"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type DiffFilter = "all" | "breaking" | "non-breaking" | "removed" | "added";

interface Props {
  value: DiffFilter;
  onChange: (v: DiffFilter) => void;
  counts: Record<DiffFilter, number | null>;
  disabled?: boolean;
}

/**
 * UX-DIFF-02 — Sticky horizontal bar with filter pills, showing counts at a glance.
 */
export function DiffSummaryBar({ value, onChange, counts, disabled }: Props) {
  const items: { key: DiffFilter; label: string; tone: PillTone }[] = [
    { key: "all", label: "All", tone: "gray" },
    { key: "breaking", label: "Breaking", tone: "red" },
    { key: "non-breaking", label: "Non-breaking", tone: "green" },
    { key: "removed", label: "Removed", tone: "red" },
    { key: "added", label: "Added", tone: "green" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => {
        const count = counts[it.key];
        const active = value === it.key;
        const display = disabled ? "—" : count;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => !disabled && onChange(it.key)}
            disabled={disabled}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              active
                ? activeStyles[it.tone]
                : "border-stone-200/70 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-800/70 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:bg-stone-800/60",
              disabled && "cursor-not-allowed opacity-50",
            )}
            aria-pressed={active}
          >
            <span>{it.label}</span>
            <span className="tabular-nums opacity-80">({display})</span>
          </button>
        );
      })}
    </div>
  );
}

type PillTone = "gray" | "red" | "green";
const activeStyles: Record<PillTone, string> = {
  gray:
    "border-stone-300 bg-stone-100 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100",
  red: "border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
  green:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
};
