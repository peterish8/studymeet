# Architecture

**Analysis Date:** 2026-05-06

## Pattern Overview

**Overall:** Client-Server with Real-Time Backend (Next.js App Router + Convex BaaS)

**Key Characteristics:**
- All business logic lives in Convex functions (`convex/`); the frontend only calls queries and mutations via the Convex React SDK
- Real-time reactivity is provided automatically by Convex's live query subscriptions — no manual WebSocket management needed
- WebRTC peer-to-peer video is bootstrapped through a Convex signaling table (`signalingMessages`) rather than a dedicated signaling server
- Client-side state that does not need persistence across sessions (tool selection, sidebar open, focus lock) lives in Zustand; account identity is persisted to `localStorage`

## Layers

**Presentation Layer:**
- Purpose: Renders UI, handles user interactions, reads live Convex data
- Location: `src/app/` (pages), `src/components/` (reusable components)
- Contains: Next.js App Router pages, React components, Framer Motion animations
- Depends on: Convex React hooks (`useQuery`, `useMutation`), Zustand store, `src/lib/utils.ts`
- Used by: Browser / end user

**Client State Layer:**
- Purpose: Manages ephemeral UI state (whiteboard tool, sidebar, focus lock) and persisted identity (userName, accountId, theme)
- Location: `src/store/useStore.ts`
- Contains: Single Zustand store with `persist` middleware (persists `theme`, `userName`, `accountId` to `localStorage` under key `meet-and-study-storage`)
- Depends on: Zustand
- Used by: All pages and components

**Utility / Helper Layer:**
- Purpose: Pure functions shared across front end and Convex backend
- Location: `src/lib/utils.ts`, `src/lib/auth.ts`
- Contains: `cn()` (Tailwind class merge), `generateRoomCode()`, `formatTime()`, `formatDuration()`, `getInitials()`, localStorage identity helpers
- Depends on: `clsx`, `tailwind-merge`
- Used by: Pages, components, AND Convex backend (`convex/rooms.ts` imports `generateRoomCode` directly from `src/lib/utils`)

**Backend / API Layer (Convex Functions):**
- Purpose: All database reads, writes, and access-control logic
- Location: `convex/`
- Contains: Queries and mutations for each domain (`rooms`, `users`, `signaling`, `whiteboard`, `todos`, `notes`, `aha`, `reactions`, `messages`, `profiles`, `sessions`, `dashboard`, `floatingNotes`)
- Depends on: Convex SDK, `convex/schema.ts`
- Used by: Frontend via generated `api` object at `convex/_generated/api`

**Data Layer (Convex Database):**
- Purpose: Persistent storage with indexed access
- Location: Schema defined in `convex/schema.ts`; generated types in `convex/_generated/dataModel.d.ts`
- Contains: 13 tables — `profiles`, `rooms`, `users`, `whiteboardStrokes`, `todos`, `ahaMoments`, `sessionNotes`, `reactions`, `floatingNotes`, `signalingMessages`, `roomMessages`, `studySessions`, `studySessionParticipants`
- Depends on: Convex platform
- Used by: Convex functions only

## Data Flow

**User Creates or Joins a Room:**

1. User opens `/app` (`src/app/app/page.tsx`) and enters name + optional room code
2. Component calls `useMutation(api.rooms.create)` or `api.rooms.join` directly — no API route needed
3. Convex mutation runs server-side: inserts `rooms` and `users` rows, returns `{ roomId, userId, code }`
4. Client stores `userName` in Zustand (persisted) and navigates to `/room/[id]?userId=<userId>`
5. Room page subscribes to `useQuery(api.rooms.getWithParticipants)` — live updates arrive automatically when the second participant joins

**WebRTC Video Call Signaling:**

1. `VideoCall` component (`src/components/VideoCall.tsx`) initialises a `SimplePeer` instance
2. `SimplePeer` emits a signal → component calls `useMutation(api.signaling.sendMessage)` which inserts a `signalingMessages` row
3. Other participant's `VideoCall` polls via `useQuery(api.signaling.getMessages)` — Convex reactivity delivers the row immediately
4. That client calls `peer.signal(data)` to complete the handshake, then calls `deleteMessage` mutation to clean up
5. After handshake, video/audio streams over direct peer-to-peer WebRTC; Convex is no longer in the media path

**Session Lifecycle:**

1. Room created → status `"waiting"`
2. Second user joins → status set to `"active"` by `rooms.join` mutation
3. User clicks Leave → `rooms.leave` marks `users.leftAt`, sets room `status` back to `"waiting"` or `"ended"`
4. `sessions.finalizeRoomSession` mutation collects todos, aha moments, notes, calculates duration, inserts `studySessions` + `studySessionParticipants` rows
5. Client shows `SessionSummary` modal then redirects to `/`

