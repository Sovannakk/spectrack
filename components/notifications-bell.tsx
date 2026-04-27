"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useAppStore, useUnreadCount } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import type { Notification, NotificationType } from "@/lib/types";

const typeIcon: Record<NotificationType, React.ReactNode> = {
  approval: <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />,
  comment: <MessageSquare className="h-3.5 w-3.5 text-stone-500" />,
  rejection: <XCircle className="h-3.5 w-3.5 text-red-600" />,
};

interface Props {
  projectId: string;
}

export function NotificationsBell({ projectId }: Props) {
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const unread = useUnreadCount(projectId);
  const allNotifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const recent = React.useMemo(() => {
    return allNotifications
      .filter((n) => n.projectId === projectId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [allNotifications, projectId]);

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleItemClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white shadow-[0_0_8px_rgba(249,115,22,0.6)] dark:ring-stone-950" />
        )}
      </button>
      {open && (
        <div className="glass-strong absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-white/40 px-3 py-2 dark:border-stone-800/60">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Notifications
              {unread > 0 && (
                <span className="ml-1 text-xs text-stone-500">({unread})</span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(projectId)}
                className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-300"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-stone-500">
                You're all caught up.
              </li>
            ) : (
              recent.map((n) => (
                <li
                  key={n.id}
                  className="border-b border-stone-100/60 last:border-0 dark:border-stone-800/60"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-orange-50/60 dark:hover:bg-stone-800/60",
                      !n.read && "bg-orange-50/30 dark:bg-orange-950/10",
                    )}
                  >
                    <span className="mt-0.5">{typeIcon[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !n.read
                            ? "font-medium text-stone-900 dark:text-stone-100"
                            : "text-stone-600 dark:text-stone-300",
                        )}
                      >
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
          <Link
            href={`/projects/${projectId}/notifications`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-white/40 bg-white/30 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50/60 dark:border-stone-800/60 dark:bg-stone-950/40 dark:text-orange-300 dark:hover:bg-stone-800/40"
          >
            View all notifications
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
