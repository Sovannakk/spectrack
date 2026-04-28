"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, GitCompare, Send } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CodeDiff } from "@/components/code-diff";
import { DiffSummaryBar, type DiffFilter } from "@/components/diff-summary-bar";
import { CompareAIExplanation } from "@/components/compare-ai-explanation";
import { ConfirmModal } from "@/components/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Tooltip } from "@/components/ui/tooltip";
import { fireAlerts } from "@/lib/alerts";
import { subTypeConfig } from "@/components/change-type-badge";
import type { Diff } from "@/lib/types";

export default function ComparePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const allVersionsRaw = useAppStore((s) => s.versions);
  const allDiffsRaw = useAppStore((s) => s.diffs);
  const allMembersRaw = useAppStore((s) => s.members);
  const reviewers = React.useMemo(
    () =>
      allMembersRaw
        .filter((m) => m.projectId === projectId && m.role === "reviewer")
        .map((m) => m.name),
    [allMembersRaw, projectId],
  );
  const versions = React.useMemo(
    () => allVersionsRaw.filter((v) => v.projectId === projectId),
    [allVersionsRaw, projectId],
  );
  const allDiffs = React.useMemo(
    () => allDiffsRaw.filter((d) => d.projectId === projectId),
    [allDiffsRaw, projectId],
  );
  const submitForReview = useAppStore((s) => s.submitForReview);

  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [filter, setFilter] = React.useState<DiffFilter>("all");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // UX-QW-03: pre-select from search params
  React.useEffect(() => {
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    if (f) setFrom(f);
    if (t) setTo(t);
  }, [searchParams]);

  React.useEffect(() => {
    if (!from && versions[0]) setFrom(versions[0].name);
    if (!to && versions[1]) setTo(versions[1].name);
  }, [versions, from, to]);

  const diffs = React.useMemo(() => {
    if (!from || !to || from === to) return [];
    return allDiffs.filter(
      (d) => d.fromVersion === from && d.toVersion === to,
    );
  }, [allDiffs, from, to]);

  const filteredDiffs = React.useMemo(() => {
    return diffs.filter((d) => matchesFilter(d, filter));
  }, [diffs, filter]);

  const versionsSelected = !!from && !!to && from !== to;

  const counts: Record<DiffFilter, number | null> = versionsSelected
    ? {
        all: diffs.length,
        breaking: diffs.filter((d) => d.changeType === "breaking").length,
        "non-breaking": diffs.filter((d) => d.changeType === "non-breaking")
          .length,
        removed: diffs.filter((d) => d.subType === "endpoint_removed").length,
        added: diffs.filter((d) => d.subType === "endpoint_added").length,
      }
    : {
        all: null,
        breaking: null,
        "non-breaking": null,
        removed: null,
        added: null,
      };

  const handleCopyDiff = async () => {
    if (!versionsSelected) return;
    const md = formatDiffMarkdown(from, to, diffs);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Diff copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Skeleton className="h-96" />;

  if (versions.length < 2) {
    return (
      <EmptyState
        icon={<GitCompare className="h-5 w-5" />}
        title="Need at least two versions to compare"
        description="Upload another version to start comparing changes."
      />
    );
  }

  const versionOptions = versions.map((v) => ({
    value: v.name,
    label: `${v.name} (${v.status})`,
  }));

  const copyButton = (
    <Button
      variant="outline"
      onClick={handleCopyDiff}
      disabled={!versionsSelected}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> Copy diff
        </>
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare versions"
        description="Side-by-side diff between two versions of your API specification."
        actions={
          <>
            {!versionsSelected ? (
              <Tooltip label="Select two versions first">
                <span className="inline-flex">{copyButton}</span>
              </Tooltip>
            ) : (
              copyButton
            )}
            {role === "contributor" && diffs.length > 0 && (
              <Button onClick={() => setConfirmOpen(true)}>
                <Send className="h-4 w-4" /> Submit for review
              </Button>
            )}
          </>
        }
      />

      {/* UX-DIFF-03 — sticky version selector (sits below TopNav at top:56px) */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-stone-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-stone-800/60 dark:bg-stone-950/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">From version</Label>
            <Select
              options={versionOptions}
              value={from}
              onValueChange={setFrom}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To version</Label>
            <Select options={versionOptions} value={to} onValueChange={setTo} />
          </div>
        </div>
      </div>

      {/* UX-DIFF-02/03 — sticky summary/filter bar (sits below the version selector) */}
      <div className="sticky top-[8.5rem] z-10 -mx-4 border-b border-stone-200/60 bg-white/70 px-4 py-2 backdrop-blur dark:border-stone-800/60 dark:bg-stone-950/70 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <DiffSummaryBar
          value={filter}
          onChange={setFilter}
          counts={counts}
          disabled={!versionsSelected}
        />
      </div>

      {from && to && from === to ? (
        <p className="text-sm text-stone-500">
          Pick two different versions to see the diff.
        </p>
      ) : (
        <div className="space-y-6">
          <CompareAIExplanation
            fromVersion={from}
            toVersion={to}
            diffs={diffs}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>
                <span className="font-mono">{from}</span>
                <span className="mx-2 text-stone-400">→</span>
                <span className="font-mono">{to}</span>
              </CardTitle>
              <span className="text-xs text-stone-500">
                {filteredDiffs.length} of {diffs.length}{" "}
                {diffs.length === 1 ? "change" : "changes"}
              </span>
            </CardHeader>
            <CardContent>
              <CodeDiff diffs={filteredDiffs} />
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit for review"
        description={`Submit changes from ${from} to ${to} for reviewer approval?`}
        confirmLabel="Submit"
        onConfirm={() => {
          submitForReview(projectId, from, to);
          toast.success("Submitted for review");
          fireAlerts(
            `Email sent to ${reviewers.length === 0 ? "reviewers" : reviewers.join(", ")}: new version pending review`,
            `Telegram alert: ${to} pending review`,
          );
          router.push(`/projects/${projectId}/workflow`);
        }}
      />
    </div>
  );
}

function matchesFilter(d: Diff, filter: DiffFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "breaking":
      return d.changeType === "breaking";
    case "non-breaking":
      return d.changeType === "non-breaking";
    case "removed":
      return d.subType === "endpoint_removed";
    case "added":
      return d.subType === "endpoint_added";
  }
}

/** UX-DIFF-04 — render the current diff set as a markdown report. */
function formatDiffMarkdown(from: string, to: string, diffs: Diff[]): string {
  const breaking = diffs.filter((d) => d.changeType === "breaking");
  const nonBreaking = diffs.filter((d) => d.changeType === "non-breaking");

  const lines: string[] = [];
  lines.push(`## API Diff: ${from} → ${to}`);
  lines.push("");

  if (breaking.length > 0) {
    lines.push(`### Breaking changes (${breaking.length})`);
    lines.push("");
    for (const d of breaking) {
      lines.push(`#### ${d.endpoint}`);
      lines.push(`- **Type**: ${subTypeConfig[d.subType].label}`);
      if (d.oldValue && d.oldValue !== "-")
        lines.push(`- **Old**: \`${d.oldValue}\``);
      if (d.newValue && d.newValue !== "-")
        lines.push(`- **New**: \`${d.newValue}\``);
      lines.push(`- ${d.description}`);
      lines.push("");
    }
  }

  if (nonBreaking.length > 0) {
    lines.push(`### Non-breaking changes (${nonBreaking.length})`);
    lines.push("");
    for (const d of nonBreaking) {
      lines.push(`#### ${d.endpoint}`);
      lines.push(`- **Type**: ${subTypeConfig[d.subType].label}`);
      if (d.newValue && d.newValue !== "-")
        lines.push(`- **New**: \`${d.newValue}\``);
      lines.push(`- ${d.description}`);
      lines.push("");
    }
  }

  if (diffs.length === 0) {
    lines.push("_No differences detected._");
  }

  return lines.join("\n");
}
