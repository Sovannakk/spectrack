import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * UX-QW-06 — verbose relative time formatter matching the spec bands:
 *   < 60s        → "just now"
 *   < 60m        → "X minutes ago"
 *   < 24h        → "X hours ago"
 *   < 7d         → "X days ago"
 *   < 30d        → "X weeks ago"
 *   < 12 months  → "X months ago"
 *   ≥ 12 months  → "X years ago"
 */
export function timeAgo(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return String(input);
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "just now";
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (abs < 86400) {
    const h = Math.round(abs / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (abs < 86400 * 7) {
    const days = Math.round(abs / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (abs < 86400 * 30) {
    const weeks = Math.round(abs / (86400 * 7));
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (abs < 86400 * 365) {
    const months = Math.round(abs / (86400 * 30));
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.round(abs / (86400 * 365));
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** Locale-aware absolute timestamp suitable for tooltips. */
export function formatAbsolute(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}
