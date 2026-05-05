import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    accountId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_account_id", ["accountId"]),

  // Rooms - main session container
  rooms: defineTable({
    code: v.string(), // 6-character room code
    name: v.optional(v.string()), // optional session name
    creatorId: v.string(), // user who created the room
    participantIds: v.array(v.string()), // max 2 users
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("ended")),
    createdAt: v.number(),
    endedAt: v.optional(v.number()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))), // creator's theme preference
    pomodoroState: v.optional(v.object({
      isRunning: v.boolean(),
      isFocusMode: v.boolean(),
      timeRemaining: v.number(), // in seconds
      totalDuration: v.number(),
      startedAt: v.optional(v.number()),
      pausedAt: v.optional(v.number()),
    })),
    finalizedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"]),

  // Users in a room
  users: defineTable({
    roomId: v.id("rooms"),
    accountId: v.optional(v.string()),
    name: v.string(),
    peerId: v.optional(v.string()), // for WebRTC
    theme: v.union(v.literal("light"), v.literal("dark")),
    isMicOn: v.boolean(),
    isCameraOn: v.boolean(),
    isStuck: v.boolean(), // "stuck" signal
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_name", ["roomId", "name"]),

  // Whiteboard strokes
  whiteboardStrokes: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    // Optional for backward compatibility with legacy records created
    // before elementId existed. New writes should always include it.
    elementId: v.optional(v.string()),
    type: v.union(v.literal("pen"), v.literal("shape"), v.literal("text")),
    points: v.array(v.object({ x: v.number(), y: v.number() })),
    color: v.string(),
    strokeWidth: v.number(),
    shapeType: v.optional(v.union(v.literal("rectangle"), v.literal("circle"), v.literal("arrow"), v.literal("line"))),
    text: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Todo items
  todos: defineTable({
    roomId: v.id("rooms"),
    userId: v.optional(v.id("users")), // null = shared task
    text: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Aha moments
  ahaMoments: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    timestamp: v.number(),
  })
    .index("by_room", ["roomId"]),

  // Session notes (shared notepad)
  sessionNotes: defineTable({
    roomId: v.id("rooms"),
    content: v.string(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_room", ["roomId"]),

  // Reactions (emoji floaters)
  reactions: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    emoji: v.string(), // 👍 💡 😵 🔥
    timestamp: v.number(),
  })
    .index("by_room", ["roomId"]),

  // Floating sticky notes (draggable)
  floatingNotes: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    x: v.number(), // position in pixels
    y: v.number(),
    width: v.number(),
    height: v.number(),
    color: v.string(), // note color theme
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Messages for signaling (WebRTC)
  signalingMessages: defineTable({
    roomId: v.id("rooms"),
    fromUserId: v.id("users"),
    toUserId: v.optional(v.id("users")), // null = broadcast
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice-candidate")),
    payload: v.string(), // JSON string
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_to_user", ["roomId", "toUserId"]),

  roomMessages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),

  studySessions: defineTable({
    roomId: v.id("rooms"),
    roomCode: v.string(),
    roomName: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.number(),
    durationSec: v.number(),
    participantIds: v.array(v.id("users")),
    participantAccountIds: v.array(v.string()),
    ahaCount: v.number(),
    todosCompleted: v.number(),
    todosTotal: v.number(),
    pomodoroRounds: v.number(),
    notesUpdatedCount: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_ended_at", ["endedAt"]),

  studySessionParticipants: defineTable({
    sessionId: v.id("studySessions"),
    userId: v.id("users"),
    accountId: v.optional(v.string()),
    name: v.string(),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    todoTotal: v.number(),
    todoCompleted: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_account_id", ["accountId"]),
});
