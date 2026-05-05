import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all floating notes for a room
export const getNotes = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const notes = await ctx.db
      .query("floatingNotes")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("desc")
      .take(100);
    return notes;
  },
});

// Create a new floating note
export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    userName: v.string(),
    x: v.number(),
    y: v.number(),
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { roomId, userId, userName, x, y, content, color, actorUserId }) => {
    if (actorUserId !== userId) throw new Error("Unauthorized");
    const actor = await ctx.db.get(actorUserId);
    if (!actor || actor.roomId !== roomId || actor.leftAt || actor.name !== userName) throw new Error("Unauthorized");
    const now = Date.now();
    const noteId = await ctx.db.insert("floatingNotes", {
      roomId,
      userId,
      userName,
      content: content || "",
      x,
      y,
      width: 200,
      height: 120,
      color: color || "yellow",
      createdAt: now,
      updatedAt: now,
    });
    return noteId;
  },
});

// Update note content
export const updateContent = mutation({
  args: {
    noteId: v.id("floatingNotes"),
    content: v.string(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { noteId, content, actorUserId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== actorUserId) throw new Error("Unauthorized");
    await ctx.db.patch(noteId, {
      content,
      updatedAt: Date.now(),
    });
  },
});

// Update note position (drag)
export const updatePosition = mutation({
  args: {
    noteId: v.id("floatingNotes"),
    x: v.number(),
    y: v.number(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { noteId, x, y, actorUserId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== actorUserId) throw new Error("Unauthorized");
    await ctx.db.patch(noteId, {
      x,
      y,
      updatedAt: Date.now(),
    });
  },
});

// Update note size (resize)
export const updateSize = mutation({
  args: {
    noteId: v.id("floatingNotes"),
    width: v.number(),
    height: v.number(),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { noteId, width, height, actorUserId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== actorUserId) throw new Error("Unauthorized");
    await ctx.db.patch(noteId, {
      width,
      height,
      updatedAt: Date.now(),
    });
  },
});

// Delete a note
export const deleteNote = mutation({
  args: {
    noteId: v.id("floatingNotes"),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, { noteId, actorUserId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== actorUserId) throw new Error("Unauthorized");
    await ctx.db.delete(noteId);
  },
});

// Clear all notes for a room (only by room participants)
export const clearAll = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, { roomId }) => {
    const notes = await ctx.db
      .query("floatingNotes")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
  },
});
