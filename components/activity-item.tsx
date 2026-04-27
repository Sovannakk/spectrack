import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import type { Activity } from "@/lib/types";

export function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Avatar name={activity.user} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-stone-700 dark:text-stone-300">
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {activity.user}
          </span>{" "}
          <span className="text-stone-500">{activity.action.toLowerCase()}</span>{" "}
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {activity.target}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          {timeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