**State Management:**

- **Server state** (rooms, messages, whiteboard strokes, todos, etc.): managed entirely by Convex live queries — no Redux, no local cache needed
- **UI state** (selected tool, sidebar open, focus lock, notes open): Zustand in-memory
- **Identity state** (accountId, userName, theme): Zustand with localStorage persistence + `src/lib/auth.ts` for raw localStorage access

## Key Abstractions

**Convex API Object:**
- Purpose: Typed, auto-generated API surface for all backend functions
- Location: `convex/_generated/api.d.ts`, `convex/_generated/api.js`
- Pattern: Import as `import { api } from "@/convex/_generated/api"` then call `useQuery(api.rooms.getWithParticipants, args)` or `useMutation(api.rooms.create)`

**Room:**
- Purpose: The primary unit of collaboration; contains at most 2 participants
- Schema: `convex/schema.ts` — `rooms` table with `code` (6-char), `participantIds`, `status` (`waiting | active | ended`), embedded `pomodoroState`
- Access: `convex/rooms.ts` — `getByCode`, `getWithParticipants`, `create`, `join`, `leave`, `updatePomodoro`, `getSummary`

**User (Room-scoped):**
- Purpose: Represents a participant within a specific room session (not a global account)
- Schema: `users` table linked to `rooms._id`; stores `peerId`, `isMicOn`, `isCameraOn`, `isStuck`, `leftAt`
- Note: A global identity (Google OAuth) is stored separately in `profiles` table, linked by `accountId` string

**Zustand Store:**
- Purpose: Single source of truth for all client-side state
- Location: `src/store/useStore.ts`
- Pattern: Exported as `useStore` hook; selectors destructure only needed fields to avoid unnecessary re-renders

**ConvexClientProvider:**
- Purpose: Wraps the entire app with the Convex React context
- Location: `src/components/ConvexClientProvider.tsx`
- Pattern: Instantiates `ConvexReactClient` with `NEXT_PUBLIC_CONVEX_URL` once at module level; renders `<ConvexProvider>`

## Entry Points

**Landing / Marketing Page:**
- Location: `src/app/page.tsx`
- Triggers: Direct navigation to `/`
- Responsibilities: Landing page with CTA to enter the app

**App Dashboard (Create/Join):**
- Location: `src/app/app/page.tsx`
- Triggers: User navigates to `/app`
- Responsibilities: Name entry, create room, join room by code; links to `/rooms` (open rooms listing) and `/dashboard`

**Room Page:**
- Location: `src/app/room/[id]/page.tsx`
- Triggers: Navigation to `/room/<convex-room-id>?userId=<convex-user-id>` after create or join
- Responsibilities: Full collaborative session — Whiteboard, VideoCall, PomodoroTimer, Sidebar, FloatingNotes, FloatingTodos, emoji reactions, Aha button

**Auth Callback:**
- Location: `src/app/auth/callback/page.tsx`
- Triggers: Redirect from OAuth flow with query params `accountId`, `email`, `name`, `avatarUrl`
- Responsibilities: Calls `api.auth.upsertProfileFromGoogle`, stores `accountId` in Zustand + localStorage, redirects to `/dashboard`

**User Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Navigation to `/dashboard` (requires `accountId`)
- Responsibilities: Displays study stats (total sessions, focus time, todos, completion rate) and recent session history via `api.dashboard.getOverview`

**Root Layout:**
- Location: `src/app/layout.tsx`
- Responsibilities: Wraps all pages in `ConvexClientProvider`; sets global metadata

## Error Handling

**Strategy:** Defensive — mutations throw on invalid state; components handle `null` returns from queries with loading spinners or redirect guards

**Patterns:**
- Convex mutations validate actor membership via `ensureMember()` helper in `convex/sessions.ts` before any write
- Pages check for missing `accountId` and show inline "sign in" prompts rather than hard redirects (except `/auth/callback`)
- `VideoCall` catches `getUserMedia` errors with `console.error`; peer errors trigger an automatic 5-second reconnect loop
- Room loading renders a spinner until both `room` and `user` queries return non-null

## Cross-Cutting Concerns

**Logging:** `console.error` only in media/WebRTC paths; no structured logging framework
**Validation:** Input validation in-component (empty name, 6-char room code checks) plus server-side in Convex mutations
**Authentication:** Custom — `accountId` (UUID string) stored in localStorage, passed as arg to mutations; no JWT or session cookie; Convex has no built-in auth configured — all access control is manual membership checks inside mutation handlers

---

*Architecture analysis: 2026-05-06*
