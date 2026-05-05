"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDebouncedCallback } from "use-debounce";

interface NotesPadProps {
  roomId: string;
  userId: string;
}

export function NotesPad({ roomId, userId }: NotesPadProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const notes = useQuery(api.notes.get, { roomId: roomId as Id<"rooms"> });
  const updateNotes = useMutation(api.notes.update);

  // Sync with server
  useEffect(() => {
    if (notes && !isTyping) {
      setContent(notes.content);
    }
  }, [notes, isTyping]);

  // Debounced save
  const debouncedSave = useDebouncedCallback(async (text: string) => {
    await updateNotes({ roomId: roomId as Id<"rooms">, content: text, updatedBy: userId as Id<"users">, actorUserId: userId as Id<"users"> });
    setIsTyping(false);
  }, 1000);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setIsTyping(true);
    debouncedSave(text);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-strong text-ink dark:text-white">Session Notes</h3>
        {isTyping && (
          <span className="text-fine-print text-ink-muted">Saving...</span>
        )}
        {!isTyping && notes && (
          <span className="text-fine-print text-ink-muted">
            Last updated {new Date(notes.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type notes here... Both you and your study buddy can edit this."
        className="flex-1 w-full p-4 rounded-lg bg-canvas-parchment dark:bg-tile-1 border border-divider-hairline resize-none focus:outline-none focus:ring-2 focus:ring-primary text-body text-ink dark:text-white"
        spellCheck={false}
      />
      
      <p className="mt-3 text-fine-print text-ink-muted">
        Shared notepad - edits sync in real-time
      </p>
    </div>
  );
}
