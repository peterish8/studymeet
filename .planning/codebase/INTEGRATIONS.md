# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

**Real-time Database & Backend:**
- Convex - Serverless real-time backend used for all data storage, queries, and mutations
  - SDK/Client: `convex` ^1.15.0 (`ConvexProvider`, `ConvexReactClient` from `convex/react`)
  - Auth: `NEXT_PUBLIC_CONVEX_URL` env var
  - Client bootstrap: `src/components/ConvexClientProvider.tsx`
  - Server functions: `convex/` directory (schema, rooms, users, messages, whiteboard, todos, signaling, sessions, etc.)

**Font Delivery:**
- Google Fonts CDN - Serves Inter, Poppins, JetBrains Mono fonts
  - Import: CSS `@import` in `src/app/globals.css`
  - No API key required

**WebRTC Signaling (self-hosted via Convex):**
- SimplePeer ^9.11.1 - Peer-to-peer video/audio; signaling channel implemented over Convex database (`convex/signaling.ts`)
  - No external STUN/TURN server configured in code (uses browser defaults)
  - Signaling messages stored in `signalingMessages` table in Convex

## Data Storage

**Databases:**
- Convex (cloud-hosted document database)
  - Connection: `NEXT_PUBLIC_CONVEX_URL` (client-side) — loaded in `src/components/ConvexClientProvider.tsx`
  - Client: Convex React SDK (`useQuery`, `useMutation` from `convex/react`)
  - Schema: `convex/schema.ts`
  - Tables: `profiles`, `rooms`, `users`, `whiteboardStrokes`, `todos`, `ahaMoments`, `sessionNotes`, `reactions`, `floatingNotes`, `signalingMessages`, `roomMessages`, `studySessions`, `studySessionParticipants`
  - All tables have indexed queries; no raw SQL

**File Storage:**
- None detected — no file upload, S3, or blob storage integration found

**Caching:**
- None — no Redis, Memcached, or similar detected; Convex reactive queries serve as the real-time data layer

**Client Persistence:**
- Browser localStorage — persists `theme`, `userName`, `accountId` via Zustand `persist` middleware
  - Key: `meet-and-study-storage`
  - Auth account ID separately stored under key `meet_and_study_account_id` (see `src/lib/auth.ts`)

## Authentication & Identity

**Auth Provider:**
- Custom / pseudo-Google OAuth — no official OAuth library detected in dependencies
  - Implementation: The auth callback at `src/app/auth/callback/page.tsx` receives `accountId`, `email`, `name`, `avatarUrl` as URL query params and upserts to Convex `profiles` table via `convex/auth.ts:upsertProfileFromGoogle`
  - The sign-in button in `src/app/app/page.tsx` simulates sign-in by redirecting to `/auth/callback` with a synthetic `accountId` (`acct_<timestamp>`) — actual Google OAuth handshake is not implemented in the current codebase
  - Account ID stored in localStorage via `src/lib/auth.ts`
  - Guest mode: fully supported — users can join rooms without an account; `accountId` is optional on all user records

**Session Management:**
- No server-side sessions or JWT tokens detected
- Identity is tracked via `accountId` string stored in Zustand store and localStorage

## Monitoring & Observability

**Error Tracking:**
- None detected — no Sentry, Datadog, or similar integration found

**Analytics:**
- None detected — no GA, Segment, Mixpanel, or similar

**Logs:**
- `console.error` used in `src/components/VideoCall.tsx` for media stream failures
- No structured logging service configured

## CI/CD & Deployment

**Hosting:**
- TBD — no `Dockerfile`, `vercel.json`, `netlify.toml`, or platform config detected in repository root

**CI Pipeline:**
- None detected — no GitHub Actions, CircleCI, or similar config files present

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL; required for all backend connectivity (read in `src/components/ConvexClientProvider.tsx`)

**Secrets location:**
- `.env.local` file present at project root (contents not read per security policy)

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` (Next.js page at `src/app/auth/callback/page.tsx`) — receives auth data as query parameters post sign-in; not a true webhook endpoint

**Outgoing:**
- None detected

## Browser APIs Used

**Media:**
- `navigator.mediaDevices.getUserMedia` — camera/microphone access for video calls (`src/components/VideoCall.tsx`)

**Storage:**
- `window.localStorage` — account ID persistence (`src/lib/auth.ts`) and Zustand store persistence

---

*Integration audit: 2026-05-06*
