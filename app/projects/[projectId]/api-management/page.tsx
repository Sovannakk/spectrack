"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, Download, FileCode, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { undoableToast } from "@/lib/use-undoable-action";
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
import {
  FileDropzone,
  type DroppedFile,
} from "@/components/file-dropzone";
import { ConfirmModal } from "@/components/confirm-modal";
import { PageHeader } from "@/components/page-header";
import { Tooltip } from "@/components/ui/tooltip";
import { downloadApiFile } from "@/lib/download";
import { cn, formatDate } from "@/lib/utils";
import type { ApiFile } from "@/lib/types";

export default function ApiFilesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const allApiFiles = useAppStore((s) => s.apiFiles);
  const allEndpoints = useAppStore((s) => s.endpoints);
  const allVersions = useAppStore((s) => s.versions);
  const apiFiles = React.useMemo(
    () => allApiFiles.filter((f) => f.projectId === projectId),
    [allApiFiles, projectId],
  );
  const deleteApiFile = useAppStore((s) => s.deleteApiFile);
  const restoreApiFile = useAppStore((s) => s.restoreApiFile);
  const updateApiFile = useAppStore((s) => s.updateApiFile);

  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);
  const fileToDelete = apiFiles.find((f) => f.id === confirmId);
  const fileToEdit = apiFiles.find((f) => f.id === editId);

  const canMutate = role === "owner" || role === "contributor";

  const handleDownload = (f: ApiFile) => {
    const fileVersion = allVersions.find((v) => v.fileId === f.id);
    const fileEndpoints = fileVersion
      ? allEndpoints.filter(
          (e) => e.projectId === projectId && e.versionId === fileVersion.id,
        )
      : [];
    downloadApiFile(f, fileEndpoints);
    toast.success(`Downloading ${f.name}…`);
  };

  const handleCopy = async (f: ApiFile) => {
    await navigator.clipboard.writeText(f.fileUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="API files"
        description="All uploaded specifications for this project."
        actions={
          canMutate ? (
            <Link
              href={`/projects/${projectId}/api-management/upload`}
              className={cn(buttonVariants())}
            >
              <Plus className="h-4 w-4" /> Upload API
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <TableSkeleton />
      ) : apiFiles.length === 0 ? (
        <EmptyState
          icon={<FileCode className="h-5 w-5" />}
          title="No API files yet"
          description="Upload your first OpenAPI/JSON spec to get started."
          actions={[
            {
              label: "Upload API",
              href: `/projects/${projectId}/api-management/upload`,
              roles: ["owner", "contributor"],
              icon: <Plus className="h-4 w-4" />,
            },
            {
              label: "Ask a contributor to upload",
              roles: ["reviewer"],
              variant: "muted",
            },
          ]}
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>File name</TH>
              <TH className="w-24">Format</TH>
              <TH>Uploaded by</TH>
              <TH>Uploaded at</TH>
              <TH className="w-44 text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {apiFiles.map((f) => (
              <TR key={f.id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">{f.name}</span>
                  </div>
                </TD>
                <TD>
                  <Badge variant={f.format === "JSON" ? "blue" : "amber"}>
                    {f.format}
                  </Badge>
                </TD>
                <TD>{f.uploadedBy}</TD>
                <TD>{formatDate(f.uploadedAt)}</TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <Tooltip label="Copy link">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Copy link"
                        onClick={() => handleCopy(f)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Download">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Download"
                        onClick={() => handleDownload(f)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                    {canMutate && (
                      <>
                        <Tooltip label="Edit">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit"
                            onClick={() => setEditId(f.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Delete" side="left">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete"
                            onClick={() => setConfirmId(f.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <ConfirmModal
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Delete file"
        description={
          fileToDelete
            ? `Permanently delete "${fileToDelete.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!confirmId || !fileToDelete) return;
          const snapshot = fileToDelete;
          deleteApiFile(confirmId);
          undoableToast({
            message: `"${snapshot.name}" deleted`,
            onUndo: () => restoreApiFile(snapshot),
          });
        }}
      />

      {fileToEdit && (
        <EditFileModal
          file={fileToEdit}
          onClose={() => setEditId(null)}
          onSave={(name, replacement) => {
            updateApiFile(fileToEdit.id, {
              name,
              replacementFileName: replacement?.name,
            });
            toast.success("File updated");
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

function EditFileModal({
  file,
  onClose,
  onSave,
}: {
  file: ApiFile;
  onClose: () => void;
  onSave: (name: string, replacement: DroppedFile | null) => void;
}) {
  const [name, setName] = React.useState(file.name);
  const [replacement, setReplacement] = React.useState<DroppedFile | null>(
    null,
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit file</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fileName">File name</Label>
            <Input
              id="fileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Format</Label>
            <Badge variant={file.format === "JSON" ? "blue" : "amber"}>
              {file.format}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <Label>Re-upload file (optional)</Label>
            <FileDropzone
              value={replacement}
              onChange={setReplacement}
              onError={(msg) => toast.error(msg)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(name.trim() || file.name, replacement)}
            disabled={!name.trim()}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
