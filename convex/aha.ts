import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all aha moments for room
export const getMoments = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const moments = await ctx.db
      .query("ahaMoments")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .collect();

    return moments;
  },
});

// Add aha moment
export const add = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt || actor.name !== args.userName) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("ahaMoments", {
      roomId: args.roomId,
      userId: args.userId,
      userName: args.userName,
      timestamp: Date.now(),
    });
  },
});

// Get aha count
export const getCount = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const moments = await ctx.db
      .query("ahaMoments")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return moments.length;
  },
});
