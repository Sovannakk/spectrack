"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
  return ctx;
}

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  className,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setValue = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-6 border-b border-stone-200/60 dark:border-stone-800/70",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: current, setValue } = useTabs();
  const active = current === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "relative -mb-px inline-flex h-9 items-center justify-center px-0 text-sm font-medium transition-colors focus-visible:outline-none",
        active
          ? "text-stone-900 dark:text-stone-100"
          : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-colors",
          active ? "bg-orange-500" : "bg-transparent",
        )}
      />
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: current } = useTabs();
  if (current !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-5", className)} {...props}>
      {children}
    </div>
  );
}
