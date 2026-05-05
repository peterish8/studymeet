"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { formatDuration } from "@/lib/utils";
import { Clock, Zap, CheckCircle, Users, X, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface SessionSummaryProps {
  roomId: string;
  sessionStartTime: number;
  onClose: () => void;
}

export function SessionSummary({ roomId, sessionStartTime, onClose }: SessionSummaryProps) {
  const summary = useQuery(api.rooms.getSummary, { roomId: roomId as Id<"rooms"> });

  const handleCopy = () => {
    if (!summary) return;
    
    const text = `
Study Session Summary
====================
Duration: ${formatDuration(sessionStartTime, Date.now())}
Aha Moments: ${summary.ahaCount}
Tasks Completed: ${summary.todosCompleted}/${summary.todosTotal}
Participants: ${summary.participants.map((p: any) => p.name).join(", ")}
    `.trim();
    
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-tile-1 rounded-2xl max-w-md w-full p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orb-mint to-orb-sky flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-display-md font-semibold text-ink dark:text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-body text-ink-muted dark:text-white/70">
            Great work studying together!
          </p>
        </div>

        {/* Stats */}
        {summary && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-canvas-parchment dark:bg-tile-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-caption text-ink-muted">Duration</p>
                <p className="text-body-strong text-ink dark:text-white">
                  {formatDuration(sessionStartTime, Date.now())}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-canvas-parchment dark:bg-tile-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orb-peach/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-caption text-ink-muted">Aha Moments</p>
                <p className="text-body-strong text-ink dark:text-white">
                  {summary.ahaCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-canvas-parchment dark:bg-tile-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orb-mint/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-caption text-ink-muted">Tasks Completed</p>
                <p className="text-body-strong text-ink dark:text-white">
                  {summary.todosCompleted}/{summary.todosTotal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-canvas-parchment dark:bg-tile-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orb-lavender/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-caption text-ink-muted">Participants</p>
                <p className="text-body-strong text-ink dark:text-white">
                  {summary.participants.map((p: any) => p.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCopy} className="flex-1 gap-2">
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
