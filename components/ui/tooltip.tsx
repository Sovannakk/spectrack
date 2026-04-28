"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Tooltip text */
  label: React.ReactNode;
  /** Position relative to the trigger */
  side?: "top" | "bottom" | "left" | "right";
  /** Delay in ms before showing (default 250) */
  delay?: number;
  /** Optional extra classes for the bubble */
  className?: string;
  /** The trigger element. Must be a single React element. */
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

/**
 * Lightweight tooltip wrapper. Hover or focus the child to show.
 * Renders as a sibling positioned absolutely so the trigger keeps
 * its native semantics and `aria-describedby`.
 */
export function Tooltip({
  label,
  side = "top",
  delay = 250,
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactId = React.useId();
  const id = `tooltip-${reactId}`;

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(e);
      hide();
    },
    "aria-describedby": open
      ? id
      : (children.props as { "aria-describedby"?: string })[
          "aria-describedby"
        ],
  });

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  } as const;

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-stone-900/95 px-2 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm dark:bg-stone-100/95 dark:text-stone-900",
            sideClasses[side],
            "animate-in fade-in",
            className,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Pretty kbd chip — used in tooltips and the topnav for shortcut hints. */
export function Kbd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-stone-300/80 bg-stone-50 px-1 font-sans text-[10px] font-medium text-stone-600 shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
