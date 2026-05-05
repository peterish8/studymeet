"use client";

import { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg border border-divider-hairline bg-surface-muted p-1 dark:border-cursor-border dark:bg-cursor-elevated",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: selectedValue, onChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        "btn-press rounded-md px-4 py-2 text-sm font-medium transition-all",
        isSelected
          ? "border border-divider-hairline bg-white text-ink shadow-soft dark:border-cursor-border dark:bg-cursor-active dark:text-ink-dark-primary"
          : "text-ink-muted hover:text-ink dark:text-ink-dark-tertiary dark:hover:text-ink-dark-secondary",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  
  if (selectedValue !== value) return null;
  
  return <div className={className}>{children}</div>;
}
