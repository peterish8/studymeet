"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface AhaButtonProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function AhaButton({ roomId, userId, userName }: AhaButtonProps) {
  const addAha = useMutation(api.aha.add);
  const moments = useQuery(api.aha.getMoments, { roomId: roomId as Id<"rooms"> });
  const prevCountRef = useRef<number | null>(null);

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#a7e5d3", "#f4c5a8", "#c8b8e0", "#a8c8e8", "#e8b8c4"];

    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  // Fire confetti on both screens whenever a new Aha moment is added by either user
  useEffect(() => {
    if (moments === undefined) return;
    if (prevCountRef.current === null) {
      prevCountRef.current = moments.length;
      return;
    }
    if (moments.length > prevCountRef.current) {
      triggerConfetti();
      const audio = new Audio("/aha-sound.mp3");
      audio.play().catch(() => {});
    }
    prevCountRef.current = moments.length;
  }, [moments, triggerConfetti]);

  const handleClick = async () => {
    await addAha({ roomId: roomId as Id<"rooms">, userId: userId as Id<"users">, actorUserId: userId as Id<"users">, userName });
  };

  return (
    <Button
      onClick={handleClick}
      size="sm"
      className="gap-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 text-white border-0 shadow-sm"
    >
      <Zap className="w-4 h-4" />
      <span className="hidden sm:inline">Aha!</span>
    </Button>
  );
}
