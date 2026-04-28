"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  ClipboardList,
  GitCompare,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Button, buttonVariants } from "@/components/ui/button";
import { TableSkeleton } from "@/components/loading-skeletons";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { TagInput } from "@/components/tag-input";
import { EvolutionTimeline } from "@/components/evolution-timeline";
import { Tooltip } from "@/components/ui/tooltip";
import { RelativeTime } from "@/components/relative-time";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn, formatDate } from "@/lib/utils";
import type { ApiVersion } from "@/lib/types";

type View = "table" | "timeline";

export default function VersionsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const allVersions = useAppStore((s) => s.versions);
  const allApprovals = useAppStore((s) => s.approvals);
  const updateVersion = useAppStore((s) => s.updateVersion);
  const versions = React.useMemo(
    () => allVersions.filter((v) => v.projectId === projectId),
    [allVersions, projectId],
  );
  const approvalByToVersion = React.useMemo(() => {
    const map = new Map<string, (typeof allApprovals)[number]>();
    for (const a of allApprovals) {
      if (a.projectId !== projectId) continue;
      const existing = map.get(a.toVersion);
      if (
        !existing ||
        new Date(a.submittedAt).getTime() >
          new Date(existing.submittedAt).getTime()
      ) {
        map.set(a.toVersion, a);
      }
    }
    return map;
  }, [allApprovals, projectId]);

  const [view, setView] = React.useState<View>("table");
  const [editId, setEditId] = React.useState<string | null>(null);
  const [expandedRejection, setExpandedRejection] = React.useState<
    Record<string, boolean>
  >({});
  const editing = versions.find((v) => v.id === editId);
  const showRejectionRow = role !== "reviewer";

  const canCreate = role === "owner" || role === "contributor";
  const canEdit = role === "owner" || role === "contributor";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Versions"
        description="Track every version of your API and its review status."
        actions={
          <>
            <ViewToggle view={view} onChange={setView} />
            {canCreate && (
              <Tooltip
                label={
                  <span className="inline-flex items-center gap-1">
                    New version <kbd className="rounded bg-white/20 px-1 font-mono text-[10px]">N</kbd>
                  </span>
                }
                side="bottom"
              >
                <Link
                  href={`/projects/${projectId}/api-management/upload`}
                  className={cn(buttonVariants())}
                >
                  <Plus className="h-4 w-4" /> New version
                </Link>
              </Tooltip>
            )}
          </>
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : versions.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No versions yet"
          description="Upload your first API spec to create a version."
          actions={[
            {
              label: "Create your first version",
              href: `/projects/${projectId}/api-management/upload`,
              roles: ["owner", "contributor"],
              icon: <Plus className="h-4 w-4" />,
            },
            {
              label: "No versions created yet",
              roles: ["reviewer"],
              variant: "muted",
            },
          ]}
        />
      ) : view === "table" ? (
        <Table>
          <THead>
            <TR>
              <TH>Version</TH>
              <TH>Tags</TH>
              <TH className="w-32">Status</TH>
              <TH>Created by</TH>
              <TH>Created at</TH>
              {canEdit && <TH className="w-32 text-right">Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {versions.map((v) => {
              const isEditable = v.status === "draft" || v.status === "rejected";
              const isRejected = v.status === "rejected";
              const rejectionApproval = isRejected
                ? approvalByToVersion.get(v.name)
                : undefined;
              const expanded = !!expandedRejection[v.id];
              const colCount = canEdit ? 6 : 5;
              return (
                <React.Fragment key={v.id}>
                  <TR>
                    <TD>
                      <Link
                        href={`/projects/${projectId}/api-management/versions/${v.id}`}
                        className="font-mono text-sm font-medium text-stone-900 hover:text-orange-600 dark:text-stone-100 dark:hover:text-orange-300"
                      >
                        {v.name}
                      </Link>
                    </TD>
                    <TD>
                      <div className="flex flex-wrap gap-1">
                        {v.tags.length === 0 ? (
                          <span className="text-xs text-stone-400">—</span>
                        ) : (
                          v.tags.map((t) => (
                            <Badge key={t} variant="violet">
                              {t}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={v.status} />
                        {showRejectionRow && isRejected && rejectionApproval && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRejection((s) => ({
                                ...s,
                                [v.id]: !s[v.id],
                              }))
                            }
                            aria-label={
                              expanded
                                ? "Hide rejection reason"
                                : "Show rejection reason"
                            }
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {showRejectionRow && isRejected && rejectionApproval && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRejection((s) => ({
                                ...s,
                                [v.id]: !s[v.id],
                              }))
                            }
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </TD>
                    <TD>{v.createdBy}</TD>
                    <TD>
                      <RelativeTime timestamp={v.createdAt} />
                    </TD>
                    {canEdit && (
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CompareDropdown
                            currentVersionName={v.name}
                            allVersions={versions}
                            projectId={projectId}
                          />
                          <Tooltip
                            label={
                              isEditable
                                ? "Edit version"
                                : "Approved & pending versions can't be edited"
                            }
                            side="left"
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit version"
                              disabled={!isEditable}
                              onClick={() => isEditable && setEditId(v.id)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TD>
                    )}
                  </TR>
                  {showRejectionRow &&
                    isRejected &&
                    rejectionApproval &&
                    expanded && (
                      <TR>
                        <TD
                          colSpan={colCount}
                          className="bg-red-50/40 dark:bg-red-950/20"
                        >
                          <div className="border-l-2 border-red-400 pl-3">
                            <div className="text-xs font-medium text-red-700 dark:text-red-300">
                              Rejected
                              {rejectionApproval.reviewerComment
                                ? ` · ${formatDate(rejectionApproval.submittedAt)}`
                                : ""}
                            </div>
                            <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                              {rejectionApproval.reviewerComment ??
                                "No reason was provided."}
                            </p>
                            {role === "contributor" && (
                              <div className="mt-2">
                                <Link
                                  href={`/projects/${projectId}/api-management/upload?resubmit=${v.id}`}
                                  className={cn(
                                    buttonVariants({
                                      variant: "outline",
                                      size: "sm",
                                    }),
                                  )}
                                >
                                  Fix &amp; resubmit
                                </Link>
                              </div>
                            )}
                          </div>
                        </TD>
                      </TR>
                    )}
                </React.Fragment>
              );
            })}
          </TBody>
        </Table>
      ) : (
        <EvolutionTimeline versions={versions} orientation="vertical" />
      )}

      {editing && (
        <EditVersionModal
          version={editing}
          onClose={() => setEditId(null)}
          onSave={(name, tags) => {
            updateVersion(editing.id, { name, tags });
            toast.success(`Version updated`);
            setEditId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function CompareDropdown({
  currentVersionName,
  allVersions,
  projectId,
}: {
  currentVersionName: string;
  allVersions: ApiVersion[];
  projectId: string;
}) {
  const router = useRouter();
  const others = allVersions.filter((v) => v.name !== currentVersionName);
  if (others.length === 0) return null;
  return (
    <Dropdown>
      <Tooltip label="Compare with…" side="left">
        <DropdownTrigger
          aria-label="Compare with another version"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
        >
          <GitCompare className="h-3.5 w-3.5" />
        </DropdownTrigger>
      </Tooltip>
      <DropdownMenu align="end" className="w-48">
        <DropdownLabel>Compare with…</DropdownLabel>
        {others.map((v) => (
          <DropdownItem
            key={v.id}
            onSelect={() =>
              router.push(
                `/projects/${projectId}/compare?from=${currentVersionName}&to=${v.name}`,
              )
            }
          >
            <span className="font-mono">{v.name}</span>
            <span className="ml-auto text-[10px] text-stone-500">
              {v.status}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-stone-200/70 bg-white p-0.5 dark:border-stone-800/70 dark:bg-stone-950">
      <ViewBtn
        active={view === "table"}
        onClick={() => onChange("table")}
        label="Table"
        icon={<LayoutGrid className="h-3.5 w-3.5" />}
      />
      <ViewBtn
        active={view === "timeline"}
        onClick={() => onChange("timeline")}
        label="Timeline"
        icon={<ListIcon className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function ViewBtn({
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
        "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors",
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

function EditVersionModal({
  version,
  onClose,
  onSave,
}: {
  version: ApiVersion;
  onClose: () => void;
  onSave: (name: string, tags: string[]) => void;
}) {
  const [name, setName] = React.useState(version.name);
  const [tags, setTags] = React.useState<string[]>(version.tags);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit version</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="versionName">Version name</Label>
            <Input
              id="versionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Press Enter to add"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(name.trim() || version.name, tags)}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
