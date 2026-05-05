import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get session notes for room
export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("sessionNotes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    return notes;
  },
});

// Update session notes
export const update = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
    updatedBy: v.id("users"),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt || args.updatedBy !== args.actorUserId) {
      throw new Error("Unauthorized");
    }
    const existing = await ctx.db
      .query("sessionNotes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    } else {
      await ctx.db.insert("sessionNotes", {
        roomId: args.roomId,
        content: args.content,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    }
  },
});
