# Codebase Concerns

**Analysis Date:** 2026-05-06

## Tech Debt

**Fake authentication system:**
- Issue: Auth is not real OAuth. "Sign in" in `src/app/app/page.tsx` (lines 102-113) redirects to `/auth/callback` with a synthetic `accountId` constructed from `Date.now()` (`acct_${Date.now()}`). The callback page in `src/app/auth/callback/page.tsx` reads query params from the URL — there is no OAuth provider, no token exchange, no identity verification. Anyone who crafts a URL can impersonate any accountId.
- Files: `src/app/app/page.tsx`, `src/app/auth/callback/page.tsx`, `src/lib/auth.ts`
- Impact: The entire account and dashboard history system has no real auth. The `profiles` table and session history are associated with a self-issued accountId, not a verified identity.
- Fix approach: Integrate a real OAuth provider (e.g., Google via NextAuth or Clerk) and replace the fake callback with a proper token exchange flow.

**Pomodoro round count is always zero:**
- Issue: `finalizeRoomSession` in `convex/sessions.ts` (line 65) hardcodes `pomodoroRounds: 0`. The rooms table stores live pomodoro state but the count of completed rounds is never calculated from actual state transitions.
- Files: `convex/sessions.ts`, `convex/rooms.ts`
- Impact: Session summary and dashboard always show 0 pomodoro rounds regardless of actual usage.
- Fix approach: Track round completions in `rooms.pomodoroState` or count transitions in `finalizeRoomSession` from historical state.

**`creatorId` temporarily set to "temp" string:**
- Issue: `convex/rooms.ts` (line 94) inserts a room with `creatorId: "temp"` then patches it immediately after user creation. If the second patch fails, the room record holds a non-ID string value in a typed field.
- Files: `convex/rooms.ts`
- Impact: Latent data integrity risk. If the mutation errors between insert and patch, the database holds an invalid creatorId.
- Fix approach: Restructure to compute the user ID before inserting the room, or use a Convex transaction pattern that guarantees atomicity.

**`api as any` cast to access untyped Convex API paths:**
- Issue: `src/app/rooms/page.tsx` (line 20) and `src/components/Sidebar.tsx` (lines 26, 28) use `(api as any).rooms.getOpenRooms` and `(api as any).messages.*` to bypass type checking. This means those endpoints have no compile-time safety.
- Files: `src/app/rooms/page.tsx`, `src/components/Sidebar.tsx`
- Impact: Typos or API changes will fail silently until runtime. Refactoring Convex functions will not trigger TypeScript errors at call sites.
- Fix approach: Regenerate Convex types after ensuring all exported functions are present in `convex/_generated/api.d.ts`, then remove all `as any` casts on the api object.

**Widespread `any` types (42 occurrences across src/ and convex/):**
- Issue: 38 instances in `src/` and 4 in `convex/` use `: any` or `as any` for component props, query results, and event types. Examples: `SidebarProps.user: any`, `SidebarProps.otherUser: any`, `todo: any`, `moment: any`, `p: any` in `room/[id]/page.tsx`.
- Files: `src/components/Sidebar.tsx`, `src/components/FloatingTodos.tsx`, `src/components/TodoList.tsx`, `src/app/room/[id]/page.tsx`, `convex/dashboard.ts`
- Impact: Loss of type safety in the most-used components. Refactors that change Convex schema shape will not produce compile errors at component boundaries.
- Fix approach: Generate and import proper TypeScript types from `convex/_generated/dataModel.d.ts` (e.g., `Doc<"users">`, `Doc<"todos">`).

**Session duration includes pre-join waiting time:**
- Issue: `convex/rooms.ts` (line 265) and `convex/sessions.ts` (line 47) calculate session duration from `room.createdAt` — not from when the second participant joined. A room waiting 30 minutes before the partner arrives inflates the duration by 30 minutes.
- Files: `convex/rooms.ts`, `convex/sessions.ts`
- Impact: Dashboard focus time stats are inaccurate for sessions with any pre-join wait.
- Fix approach: Record `activeAt` on the room when the second participant joins (status transitions to "active") and use that as the duration start.

## Known Bugs

