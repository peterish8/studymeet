import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user by ID
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get users in room
export const getInRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return users.filter((u) => !u.leftAt);
  },
});

// Update user theme
export const updateTheme = mutation({
  args: {
    actorUserId: v.id("users"),
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark")),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, {
      theme: args.theme,
    });
  },
});

// Update media state (mic/camera)
export const updateMediaState = mutation({
  args: {
    actorUserId: v.id("users"),
    userId: v.id("users"),
    isMicOn: v.boolean(),
    isCameraOn: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, {
      isMicOn: args.isMicOn,
      isCameraOn: args.isCameraOn,
    });
  },
});

// Update peer ID for WebRTC
export const updatePeerId = mutation({
  args: {
    actorUserId: v.id("users"),
    userId: v.id("users"),
    peerId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, {
      peerId: args.peerId,
    });
  },
});

// Set "stuck" signal
export const setStuck = mutation({
  args: {
    actorUserId: v.id("users"),
    userId: v.id("users"),
    isStuck: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, {
      isStuck: args.isStuck,
    });
  },
});
