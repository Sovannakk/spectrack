"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, className }: Props) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const commit = (raw: string) => {
    const t = raw.trim().replace(/,$/, "");
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-stone-200 bg-white/80 backdrop-blur px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-orange-500 dark:border-stone-800 dark:bg-stone-950/60",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200/70 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((t) => t !== tag));
            }}
            className="rounded-full text-orange-700 hover:bg-orange-200 dark:text-orange-100 dark:hover:bg-orange-800"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        placeholder={value.length === 0 ? placeholder : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && commit(draft)}
        className="flex-1 min-w-[6rem] bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-stone-400"
      />
    </div>
  );
}
