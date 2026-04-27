"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Circle, Clock, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ApiVersion } from "@/lib/types";

const statusCfg = {
  approved: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
    icon: <Check className="h-3.5 w-3.5" />,
    label: "Approved",
    badgeCls: "border-emerald-200/70 bg-emerald-50/80 text-emerald-700",
  },
  pending: {
    bg: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Pending",
    badgeCls: "border-blue-200/70 bg-blue-50/80 text-blue-700",
  },
  rejected: {
    bg: "bg-gradient-to-br from-red-400 to-red-600 text-white",
    icon: <X className="h-3.5 w-3.5" />,
    label: "Rejected",
    badgeCls: "border-red-200/70 bg-red-50/80 text-red-700",
  },
  draft: {
    bg: "bg-gradient-to-br from-stone-300 to-stone-500 text-white",
    icon: <Circle className="h-3.5 w-3.5" />,
    label: "Draft",
    badgeCls: "border-stone-200/70 bg-stone-50/80 text-stone-700",
  },
} as const;

interface Props {
  versions: ApiVersion[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function EvolutionTimeline({
  versions,
  orientation = "horizontal",
  className,
}: Props) {
  const { projectId } = useParams<{ projectId: string }>();
  const sorted = React.useMemo(
    () =>
      [...versions].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [versions],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-200 px-6 py-10 text-center text-sm text-stone-500 dark:border-stone-800">
        No versions yet.
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <ol className={cn("relative space-y-4 pl-6", className)}>
        <span className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-orange-200/0 via-orange-300/60 to-orange-200/0 dark:via-orange-700/40" />
        {sorted.map((v) => {
          const cfg = statusCfg[v.status];
          return (
            <li key={v.id} className="relative">
              <Link
                href={`/projects/${projectId}/api-management/versions/${v.id}`}
                className="group flex items-start gap-3"
              >
                <span
                  className={cn(
                    "absolute -left-6 flex h-[22px] w-[22px] items-center justify-center rounded-full ring-4 ring-white dark:ring-stone-950",
                    cfg.bg,
                  )}
                >
                  {cfg.icon}
                </span>
                <div className="glass min-w-0 rounded-lg px-3 py-2 transition-all group-hover:translate-x-0.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {v.name}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        cfg.badgeCls,
                      )}
                    >
                      {cfg.label}
                    </span>
                    {v.tags.map((t) => (
                      <Badge key={t} variant="orange">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-stone-500">
                    Created by {v.createdBy} · {formatDate(v.createdAt)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className={cn("relative w-full overflow-x-auto pb-2", className)}>
      <div className="relative flex min-w-max items-start gap-10 px-2">
        <span className="absolute left-2 right-2 top-[14px] h-px bg-gradient-to-r from-orange-200/30 via-orange-300/60 to-orange-200/30 dark:via-orange-800/50" />
        {sorted.map((v) => {
          const cfg = statusCfg[v.status];
          return (
            <Link
              key={v.id}
              href={`/projects/${projectId}/api-management/versions/${v.id}`}
              className="group relative flex w-32 shrink-0 flex-col items-center"
            >
              <span
                className={cn(
                  "z-10 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white shadow-md transition-transform group-hover:scale-110 dark:ring-stone-950",
                  cfg.bg,
                )}
              >
                {cfg.icon}
              </span>
              <div className="mt-3 text-center">
                <div className="font-mono text-sm font-semibold text-stone-900 group-hover:text-orange-600 dark:text-stone-100 dark:group-hover:text-orange-300">
                  {v.name}
                </div>
                <div className="mt-0.5 text-[11px] text-stone-500">
                  {formatDate(v.createdAt)}
                </div>
                <span
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    cfg.badgeCls,
                  )}
                >
                  {cfg.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
