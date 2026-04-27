import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  hint,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      {/* subtle inline orange glow in the corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-200/35 blur-2xl dark:bg-orange-900/20"
      />
      <div className="relative flex items-center gap-2 text-stone-500 dark:text-stone-400">
        {icon && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
            {icon}
          </span>
        )}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="relative mt-3 text-3xl font-semibold tracking-tight text-stone-900 tabular-nums dark:text-stone-50">
        {value}
      </div>
      {hint && (
        <div className="relative mt-1 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </div>
      )}
    </Card>
  );
}
