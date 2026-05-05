"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, Plus, X, Check, GripVertical, Users, User } from "lucide-react";
import { useStore } from "@/store/useStore";

interface FloatingTodosProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function FloatingTodos({ roomId, userId, userName }: FloatingTodosProps) {
  const todos = useQuery(api.todos.getTodos, { roomId: roomId as Id<"rooms"> });
  const addTodo = useMutation(api.todos.add);
  const toggleComplete = useMutation(api.todos.toggleComplete);
  
  const { todoMode, setTodoMode } = useStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [newTodoText, setNewTodoText] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Filter todos
  const sharedTodos = todos?.filter((t: any) => !t.userId) || [];
  const myTodos = todos?.filter((t: any) => t.userId === userId) || [];
  const otherTodos = todos?.filter((t: any) => t.userId && t.userId !== userId) || [];

  const displayedTodos = todoMode === "shared" ? sharedTodos : myTodos;
  const completedCount = displayedTodos.filter((t: any) => t.isCompleted).length;
  const totalCount = displayedTodos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragOffset.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 400, e.clientY - dragOffset.current.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (navigator.vibrate) navigator.vibrate(30);
  }, []);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove as any);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove as any);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleAddTodo = useCallback(async () => {
    if (!newTodoText.trim()) return;
    
    await addTodo({
      roomId: roomId as Id<"rooms">,
      text: newTodoText.trim(),
      userId: todoMode === "individual" ? (userId as Id<"users">) : undefined,
      actorUserId: userId as Id<"users">,
    });
    
    setNewTodoText("");
    if (navigator.vibrate) navigator.vibrate(50);
  }, [addTodo, roomId, newTodoText, todoMode, userId]);

  const handleToggle = useCallback(async (todoId: string) => {
    await toggleComplete({ todoId: todoId as any, actorUserId: userId as Id<"users"> });
    if (navigator.vibrate) navigator.vibrate([20, 30]);
  }, [toggleComplete]);

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsMinimized(false);
          setIsOpen(true);
          if (navigator.vibrate) navigator.vibrate(40);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          <ListTodo className="w-6 h-6" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red text-white text-[10px] rounded-full flex items-center justify-center">
              {totalCount - completedCount}
            </span>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed z-40 w-80 bg-white dark:bg-cursor-surface rounded-2xl shadow-2xl border border-divider-hairline dark:border-cursor-border overflow-hidden ${isDragging ? "cursor-grabbing" : ""}`}
      style={{ left: 0, top: 0 }}
    >
      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-canvas-parchment dark:bg-cursor-elevated border-b border-divider-hairline dark:border-cursor-border cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-ink-muted dark:text-ink-dark-tertiary" />
          <ListTodo className="w-4 h-4 text-primary" />
          <span className="text-body-strong text-ink dark:text-ink-dark-primary">Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Mode Toggle */}
          <button
            onClick={() => {
              setTodoMode(todoMode === "shared" ? "individual" : "shared");
              if (navigator.vibrate) navigator.vibrate(30);
            }}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={todoMode === "shared" ? "Switch to my tasks" : "Switch to shared tasks"}
          >
            {todoMode === "shared" ? (
              <Users className="w-4 h-4 text-accent-blue" />
            ) : (
              <User className="w-4 h-4 text-accent-purple" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-ink-muted dark:text-ink-dark-tertiary" />
          </button>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="px-4 py-2 bg-canvas dark:bg-cursor-bg border-b border-divider-hairline dark:border-cursor-border">
        <div className="flex items-center justify-between">
          <span className="text-caption text-ink-muted dark:text-ink-dark-tertiary">
            {todoMode === "shared" ? "Shared tasks" : "My personal tasks"}
          </span>
          <span className="text-caption font-medium text-ink dark:text-ink-dark-secondary">
            {completedCount}/{totalCount}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent-green rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Add New Todo */}
      <div className="p-3 border-b border-divider-hairline dark:border-cursor-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTodo();
            }}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 text-sm bg-canvas dark:bg-cursor-elevated border border-divider-hairline dark:border-cursor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
          />
          <button
            onClick={handleAddTodo}
            disabled={!newTodoText.trim()}
            className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-focus transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Todo List */}
      <div className="max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayedTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <p className="text-caption text-ink-muted dark:text-ink-dark-tertiary">
                {todoMode === "shared" 
                  ? "No shared tasks yet. Add one above!" 
                  : "No personal tasks yet. Add one above!"}
              </p>
            </motion.div>
          ) : (
            displayedTodos.map((todo: any) => (
              <motion.div
                key={todo._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <button
                  onClick={() => handleToggle(todo._id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    todo.isCompleted
                      ? "bg-accent-green border-accent-green"
                      : "border-divider-hairline dark:border-cursor-border hover:border-accent-green"
                  }`}
                >
                  {todo.isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm flex-1 truncate ${
                  todo.isCompleted 
                    ? "line-through text-ink-muted dark:text-ink-dark-tertiary" 
                    : "text-ink dark:text-ink-dark-primary"
                }`}>
                  {todo.text}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Other User's Todos (in individual mode) */}
      {todoMode === "individual" && otherTodos.length > 0 && (
        <div className="border-t border-divider-hairline dark:border-cursor-border bg-canvas-parchment/50 dark:bg-cursor-elevated/50">
          <div className="px-4 py-2 border-b border-divider-hairline dark:border-cursor-border">
            <span className="text-caption text-ink-muted dark:text-ink-dark-tertiary">
              Buddy&apos;s tasks
            </span>
          </div>
          {otherTodos.map((todo: any) => (
            <div
              key={todo._id}
              className="flex items-center gap-3 p-3 opacity-60"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                todo.isCompleted
                  ? "bg-accent-green border-accent-green"
                  : "border-divider-hairline dark:border-cursor-border"
              }`}>
                {todo.isCompleted && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm flex-1 truncate ${
                todo.isCompleted 
                  ? "line-through text-ink-muted" 
                  : "text-ink dark:text-ink-dark-secondary"
              }`}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
