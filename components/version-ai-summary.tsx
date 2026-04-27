"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { MethodBadge } from "@/components/method-badge";
import { cn } from "@/lib/utils";
import type { Diff, Endpoint, HttpMethod } from "@/lib/types";

interface Props {
  projectId: string;
  versionName: string;
  whatItDoes: string;
  endpoints: Endpoint[];
  diffs?: Diff[];
  previousVersion?: string;
}

export function VersionAISummary({
  projectId,
  versionName,
  whatItDoes,
  endpoints,
  diffs,
  previousVersion,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const grouped = React.useMemo(() => {
    const map: Record<string, HttpMethod[]> = {};
    for (const e of endpoints) {
      const base = e.path.split("/").slice(0, 4).join("/") || e.path;
      map[base] = map[base] ?? [];
      if (!map[base].includes(e.method)) map[base].push(e.method);
    }
    return map;
  }, [endpoints]);

  const breaking = diffs?.filter((d) => d.changeType === "breaking") ?? [];
  const nonBreaking =
    diffs?.filter((d) => d.changeType === "non-breaking") ?? [];

  return (
    <div className="glass relative overflow-hidden rounded-xl">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-200/35 blur-3xl"
      />
      <div className="relative flex items-center justify-between border-b border-white/40 px-5 py-3 dark:border-stone-800/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_2px_4px_-1px_rgba(249,115,22,0.4)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            AI-generated summary
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

      {loading ? (
        <div className="relative flex items-center gap-2 px-5 py-8 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating summary…
        </div>
      ) : (
        <div className="relative divide-y divide-stone-100/60 dark:divide-stone-800/60">
          <section className="px-5 py-4">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
              What this API does
            </h4>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {whatItDoes}
            </p>
          </section>

          <section className="px-5 py-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Key endpoints
            </h4>
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-stone-500">No endpoints in this version.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(grouped).map(([base, methods]) => (
                  <li
                    key={base}
                    className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300"
                  >
                    <span className="font-mono text-xs">{base}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-xs text-stone-500">
                      {methods.length} endpoint{methods.length === 1 ? "" : "s"}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1">
                      {methods.map((m) => (
                        <MethodBadge key={m} method={m} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {previousVersion && diffs && diffs.length > 0 && (
            <section className="px-5 py-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Changes from {previousVersion}
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Callout
                  tone="emerald"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  text={`${nonBreaking.length} ${
                    nonBreaking.length === 1 ? "safe change" : "safe changes"
                  } added`}
                />
                <Callout
                  tone="red"
                  icon={<AlertTriangle className="h-3.5 w-3.5" />}
                  text={`${breaking.length} breaking ${
                    breaking.length === 1 ? "change" : "changes"
                  } introduced`}
                />
              </div>
              <Link
                href={`/projects/${projectId}/compare?from=${previousVersion}&to=${versionName}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline dark:text-orange-300"
              >
                See full diff <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Callout({
  tone,
  icon,
  text,
}: {
  tone: "red" | "emerald";
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
        tone === "red"
          ? "border-red-200/70 bg-red-50/80 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          : "border-emerald-200/70 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
      )}
    >
      {icon}
      {text}
    </div>
  );
}