**WebRTC re-initiator race condition:**
- Symptoms: Initiator is determined by string comparison `userId < otherUserId` (`src/components/VideoCall.tsx` line 70). Both peers could independently calculate the same role if Convex IDs ever collide in comparison, though the real risk is that `trickle: false` in SimplePeer means the entire SDP must be exchanged in one signal. If the offer/answer message is not polled before the peer times out, the call silently fails.
- Files: `src/components/VideoCall.tsx`
- Trigger: High-latency Convex signaling or a slow first render causes the initiator to timeout waiting for an answer.
- Workaround: Refresh the page; the reconnect loop fires after 5 seconds.

**"End call" reconnects automatically after 5 seconds:**
- Symptoms: `handleEndCall` in `src/components/VideoCall.tsx` (lines 163-172) sets state to "ended" then schedules a reconnect in 5 seconds via `setTimeout`. There is no way for a user to intentionally end a call permanently during a session — it always tries to re-establish.
- Files: `src/components/VideoCall.tsx`
- Trigger: User clicks "End call" button.
- Workaround: None during an active session.

**Whiteboard shape types not synced:**
- Symptoms: `convex/whiteboard.ts` `addStroke` stores `shapeType` for shapes, but the `Whiteboard.tsx` `handleChange` callback (lines 82-106) only syncs `freedraw` and `text` element types. Shapes drawn in Excalidraw (rectangles, circles, arrows, lines) are never persisted to Convex.
- Files: `src/components/Whiteboard.tsx`, `convex/whiteboard.ts`
- Trigger: Drawing any non-freehand element on the whiteboard.
- Workaround: None — shapes disappear on reload or for the other participant.

**Reactions accumulate without cleanup:**
- Symptoms: `convex/reactions.ts` provides a `cleanup` mutation but it is never called from anywhere in the codebase. The `getRecent` query filters in-memory post-fetch, so the `reactions` table grows unboundedly.
- Files: `convex/reactions.ts`, `src/app/room/[id]/page.tsx`
- Trigger: Any session where emoji reactions are used.
- Workaround: None — cleanup must be triggered manually or scheduled.

**Missing notification sound asset:**
- Symptoms: `PomodoroTimer.tsx` (line 34) creates `new Audio("/notification.mp3")`. No `notification.mp3` file exists in `public/`. The `.catch(() => {})` silently swallows the error so the timer auto-advances without any sound or user feedback.
- Files: `src/components/PomodoroTimer.tsx`, `public/`
- Trigger: Pomodoro round completes.
- Workaround: Timer still advances; sound simply never plays.

**`floatingNotes.clearAll` has no authorization check:**
- Symptoms: `convex/floatingNotes.ts` (lines 120-134) clears all notes for a room without verifying the caller is a room participant. Any user knowing the roomId can delete all notes.
- Files: `convex/floatingNotes.ts`
- Trigger: Calling `clearAll` with any valid roomId.
- Workaround: Notes endpoint is not publicly exposed through UI, but the mutation is callable.

## Security Considerations

**No real authentication — accountId is self-issued:**
- Risk: The entire user identity chain relies on a client-generated `accountId` stored in localStorage (`src/lib/auth.ts`). There is no server-side session, no JWT, no token verification. Users can claim any accountId by setting it in localStorage or crafting a URL.
- Files: `src/lib/auth.ts`, `src/app/auth/callback/page.tsx`, `convex/auth.ts`
- Current mitigation: None. Room-level mutations check `actorUserId` is a valid room member, but account identity is fully self-asserted.
- Recommendations: Implement real OAuth (e.g., Clerk, NextAuth with Google provider). The Convex `profiles` table and dashboard are meaningless without verified identity.

**userId passed via URL query parameter:**
- Risk: `src/app/room/[id]/page.tsx` reads `userId` from `searchParams.get("userId")`. This userId is a Convex database ID. Anyone who observes a room URL (e.g., from browser history, a shared link) can impersonate any user in that room by using their userId.
- Files: `src/app/room/[id]/page.tsx`, `src/app/app/page.tsx`
- Current mitigation: Convex mutations check `actorUserId === userId` for same-user operations and verify room membership. But those checks rely on the same userId that is URL-visible.
- Recommendations: Store userId in a short-lived session cookie or in-memory state after room creation; remove it from the URL.

**Convex mutation authorization relies on user's own self-reported userId:**
- Risk: The `actorUserId` authorization pattern (e.g., `convex/users.ts`, `convex/whiteboard.ts`, `convex/signaling.ts`) verifies the actor is a legitimate room member. However, if a user knows any valid Convex `users` table ID for a room participant, they can perform operations as that user since there is no server-side session binding.
- Files: `convex/users.ts`, `convex/whiteboard.ts`, `convex/signaling.ts`, `convex/rooms.ts`
- Current mitigation: Room membership check (`actor.roomId === roomId && !actor.leftAt`) limits blast radius.
- Recommendations: Bind userId to a server-side session or use Convex's built-in auth integration for proper identity verification.

