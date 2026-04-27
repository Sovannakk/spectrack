"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileDropzone, type DroppedFile } from "@/components/file-dropzone";
import { useAppStore } from "@/lib/store";
import { fireAlerts } from "@/lib/alerts";

interface Props {
  versionId: string;
  versionName: string;
  reviewerComment: string | null;
  reviewers: string[];
}

export function ResubmitBanner({
  versionId,
  versionName,
  reviewerComment,
  reviewers,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<DroppedFile | null>(null);
  const resubmit = useAppStore((s) => s.resubmitVersion);

  return (
    <div className="glass relative flex flex-col gap-3 overflow-hidden rounded-xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-red-200/40 blur-2xl"
      />
      <AlertCircle className="relative h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
      <div className="relative flex-1 min-w-0">
        <div className="font-medium">
          Version {versionName} was rejected
        </div>
        <p className="mt-0.5 text-sm text-red-700/90 dark:text-red-200/90">
          {reviewerComment ?? "No reason provided."}
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="relative"
      >
        Fix &amp; resubmit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resubmit {versionName}</DialogTitle>
            <DialogDescription>
              Upload a corrected file. The version status will be set back to
              pending review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-stone-200/60 bg-white/60 px-3 py-2 text-sm dark:border-stone-800/60 dark:bg-stone-900/60">
              <span className="font-medium">Rejection reason:</span>{" "}
              {reviewerComment ?? "No reason provided."}
            </div>
            <FileDropzone
              value={file}
              onChange={setFile}
              onError={(msg) => toast.error(msg)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!file}
              onClick={() => {
                if (!file) return;
                resubmit(versionId, {
                  fileName: file.name,
                  format: file.format,
                });
                toast.success("Resubmitted for review");
                fireAlerts(
                  `Email sent to ${reviewers.length === 0 ? "reviewers" : reviewers.join(", ")}: ${versionName} has been resubmitted`,
                  `Telegram alert: ${versionName} resubmitted`,
                );
                setOpen(false);
              }}
            >
              Resubmit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
