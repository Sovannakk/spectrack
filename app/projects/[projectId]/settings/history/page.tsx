"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ChevronDown, Download } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { OwnerGuard } from "@/components/owner-guard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ChangeTypeBadge } from "@/components/change-type-badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { downloadCsv } from "@/lib/download";
import { cn, formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import type { ActivityAction, ChangeType } from "@/lib/types";

const actionOptions = [
  { value: "all", label: "All actions" },
  { value: "Uploaded", label: "Uploaded" },
  { value: "Submitted", label: "Submitted" },
  { value: "Resubmitted", label: "Resubmitted" },
  { value: "Commented", label: "Commented" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Invited", label: "Invited" },
];

const changeOptions = [
  { value: "all", label: "All changes" },
  { value: "breaking", label: "Breaking only" },
  { value: "non-breaking", label: "Non-breaking only" },
];

const actionTone: Record<ActivityAction, string> = {
  Approved: "text-emerald-700 dark:text-emerald-300",
  Rejected: "text-red-700 dark:text-red-300",
  Submitted: "text-blue-700 dark:text-blue-300",
  Resubmitted: "text-blue-700 dark:text-blue-300",
  Uploaded: "text-stone-700 dark:text-stone-300",
  Created: "text-stone-700 dark:text-stone-300",
  Updated: "text-stone-700 dark:text-stone-300",
  Deleted: "text-stone-700 dark:text-stone-300",
  Commented: "text-stone-700 dark:text-stone-300",
  Invited: "text-stone-700 dark:text-stone-300",
  Removed: "text-stone-700 dark:text-stone-300",
};

export default function HistoryPage() {
  return (
    <OwnerGuard>
      <Inner />
    </OwnerGuard>
  );
}

function Inner() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const allActivities = useAppStore((s) => s.activities);
  const allDiffs = useAppStore((s) => s.diffs);
  const activities = React.useMemo(
    () => allActivities.filter((a) => a.projectId === projectId),
    [allActivities, projectId],
  );
  const diffs = React.useMemo(
    () => allDiffs.filter((d) => d.projectId === projectId),
    [allDiffs, projectId],
  );

  const [actionFilter, setActionFilter] = React.useState("all");
  const [changeFilter, setChangeFilter] = React.useState("all");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const filteredActs = React.useMemo(
    () =>
      actionFilter === "all"
        ? activities
        : activities.filter((a) => a.action === actionFilter),
    [activities, actionFilter],
  );

  const filteredDiffs = React.useMemo(
    () =>
      changeFilter === "all"
        ? diffs
        : diffs.filter((d) => d.changeType === (changeFilter as ChangeType)),
    [diffs, changeFilter],
  );

  if (loading) return <Skeleton className="h-64" />;

  const exportCsv = () => {
    const rows: string[][] = [
      [
        "From version",
        "To version",
        "Endpoint",
        "Sub-type",
        "Change type",
        "Old value",
        "New value",
        "Description",
      ],
      ...filteredDiffs.map((d) => [
        d.fromVersion,
        d.toVersion,
        d.endpoint,
        d.subType,
        d.changeType,
        d.oldValue,
        d.newValue,
        d.description,
      ]),
    ];
    downloadCsv(`change-history-${projectId}.csv`, rows);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="History & activity"
        description="Audit log of who did what and what changed in the API."
      />

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity log</TabsTrigger>
          <TabsTrigger value="changes">Change history</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity timeline</CardTitle>
              <div className="w-48">
                <Select
                  options={actionOptions}
                  value={actionFilter}
                  onValueChange={setActionFilter}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredActs.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Actions in this project will appear here."
                />
              ) : (
                <ul className="space-y-1">
                  {filteredActs.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-stone-50 dark:hover:bg-stone-800/40"
                    >
                      <Avatar name={a.user} size="sm" />
                      <p className="flex-1 min-w-0 text-sm">
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {a.user}
                        </span>{" "}
                        <span
                          className={cn(
                            "font-medium",
                            actionTone[a.action],
                          )}
                        >
                          {a.action.toLowerCase()}
                        </span>{" "}
                        <span className="text-stone-700 dark:text-stone-300">
                          {a.target}
                        </span>
                      </p>
                      <span
                        className="shrink-0 text-xs text-stone-500"
                        title={formatDateTime(a.timestamp)}
                      >
                        {timeAgo(a.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Change history</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-48">
                  <Select
                    options={changeOptions}
                    value={changeFilter}
                    onValueChange={setChangeFilter}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCsv}
                  disabled={filteredDiffs.length === 0}
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDiffs.length === 0 ? (
                <EmptyState
                  title="No changes yet"
                  description="API changes between versions will appear here."
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH className="w-32">Version pair</TH>
                      <TH>Endpoint</TH>
                      <TH className="w-44">Type</TH>
                      <TH className="w-36">Old</TH>
                      <TH className="w-36">New</TH>
                      <TH className="w-32">Date</TH>
                      <TH className="w-10" />
                    </TR>
                  </THead>
                  <TBody>
                    {filteredDiffs.map((d) => (
                      <React.Fragment key={d.id}>
                        <TR>
                          <TD>
                            <span className="font-mono text-xs">
                              {d.fromVersion} → {d.toVersion}
                            </span>
                          </TD>
                          <TD className="font-mono text-xs">{d.endpoint}</TD>
                          <TD>
                            <ChangeTypeBadge subType={d.subType} />
                          </TD>
                          <TD>
                            <code className="font-mono text-[11px] text-stone-500">
                              {d.oldValue}
                            </code>
                          </TD>
                          <TD>
                            <code className="font-mono text-[11px] text-stone-700 dark:text-stone-300">
                              {d.newValue}
                            </code>
                          </TD>
                          <TD className="text-xs text-stone-500">
                            {formatDate(new Date())}
                          </TD>
                          <TD>
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded(expanded === d.id ? null : d.id)
                              }
                              className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform",
                                  expanded === d.id ? "rotate-180" : "",
                                )}
                              />
                            </button>
                          </TD>
                        </TR>
                        {expanded === d.id && (
                          <TR className="bg-stone-50/50 dark:bg-stone-900/40 hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                            <TD colSpan={7}>
                              <div className="space-y-1 px-2 py-1 text-sm text-stone-700 dark:text-stone-300">
                                <p>{d.description}</p>
                                <p className="text-xs text-stone-500">
                                  {d.plainExplanation}
                                </p>
                              </div>
                            </TD>
                          </TR>
                        )}
                      </React.Fragment>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
