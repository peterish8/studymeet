"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

interface WhiteboardProps {
  roomId: string;
  userId: string;
}

export function Whiteboard({ roomId, userId }: WhiteboardProps) {
  const { isFocusMode } = useStore();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousElementIdsRef = useRef<Set<string>>(new Set());

  const strokes = useQuery(api.whiteboard.getStrokes, { roomId: roomId as Id<"rooms"> });
  const addStroke = useMutation(api.whiteboard.addStroke);
  const removeStroke = useMutation(api.whiteboard.removeStroke);

  // Load saved strokes into Excalidraw
  useEffect(() => {
    if (excalidrawAPI && strokes) {
      const elements = strokes.map((stroke: any) => {
        const elementId = stroke.elementId ?? stroke._id;
        if (stroke.type === "pen" && stroke.points.length > 0) {
          return {
            id: elementId,
            type: "freedraw",
            points: stroke.points.map((p: any) => [p.x, p.y, 0.5]),
            strokeColor: stroke.color,
            strokeWidth: stroke.strokeWidth,
            isDeleted: false,
          };
        } else if (stroke.type === "text" && stroke.text) {
          return {
            id: elementId,
            type: "text",
            x: stroke.points[0].x,
            y: stroke.points[0].y,
            text: stroke.text,
            strokeColor: stroke.color,
            fontSize: stroke.strokeWidth * 8 + 16,
            isDeleted: false,
          };
        }
        return null;
      }).filter(Boolean);

      excalidrawAPI.updateScene({ elements });
    }
  }, [excalidrawAPI, strokes]);

  // Handle changes from Excalidraw with debouncing
  const handleChange = useCallback((elements: any, appState: any) => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save to avoid too frequent updates
    saveTimeoutRef.current = setTimeout(async () => {
      if (!excalidrawAPI) return;

      const currentIds = new Set<string>();
      for (const element of elements) {
        if (element.isDeleted) continue;
        if (!element.id) continue;
        currentIds.add(element.id);

        if (element.type === "freedraw" && element.points) {
          const points = element.points.map((p: number[]) => ({ x: p[0], y: p[1] }));
          await addStroke({
            roomId: roomId as Id<"rooms">,
            userId: userId as Id<"users">,
            actorUserId: userId as Id<"users">,
            elementId: element.id,
            type: "pen",
            points,
            color: element.strokeColor || "#1d1d1f",
            strokeWidth: element.strokeWidth || 2,
          });
        } else if (element.type === "text") {
          await addStroke({
            roomId: roomId as Id<"rooms">,
            userId: userId as Id<"users">,
            actorUserId: userId as Id<"users">,
            elementId: element.id,
            type: "text",
            points: [{ x: element.x, y: element.y }],
            color: element.strokeColor || "#1d1d1f",
            strokeWidth: 2,
            text: element.text,
          });
        }
      }

      for (const previousId of Array.from(previousElementIdsRef.current)) {
        if (!currentIds.has(previousId)) {
          await removeStroke({
            roomId: roomId as Id<"rooms">,
            actorUserId: userId as Id<"users">,
            elementId: previousId,
          });
        }
      }
      previousElementIdsRef.current = currentIds;
    }, 1000); // 1 second debounce
  }, [excalidrawAPI, roomId, userId, addStroke, removeStroke]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isFocusMode) return null;

  return (
    <div className="absolute inset-0 bg-white">
      <Excalidraw
        onChange={handleChange}
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        UIOptions={{
          tools: {
            image: false,
          },
        }}
      />
    </div>
  );
}
