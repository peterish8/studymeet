"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import SimplePeer from "simple-peer";
import { motion } from "framer-motion";

interface VideoCallProps {
  roomId: string;
  userId: string;
  otherUserId?: string;
}

export function VideoCall({ roomId, userId, otherUserId }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected" | "ended" | "reconnecting">("idle");
  const [connectionEpoch, setConnectionEpoch] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { isFocusLock } = useStore();
  const user = useQuery(api.users.get, userId ? { userId: userId as Id<"users"> } : "skip");
  const otherUser = useQuery(api.users.get, otherUserId ? { userId: otherUserId as Id<"users"> } : "skip");
  const signalingMessages = useQuery(api.signaling.getMessages, userId ? { roomId: roomId as Id<"rooms">, toUserId: userId as Id<"users"> } : "skip");

  const updateMediaState = useMutation(api.users.updateMediaState);
  const sendSignal = useMutation(api.signaling.sendMessage);
  const deleteSignal = useMutation(api.signaling.deleteMessage);

  // Initialize local stream
  useEffect(() => {
    let stream: MediaStream;

    const initLocalStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Sync actual device state with backend
        await updateMediaState({ actorUserId: userId as Id<"users">, userId: userId as Id<"users">, isMicOn: true, isCameraOn: true });
      } catch (err) {
        console.error("Failed to get local stream:", err);
      }
    };

    initLocalStream();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [userId]);

  // Initialize WebRTC peer
  useEffect(() => {
    if (!localStream || !otherUserId || callState === "ended") return;

    // Determine if we're the initiator (first user in room)
    const isInitiator = userId < otherUserId;

    const newPeer = new SimplePeer({
      initiator: isInitiator,
      stream: localStream,
      trickle: false,
    });

    newPeer.on("signal", async (data) => {
      await sendSignal({
        roomId: roomId as Id<"rooms">,
        fromUserId: userId as Id<"users">,
        actorUserId: userId as Id<"users">,
        toUserId: otherUserId as Id<"users">,
        type: data.type === "offer" ? "offer" : data.type === "answer" ? "answer" : "ice-candidate",
        payload: JSON.stringify(data),
      });
    });

    newPeer.on("stream", (stream) => {
      setRemoteStream(stream);
      setCallState("connected");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    newPeer.on("error", (err) => {
      console.error("Peer error:", err);
      setCallState("reconnecting");
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, [localStream, otherUserId, roomId, userId, callState, connectionEpoch]);

  useEffect(() => {
    if (callState !== "reconnecting") return;
    const t = setTimeout(() => {
      setCallState("connecting");
      setConnectionEpoch((v) => v + 1);
    }, 5000);
    return () => clearTimeout(t);
  }, [callState]);

  // Handle incoming signals
  useEffect(() => {
    if (!peer || !signalingMessages) return;

    signalingMessages.forEach(async (msg: any) => {
      const data = JSON.parse(msg.payload);
      peer.signal(data);
      await deleteSignal({ messageId: msg._id, actorUserId: userId as Id<"users"> });
    });
  }, [signalingMessages, peer, deleteSignal]);

  // Toggle mic
  const toggleMic = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        await updateMediaState({
          actorUserId: userId as Id<"users">,
          userId: userId as Id<"users">,
          isMicOn: audioTrack.enabled,
          isCameraOn: user?.isCameraOn ?? true,
        });
      }
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        await updateMediaState({
          actorUserId: userId as Id<"users">,
          userId: userId as Id<"users">,
          isMicOn: user?.isMicOn ?? true,
          isCameraOn: videoTrack.enabled,
        });
      }
    }
  };

  if (isFocusLock) return null;

  const handleEndCall = () => {
    peer?.destroy();
    setPeer(null);
    setRemoteStream(null);
    setCallState("ended");
    setTimeout(() => {
      setCallState("reconnecting");
      setConnectionEpoch((v) => v + 1);
    }, 5000);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className={`fixed bottom-6 right-6 z-30 rounded-xl border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900 ${
        isCompact ? "w-48" : "w-80"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Video Call</p>
        <button
          onClick={() => setIsCompact((prev) => !prev)}
          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {isCompact ? "Expand" : "Collapse"}
        </button>
      </div>
      <div className={`grid gap-3 ${isCompact ? "grid-cols-1" : "grid-cols-2"}`}>
        <div className="relative aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full rounded-lg object-cover border ${
              user?.isCameraOn ? "border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700"
            }`}
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">You</span>
        </div>
        <div className="relative aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full rounded-lg object-cover border ${
              remoteStream ? "border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700"
            }`}
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Waiting for connection...
            </div>
          )}
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {otherUser?.name || "Partner"}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${user?.isMicOn ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"} hover:opacity-80 transition-opacity dark:${user?.isMicOn ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            {user?.isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleCamera}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${user?.isCameraOn ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"} hover:opacity-80 transition-opacity dark:${user?.isCameraOn ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            {user?.isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEndCall}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:opacity-85"
            aria-label="End call"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{callState}</p>
        </div>
      </div>
      {!otherUserId && (
        <div className="mt-2 rounded-md bg-surface-muted px-2 py-1 text-caption text-ink-muted dark:bg-cursor-elevated dark:text-ink-dark-secondary">
          Invite your buddy with room code to start call.
        </div>
      )}
    </motion.div>
  );
}
