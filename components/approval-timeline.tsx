"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Approval, Member } from "@/lib/types";

interface Props {
  approval: Approval;
  members: Member[];
}

type StepState = "completed" | "active" | "upcoming";

/**
 * UX-WF-01 — horizontal 3-step timeline of an approval's lifecycle.
 * On narrow screens the steps stack vertically.
 */
export function ApprovalTimeline({ approval, members }: Props) {
  const isPending = approval.status === "pending";
  const isApproved = approval.status === "approved";
  const isRejected = approval.status === "rejected";
  const reviewer = members.find((m) => m.role === "reviewer");

  const steps: StepDef[] = [
    {
      key: "submitted",
      label: "Submitted",
      state: "completed",
      actor: approval.submittedBy,
      time: approval.submittedAt,
    },
    {
      key: "review",
      label: "Under review",
      state: isPending ? "active" : "completed",
      actor: reviewer?.name,
      time: undefined,
    },
    {
      key: "decision",
      label: "Decision",
      state: isPending ? "upcoming" : "completed",
      actor: reviewer?.name,
      tone: isApproved ? "approved" : isRejected ? "rejected" : undefined,
      decisionLabel: isApproved
        ? "Approved"
        : isRejected
          ? "Rejected"
          : undefined,
      footnote: !isPending ? approval.reviewerComment ?? undefined : undefined,
    },
  ];

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
      {steps.map((step, i) => (
        <li
          key={step.key}
          className={cn(
            "relative flex flex-1 flex-row items-start gap-3 sm:flex-col sm:items-center sm:text-center",
          )}
        >
          {/* Connector line */}
          {i > 0 && (
            <span
              aria-hidden
              className={cn(
                "absolute left-[15px] top-0 -mt-4 h-4 w-px sm:left-0 sm:top-4 sm:right-1/2 sm:mr-4 sm:mt-0 sm:h-px sm:w-auto",
                step.state === "upcoming"
                  ? "border-l border-dashed border-stone-300 sm:border-l-0 sm:border-t sm:border-t-stone-300 dark:border-stone-700"
                  : "bg-emerald-300 sm:h-px sm:bg-emerald-300 dark:bg-emerald-800",
              )}
            />
          )}

          <StepCircle step={step} />

          <div className="min-w-0 flex-1 sm:mt-2 sm:flex-initial">
            <div
              className={cn(
                "text-sm",
                step.state === "active"
                  ? "font-semibold text-stone-900 dark:text-stone-100"
                  : step.state === "upcoming"
                    ? "text-stone-400"
                    : "font-medium text-stone-800 dark:text-stone-200",
              )}
            >
              {step.label}
            </div>
            {step.decisionLabel && (
              <div
                className={cn(
                  "mt-0.5 text-xs font-semibold",
                  step.tone === "approved" &&
                    "text-emerald-700 dark:text-emerald-300",
                  step.tone === "rejected" &&
                    "text-red-700 dark:text-red-300",
                )}
              >
                {step.decisionLabel}
              </div>
            )}
            {step.actor && step.state !== "upcoming" && (
              <div className="mt-0.5 text-[11px] text-stone-500">
                {step.actor}
                {step.time && (
                  <>
                    <span className="mx-1">·</span>
                    {formatDate(step.time)}
                  </>
                )}
              </div>
            )}
            {step.footnote && (
              <p className="mt-1 max-w-xs text-[11px] text-stone-500">
                {step.footnote}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

interface StepDef {
  key: string;
  label: string;
  state: StepState;
  actor?: string;
  time?: string;
  tone?: "approved" | "rejected";
  decisionLabel?: string;
  footnote?: string;
}

function StepCircle({ step }: { step: StepDef }) {
  const isApproved = step.tone === "approved";
  const isRejected = step.tone === "rejected";
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        step.state === "completed" &&
          !isRejected &&
          "bg-emerald-500 text-white",
        step.state === "completed" &&
          isRejected &&
          "bg-red-500 text-white",
        step.state === "active" &&
          "bg-orange-500 text-white animate-pulse",
        step.state === "upcoming" &&
          "border border-dashed border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900",
      )}
    >
      {step.state === "completed" && isRejected ? (
        <X className="h-4 w-4" />
      ) : step.state === "completed" && (isApproved || step.key === "submitted" || step.key === "review") ? (
        <Check className="h-4 w-4" />
      ) : (
        <span>·</span>
      )}
    </span>
  );
}
