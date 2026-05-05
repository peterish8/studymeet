"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, X, GripVertical, Check, Palette } from "lucide-react";

interface FloatingNotesProps {
  roomId: string;
  userId: string;
  userName: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const NOTE_COLORS = [
  { name: "yellow", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-900" },
  { name: "blue", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-900" },
  { name: "green", bg: "bg-green-100", border: "border-green-300", text: "text-green-900" },
  { name: "pink", bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-900" },
  { name: "purple", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-900" },
];

export function FloatingNotes({ roomId, userId, userName, containerRef }: FloatingNotesProps) {
  const notes = useQuery(api.floatingNotes.getNotes, { roomId: roomId as Id<"rooms"> });
  const createNote = useMutation(api.floatingNotes.create);
  const updateContent = useMutation(api.floatingNotes.updateContent);
  const updatePosition = useMutation(api.floatingNotes.updatePosition);
  const deleteNote = useMutation(api.floatingNotes.deleteNote);

  const [isCreating, setIsCreating] = useState(false);
  const [newNotePos, setNewNotePos] = useState({ x: 0, y: 0 });
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("yellow");
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle click on container to create note
  const handleContainerClick = useCallback((e: MouseEvent) => {
    if (isCreating) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing note
    const target = e.target as HTMLElement;
    if (target.closest('[data-note-id]')) return;

    setNewNotePos({ x, y });
    setIsCreating(true);
  }, [isCreating, containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("click", handleContainerClick);
    return () => container.removeEventListener("click", handleContainerClick);
  }, [containerRef, handleContainerClick]);

  // Create the note
  const handleCreateNote = useCallback(async (content: string) => {
    if (!content.trim()) {
      setIsCreating(false);
      return;
    }

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);

    await createNote({
      roomId: roomId as Id<"rooms">,
      userId: userId as Id<"users">,
      actorUserId: userId as Id<"users">,
      userName,
      x: Math.max(20, newNotePos.x - 100),
      y: Math.max(20, newNotePos.y - 50),
      content: content.trim(),
      color: selectedColor,
    });

    setIsCreating(false);
  }, [createNote, roomId, userId, userName, newNotePos, selectedColor]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, noteId: string, noteX: number, noteY: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragOffset.current = {
      x: e.clientX - noteX,
      y: e.clientY - noteY,
    };
    setDraggedNote(noteId);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNote) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.current.x, rect.width - 200));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.current.y, rect.height - 120));

    // Optimistic update - don't await to keep it smooth
    updatePosition({ noteId: draggedNote as any, actorUserId: userId as Id<"users">, x, y });
  }, [draggedNote, updatePosition, containerRef]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (draggedNote) {
      setDraggedNote(null);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  }, [draggedNote]);

  // Global mouse events for dragging
  useEffect(() => {
    if (draggedNote) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e as any);
      const handleMouseUp = () => handleDragEnd();

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedNote, handleDragMove, handleDragEnd]);

  const handleDelete = useCallback(async (noteId: string) => {
    if (navigator.vibrate) navigator.vibrate([30, 50]);
    await deleteNote({ noteId: noteId as any, actorUserId: userId as Id<"users"> });
  }, [deleteNote]);

  const handleContentChange = useCallback(async (noteId: string, content: string) => {
    await updateContent({ noteId: noteId as any, actorUserId: userId as Id<"users">, content });
  }, [updateContent]);

  const getColorStyles = (colorName: string) => {
    return NOTE_COLORS.find(c => c.name === colorName) || NOTE_COLORS[0];
  };

  return (
    <>
      {/* Click catcher overlay when in creating mode */}
      {isCreating && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
          onClick={() => setIsCreating(false)}
        />
      )}

      {/* New Note Input Overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-white dark:bg-cursor-surface rounded-xl shadow-2xl border border-divider-hairline dark:border-cursor-border p-4"
            style={{
              left: newNotePos.x,
              top: newNotePos.y,
              width: 240,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-ink-muted" />
              <span className="text-caption-strong text-ink dark:text-ink-dark-primary">New Note</span>
            </div>
            
            {/* Color picker */}
            <div className="flex gap-1 mb-3">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-6 h-6 rounded-full ${color.bg} border-2 transition-all ${
                    selectedColor === color.name ? "border-ink scale-110" : "border-transparent"
                  }`}
                />
              ))}
            </div>

            <textarea
              autoFocus
              placeholder="Type your note..."
              className="w-full h-24 p-2 text-sm bg-canvas dark:bg-cursor-elevated border border-divider-hairline dark:border-cursor-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  handleCreateNote(e.currentTarget.value);
                }
                if (e.key === "Escape") {
                  setIsCreating(false);
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-caption text-ink-muted hover:text-ink dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                  handleCreateNote(textarea?.value || "");
                }}
                className="px-3 py-1.5 text-caption bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Notes */}
      <AnimatePresence>
        {notes?.map((note) => {
          const colors = getColorStyles(note.color);
          const isDragging = draggedNote === note._id;
          
          return (
            <motion.div
              key={note._id}
              data-note-id={note._id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute z-30 rounded-xl shadow-lg border-2 ${colors.bg} ${colors.border} ${isDragging ? "shadow-2xl z-50 cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: note.x,
                top: note.y,
                width: note.width || 200,
                minHeight: note.height || 100,
              }}
            >
              {/* Drag Handle */}
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-black/10 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleDragStart(e, note._id, note.x, note.y)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-ink/30" />
                  <span className="text-micro-legal text-ink/60">{note.userName}</span>
                </div>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-ink/50" />
                </button>
              </div>

              {/* Note Content */}
              <textarea
                defaultValue={note.content}
                className={`w-full p-3 bg-transparent resize-none focus:outline-none text-sm ${colors.text} placeholder:text-ink/30`}
                style={{ minHeight: 60 }}
                onBlur={(e) => handleContentChange(note._id, e.target.value)}
                placeholder="Empty note..."
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Instructions tooltip */}
      {!isCreating && (!notes || notes.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="bg-ink/80 dark:bg-cursor-elevated/90 text-white px-4 py-2 rounded-full text-caption backdrop-blur-sm">
            Click anywhere to add a sticky note
          </div>
        </motion.div>
      )}
    </>
  );
}

// Hook to enable note creation mode
export function useNoteCreation(containerRef: React.RefObject<HTMLDivElement>, enabled: boolean) {
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      if (isCreating) return;
      
      // Check if clicking on existing interactive element
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('textarea') || target.closest('[data-note-id]')) {
        return;
      }

      setIsCreating(true);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef, enabled, isCreating]);

  return { isCreating, setIsCreating };
}
