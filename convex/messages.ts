import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roomMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt || actor.name !== args.userName) {
      throw new Error("Unauthorized");
    }
    const text = args.content.trim();
    if (!text) return;
    await ctx.db.insert("roomMessages", {
      roomId: args.roomId,
      userId: args.userId,
      userName: args.userName,
      content: text,
      createdAt: Date.now(),
    });
  },
});
