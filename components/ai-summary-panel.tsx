"use client";

import * as React from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface Props {
  text: string;
  title?: string;
}

export function AISummaryPanel({ text, title = "AI summary" }: Props) {
  const [loading, setLoading] = React.useState(false);
  return (
    <div className="glass relative overflow-hidden rounded-xl p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-orange-200/40 blur-2xl"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_2px_4px_-1px_rgba(249,115,22,0.4)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
          disabled={loading}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-stone-200/70 bg-white/80 backdrop-blur px-2 text-xs font-medium text-stone-700 transition-colors hover:bg-white disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Regenerate
        </button>
      </div>
      <p className="relative mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-stone-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating summary…
          </span>
        ) : (
          text
        )}
      </p>
    </div>
  );
}
