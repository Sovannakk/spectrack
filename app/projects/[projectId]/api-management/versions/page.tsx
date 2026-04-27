"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn, formatDate } from "@/lib/utils";
import type { ApiVersion } from "@/lib/types";

type View = "table" | "timeline";

export default function VersionsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const allVersions = useAppStore((s) => s.versions);
  const updateVersion = useAppStore((s) => s.updateVersion);
  const versions = React.useMemo(
    () => allVersions.filter((v) => v.projectId === projectId),
    [allVersions, projectId],
  );

  const [view, setView] = React.useState<View>("table");
  const [editId, setEditId] = React.useState<string | null>(null);
  const editing = versions.find((v) => v.id === editId);

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
              <Link
                href={`/projects/${projectId}/api-management/upload`}
                className={cn(buttonVariants())}
              >
                <Plus className="h-4 w-4" /> New version
              </Link>
            )}
          </>
        }
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : versions.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No versions yet"
          description="Upload your first API spec to create a version."
          action={
            canCreate ? (
              <Link
                href={`/projects/${projectId}/api-management/upload`}
                className={cn(buttonVariants())}
              >
                <Plus className="h-4 w-4" /> Upload API
              </Link>
            ) : undefined
          }
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
              {canEdit && <TH className="w-20 text-right">Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {versions.map((v) => {
              const isEditable = v.status === "draft" || v.status === "rejected";
              return (
                <TR key={v.id}>
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
                    <StatusBadge status={v.status} />
                  </TD>
                  <TD>{v.createdBy}</TD>
                  <TD>{formatDate(v.createdAt)}</TD>
                  {canEdit && (
                    <TD className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={
                          isEditable
                            ? "Edit"
                            : "Cannot edit an approved or pending version"
                        }
                        disabled={!isEditable}
                        onClick={() => isEditable && setEditId(v.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TD>
                  )}
                </TR>
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
