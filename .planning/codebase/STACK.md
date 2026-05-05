# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- TypeScript 5.x - All application and backend (Convex) code in `src/` and `convex/`
- CSS - Global styles in `src/app/globals.css`

**Secondary:**
- JavaScript - Build scripts in `package.json` (inline Node.js script for cache clearing)
- HTML - Via JSX/TSX rendering in Next.js components

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version` file detected)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.5 - Full-stack React framework; App Router architecture, located in `src/app/`
- React 18.3.1 - UI library; all components in `src/components/` and `src/app/`
- Tailwind CSS 3.4.1 - Utility-first CSS; config at `tailwind.config.ts`

**Animation:**
- Framer Motion 11.0.0 - Spring physics, layout animations, whileHover/whileInView gestures; used extensively across `src/app/page.tsx` and room components

**State Management:**
- Zustand 4.5.2 with `persist` middleware - Global client state; store defined in `src/store/useStore.ts`; persists `theme`, `userName`, `accountId` to `localStorage` under key `meet-and-study-storage`

**Real-time Backend:**
- Convex 1.15.0 - Serverless real-time database and backend; all server functions in `convex/`; client bootstrapped in `src/components/ConvexClientProvider.tsx`

**Build/Dev:**
- PostCSS 8 - CSS processing; config at `postcss.config.mjs`
- ESLint 8.57.0 with `eslint-config-next` - Linting; standard Next.js config
- TypeScript compiler - Config at `tsconfig.json`

## Key Dependencies

**Critical:**
- `convex` ^1.15.0 - Real-time reactive database; all data mutations and queries go through Convex; the entire backend layer
- `framer-motion` ^11.0.0 - Animation system; used on landing page and in room UI
- `simple-peer` ^9.11.1 - WebRTC peer-to-peer video/audio; used in `src/components/VideoCall.tsx`
- `@excalidraw/excalidraw` ^0.18.1 - Whiteboard drawing library; used in `src/components/Whiteboard.tsx`

**UI Utilities:**
- `lucide-react` ^0.400.0 - Icon set used throughout all pages
- `clsx` ^2.1.0 + `tailwind-merge` ^2.2.0 - Class merging utility; `cn()` helper in `src/lib/utils.ts`
- `canvas-confetti` ^1.9.3 - Confetti animation for celebration moments (e.g., session completion)
- `use-debounce` ^10.0.0 - Debounce hook for input handlers
- `uuid` ^9.0.1 - UUID generation (types: `@types/uuid`)
- `zustand` ^4.5.2 - Client-side global state store

## Configuration

**Environment:**
- `.env.local` present (contents not read)
- Required env var: `NEXT_PUBLIC_CONVEX_URL` — consumed in `src/components/ConvexClientProvider.tsx` to bootstrap the Convex client
- Convex project identifier: `meet-and-study` — stored in `convex.json`

**Build:**
- `next.config.mjs` — minimal config; `reactStrictMode: true`; no custom webpack or redirects
- `tsconfig.json` — strict mode, `bundler` module resolution, path alias `@/*` maps to `./src/*` and `./`
- `tailwind.config.ts` — custom design system tokens: colors (`primary`, `canvas`, `surface`, `ink`, `accent`, `orb`), font families (`display: Poppins`, `body/sans: Inter`), custom spacing, border-radius, and shadow scale

**Fonts:**
- Google Fonts (loaded via CSS import in `src/app/globals.css`): Inter (400–700), Poppins (500–700), JetBrains Mono (400–500)

## Platform Requirements

**Development:**
- Run with: `npm run dev` (Next.js dev server)
- Convex dev backend: `npm run convex:dev` (runs `npx convex@1.15.0 dev`)
- Both processes must run concurrently for full local functionality

**Production:**
- Hosting platform: TBD (not configured in codebase)
- Convex cloud handles backend/database hosting automatically via `convex.json` project linkage

---

*Stack analysis: 2026-05-06*
