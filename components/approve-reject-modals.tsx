"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { fireAlerts } from "@/lib/alerts";

interface CommonProps {
  approvalId: string;
  toVersion: string;
  submittedBy: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveModal({
  approvalId,
  toVersion,
  submittedBy,
  open,
  onOpenChange,
}: CommonProps) {
  const approve = useAppStore((s) => s.approveApproval);
  const [text, setText] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve {toVersion}?</DialogTitle>
          <DialogDescription>
            The version status will be set to approved. You can leave optional
            feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`approveText-${approvalId}`}>
            Feedback (optional)
          </Label>
          <Textarea
            id={`approveText-${approvalId}`}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Looks great! …"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              approve(approvalId, text.trim() || undefined);
              toast.success(`Approved ${toVersion}`);
              fireAlerts(
                `Email sent to ${submittedBy}: your version was approved`,
                `Telegram alert sent: ${toVersion} approved`,
              );
              onOpenChange(false);
              setText("");
            }}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectModal({
  approvalId,
  toVersion,
  submittedBy,
  open,
  onOpenChange,
}: CommonProps) {
  const reject = useAppStore((s) => s.rejectApproval);
  const [text, setText] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {toVersion}?</DialogTitle>
          <DialogDescription>
            Provide a reason for rejection (min. 10 characters).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`rejectText-${approvalId}`}>Reason</Label>
          <Textarea
            id={`rejectText-${approvalId}`}
            rows={3}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setErr(null);
            }}
            placeholder="Explain why this version is being rejected…"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (text.trim().length < 10) {
                setErr("Please provide at least 10 characters.");
                return;
              }
              reject(approvalId, text.trim());
              toast.success(`Rejected ${toVersion}`);
              fireAlerts(
                `Email sent to ${submittedBy}: your version was rejected`,
                `Telegram alert sent: ${toVersion} rejected`,
              );
              onOpenChange(false);
              setText("");
            }}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