**Emoji field not validated:**
- Risk: `convex/reactions.ts` `add` mutation accepts `emoji: v.string()` with no length or content validation. Any string can be stored as an emoji.
- Files: `convex/reactions.ts`
- Current mitigation: Reactions are displayed without sanitization in JSX (React will escape HTML, so XSS is limited). However, malformed data could cause rendering issues.
- Recommendations: Validate emoji values against an allowlist matching the four supported emojis (`👍 💡 😵 🔥`).

## Performance Bottlenecks

**Whiteboard onChange fires on every Excalidraw interaction:**
- Problem: `handleChange` in `src/components/Whiteboard.tsx` (line 66) is called by Excalidraw on every canvas event, and loops over all elements calling individual `addStroke` mutations per element inside a 1-second debounce. For a whiteboard with many strokes, each debounce cycle fires N separate Convex mutations.
- Files: `src/components/Whiteboard.tsx`
- Cause: No batching; each element dispatches its own mutation. Convex function call overhead multiplied by stroke count.
- Improvement path: Batch all stroke changes into a single Convex mutation that accepts an array of changed elements. Reduce the N-mutation fan-out to 1 call per debounce cycle.

**`getOpenRooms` query issues N+1 Convex lookups:**
- Problem: `convex/rooms.ts` `getOpenRooms` (lines 17-42) fetches all "waiting" rooms then for each room separately queries the `users` table. This is an N+1 query pattern inside a Convex query.
- Files: `convex/rooms.ts`
- Cause: `Promise.all` of per-room user queries. As the number of open rooms grows, so does the query cost.
- Improvement path: Use Convex's document relationship model or a flattened index to avoid the nested per-room fetch.

**`dashboard.getOverview` and `sessions.listForAccount` iterate sessions in a loop:**
- Problem: Both `convex/dashboard.ts` and `convex/sessions.ts` fetch session participant rows then loop over unique session IDs calling `ctx.db.get(id)` individually. This is an O(n) call loop inside a Convex query where n is the number of sessions the user has attended.
- Files: `convex/dashboard.ts`, `convex/sessions.ts`
- Cause: No Convex index on `studySessions` by `participantAccountIds` — requires joining through `studySessionParticipants` then fetching sessions one by one.
- Improvement path: Add a `by_account_id` index directly on `studySessions` or use Convex's `collect` + filter approach to avoid per-ID fetches.

**Reactions table full-collect with in-memory filtering:**
- Problem: `convex/reactions.ts` `getRecent` (lines 5-16) `.collect()`s all reactions for a room then filters by timestamp in JavaScript. If a room has thousands of reactions accumulated (since cleanup is never called), this is a large unnecessary data transfer.
- Files: `convex/reactions.ts`
- Cause: No timestamp index on reactions; cleanup is never triggered.
- Improvement path: Add `.index("by_room_and_timestamp", ["roomId", "timestamp"])` to the reactions table and filter using the index, and wire up `cleanup` to a scheduled function.

## Fragile Areas

**WebRTC signaling via Convex polling:**
- Files: `src/components/VideoCall.tsx`, `convex/signaling.ts`
- Why fragile: WebRTC signaling depends on Convex's reactive query redelivering signaling messages within the peer's offer/answer window. `trickle: false` means a complete SDP must arrive before the peer gives up. Any Convex subscription delay, network hiccup, or tab backgrounding can break the handshake. The reconnect loop (5-second retry) re-creates the peer object and restarts from scratch, potentially leaving stale signaling messages.
- Safe modification: Keep the signaling message lifecycle (send, consume, delete) atomic. Do not change the `trickle` setting without also implementing ICE candidate queuing.
- Test coverage: None.

**Room leave + finalize race condition:**
- Files: `src/app/room/[id]/page.tsx`, `convex/rooms.ts`, `convex/sessions.ts`
- Why fragile: `handleLeave` calls `leaveRoom` then `finalizeRoomSession` sequentially. `finalizeRoomSession` calls `ensureMember` which checks `!actor.leftAt`. Since `leaveRoom` sets `leftAt`, the finalize call will fail authorization because the user has already left. The `ensureMember` guard was written to prevent unauthorized access but also blocks the legitimate finalize after leave.
- Safe modification: Remove the `ensureMember` check from `finalizeRoomSession` or run finalize before leave, or pass the leave + finalize as a single Convex mutation.
- Test coverage: None.

