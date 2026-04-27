"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GitCompare, Send } from "lucide-react";
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
import { DiffTable } from "@/components/diff-table";
import { CompareAIExplanation } from "@/components/compare-ai-explanation";
import { ConfirmModal } from "@/components/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { fireAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "breaking" | "non-breaking";

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
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Pre-select from search params (set by Dashboard "View full diff")
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
    if (filter === "all") return diffs;
    return diffs.filter((d) => d.changeType === filter);
  }, [diffs, filter]);

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

  const breakingCount = diffs.filter((d) => d.changeType === "breaking").length;
  const nonBreakingCount = diffs.filter(
    (d) => d.changeType === "non-breaking",
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compare versions"
        description="Side-by-side diff between two versions of your API specification."
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>From version</Label>
            <Select
              options={versionOptions}
              value={from}
              onValueChange={setFrom}
            />
          </div>
          <div className="space-y-1.5">
            <Label>To version</Label>
            <Select options={versionOptions} value={to} onValueChange={setTo} />
          </div>
        </CardContent>
      </Card>

      {from && to && from === to ? (
        <p className="text-sm text-stone-500">
          Pick two different versions to see the diff.
        </p>
      ) : (
        <>
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
              <FilterPills
                value={filter}
                onChange={setFilter}
                counts={{
                  all: diffs.length,
                  breaking: breakingCount,
                  "non-breaking": nonBreakingCount,
                }}
              />
            </CardHeader>
            <CardContent>
              <DiffTable diffs={filteredDiffs} showImpact />
            </CardContent>
          </Card>

          {role === "contributor" && diffs.length > 0 && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setConfirmOpen(true)}>
                <Send className="h-4 w-4" /> Submit for review
              </Button>
            </div>
          )}
        </>
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

function FilterPills({
  value,
  onChange,
  counts,
}: {
  value: FilterMode;
  onChange: (v: FilterMode) => void;
  counts: { all: number; breaking: number; "non-breaking": number };
}) {
  const options: { key: FilterMode; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "breaking", label: `Breaking (${counts.breaking})` },
    { key: "non-breaking", label: `Non-breaking (${counts["non-breaking"]})` },
  ];
  return (
    <div className="inline-flex items-center rounded-md border border-stone-200/70 bg-white p-0.5 dark:border-stone-800/70 dark:bg-stone-950">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors",
            value === o.key
              ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
