"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { HttpMethod } from "@/lib/types";

const METHOD_ORDER: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

interface Source {
  method: HttpMethod;
}

interface Props<T extends Source> {
  endpoints: T[];
  activeMethod: HttpMethod | "ALL";
  onChange: (m: HttpMethod | "ALL") => void;
  className?: string;
}

const ACTIVE_STYLES: Record<HttpMethod, string> = {
  GET: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
  POST: "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200",
  PUT: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
  DELETE:
    "border-red-300 bg-red-100 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
  PATCH:
    "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200",
};

/**
 * UX-QW-05 — clickable HTTP method filter pills above any endpoint list.
 * Hides methods with 0 results. ALL pill resets the filter.
 */
export function MethodFilter<T extends Source>({
  endpoints,
  activeMethod,
  onChange,
  className,
}: Props<T>) {
  const counts = React.useMemo(() => {
    const out = new Map<HttpMethod, number>();
    for (const e of endpoints) out.set(e.method, (out.get(e.method) ?? 0) + 1);
    return out;
  }, [endpoints]);

  const visible = METHOD_ORDER.filter((m) => (counts.get(m) ?? 0) > 0);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onChange("ALL")}
        className={cn(
          "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
          activeMethod === "ALL"
            ? "border-stone-300 bg-stone-100 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            : "border-stone-200/70 bg-transparent text-stone-600 hover:bg-stone-50 dark:border-stone-800/70 dark:text-stone-400 dark:hover:bg-stone-800/40",
        )}
      >
        ALL ({endpoints.length})
      </button>
      {visible.map((m) => {
        const active = activeMethod === m;
        const count = counts.get(m) ?? 0;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "inline-flex h-7 items-center rounded-full border px-3 font-mono text-xs font-semibold transition-colors",
              active
                ? ACTIVE_STYLES[m]
                : "border-stone-200/70 bg-transparent text-stone-500 hover:bg-stone-50 dark:border-stone-800/70 dark:text-stone-400 dark:hover:bg-stone-800/40",
            )}
          >
            {m} ({count})
          </button>
        );
      })}
    </div>
  );
}
