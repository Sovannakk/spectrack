"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AtSign, Bell, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; tone: string }
> = {
  approval: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  },
  comment: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    tone: "bg-stone-50 text-stone-600 dark:bg-stone-900 dark:text-stone-300",
  },
  rejection: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    tone: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  },
  mention: {
    icon: <AtSign className="h-3.5 w-3.5" />,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  },
};

export default function NotificationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const allNotifications = useAppStore((s) => s.notifications);
  const notifications = React.useMemo(
    () =>
      allNotifications
        .filter((n) => n.projectId === projectId)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [allNotifications, projectId],
  );
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const unread = notifications.filter((n) => !n.read).length;

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : "You're all caught up."
        }
        actions={
          notifications.length > 0 && unread > 0 ? (
            <Button
              variant="outline"
              onClick={() => markAllRead(projectId)}
              size="sm"
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="No notifications"
          description="You'll see updates about your projects here."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type];
            return (
              <li key={n.id}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        cfg.tone,
                      )}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          !n.read
                            ? "font-medium text-stone-900 dark:text-stone-100"
                            : "text-stone-600 dark:text-stone-300",
                        )}
                      >
                        {n.message}
                      </p>
                      <p className="text-xs text-stone-500">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read ? (
                      <>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markRead(n.id)}
                        >
                          Mark read
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-stone-400">Read</span>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
