import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { generateRoomCode } from "../src/lib/utils";

// Get room by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    return room;
  },
});

export const getOpenRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        const users = await ctx.db
          .query("users")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();
        const activeUsers = users.filter((u) => !u.leftAt);
        return {
          ...room,
          activeCount: activeUsers.length,
          participants: activeUsers.map((u) => ({ _id: u._id, name: u.name })),
        };
      })
    );

    return enriched.filter((room) => room.activeCount < 2).slice(0, 20);
  },
});

// Get room by ID with participants
export const getWithParticipants = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const activeUsers = users.filter((u) => !u.leftAt);

    return {
      ...room,
      participants: activeUsers,
    };
  },
});

// Create new room
export const create = mutation({
  args: {
    creatorName: v.string(),
    roomName: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique room code
    let code = generateRoomCode();
    let existing = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    // Keep generating until unique
    while (existing) {
      code = generateRoomCode();
      existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
    }

    // Create room
    const roomId = await ctx.db.insert("rooms", {
      code,
      name: args.roomName,
      creatorId: "temp", // Will update after user creation
      participantIds: [],
      status: "waiting",
      createdAt: Date.now(),
      theme: args.theme || "light",
    });

    // Create creator user
    const userId = await ctx.db.insert("users", {
      roomId,
      accountId: args.accountId,
      name: args.creatorName,
      theme: args.theme || "light",
      isMicOn: false,
      isCameraOn: false,
      isStuck: false,
      joinedAt: Date.now(),
    });

    // Update room with creator
    await ctx.db.patch(roomId, {
      creatorId: userId,
      participantIds: [userId],
    });

    return { roomId, userId, code };
  },
});

// Join existing room
export const join = mutation({
  args: {
    code: v.string(),
    userName: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status === "ended") {
      throw new Error("Room has ended");
    }

    // Check if room is full
    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const activeUsers = users.filter((u) => !u.leftAt);

    if (activeUsers.length >= 2) {
      throw new Error("Room is full. This session is private.");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      roomId: room._id,
      accountId: args.accountId,
      name: args.userName,
      theme: args.theme || "light",
      isMicOn: false,
      isCameraOn: false,
      isStuck: false,
      joinedAt: Date.now(),
    });

    // Update room status
    const newParticipantIds = [...room.participantIds, userId];
    await ctx.db.patch(room._id, {
      participantIds: newParticipantIds,
      status: newParticipantIds.length >= 2 ? "active" : "waiting",
    });

    return { roomId: room._id, userId };
  },
});

// Leave room
export const leave = mutation({
  args: { roomId: v.id("rooms"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.roomId !== args.roomId || user.leftAt) return;

    await ctx.db.patch(args.userId, {
      leftAt: Date.now(),
    });

    const room = await ctx.db.get(args.roomId);
    if (!room) return;

    // Check remaining users
    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const activeUsers = users.filter((u) => !u.leftAt);

    if (activeUsers.length === 0) {
      // End room if no one left
      await ctx.db.patch(args.roomId, {
        status: "ended",
        endedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.roomId, {
        participantIds: activeUsers.map((u) => u._id),
        status: "waiting",
      });
    }
  },
});

// Update Pomodoro state
export const updatePomodoro = mutation({
  args: {
    roomId: v.id("rooms"),
    actorUserId: v.id("users"),
    pomodoroState: v.object({
      isRunning: v.boolean(),
      isFocusMode: v.boolean(),
      timeRemaining: v.number(),
      totalDuration: v.number(),
      startedAt: v.optional(v.number()),
      pausedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) {
      throw new Error("Unauthorized room access");
    }
    await ctx.db.patch(args.roomId, {
      pomodoroState: args.pomodoroState,
    });
  },
});

// Get session summary
export const getSummary = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const ahaMoments = await ctx.db
      .query("ahaMoments")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const endTime = room.endedAt || Date.now();
    const duration = Math.floor((endTime - room.createdAt) / 1000);

    return {
      duration,
      ahaCount: ahaMoments.length,
      todosCompleted: todos.filter((t) => t.isCompleted).length,
      todosTotal: todos.length,
      participants: users.map((u) => ({
        name: u.name,
        joinedAt: u.joinedAt,
        leftAt: u.leftAt,
      })),
    };
  },
});
