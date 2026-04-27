"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList, Eye, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn, formatDate } from "@/lib/utils";

export default function WorkflowPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const me = useAppStore((s) => s.currentUser);
  const allApprovals = useAppStore((s) => s.approvals);
  const approvals = React.useMemo(
    () => allApprovals.filter((a) => a.projectId === projectId),
    [allApprovals, projectId],
  );

  const visible = React.useMemo(
    () =>
      role === "contributor"
        ? approvals.filter((a) => a.submittedBy === me.name)
        : approvals,
    [approvals, role, me.name],
  );

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Approvals"
        description="Review queue for version submissions."
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No submissions yet"
          description={
            role === "contributor"
              ? "You haven't submitted any versions for review."
              : "When contributors submit versions, they'll show up here."
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>From → To</TH>
              <TH>Submitted by</TH>
              <TH>Submitted at</TH>
              <TH className="w-32">Status</TH>
              <TH className="w-32 text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {visible.map((a) => (
              <TR key={a.id}>
                <TD>
                  <span className="font-mono text-xs">
                    {a.fromVersion} → {a.toVersion}
                  </span>
                </TD>
                <TD>{a.submittedBy}</TD>
                <TD>{formatDate(a.submittedAt)}</TD>
                <TD>
                  <StatusBadge status={a.status} />
                </TD>
                <TD className="text-right">
                  {role === "reviewer" ? (
                    <Link
                      href={`/projects/${projectId}/workflow/${a.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      <Eye className="h-3.5 w-3.5" /> Review
                    </Link>
                  ) : role === "contributor" && a.status === "rejected" ? (
                    <Link
                      href={`/projects/${projectId}/api-management/upload`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      <Upload className="h-3.5 w-3.5" /> Re-upload
                    </Link>
                  ) : (
                    <Link
                      href={`/projects/${projectId}/workflow/${a.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                      )}
                    >
                      View
                    </Link>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
