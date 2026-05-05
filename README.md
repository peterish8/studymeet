# Meet&Study

A focused, distraction-free study room where exactly two students can join, video call, collaborate on a shared whiteboard, track their session goals, and keep each other accountable — all in real time.

## Design Philosophy

**Premium Blend of Apple + ElevenLabs Aesthetics:**
- Apple's clean typography, tight letter-spacing, and Action Blue (#0066cc) CTAs
- ElevenLabs' atmospheric gradient orbs (mint, peach, lavender, sky, rose) for depth
- Warm off-white canvas with frosted glass effects
- Minimal shadows, pill-shaped buttons, and editorial spacing

## Features

### Core
- **1-on-1 Video Calls** — WebRTC peer-to-peer video with mic/camera controls
- **Shared Whiteboard** — Real-time drawing with pen, shapes, text, and eraser
- **Pomodoro Timer** — Focus mode with fullscreen timer, synced between users
- **Todo Lists** — Shared or individual mode with completion tracking
- **Aha Moments** — Celebration button with confetti and sound
- **Session Notes** — Collaborative notepad for study notes
- **Theme Toggle** — Per-user light/dark mode preference

### Bonus
- Reaction emojis (👍 💡 😵 🔥)
- "Stuck?" signal for when you need help
- Session summary on exit
- Focus lock mode to minimize distractions

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Convex (real-time database)
- **Video:** WebRTC + Simple Peer
- **State:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Project Structure

```
meet-and-study/
├── app/                    # Next.js app router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── room/[id]/         # Room page
├── components/            # React components
│   ├── ui/               # UI primitives (Button, Input, etc.)
│   ├── Whiteboard.tsx    # Canvas drawing component
│   ├── VideoCall.tsx     # WebRTC video component
│   ├── PomodoroTimer.tsx # Timer component
│   ├── TodoList.tsx      # Task management
│   ├── Sidebar.tsx       # Collapsible sidebar
│   ├── AhaButton.tsx     # Celebration button
│   ├── SessionSummary.tsx # Exit summary modal
│   └── NotesPad.tsx      # Shared notes
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── rooms.ts          # Room mutations/queries
│   ├── users.ts          # User mutations/queries
│   ├── whiteboard.ts     # Whiteboard operations
│   ├── todos.ts          # Todo operations
│   ├── aha.ts            # Aha moment operations
│   ├── notes.ts          # Notes operations
│   ├── reactions.ts      # Emoji reactions
│   └── signaling.ts      # WebRTC signaling
├── store/                # Zustand store
│   └── useStore.ts       # App state management
├── lib/                  # Utilities
│   └── utils.ts          # Helper functions
└── public/              # Static assets
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Convex
```bash
# Install Convex CLI globally (if not already)
npm install -g convex

# Initialize Convex (run this in project root)
convex dev

# This will:
# - Create a Convex project
# - Generate the CONVEX_URL for your .env.local
# - Push the schema to Convex
```

### 3. Configure Environment
Copy the Convex URL from the CLI output and update `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

- If the UI suddenly appears unstyled or partially broken, the Next.js cache is likely stale/corrupted.
- Run `npm run clean` to clear `.next`, then restart with `npm run dev`.
- Use `npm run clean` on demand if styles/build output ever look stale.
- If Convex deploy fails after a schema change, keep newly added fields `v.optional(...)` first, deploy, backfill old docs, then make required in a later deploy.

## How to Use

1. **Create a Room**
   - Enter your name and optional session name
   - Get a 6-character room code
   - Share the code with your study buddy

2. **Join a Room**
   - Enter your name and the room code
   - Join the session

3. **Study Together**
   - Video call automatically connects when both users join
   - Draw on the whiteboard together
   - Track tasks in the todo list
   - Use Pomodoro timer for focus sessions
   - Celebrate "Aha!" moments

4. **Customize**
   - Toggle light/dark theme (independent per user)
   - Switch between shared and individual todo modes
   - Use Focus Lock to minimize distractions

## Convex Schema Overview

### Tables
- `rooms` — Session data, Pomodoro state, participants
- `users` — User info, media state, peer IDs
- `whiteboardStrokes` — Drawing data with points, colors, shapes
- `todos` — Task items with completion status
- `ahaMoments` — Celebration timestamps
- `sessionNotes` — Shared notepad content
- `reactions` — Emoji reactions
- `signalingMessages` — WebRTC signaling data

## Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy Convex
```bash
convex deploy
```

## Design Tokens

### Colors (Apple + ElevenLabs Blend)
- **Primary:** #0066cc (Apple Action Blue)
- **Canvas:** #ffffff (Apple Pure White)
- **Canvas Parchment:** #f5f5f7 (Apple Parchment)
- **Tile Dark:** #272729 (Apple Near-Black)
- **Orb Colors:** mint, peach, lavender, sky, rose (ElevenLabs gradients)

### Typography
- **Font:** Inter (Apple's SF Pro substitute)
- **Display:** 56px/600/-0.28px tracking (Apple style)
- **Body:** 17px/400/1.47 line-height
- **Pill Buttons:** 9999px border-radius

### Spacing
- **Section:** 80px (Apple) / 96px (ElevenLabs blended)
- **Card Padding:** 24px
- **Gutter:** 20-24px

## License

MIT — Built for students who are tired of studying alone.
