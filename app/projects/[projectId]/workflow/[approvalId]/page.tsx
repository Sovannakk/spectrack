"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Check, MessageSquare, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ChangeTypeBadge } from "@/components/change-type-badge";
import { CommentThread } from "@/components/comment-thread";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  ApproveModal,
  RejectModal,
} from "@/components/approve-reject-modals";
import { fireAlerts } from "@/lib/alerts";
import { cn, formatDate } from "@/lib/utils";

export default function ApprovalDetailPage() {
  const { projectId, approvalId } = useParams<{
    projectId: string;
    approvalId: string;
  }>();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const allApprovals = useAppStore((s) => s.approvals);
  const allDiffs = useAppStore((s) => s.diffs);
  const allComments = useAppStore((s) => s.comments);
  const allEndpoints = useAppStore((s) => s.endpoints);
  const allVersions = useAppStore((s) => s.versions);

  const approval = React.useMemo(
    () =>
      allApprovals.find(
        (a) => a.id === approvalId && a.projectId === projectId,
      ),
    [allApprovals, approvalId, projectId],
  );
  const diffs = React.useMemo(
    () =>
      approval
        ? allDiffs.filter(
            (d) =>
              d.projectId === projectId &&
              d.fromVersion === approval.fromVersion &&
              d.toVersion === approval.toVersion,
          )
        : [],
    [allDiffs, approval, projectId],
  );
  const comments = React.useMemo(
    () => allComments.filter((c) => c.approvalId === approvalId),
    [allComments, approvalId],
  );
  // Map endpoint string (e.g. "POST /api/v1/payments") to endpoint id in the toVersion
  const endpointIdByLabel = React.useMemo(() => {
    if (!approval) return new Map<string, string>();
    const targetVersion = allVersions.find(
      (v) => v.projectId === projectId && v.name === approval.toVersion,
    );
    if (!targetVersion) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const e of allEndpoints) {
      if (e.versionId === targetVersion.id) {
        map.set(`${e.method} ${e.path}`, e.id);
      }
    }
    return map;
  }, [allEndpoints, allVersions, approval, projectId]);

  const addComment = useAppStore((s) => s.addComment);

  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [openEndpoint, setOpenEndpoint] = React.useState<string | null>(null);

  if (loading) return <Skeleton className="h-96" />;

  if (!approval) {
    return (
      <EmptyState
        title="Approval not found"
        description="This approval may have been removed."
      />
    );
  }

  const isPending = approval.status === "pending";

  const handleAddComment = (input: {
    endpoint: string;
    endpointId?: string;
    text: string;
  }) => {
    addComment(approvalId, input);
    toast.success("Comment posted");
    fireAlerts(
      `Email sent to project members: new comment on ${input.endpoint}`,
      `Telegram alert: new comment on ${input.endpoint}`,
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${approval.fromVersion} → ${approval.toVersion}`}
        description={`Submitted by ${approval.submittedBy} on ${formatDate(approval.submittedAt)}`}
        meta={<StatusBadge status={approval.status} />}
        actions={
          role === "reviewer" && isPending ? (
            <>
              <Button variant="outline" onClick={() => setRejectOpen(true)}>
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button onClick={() => setApproveOpen(true)}>
                <Check className="h-4 w-4" /> Approve
              </Button>
            </>
          ) : undefined
        }
      />

      {approval.reviewerComment && (
        <div className="rounded-md border border-stone-200/70 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
          <span className="font-medium">Reviewer note:</span>{" "}
          {approval.reviewerComment}
        </div>
      )}

      {/* WORK-01 — Diff with per-endpoint comment threads */}
      <Card>
        <CardHeader>
          <CardTitle>
            Changes{" "}
            <span className="text-xs font-normal text-stone-500">
              ({diffs.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {diffs.length === 0 ? (
            <p className="py-4 text-center text-sm text-stone-500">
              No diff entries.
            </p>
          ) : (
            diffs.map((d) => {
              const endpointId = endpointIdByLabel.get(d.endpoint);
              const epComments = comments.filter(
                (c) => c.endpoint === d.endpoint,
              );
              const isOpen = openEndpoint === d.id;
              const breaking = d.changeType === "breaking";
              return (
                <div
                  key={d.id}
                  className={cn(
                    "rounded-md border",
                    breaking
                      ? "border-red-200/70 dark:border-red-900/50"
                      : "border-emerald-200/70 dark:border-emerald-900/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-3 px-4 py-3",
                      breaking
                        ? "bg-red-50/40 dark:bg-red-950/15"
                        : "bg-emerald-50/40 dark:bg-emerald-950/15",
                    )}
                  >
                    <ChangeTypeBadge subType={d.subType} />
                    <span className="font-mono text-xs text-stone-700 dark:text-stone-300">
                      {d.endpoint}
                    </span>
                    <span className="ml-auto truncate text-sm text-stone-600 dark:text-stone-300">
                      {d.description}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOpenEndpoint(isOpen ? null : d.id)
                      }
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {epComments.length > 0 ? (
                        <>
                          {epComments.length} comment
                          {epComments.length === 1 ? "" : "s"}
                        </>
                      ) : (
                        "Comment"
                      )}
                    </Button>
                  </div>
                  {isOpen && (
                    <div className="border-t border-stone-200/70 bg-white p-4 dark:border-stone-800/70 dark:bg-stone-950">
                      <CommentThread
                        comments={epComments}
                        endpoint={d.endpoint}
                        endpointId={endpointId}
                        hideEndpointLabel
                        onSubmit={handleAddComment}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentThread
            comments={comments.filter((c) => !c.endpointId)}
            onSubmit={handleAddComment}
          />
        </CardContent>
      </Card>

      <ApproveModal
        approvalId={approvalId}
        toVersion={approval.toVersion}
        submittedBy={approval.submittedBy}
        open={approveOpen}
        onOpenChange={setApproveOpen}
      />
      <RejectModal
        approvalId={approvalId}
        toVersion={approval.toVersion}
        submittedBy={approval.submittedBy}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </div>
  );
}