**Landing page file is 1662 lines:**
- Files: `src/app/page.tsx`
- Why fragile: The entire landing page is a single file with 15+ inline component definitions, complex animation orchestration, and all copy. Any change to one section risks breaking adjacent JSX or animation timing.
- Safe modification: Extract each widget section into its own file under a `src/app/(landing)/components/` directory before making any content or animation changes.
- Test coverage: None.

**Whiteboard strokes re-loaded and re-applied on every `strokes` query update:**
- Files: `src/components/Whiteboard.tsx`
- Why fragile: The `useEffect` on `strokes` (lines 33-63) calls `excalidrawAPI.updateScene({ elements })` every time the Convex query returns updated data. This overwrites the entire Excalidraw canvas state on every remote update, which can cause cursor jumps, selection resets, or in-progress strokes to be cleared.
- Safe modification: Implement a diff-based update that only applies changed elements rather than replacing the entire scene.
- Test coverage: None.

## Scaling Limits

**Room capacity hardcoded at 2 users:**
- Current capacity: Max 2 active users per room (enforced in `convex/rooms.ts` line 153)
- Limit: The schema, UI, WebRTC (peer-to-peer only), and all multi-participant logic assume exactly 2 users. Scaling to group sessions would require a multi-peer WebRTC architecture (SFU) and significant schema changes.
- Scaling path: Integrate a media server (e.g., LiveKit, Daily.co) to replace the direct SimplePeer connection.

**Signaling messages not cleaned up:**
- Current capacity: Signaling messages are deleted after consumption (`convex/signaling.ts` line 55), but only if the connection succeeds. Failed handshakes leave orphaned messages in the `signalingMessages` table indefinitely.
- Limit: No TTL or scheduled cleanup exists.
- Scaling path: Add a scheduled Convex function to delete `signalingMessages` older than 5 minutes.

## Dependencies at Risk

**`simple-peer` (v9.11.1) — unmaintained:**
- Risk: The `simple-peer` package has had minimal maintenance activity since 2022. It relies on the deprecated `RTCPeerConnection` API patterns and does not support modern WebRTC features like unified plan by default.
- Impact: WebRTC compatibility may degrade on newer browser versions. Security patches are unlikely.
- Migration plan: Replace with `@livekit/client`, `mediasoup-client`, or direct `RTCPeerConnection` usage for a two-party call.

**Next.js 14.2.5 — not on latest 14.x patch:**
- Risk: Minor version is not the latest `14.x` release. Known security patches may be missing.
- Impact: Low immediate risk but should be kept current.
- Migration plan: `npm install next@latest` within the 14.x range.

## Missing Critical Features

**No data retention or room cleanup:**
- Problem: Ended rooms and all their associated data (strokes, notes, reactions, floating notes, messages, todos) remain in the database forever. There is no TTL, archival, or deletion policy.
- Blocks: Database storage grows unboundedly. No way to reset or clean up test rooms created during development.

**No error boundary or global error handling:**
- Problem: There is no React Error Boundary anywhere in the component tree. Convex query/mutation failures surface only as silent `undefined` returns or unhandled promise rejections.
- Blocks: Any runtime error in a component (e.g., malformed Convex data, a failed `excalidrawAPI` call) will crash the entire page with a white screen rather than a recoverable error state.

**No loading states for Convex mutations:**
- Problem: Most mutation-triggering buttons (reactions, aha button, whiteboard actions) have no loading or disabled state. Double-clicks can fire duplicate mutations.
- Blocks: Data duplication (e.g., two identical aha moments recorded, duplicate reactions).

## Test Coverage Gaps

**Zero test files in the project:**
- What's not tested: All Convex mutations (authorization logic, room state transitions, session finalization), all React components (Whiteboard, VideoCall, PomodoroTimer, Sidebar), all utility functions in `src/lib/utils.ts`.
- Files: Entire `src/` and `convex/` directories.
- Risk: Any refactor to the authorization pattern, Pomodoro state machine, or WebRTC signaling flow will silently break without detection.
- Priority: High — the authorization pattern (`actorUserId` check) and room state machine are the most critical untested paths.

---

*Concerns audit: 2026-05-06*
