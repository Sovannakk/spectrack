"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Upload, GitBranch, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ChecklistStepStatus {
  uploadedApi: boolean;
  createdVersion: boolean;
  invitedTeammate: boolean;
}

interface Props {
  projectId: string;
  projectName: string;
  status: ChecklistStepStatus;
  isOwner: boolean;
  onDismiss: () => void;
  onInviteClick: () => void;
}

export function WelcomeChecklist({
  projectId,
  projectName,
  status,
  isOwner,
  onDismiss,
  onInviteClick,
}: Props) {
  const completed = [
    status.uploadedApi,
    status.createdVersion,
    status.invitedTeammate,
  ].filter(Boolean).length;
  const total = 3;
  const pct = Math.round((completed / total) * 100);

  const step1Done = status.uploadedApi;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-2">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Welcome to {projectName}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Let&apos;s get your project set up. Follow the steps below to get
          started.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">
            {completed} of {total} completed
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <StepCard
          number={1}
          completed={status.uploadedApi}
          title="Upload your first API file"
          description="Upload a Swagger or OpenAPI file (.json or .yaml) to get started."
          cta={
            <Link
              href={`/projects/${projectId}/api-management/upload`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload API
            </Link>
          }
        />
        <StepCard
          number={2}
          completed={status.createdVersion}
          locked={!step1Done}
          lockedReason="Complete step 1 first"
          title="Create a version"
          description="Assign a version name (e.g. v1) and tags to your uploaded file."
          cta={
            <Link
              href={`/projects/${projectId}/api-management/versions`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Create version
            </Link>
          }
        />
        <StepCard
          number={3}
          completed={status.invitedTeammate}
          locked={!step1Done}
          lockedReason="Complete step 1 first"
          title="Invite a teammate"
          description={
            isOwner
              ? "Invite a Contributor or Reviewer to collaborate on this project."
              : "Ask your Owner to invite teammates to collaborate."
          }
          cta={
            isOwner ? (
              <Button size="sm" onClick={onInviteClick}>
                <Users className="h-3.5 w-3.5" />
                Invite member
              </Button>
            ) : (
              <span className="text-xs text-stone-500">
                Owners only
              </span>
            )
          }
        />
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline dark:hover:text-stone-100"
        >
          Skip setup, go to dashboard
        </button>
      </div>
    </div>
  );
}

function StepCard({
  number,
  completed,
  locked,
  lockedReason,
  title,
  description,
  cta,
}: {
  number: number;
  completed: boolean;
  locked?: boolean;
  lockedReason?: string;
  title: string;
  description: string;
  cta: React.ReactNode;
}) {
  const ctaContent = (
    <span
      className={cn(
        "inline-flex shrink-0",
        locked && !completed && "pointer-events-none opacity-50",
      )}
      aria-disabled={locked && !completed ? true : undefined}
    >
      {cta}
    </span>
  );
  return (
    <Card
      className={cn(
        "transition-colors",
        completed && "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20",
      )}
    >
      <CardContent className="flex flex-wrap items-center gap-4 py-4">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            completed
              ? "bg-emerald-500 text-white"
              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
          )}
        >
          {completed ? <Check className="h-4 w-4" /> : number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </div>
          <p className="mt-0.5 text-xs text-stone-500">{description}</p>
        </div>
        {completed ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" /> Done
          </span>
        ) : locked && lockedReason ? (
          <Tooltip label={lockedReason} side="left">
            {ctaContent}
          </Tooltip>
        ) : (
          ctaContent
        )}
      </CardContent>
    </Card>
  );
}
