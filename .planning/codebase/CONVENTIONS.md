# Coding Conventions

**Analysis Date:** 2026-05-06

## Naming Patterns

**Files:**
- React components: PascalCase, `.tsx` — `Button.tsx`, `PomodoroTimer.tsx`, `FloatingNotes.tsx`
- UI primitives in subdirectory: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`
- Next.js pages: `page.tsx` (App Router convention) — `src/app/page.tsx`, `src/app/app/page.tsx`
- Utility modules: camelCase, `.ts` — `src/lib/utils.ts`, `src/lib/auth.ts`
- Zustand store: `useStore.ts` (hook naming prefix applied to filename)
- Convex backend files: camelCase domain nouns — `convex/rooms.ts`, `convex/todos.ts`, `convex/floatingNotes.ts`

**Functions:**
- React component functions: PascalCase — `function PomodoroTimer(...)`, `function Sidebar(...)`
- Page default exports: PascalCase with `Page` suffix — `AppDashboardPage`, `DashboardPage`, `RoomsPage`
- Event handlers: camelCase with `handle` prefix — `handleCreate`, `handleJoin`
- Utility functions: camelCase — `generateRoomCode()`, `formatTime()`, `formatDuration()`
- Convex queries: camelCase descriptive names — `getByCode`, `getWithParticipants`, `getOpenRooms`
- Convex mutations: action verbs camelCase — `create`, `join`, `add`, `toggleComplete`, `update`
- Internal helper hooks: camelCase with `use` prefix — `useTabs()`

**Variables and State:**
- Boolean state: `is` / `has` prefix — `isCreating`, `isJoining`, `isFocusMode`, `isSidebarOpen`
- Local state: camelCase — `nameInput`, `roomCode`, `roomName`, `error`
- Constants: SCREAMING_SNAKE_CASE — `FOCUS_DURATION`, `BREAK_DURATION`, `ACCOUNT_ID_KEY`
- Zustand store keys: camelCase matching property name — `userName`, `currentRoomId`, `selectedTool`

**Types and Interfaces:**
- Interface names: PascalCase with `Props` suffix for component props — `ButtonProps`, `InputProps`, `CardProps`
- Context types: PascalCase `Type` suffix — `TabsContextType`
- Store interface: plain PascalCase — `AppState`
- Union type aliases: PascalCase — `Theme`, `Tool`, `TodoMode`

## Code Style

**Formatting:**
- No project-level Prettier config detected — formatting relies on editor defaults and ESLint
- ESLint: `eslint-config-next` (Next.js standard ruleset) via `next lint`
- Indentation: 2 spaces
- Quotes: double quotes for strings (`"use client"`, `"meet-and-study-storage"`)
- Trailing commas: present in multi-line objects/arrays

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- `skipLibCheck: true` — library types not fully checked
- `noEmit: true` — TypeScript only used for type checking, not output
- Non-null assertions used when env vars expected: `process.env.NEXT_PUBLIC_CONVEX_URL!`
- `err: any` used in some catch blocks: `catch (err: any)`

## Import Organization

**Order (observed pattern):**
1. React/Next.js core — `import { useState } from "react"`, `import { useRouter } from "next/navigation"`
2. External packages — `framer-motion`, `convex/react`, `lucide-react`
3. Internal aliases (`@/`) — `@/components/...`, `@/lib/...`, `@/store/...`
4. Type imports mixed inline (not separated)

**Path Aliases:**
- `@/*` resolves to `./src/*` and `./` — configured in `tsconfig.json`
- Convex generated types: `@/convex/_generated/api`, `@/convex/_generated/dataModel`

**Example:**
```typescript
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
```

## React Component Patterns

**"use client" directive:**
- All interactive components declare `"use client"` at top of file
- Server-only files (Convex backend, schema, layout metadata) have no directive

**forwardRef pattern for UI primitives:**
```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => { ... }
);
Button.displayName = "Button";
export { Button };
```

**Named exports for components (not default):**
- Feature components: `export function PomodoroTimer(...)`
- UI primitives: `export { Button }`, `export { Input }`, `export { Card }`
- Pages: `export default function RoomPage()` (Next.js App Router requires default export)

**Props extending HTML attributes:**
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "pearl";
  size?: "sm" | "md" | "lg";
}
```

**Conditional className composition:**
- Always uses `cn()` from `src/lib/utils.ts` (combines `clsx` + `tailwind-merge`)
- Variant maps: object literal lookup `variants[variant]`
- Dark mode: inline Tailwind `dark:` prefix classes — `dark:bg-cursor-surface`

## Convex Backend Patterns

**Query/mutation structure:**
```typescript
export const functionName = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // implementation
  },
});
```

**Authorization guard pattern (every mutation):**
```typescript
const actor = await ctx.db.get(args.actorUserId);
if (!actor || actor.roomId !== args.roomId || actor.leftAt) {
  throw new Error("Unauthorized");
}
```

**Index queries:**
```typescript
await ctx.db
  .query("tableName")
  .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
  .collect();  // or .unique()
```

**Timestamps:** All records use `Date.now()` (Unix milliseconds) for `createdAt`, `updatedAt`

## State Management

**Zustand store (`src/store/useStore.ts`):**
- Single global store `AppState` with `persist` middleware
- Only `theme`, `userName`, `accountId` persisted to localStorage key `"meet-and-study-storage"`
- `initialState` object defined separately for `reset()` usage
- Setter pattern: `setX: (x) => set({ x })`, toggler: `toggleX: () => set((state) => ({ x: !state.x }))`

**Local state:** `useState` for ephemeral UI state (loading, error, form inputs)

**Server state:** Convex reactive queries via `useQuery` — no manual cache management needed

## Error Handling

**UI layer:**
- `try/catch` blocks around all mutation calls
- Generic user-facing error state: `setError("Unable to create room right now.")`
- Convex error message surfaced when descriptive: `err?.message || "Unable to join room."`
- Loading state booleans set before `try`, cleared in `finally`

**Backend layer:**
- Mutations throw `new Error("Unauthorized")` for auth failures — consistent message strings
- Domain errors use descriptive messages: `"Room has ended"`, `"Room is full. This session is private."`
- No custom error classes; plain `Error` only

**Audio play errors swallowed silently:**
```typescript
audio.play().catch(() => {});
```

## Logging

**Framework:** `console.error` only (no structured logger)

**Usage:** Restricted to caught errors in `VideoCall.tsx`:
```typescript
console.error("Failed to get local stream:", err);
console.error("Peer error:", err);
```

No `console.log` usage in production source files — clean of debug logging.

## Comments

**When to Comment:**
- Inline comments for non-obvious constants: `// 25 minutes`, `// max 2 users`
- Section dividers using `/* ─── Section Name ───... */` (used in `page.tsx` for large files)
- Schema fields annotated: `// 6-character room code`, `// JSON string`
- Backward compatibility notes: `// Optional for backward compatibility with legacy records...`

**No JSDoc/TSDoc** — function types are expressed through TypeScript interfaces instead.

## Module Design

**Exports:**
- Named exports preferred for feature components and utilities
- Default exports only for Next.js pages (required by App Router)
- No barrel `index.ts` files — import directly from file path

**Utility grouping:** `src/lib/utils.ts` — pure functions only (`cn`, `generateRoomCode`, `formatTime`, `formatDuration`, `getInitials`)

**Auth helpers:** `src/lib/auth.ts` — localStorage wrapper with SSR guard (`typeof window === "undefined"`)

---

*Convention analysis: 2026-05-06*
