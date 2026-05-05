import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";
export type Tool = "pen" | "rectangle" | "circle" | "arrow" | "line" | "text" | "eraser";
export type TodoMode = "shared" | "individual";

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // User
  userName: string;
  setUserName: (name: string) => void;
  accountId: string | null;
  setAccountId: (id: string | null) => void;
  
  // Room
  currentRoomId: string | null;
  setCurrentRoomId: (id: string | null) => void;
  
  // Whiteboard
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  
  // Pomodoro
  isFocusMode: boolean;
  setIsFocusMode: (value: boolean) => void;
  
  // Todo
  todoMode: TodoMode;
  setTodoMode: (mode: TodoMode) => void;
  
  // Sidebar
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
  
  // Focus Lock
  isFocusLock: boolean;
  setIsFocusLock: (value: boolean) => void;
  toggleFocusLock: () => void;
  
  // Notes pad
  isNotesOpen: boolean;
  setIsNotesOpen: (value: boolean) => void;
  toggleNotes: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  theme: "light" as Theme,
  userName: "",
  accountId: null,
  currentRoomId: null,
  selectedTool: "pen" as Tool,
  selectedColor: "#1d1d1f",
  strokeWidth: 2,
  isFocusMode: false,
  todoMode: "shared" as TodoMode,
  isSidebarOpen: true,
  isFocusLock: false,
  isNotesOpen: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      
      setUserName: (userName) => set({ userName }),
      setAccountId: (accountId) => set({ accountId }),
      
      setCurrentRoomId: (currentRoomId) => set({ currentRoomId }),
      
      setSelectedTool: (selectedTool) => set({ selectedTool }),
      setSelectedColor: (selectedColor) => set({ selectedColor }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      
      setIsFocusMode: (isFocusMode) => set({ isFocusMode }),
      
      setTodoMode: (todoMode) => set({ todoMode }),
      
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      setIsFocusLock: (isFocusLock) => set({ isFocusLock }),
      toggleFocusLock: () => set((state) => ({ isFocusLock: !state.isFocusLock })),
      
      setIsNotesOpen: (isNotesOpen) => set({ isNotesOpen }),
      toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),
      
      reset: () => set(initialState),
    }),
    {
      name: "meet-and-study-storage",
      partialize: (state) => ({ theme: state.theme, userName: state.userName, accountId: state.accountId }),
    }
  )
);
