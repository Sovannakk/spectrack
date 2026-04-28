"use client";

import * as React from "react";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { ChangeTypeBadge, subTypeConfig } from "@/components/change-type-badge";
import { MethodBadge } from "@/components/method-badge";
import { DiffTable } from "@/components/diff-table";
import { cn } from "@/lib/utils";
import type { Diff, HttpMethod } from "@/lib/types";

interface Props {
  diffs: Diff[];
}

type ViewMode = "code" | "table";

/**
 * UX-DIFF-01 — Side-by-side code diff view, grouped per endpoint.
 * Each card has a Code/Table toggle. Falls back to the existing DiffTable.
 */
export function CodeDiff({ diffs }: Props) {
  const [view, setView] = React.useState<ViewMode>("code");

  if (diffs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-200 px-6 py-10 text-center text-sm text-stone-500 dark:border-stone-800">
        No differences detected.
      </div>
    );
  }

  // Group diffs by endpoint string ("GET /payments")
  const grouped = React.useMemo(() => {
    const map = new Map<string, Diff[]>();
    for (const d of diffs) {
      const key = d.endpoint;
      const list = map.get(key) ?? [];
      list.push(d);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [diffs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="inline-flex items-center rounded-md border border-stone-200/70 bg-white p-0.5 dark:border-stone-800/70 dark:bg-stone-950">
          <ToggleButton
            active={view === "code"}
            onClick={() => setView("code")}
            label="Code view"
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
          />
          <ToggleButton
            active={view === "table"}
            onClick={() => setView("table")}
            label="Table view"
            icon={<TableIcon className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      {view === "table" ? (
        <DiffTable diffs={diffs} showImpact />
      ) : (
        <div className="space-y-3">
          {grouped.map(([endpoint, list]) => (
            <DiffCard key={endpoint} endpoint={endpoint} entries={list} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
        active
          ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
          : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function DiffCard({
  endpoint,
  entries,
}: {
  endpoint: string;
  entries: Diff[];
}) {
  const [method, ...rest] = endpoint.split(" ");
  const path = rest.join(" ");
  const breaking = entries.some((d) => d.changeType === "breaking");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border",
        breaking
          ? "border-red-200/70 dark:border-red-900/40"
          : "border-emerald-200/70 dark:border-emerald-900/40",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 border-b px-3 py-2",
          breaking
            ? "border-red-200/60 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
            : "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        )}
      >
        {isHttpMethod(method) ? <MethodBadge method={method} /> : null}
        <span className="font-mono text-sm">{path}</span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              breaking
                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200",
            )}
          >
            {breaking ? "Breaking" : "Non-breaking"}
          </span>
        </span>
      </div>

      {/* Body */}
      {entries.map((d, i) => (
        <DiffEntry key={d.id} diff={d} divider={i < entries.length - 1} />
      ))}
    </div>
  );
}

function DiffEntry({ diff, divider }: { diff: Diff; divider: boolean }) {
  const cfg = subTypeConfig[diff.subType];
  // Synthesize old/new schema lines from the existing Diff fields. We don't
  // mutate mock data; we just render whatever info we have.
  const oldLines = synthesizeLines(diff, "old");
  const newLines = synthesizeLines(diff, "new");

  return (
    <div className={cn("p-3", divider && "border-b border-stone-200/60 dark:border-stone-800/60")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ChangeTypeBadge subType={diff.subType} />
        <span className="text-xs text-stone-500">{cfg.label}</span>
        <span className="ml-auto text-xs text-stone-500">{diff.description}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <CodePane label="from" lines={oldLines} tone="old" />
        <CodePane label="to" lines={newLines} tone="new" />
      </div>
    </div>
  );
}

function CodePane({
  label,
  lines,
  tone,
}: {
  label: string;
  lines: { kind: "removed" | "added" | "unchanged"; text: string }[];
  tone: "old" | "new";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border font-mono text-[12px]",
        tone === "old"
          ? "border-red-200/60 bg-[#FFF5F5] dark:border-red-900/40 dark:bg-red-950/20"
          : "border-emerald-200/60 bg-[#F5FFF5] dark:border-emerald-900/40 dark:bg-emerald-950/20",
      )}
    >
      <div
        className={cn(
          "border-b px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
          tone === "old"
            ? "border-red-200/60 text-red-700 dark:border-red-900/40 dark:text-red-200"
            : "border-emerald-200/60 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-200",
        )}
      >
        {label}
      </div>
      <div className="px-1 py-1">
        {lines.length === 0 ? (
          <div className="px-2 py-1 text-stone-400">—</div>
        ) : (
          lines.map((l, i) => <CodeLine key={i} line={l} />)
        )}
      </div>
    </div>
  );
}

function CodeLine({
  line,
}: {
  line: { kind: "removed" | "added" | "unchanged"; text: string };
}) {
  const prefix = line.kind === "removed" ? "-" : line.kind === "added" ? "+" : " ";
  return (
    <div
      className={cn(
        "flex items-start gap-1 px-2 py-0.5",
        line.kind === "removed" &&
          "border-l-2 border-red-400 bg-[#FFECEC] text-red-900 dark:bg-red-950/40 dark:text-red-200",
        line.kind === "added" &&
          "border-l-2 border-emerald-400 bg-[#ECFFEC] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
        line.kind === "unchanged" && "text-stone-700 dark:text-stone-300",
      )}
    >
      <span aria-hidden className="select-none text-stone-400">
        {prefix}
      </span>
      <span className="whitespace-pre-wrap">{line.text}</span>
    </div>
  );
}

function synthesizeLines(
  diff: Diff,
  side: "old" | "new",
): { kind: "removed" | "added" | "unchanged"; text: string }[] {
  const value = side === "old" ? diff.oldValue : diff.newValue;
  // Choose line "kind" based on subType + side
  switch (diff.subType) {
    case "endpoint_removed":
      return side === "old"
        ? [{ kind: "unchanged", text: `${diff.endpoint}: exists` }]
        : [{ kind: "removed", text: `${diff.endpoint}: removed` }];
    case "endpoint_added":
      return side === "new"
        ? [{ kind: "added", text: `${diff.endpoint}: added` }]
        : [{ kind: "unchanged", text: `${diff.endpoint}: (not present)` }];
    case "optional_to_required":
      return [
        {
          kind: side === "old" ? "removed" : "added",
          text: side === "old" ? `${value} (optional)` : `${value} (required)`,
        },
      ];
    case "field_renamed":
    case "type_changed":
    case "method_changed":
      return [
        {
          kind: side === "old" ? "removed" : "added",
          text: value || "—",
        },
      ];
    case "optional_field_added":
    case "response_data_added":
    case "optional_param_added":
    case "enum_expanded":
      return side === "new"
        ? [{ kind: "added", text: value || diff.description }]
        : [{ kind: "unchanged", text: "(not present)" }];
    case "response_structure":
      return [
        {
          kind: side === "old" ? "removed" : "added",
          text: value || diff.description,
        },
      ];
    default:
      return value
        ? [{ kind: side === "old" ? "removed" : "added", text: value }]
        : [];
  }
}

function isHttpMethod(s: string): s is HttpMethod {
  return ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(s);
}
