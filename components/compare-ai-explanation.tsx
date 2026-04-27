"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ImpactDot } from "@/components/change-type-badge";
import { cn } from "@/lib/utils";
import type { Diff } from "@/lib/types";

interface Props {
  fromVersion: string;
  toVersion: string;
  diffs: Diff[];
}

export function CompareAIExplanation({
  fromVersion,
  toVersion,
  diffs,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const breaking = diffs.filter((d) => d.changeType === "breaking");
  const nonBreaking = diffs.filter((d) => d.changeType === "non-breaking");

  const mostImpactful = React.useMemo(() => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return breaking
      .slice()
      .sort((a, b) => order[a.impactLevel] - order[b.impactLevel])[0];
  }, [breaking]);

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
            AI change explanation
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
        <div className="relative space-y-5 p-5">
          {mostImpactful && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200/70 bg-amber-50/80 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
                  Most impactful change
                </div>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
                  <span className="font-mono text-xs">
                    {mostImpactful.endpoint}
                  </span>{" "}
                  — {mostImpactful.plainExplanation}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-white/60 px-4 py-3 dark:bg-stone-950/40">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              <span className="font-semibold">{breaking.length}</span> breaking{" "}
              {breaking.length === 1 ? "change" : "changes"} and{" "}
              <span className="font-semibold">{nonBreaking.length}</span> safe{" "}
              {nonBreaking.length === 1 ? "change" : "changes"} were detected
              between{" "}
              <span className="font-mono text-xs">{fromVersion}</span> and{" "}
              <span className="font-mono text-xs">{toVersion}</span>.
            </p>
          </div>

          {(breaking.length > 0 || nonBreaking.length > 0) && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Important changes
              </h4>
              <ul className="space-y-2">
                {breaking.map((d) => (
                  <Callout
                    key={d.id}
                    tone="red"
                    endpoint={d.endpoint}
                    text={d.plainExplanation}
                    impact={d.impactLevel}
                  />
                ))}
                {nonBreaking.map((d) => (
                  <Callout
                    key={d.id}
                    tone="emerald"
                    endpoint={d.endpoint}
                    text={d.plainExplanation}
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-blue-200/70 bg-blue-50/80 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/30">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
              In plain terms
            </h4>
            <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
              The {fromVersion} → {toVersion} update introduces{" "}
              {breaking.length}{" "}
              {breaking.length === 1 ? "change" : "changes"} that may break
              existing connections, plus {nonBreaking.length} safe{" "}
              {nonBreaking.length === 1 ? "improvement" : "improvements"}. Some
              old connections may stop working unless they are updated. Review
              the diff carefully before approving.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Callout({
  tone,
  endpoint,
  text,
  impact,
}: {
  tone: "red" | "emerald";
  endpoint: string;
  text: string;
  impact?: "high" | "medium" | "low";
}) {
  return (
    <li
      className={cn(
        "rounded-md border-l-4 bg-white/70 backdrop-blur px-3 py-2 dark:bg-stone-950/40",
        tone === "red"
          ? "border-l-red-500 ring-1 ring-red-200/60 dark:ring-red-900/40"
          : "border-l-emerald-500 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
          {endpoint}
        </span>
        {tone === "red" ? (
          <AlertTriangle className="h-3 w-3 text-red-500" />
        ) : (
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        )}
        {impact && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-stone-500">
            <ImpactDot level={impact} /> {impact} impact
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">{text}</p>
    </li>
  );
}
