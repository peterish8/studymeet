# StudyRoom — Prototyping PRD
**Version:** 0.1 (Non-AI MVP)  
**Type:** 1-on-1 Collaborative Study Platform  
**Theme:** Minimal, Black & White  

---

## 1. Overview

A focused, distraction-free study room where exactly two students can join, video call, collaborate on a shared whiteboard, track their session goals, and keep each other accountable — all in real time. No AI in this version. Just clean, human-to-human studying.

---

## 2. Core Constraints

| Constraint | Value |
|---|---|
| Max users per room | **2** |
| Minimum users to start session | 1 (waiting state until 2nd joins) |
| Theme options | Black or White (per user, independent) |
| AI features | ❌ None in this prototype |

---

## 3. Feature List

### 3.1 Room System
- User creates a room → gets a shareable **6-character room code**
- Second user joins via code
- If room is full (2/2), reject entry with a friendly message: *"Room is full. This session is private."*
- Room has a **session name** (optional, set by creator) e.g. "DSA prep - Sunday"
- Room persists until both users leave
- Waiting screen shown to creator until 2nd user joins — shows room code big and bold

---

### 3.2 Video Call
- 1-on-1 WebRTC video call (peer-to-peer)
- Both video feeds shown as small floating tiles (bottom corners or sidebar) — they don't take up the main canvas
- Mute / unmute mic toggle
- Camera on/off toggle
- Simple connection status indicator (green dot = connected)
- No recording in this version

---

### 3.3 Shared Whiteboard *(Main Canvas)*
The whiteboard is the **center of the screen** — the primary workspace.

**Tools available:**
- ✏️ Pen (freehand draw)
- 📐 Shapes — rectangle, circle, arrow, line
- 🔤 Text tool
- 🧹 Eraser
- 🗑️ Clear all (with confirmation prompt)
- Color picker — limited palette: black, white, grey, red, blue (keeps it clean)
- Stroke size selector (thin / medium / thick)

