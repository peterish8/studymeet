"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Plus, Check, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TodoListProps {
  roomId: string;
  userId: string;
}

export function TodoList({ roomId, userId }: TodoListProps) {
  const [newTodo, setNewTodo] = useState("");
  const { todoMode, setTodoMode } = useStore();

  const todos = useQuery(api.todos.getTodos, { roomId: roomId as Id<"rooms"> });
  const stats = useQuery(api.todos.getStats, { roomId: roomId as Id<"rooms"> });
  const addTodo = useMutation(api.todos.add);
  const toggleComplete = useMutation(api.todos.toggleComplete);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await addTodo({
      roomId: roomId as Id<"rooms">,
      text: newTodo.trim(),
      userId: todoMode === "individual" ? (userId as Id<"users">) : undefined,
      actorUserId: userId as Id<"users">,
    });
    setNewTodo("");
  };

  const handleToggle = async (todoId: string) => {
    await toggleComplete({ todoId: todoId as Id<"todos">, actorUserId: userId as Id<"users"> });
  };

  // Filter todos by mode
  const sharedTodos = todos?.filter((t: any) => !t.userId) || [];
  const myTodos = todos?.filter((t: any) => t.userId === userId) || [];
  const otherTodos = todos?.filter((t: any) => t.userId && t.userId !== userId) || [];

  // Calculate progress
  const myStats = stats?.[userId] || { total: 0, completed: 0 };
  const otherUserId = Object.keys(stats || {}).find((id) => id !== userId && id !== "shared");
  const otherStats = otherUserId ? stats?.[otherUserId] : { total: 0, completed: 0 };

  const myProgress = myStats.total > 0 ? (myStats.completed / myStats.total) * 100 : 0;
  const otherProgress = (otherStats?.total ?? 0) > 0 ? ((otherStats?.completed ?? 0) / (otherStats?.total ?? 1)) * 100 : 0;

  // Check for winner
  const isWinner = todoMode === "individual" && myStats.total > 0 && myStats.completed === myStats.total;
  const isOtherWinner = todoMode === "individual" && (otherStats?.total ?? 0) > 0 && (otherStats?.completed ?? 0) === (otherStats?.total ?? 0);

  const TodoItem = ({ todo }: { todo: any }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
    >
      <button
        onClick={() => !todo.isCompleted && handleToggle(todo._id)}
        disabled={todo.isCompleted}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
          todo.isCompleted
            ? "bg-primary border-primary cursor-default"
            : "border-divider-hairline hover:border-primary cursor-pointer"
        }`}
      >
        {todo.isCompleted && <Check className="w-3 h-3 text-white" />}
      </button>
      <span
        className={`text-body flex-1 ${
          todo.isCompleted
            ? "line-through text-ink-muted dark:text-white/50"
            : "text-ink dark:text-white"
        }`}
      >
        {todo.text}
      </span>
    </motion.div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-strong text-ink dark:text-white">Tasks</h3>
        <Toggle
          options={[
            { value: "shared", label: "Shared" },
            { value: "individual", label: "My Own" },
          ]}
          value={todoMode}
          onChange={(v) => setTodoMode(v as any)}
        />
      </div>

      {/* Winner Banners */}
      <AnimatePresence>
        {isWinner && !isOtherWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-3 bg-orb-mint/30 rounded-lg border border-orb-mint/50"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Trophy className="w-5 h-5" />
              <span className="text-body-strong">🏆 You finished first!</span>
            </div>
          </motion.div>
        )}
        {isOtherWinner && !isWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-3 bg-orb-peach/30 rounded-lg border border-orb-peach/50"
          >
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Trophy className="w-5 h-5" />
              <span className="text-body-strong">
                🏆 {stats?.[otherUserId || ""]?.name || "Your buddy"} finished first!
              </span>
            </div>
          </motion.div>
        )}
        {isWinner && isOtherWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-3 bg-orb-lavender/30 rounded-lg border border-orb-lavender/50"
          >
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Trophy className="w-5 h-5" />
              <span className="text-body-strong">🎉 You both finished!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Todo */}
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="flex-1"
          isPill={false}
        />
        <Button type="submit" size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      {/* Individual Mode */}
      {todoMode === "individual" && (
        <div className="space-y-4">
          {/* My Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption-strong text-ink dark:text-white">My Tasks</span>
              <span className="text-caption text-ink-muted">
                {myStats.completed}/{myStats.total}
              </span>
            </div>
            <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${myProgress}%` }}
              />
            </div>
            <div className="space-y-1">
              {myTodos.map((todo: any) => (
                <TodoItem key={todo._id} todo={todo} />
              ))}
              {myTodos.length === 0 && (
                <p className="text-caption text-ink-muted text-center py-4">
                  No personal tasks yet
                </p>
              )}
            </div>
          </div>

          {/* Other User Progress (if any) */}
          {otherTodos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption-strong text-ink dark:text-white">
                  {stats?.[otherUserId || ""]?.name || "Buddy"} Tasks
                </span>
                <span className="text-caption text-ink-muted">
                  {otherStats?.completed}/{otherStats?.total}
                </span>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-orb-peach"
                  initial={{ width: 0 }}
                  animate={{ width: `${otherProgress}%` }}
                />
              </div>
              <div className="space-y-1">
                {otherTodos.map((todo: any) => (
                  <TodoItem key={todo._id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared Mode */}
      {todoMode === "shared" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption-strong text-ink dark:text-white">Shared Tasks</span>
            <span className="text-caption text-ink-muted">
              {stats?.shared?.completed || 0}/{stats?.shared?.total || 0}
            </span>
          </div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{
                width: `${(stats?.shared?.total ?? 0) > 0 ? ((stats?.shared?.completed ?? 0) / (stats?.shared?.total ?? 1)) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="space-y-1">
            {sharedTodos.map((todo: any) => (
              <TodoItem key={todo._id} todo={todo} />
            ))}
            {sharedTodos.length === 0 && (
              <p className="text-caption text-ink-muted text-center py-4">
                No shared tasks yet
              </p>
            )}
          </div>

          {/* Completion Banner */}
          <AnimatePresence>
            {(stats?.shared?.total ?? 0) > 0 && (stats?.shared?.completed ?? 0) === (stats?.shared?.total ?? 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-orb-mint/30 rounded-lg border border-orb-mint/50 text-center"
              >
                <span className="text-body-strong text-green-700 dark:text-green-400">
                  You both crushed it!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
