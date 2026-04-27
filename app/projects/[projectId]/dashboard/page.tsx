"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Eye,
  FileCode,
  GitBranch,
  GitCompare,
  History,
  Inbox,
  Upload,
  Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { MetricCard } from "@/components/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/components/activity-item";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { EvolutionTimeline } from "@/components/evolution-timeline";
import { ChangeTypeBadge } from "@/components/change-type-badge";
import { RatioBar } from "@/components/ratio-bar";
import { ApproveModal } from "@/components/approve-reject-modals";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const loading = usePageLoader();

  const role = useAppStore((s) => s.currentUser.role);
  const me = useAppStore((s) => s.currentUser);
  const allProjects = useAppStore((s) => s.projects);
  const allApiFiles = useAppStore((s) => s.apiFiles);
  const allVersions = useAppStore((s) => s.versions);
  const allMembers = useAppStore((s) => s.members);
  const allApprovals = useAppStore((s) => s.approvals);
  const allDiffs = useAppStore((s) => s.diffs);
  const allActivities = useAppStore((s) => s.activities);

  const project = React.useMemo(
    () => allProjects.find((p) => p.id === projectId),
    [allProjects, projectId],
  );
  const apiFiles = React.useMemo(
    () => allApiFiles.filter((f) => f.projectId === projectId),
    [allApiFiles, projectId],
  );
  const versions = React.useMemo(
    () => allVersions.filter((v) => v.projectId === projectId),
    [allVersions, projectId],
  );
  const members = React.useMemo(
    () => allMembers.filter((m) => m.projectId === projectId),
    [allMembers, projectId],
  );
  const approvals = React.useMemo(
    () => allApprovals.filter((a) => a.projectId === projectId),
    [allApprovals, projectId],
  );
  const diffs = React.useMemo(
    () => allDiffs.filter((d) => d.projectId === projectId),
    [allDiffs, projectId],
  );
  const activities = React.useMemo(
    () => allActivities.filter((a) => a.projectId === projectId),
    [allActivities, projectId],
  );

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const pendingCount = pendingApprovals.length;
  const breakingCount = diffs.filter((d) => d.changeType === "breaking").length;
  const nonBreakingCount = diffs.filter(
    (d) => d.changeType === "non-breaking",
  ).length;
  const mySubmissions = approvals.filter((a) => a.submittedBy === me.name);

  // DASH-02 — auto-pick the two most recent versions for the latest changes preview
  const latestPair = React.useMemo(() => {
    const candidates = versions
      .filter((v) => v.status === "approved" || v.status === "pending")
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (candidates.length < 2) return null;
    const [to, from] = candidates;
    const matched = diffs.filter(
      (d) => d.fromVersion === from.name && d.toVersion === to.name,
    );
    return { from, to, diffs: matched.slice(0, 4) };
  }, [versions, diffs]);

  // DASH-04 — top breaking changes
  const topBreaking = diffs
    .filter((d) => d.changeType === "breaking")
    .slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={project?.name ?? "Dashboard"}
        description={project?.description}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="API files"
          value={apiFiles.length}
          icon={<FileCode className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Versions"
          value={versions.length}
          icon={<GitBranch className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Members"
          value={members.length}
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Pending approvals"
          value={pendingCount}
          icon={<ClipboardList className="h-3.5 w-3.5" />}
        />
      </div>

      {/* DASH-01 — API Evolution Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API evolution timeline</CardTitle>
            <CardDescription>
              All versions in this project, ordered chronologically.
            </CardDescription>
          </div>
          <Link
            href={`/projects/${projectId}/api-management/versions`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
            )}
          >
            <History className="h-3.5 w-3.5" /> Full history
          </Link>
        </CardHeader>
        <CardContent>
          <EvolutionTimeline versions={versions} />
        </CardContent>
      </Card>

      {/* DASH-02 — Latest changes preview */}
      {latestPair && latestPair.diffs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Latest changes</CardTitle>
              <CardDescription>
                <span className="font-mono">{latestPair.from.name}</span>
                <span className="mx-1.5 text-stone-400">→</span>
                <span className="font-mono">{latestPair.to.name}</span>
              </CardDescription>
            </div>
            <Link
              href={`/projects/${projectId}/compare?from=${latestPair.from.name}&to=${latestPair.to.name}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
              )}
            >
              View full diff <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {latestPair.diffs.map((d) => (
                <li
                  key={d.id}
                  className={cn(
                    "flex items-center gap-3 py-2 px-2 -mx-2 rounded-md",
                    d.changeType === "breaking"
                      ? "bg-red-50/40 dark:bg-red-950/15"
                      : "bg-emerald-50/40 dark:bg-emerald-950/15",
                  )}
                >
                  <ChangeTypeBadge subType={d.subType} />
                  <span className="font-mono text-xs text-stone-700 dark:text-stone-300">
                    {d.endpoint}
                  </span>
                  <span className="ml-auto truncate text-xs text-stone-500">
                    {d.description}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              The latest things happening in this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="py-4 text-sm text-stone-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {activities.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <ActivityItem activity={a} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(role === "owner" || role === "contributor") && (
              <Link
                href={`/projects/${projectId}/api-management/upload`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start",
                )}
              >
                <Upload className="h-4 w-4" /> Upload API
              </Link>
            )}
            <Link
              href={`/projects/${projectId}/compare`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "justify-start",
              )}
            >
              <GitCompare className="h-4 w-4" /> Compare versions
            </Link>
            <Link
              href={`/projects/${projectId}/workflow`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "justify-start",
              )}
            >
              <ClipboardList className="h-4 w-4" /> View approvals
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* DASH-04 — Owner overview with breaking change ratio */}
      {role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Breaking
              change overview
            </CardTitle>
            <CardDescription>
              How many changes are safe vs. potentially breaking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Stat
                label="Breaking changes"
                value={breakingCount}
                tone="red"
              />
              <Stat
                label="Non-breaking changes"
                value={nonBreakingCount}
                tone="emerald"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-stone-500">
                <span>Distribution</span>
                <span className="tabular-nums">
                  {breakingCount + nonBreakingCount} total
                </span>
              </div>
              <RatioBar
                parts={[
                  { value: breakingCount, tone: "red" },
                  { value: nonBreakingCount, tone: "emerald" },
                ]}
              />
              <div className="mt-2 flex items-center gap-4 text-xs text-stone-500">
                <LegendDot tone="red" label="Breaking" />
                <LegendDot tone="emerald" label="Non-breaking" />
              </div>
            </div>
            {topBreaking.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Top breaking changes
                </h4>
                <ul className="space-y-1.5">
                  {topBreaking.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-start gap-2 rounded-md border border-stone-200/70 px-3 py-2 text-sm dark:border-stone-800/70"
                    >
                      <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs">{d.endpoint}</span>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {d.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {role === "contributor" && (
        <Card>
          <CardHeader>
            <CardTitle>Your submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {mySubmissions.length === 0 ? (
              <p className="text-sm text-stone-500">
                You haven't submitted any versions yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {mySubmissions.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-stone-200/70 px-3 py-2 text-sm dark:border-stone-800/70"
                  >
                    <span className="font-mono text-xs">
                      {a.fromVersion} → {a.toVersion}
                    </span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* DASH-03 — Reviewer panel with inline approve & review actions */}
      {role === "reviewer" && (
        <ReviewerPanel
          projectId={projectId}
          pendingApprovals={pendingApprovals}
          onReview={(id) => router.push(`/projects/${projectId}/workflow/${id}`)}
        />
      )}
    </div>
  );
}

function ReviewerPanel({
  projectId,
  pendingApprovals,
  onReview,
}: {
  projectId: string;
  pendingApprovals: ReturnType<
    typeof useAppStore.getState
  >["approvals"];
  onReview: (id: string) => void;
}) {
  const [approveTarget, setApproveTarget] = React.useState<{
    id: string;
    toVersion: string;
    submittedBy: string;
  } | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending your review</CardTitle>
          <CardDescription>
            {pendingApprovals.length}{" "}
            {pendingApprovals.length === 1 ? "approval" : "approvals"} waiting
            for review
          </CardDescription>
        </div>
        <Link
          href={`/projects/${projectId}/workflow`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open workflow
        </Link>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title="No pending submissions"
            description="When contributors submit versions, they'll show up here."
          />
        ) : (
          <ul className="space-y-2">
            {pendingApprovals.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-stone-200/70 px-3 py-2.5 dark:border-stone-800/70"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm">
                    {a.fromVersion} → {a.toVersion}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-500">
                    Submitted by {a.submittedBy} on {formatDate(a.submittedAt)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setApproveTarget({
                      id: a.id,
                      toVersion: a.toVersion,
                      submittedBy: a.submittedBy,
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(a.id)}
                >
                  <Eye className="h-3.5 w-3.5" /> Review
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {approveTarget && (
        <ApproveModal
          open={!!approveTarget}
          onOpenChange={(o) => !o && setApproveTarget(null)}
          approvalId={approveTarget.id}
          toVersion={approveTarget.toVersion}
          submittedBy={approveTarget.submittedBy}
        />
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "blue" | "emerald";
}) {
  const tones = {
    red: "text-red-600 dark:text-red-300",
    blue: "text-blue-600 dark:text-blue-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
  };
  return (
    <div className="rounded-md border border-stone-100 p-4 dark:border-stone-800">
      <div className={`text-2xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-stone-500">
        {label}
      </div>
    </div>
  );
}

function LegendDot({
  tone,
  label,
}: {
  tone: "red" | "emerald";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          tone === "red" ? "bg-red-500" : "bg-emerald-500",
        )}
      />
      {label}
    </span>
  );
}
