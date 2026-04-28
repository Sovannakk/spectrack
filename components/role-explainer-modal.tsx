"use client";

import * as React from "react";
import { Check, X as XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/role-badge";
import type { Role } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectName: string;
  role: Role;
}

interface RoleCopy {
  blurb: string;
  can: string[];
  cannot?: string[];
}

const COPY: Record<Role, RoleCopy> = {
  owner: {
    blurb:
      "You have full access to this project. You can manage team members, upload APIs, review submissions, and configure project settings.",
    can: [
      "Manage team",
      "Upload APIs",
      "Approve or reject versions",
      "View all logs",
      "Edit project settings",
    ],
  },
  contributor: {
    blurb:
      "You can upload API files and create new versions for review. A Reviewer will check your submissions before they are approved.",
    can: [
      "Upload API files",
      "Create versions",
      "Submit for review",
      "Fix and resubmit rejected versions",
    ],
    cannot: ["Manage team", "Change project settings"],
  },
  reviewer: {
    blurb:
      "You can review submitted API versions, leave comments on specific endpoints, and approve or reject changes.",
    can: [
      "Review submitted versions",
      "Leave endpoint comments",
      "Approve or reject submissions",
    ],
    cannot: ["Upload API files", "Manage team"],
  },
};

export function RoleExplainerModal({
  open,
  onOpenChange,
  projectName,
  role,
}: Props) {
  const copy = COPY[role];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to {projectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Your role
            </span>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
            {copy.blurb}
          </p>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              You can
            </h4>
            <ul className="space-y-1.5">
              {copy.can.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-200"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          {copy.cannot && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                You cannot
              </h4>
              <ul className="space-y-1.5">
                {copy.cannot.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-sm text-stone-500 dark:text-stone-400"
                  >
                    <XIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Got it, let&apos;s go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
