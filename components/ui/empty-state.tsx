"use client";

import * as React from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export interface EmptyStateAction {
  label: string;
  /** If provided, renders as a Link */
  href?: string;
  /** Else renders as a Button with this onClick */
  onClick?: () => void;
  /** Filter the action by the current user's role. Defaults to all roles. */
  roles?: Role[];
  /** "primary" (default), "outline", or "muted" (text-only) */
  variant?: "primary" | "outline" | "muted";
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Single action — kept for backward-compat with existing callsites. */
  action?: React.ReactNode;
  /** Role-aware actions; the component filters by `currentUser.role`. */
  actions?: EmptyStateAction[];
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actions,
  className,
}: EmptyStateProps) {
  const role = useAppStore((s) => s.currentUser.role);
  const visibleActions = (actions ?? []).filter(
    (a) => !a.roles || a.roles.includes(role),
  );

  return (
    <div
      className={cn(
        "glass-subtle flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 shadow-[0_2px_6px_-2px_rgba(249,115,22,0.4)] dark:from-orange-950/60 dark:to-orange-900/60 dark:text-orange-300">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
      {visibleActions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {visibleActions.map((a) => (
            <ActionItem key={a.label} action={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionItem({ action }: { action: EmptyStateAction }) {
  if (action.variant === "muted") {
    return (
      <span className="text-sm text-stone-500 dark:text-stone-400">
        {action.icon && <span className="mr-1.5 inline-flex">{action.icon}</span>}
        {action.label}
      </span>
    );
  }
  const variant = action.variant === "outline" ? "outline" : "default";
  if (action.href) {
    return (
      <Link href={action.href} className={cn(buttonVariants({ variant }))}>
        {action.icon}
        {action.label}
      </Link>
    );
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.icon}
      {action.label}
    </Button>
  );
}
