"use client";

import * as React from "react";
import { formatAbsolute, timeAgo } from "@/lib/utils";

interface Props {
  timestamp: string | Date;
  className?: string;
}

/**
 * UX-QW-06 — renders a verbose relative time (e.g. "2 months ago") with
 * the absolute date as a `title` tooltip ("Mar 5, 2025 at 9:00 AM").
 */
export function RelativeTime({ timestamp, className }: Props) {
  return (
    <span className={className} title={formatAbsolute(timestamp)}>
      {timeAgo(timestamp)}
    </span>
  );
}
