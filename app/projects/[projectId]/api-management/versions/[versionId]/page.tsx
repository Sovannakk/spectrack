"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Copy, GitCompare, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EndpointDoc } from "@/components/endpoint-doc";
import { MethodFilter } from "@/components/method-filter";
import { RelativeTime } from "@/components/relative-time";
import type { HttpMethod } from "@/lib/types";
import { VersionAISummary } from "@/components/version-ai-summary";
import { ResubmitBanner } from "@/components/resubmit-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { cn, formatDate } from "@/lib/utils";

const baseUrlForProject = (name: string) =>
  `https://api.${name.toLowerCase().replace(/\s+/g, "")}.dev/v1`;

export default function VersionDetailPage() {
  const { projectId, versionId } = useParams<{
    projectId: string;
    versionId: string;
  }>();
  const router = useRouter();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const project = useAppStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const allVersions = useAppStore((s) => s.versions);
  const allEndpoints = useAppStore((s) => s.endpoints);
  const allApprovals = useAppStore((s) => s.approvals);
  const allDiffs = useAppStore((s) => s.diffs);
  const allMembers = useAppStore((s) => s.members);

  const version = React.useMemo(
    () =>
      allVersions.find(
        (v) => v.id === versionId && v.projectId === projectId,
      ),
    [allVersions, versionId, projectId],
  );
  const versions = React.useMemo(
    () => allVersions.filter((v) => v.projectId === projectId),
    [allVersions, projectId],
  );
  const endpoints = React.useMemo(
    () =>
      allEndpoints.filter(
        (e) => e.projectId === projectId && e.versionId === versionId,
      ),
    [allEndpoints, projectId, versionId],
  );
  const sortedAsc = React.useMemo(
    () =>
      versions
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        ),
    [versions],
  );
  const previousVersion = React.useMemo(() => {
    if (!version) return undefined;
    const idx = sortedAsc.findIndex((v) => v.id === version.id);
    return idx > 0 ? sortedAsc[idx - 1] : undefined;
  }, [sortedAsc, version]);
  const nextVersion = React.useMemo(() => {
    if (!version) return undefined;
    const idx = sortedAsc.findIndex((v) => v.id === version.id);
    return idx >= 0 && idx < sortedAsc.length - 1
      ? sortedAsc[idx + 1]
      : undefined;
  }, [sortedAsc, version]);
  const diffsAgainstPrev = React.useMemo(
    () =>
      previousVersion && version
        ? allDiffs.filter(
            (d) =>
              d.projectId === projectId &&
              d.fromVersion === previousVersion.name &&
              d.toVersion === version.name,
          )
        : [],
    [allDiffs, previousVersion, version, projectId],
  );
  const matchingApproval = React.useMemo(
    () =>
      version
        ? allApprovals.find(
            (a) =>
              a.projectId === projectId &&
              a.toVersion === version.name &&
              a.status === "rejected",
          )
        : undefined,
    [allApprovals, version, projectId],
  );
  const reviewerNames = React.useMemo(
    () =>
      allMembers
        .filter((m) => m.projectId === projectId && m.role === "reviewer")
        .map((m) => m.name),
    [allMembers, projectId],
  );

  const [search, setSearch] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState<HttpMethod | "ALL">(
    "ALL",
  );

  const filtered = endpoints.filter((e) => {
    const matchesSearch =
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.method.toLowerCase().includes(search.toLowerCase());
    const matchesMethod =
      methodFilter === "ALL" ? true : e.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  if (loading) return <Skeleton className="h-96" />;

  if (!version) {
    return (
      <EmptyState
        title="Version not found"
        description="This version may have been removed."
      />
    );
  }

  const baseUrl = baseUrlForProject(project?.name ?? "api");

  const showResubmit =
    role === "contributor" &&
    version.status === "rejected" &&
    matchingApproval !== undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${project?.name ?? ""} — ${version.name}`}
        description={
          <>
            Created by {version.createdBy} ·{" "}
            <RelativeTime timestamp={version.createdAt} />
          </>
        }
        meta={
          <>
            <StatusBadge status={version.status} />
            {version.tags.map((t) => (
              <Badge key={t} variant="violet">
                {t}
              </Badge>
            ))}
          </>
        }
        actions={
          <>
            {nextVersion && (
              <Link
                href={`/projects/${projectId}/compare?from=${version.name}&to=${nextVersion.name}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <GitCompare className="h-4 w-4" />
                Compare with {nextVersion.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <div className="w-56">
              <Select
                options={versions.map((v) => ({
                  value: v.id,
                  label: `${v.name} (${v.status})`,
                }))}
                value={versionId}
                onValueChange={(id) =>
                  router.push(
                    `/projects/${projectId}/api-management/versions/${id}`,
                  )
                }
              />
            </div>
          </>
        }
      />

      {/* APIM-06 — Resubmit banner for rejected contributor versions */}
      {showResubmit && matchingApproval && (
        <ResubmitBanner
          versionId={version.id}
          versionName={version.name}
          reviewerComment={matchingApproval.reviewerComment}
          reviewers={reviewerNames}
        />
      )}

      {/* Base URL row */}
      <div className="flex flex-col gap-2 rounded-md border border-stone-200/70 bg-white px-4 py-3 dark:border-stone-800/70 dark:bg-stone-900 sm:flex-row sm:items-center">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Base URL
        </span>
        <code className="flex-1 truncate rounded border border-stone-200/70 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
          {baseUrl}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(baseUrl);
            toast.success("Copied base URL");
          }}
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </Button>
      </div>

      {/* AI-01 — Structured AI summary */}
      <VersionAISummary
        projectId={projectId}
        versionName={version.name}
        whatItDoes={`This is the ${project?.name ?? "API"} ${version.name}. It allows applications to create, retrieve, and manage payment transactions. It supports multi-currency payments and provides an export feature for reporting.`}
        endpoints={endpoints}
        diffs={diffsAgainstPrev}
        previousVersion={previousVersion?.name}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>
            Endpoints{" "}
            <span className="text-xs font-normal text-stone-500">
              ({endpoints.length})
            </span>
          </CardTitle>
          <div className="relative w-64 max-w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search method, path, or summary…"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <MethodFilter
            endpoints={endpoints}
            activeMethod={methodFilter}
            onChange={setMethodFilter}
          />
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                No endpoints match your filter.
              </p>
            ) : (
              filtered.map((e) => <EndpointDoc key={e.id} endpoint={e} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
