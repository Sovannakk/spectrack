import { cn } from "@/lib/utils";
import type { HttpMethod } from "@/lib/types";

const map: Record<HttpMethod, string> = {
  GET: "text-emerald-700 bg-emerald-50 ring-emerald-200/70 dark:text-emerald-300 dark:bg-emerald-950/40 dark:ring-emerald-900/50",
  POST: "text-blue-700 bg-blue-50 ring-blue-200/70 dark:text-blue-300 dark:bg-blue-950/40 dark:ring-blue-900/50",
  PUT: "text-amber-700 bg-amber-50 ring-amber-200/70 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900/50",
  DELETE:
    "text-red-700 bg-red-50 ring-red-200/70 dark:text-red-300 dark:bg-red-950/40 dark:ring-red-900/50",
  PATCH:
    "text-orange-700 bg-orange-50 ring-orange-200/70 dark:text-orange-300 dark:bg-orange-950/40 dark:ring-orange-900/50",
};

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[3.25rem] items-center justify-center rounded font-mono text-[10px] font-semibold tracking-wide ring-1 ring-inset px-1.5",
        map[method],
      )}
    >
      {method}
    </span>
  );
}
