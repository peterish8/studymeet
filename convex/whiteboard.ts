import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all strokes for a room
export const getStrokes = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const strokes = await ctx.db
      .query("whiteboardStrokes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return strokes.map((stroke) => ({
      ...stroke,
      // Normalize legacy records that were created before elementId existed.
      elementId: stroke.elementId ?? String(stroke._id),
    }));
  },
});

// Add a stroke
export const addStroke = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    actorUserId: v.id("users"),
    elementId: v.string(),
    type: v.union(v.literal("pen"), v.literal("shape"), v.literal("text")),
    points: v.array(v.object({ x: v.number(), y: v.number() })),
    color: v.string(),
    strokeWidth: v.number(),
    shapeType: v.optional(v.union(v.literal("rectangle"), v.literal("circle"), v.literal("arrow"), v.literal("line"))),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.actorUserId !== args.userId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("whiteboardStrokes")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("userId", args.userId))
      .collect();
    const matched = existing.find((s: any) => (s.elementId ?? String(s._id)) === args.elementId);
    if (matched) {
      await ctx.db.patch(matched._id, {
        // Heal old docs by writing elementId when they are touched.
        elementId: matched.elementId ?? args.elementId,
        type: args.type,
        points: args.points,
        color: args.color,
        strokeWidth: args.strokeWidth,
        shapeType: args.shapeType,
        text: args.text,
      });
      return matched._id;
    }

    await ctx.db.insert("whiteboardStrokes", {
      roomId: args.roomId,
      userId: args.userId,
      elementId: args.elementId,
      type: args.type,
      points: args.points,
      color: args.color,
      strokeWidth: args.strokeWidth,
      shapeType: args.shapeType,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

export const removeStroke = mutation({
  args: {
    roomId: v.id("rooms"),
    actorUserId: v.id("users"),
    elementId: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) throw new Error("Unauthorized");
    const strokes = await ctx.db
      .query("whiteboardStrokes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const stroke of strokes as any[]) {
      if ((stroke.elementId ?? String(stroke._id)) === args.elementId) {
        await ctx.db.delete(stroke._id);
      }
    }
  },
});

// Clear all strokes (with confirmation)
export const clearAll = mutation({
  args: { roomId: v.id("rooms"), actorUserId: v.id("users") },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) throw new Error("Unauthorized");
    const strokes = await ctx.db
      .query("whiteboardStrokes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const stroke of strokes) {
      await ctx.db.delete(stroke._id);
    }
  },
});
