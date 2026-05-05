import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get pending signaling messages for a user
export const getMessages = query({
  args: {
    roomId: v.id("rooms"),
    toUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("signalingMessages")
      .withIndex("by_room_and_to_user", (q) =>
        q.eq("roomId", args.roomId).eq("toUserId", args.toUserId)
      )
      .collect();

    return messages;
  },
});

// Send signaling message
export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    fromUserId: v.id("users"),
    toUserId: v.optional(v.id("users")),
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice-candidate")),
    payload: v.string(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.fromUserId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) throw new Error("Unauthorized");
    await ctx.db.insert("signalingMessages", {
      roomId: args.roomId,
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      type: args.type,
      payload: args.payload,
      createdAt: Date.now(),
    });
  },
});

// Delete signaling message after processed
export const deleteMessage = mutation({
  args: { messageId: v.id("signalingMessages"), actorUserId: v.id("users") },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== msg.roomId || actor.leftAt) throw new Error("Unauthorized");
    await ctx.db.delete(args.messageId);
  },
});