**Behavior:**
- Both users draw in real-time (changes sync instantly via WebSocket)
- Each user's strokes are subtly labeled with their name or initials on hover
- Whiteboard state persists during the session (doesn't reset on disconnect/reconnect within same session)

---

### 3.4 Pomodoro Timer *(Focus Mode)*

**Default state:** Small timer widget sitting in the corner of the screen.

**When clicked / activated:**
- Timer **expands fullscreen** and **replaces the whiteboard**
- Clean, minimal display — just the countdown, big and centered
- Background matches user's own theme (black or white)
- Both users see the timer fullscreen simultaneously
- Options:
  - 25 min focus / 5 min break (classic Pomodoro)
  - Custom duration input
- Controls: Start, Pause, Reset
- At end of focus period → subtle sound ping + "Break time! 🎉" message
- At end of break → prompt to start next round
- **Exit Focus Mode** button → whiteboard comes back

**Sync behavior:** Timer is synced between both users. If one starts it, both see it running. Either user can pause/reset.

---

### 3.5 Aha Moment Button 🎉
- Persistent button on the UI (small, bottom bar)
- Either user can press it anytime
- When pressed → full-screen burst animation (confetti or ripple, black/white style)
- A small **"Aha Log"** panel (collapsible) records every aha moment with a timestamp:
  - *"Prats had an Aha! — 8:42 PM"*
  - *"Jay had an Aha! — 8:47 PM"*
- Both users see the animation simultaneously
- Sound: short cheerful chime

---

### 3.6 Session Todo List

**Purpose:** What do we want to finish studying today?

#### Toggle Option: Shared vs Individual
- **Shared mode:** One list, both users add/check tasks together
- **Individual mode:** Each user has their own column of tasks side by side

Toggle switch at top of todo panel: `[ Shared | Individual ]`

#### Task Behavior
- Add task with text input + Enter
- Tasks can be **struck through** one by one as completed (click to strike)
- Tasks cannot be deleted — only struck through (keeps accountability)
- Strike is **visible to both users in real time**

#### Completion Race (Individual Mode only)
- Progress bar shown for each user: *"Prats: 3/5 done"* / *"Jay: 2/5 done"*
- First user to complete all tasks gets a **winner banner** → *"🏆 Prats finished first!"*
- Small celebratory animation (keeps it fun, not cringe)

#### Shared Mode Completion
- When all shared tasks are struck → *"You both crushed it! ✅"* banner

---

### 3.7 Per-User Theme Toggle
- Each user independently picks their theme: **Black** or **White**
- Black theme: black background, white text/strokes
- White theme: white background, black text/strokes
- The shared whiteboard canvas stays neutral (white canvas, dark strokes) — only the UI shell changes per user
- Theme saved in localStorage (remembered next time same user joins)
- Toggle accessible from top-right corner at all times

---

### 3.8 Session Sidebar
Collapsible right-side panel containing:
- Todo List
- Aha Moment Log
- Participant info (name, theme, mic/cam status)
- Session duration timer (simple upward counting clock — how long you've been in)

---

## 4. Non-AI Bonus Features

| Feature | Description |
|---|---|
| **Reaction Emojis** | Quick emoji reactions (👍 💡 😵 🔥) float across both screens — like a lightweight version of YouTube reactions |
| **"Stuck?" Signal** | A button one user can press if they're confused — shows a subtle "🙋 Prats is stuck" badge to the other person, prompting them to explain |
| **Session Summary on Exit** | When either user leaves, both see a simple recap: session duration, aha moments count, todos completed. Copyable as text. |
| **Typing Indicator on Whiteboard** | When someone is actively typing in the text tool, the other user sees "Jay is typing..." |
| **Focus Lock Mode** | Optional — hides video tiles and todo panel to leave only whiteboard + timer. One-click toggle. |
| **Session Notes Pad** | Separate from whiteboard — a plain text scratchpad (like Notepad) where both users can type raw notes together. Synced in real time. |

---

## 5. UI Layout (Wireframe Description)

```
┌─────────────────────────────────────────────────────┐
│  [Session Name]           [Theme Toggle] [Leave 🚪]  │
├─────────────────────────────────────────┬───────────┤
│                                         │           │
│                                         │  Todo     │
│         WHITEBOARD / TIMER              │  List     │
│              (Main Canvas)              │           │
│                                         │  Aha Log  │
│                                         │           │
├─────────────────────────────────────────┤  Session  │
│ [🎥 Prats]  [🎥 Jay]  Toolbar  [🍅][🎉]│  Info     │
└─────────────────────────────────────────┴───────────┘
```

- Bottom bar: video tiles, whiteboard toolbar, Pomodoro button, Aha button
- Right sidebar: toggleable, contains todo + aha log + session info
- When Pomodoro is fullscreen → everything except timer is hidden

---

## 6. Tech Stack (Prototype Scope)

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS (black/white tokens) |
| Real-time | Socket.io (whiteboard sync, todo sync, timer sync, reactions) |
| Video Call | WebRTC (simple-peer library) |
| State | Zustand or React Context |
| Backend | Node.js + Express |
| Storage | In-memory (no DB needed for prototype) |

---

## 7. Out of Scope (This Version)

- AI features of any kind
- More than 2 users
- Persistent rooms across days
- Authentication / login
- Mobile support
- Recording / playback
- File uploads

---

## 8. Success Criteria for Prototype

- [ ] Two users can join a room via code and video call
- [ ] Both users draw on whiteboard and see changes instantly
- [ ] Pomodoro expands fullscreen and syncs between both users
- [ ] Each user has their own theme without affecting the other
- [ ] Todo list works in both shared and individual mode with real-time strike-through
- [ ] Aha moment triggers animation on both screens
- [ ] Session summary shows on exit

---

*Built for students who are tired of studying alone.*