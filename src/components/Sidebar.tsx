"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TodoList } from "./TodoList";
import { NotesPad } from "./NotesPad";
import { getInitials } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ListTodo, Zap, Users, FileText, HelpCircle, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  roomId: string;
  userId: string;
  user: any;
  otherUser: any;
}

export function Sidebar({ roomId, userId, user, otherUser }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("todos");
  const [message, setMessage] = useState("");

  const ahaMoments = useQuery(api.aha.getMoments, { roomId: roomId as Id<"rooms"> });
  const messages = useQuery((api as any).messages.getByRoom, { roomId }) as any[] | undefined;
  const setStuck = useMutation(api.users.setStuck);
  const sendMessage = useMutation((api as any).messages.send);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage({
      roomId: roomId as Id<"rooms">,
      userId: userId as Id<"users">,
      actorUserId: userId as Id<"users">,
      userName: user.name,
      content: message,
    });
    setMessage("");
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex p-1 gap-1">
          {[
            { id: "todos", icon: ListTodo, label: "Tasks" },
            { id: "aha", icon: Zap, label: "Aha!" },
            { id: "people", icon: Users, label: "People" },
            { id: "notes", icon: FileText, label: "Notes" },
            { id: "chat", icon: MessageSquare, label: "Chat" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "todos" && <TodoList roomId={roomId} userId={userId} />}

        {activeTab === "aha" && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Aha! Moments ({ahaMoments?.length || 0})
            </h3>
            <div className="space-y-3">
              {ahaMoments?.map((moment: any, index: number) => (
                <motion.div
                  key={moment._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {moment.userName} had an Aha!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(moment.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {(!ahaMoments || ahaMoments.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
                  No aha moments yet. Click the button when inspiration strikes!
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "people" && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Participants
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-semibold flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name} (You)
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isMicOn ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{user.isMicOn ? "Mic on" : "Mic off"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isCameraOn ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{user.isCameraOn ? "Cam on" : "Cam off"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStuck({ actorUserId: userId as Id<"users">, userId: userId as Id<"users">, isStuck: !user.isStuck })}
                  className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors flex-shrink-0 ${
                    user.isStuck
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <HelpCircle className="w-3 h-3" />
                  {user.isStuck ? "Stuck" : "Help?"}
                </button>
              </div>

              {otherUser && (
                <>
                  {otherUser.isStuck && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <HelpCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        🙋 {otherUser.name} is stuck — they need help!
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {getInitials(otherUser.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${otherUser.isMicOn ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{otherUser.isMicOn ? "Mic on" : "Mic off"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${otherUser.isCameraOn ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{otherUser.isCameraOn ? "Cam on" : "Cam off"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "notes" && <NotesPad roomId={roomId} userId={userId} />}

        {activeTab === "chat" && (
          <div className="flex h-full flex-col p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Room chat</h3>
            <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
              {messages?.length ? (
                messages.map((item) => (
                  <div key={item._id} className="rounded-md bg-white dark:bg-gray-900 p-2 text-xs shadow-sm">
                    <p className="mb-1 text-xs font-semibold text-gray-900 dark:text-white">{item.userName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">No messages yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                placeholder="Send a message"
              />
              <button onClick={handleSend} className="rounded-lg bg-gray-900 dark:bg-white px-3 text-white dark:text-gray-900">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
