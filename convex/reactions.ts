import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get recent reactions for room (last 5 minutes)
export const getRecent = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return reactions.filter((r) => r.timestamp > fiveMinutesAgo);
  },
});

// Add reaction
export const add = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    emoji: v.string(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt || actor.name !== args.userName) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("reactions", {
      roomId: args.roomId,
      userId: args.userId,
      userName: args.userName,
      emoji: args.emoji,
      timestamp: Date.now(),
    });
  },
});

// Cleanup old reactions (can be called periodically)
export const cleanup = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const reaction of reactions) {
      if (reaction.timestamp <= fiveMinutesAgo) {
        await ctx.db.delete(reaction._id);
      }
    }
  },
});
