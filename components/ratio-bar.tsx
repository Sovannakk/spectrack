import { cn } from "@/lib/utils";

interface RatioBarProps {
  parts: { value: number; tone: "red" | "emerald" | "blue" | "amber" }[];
  className?: string;
}

const tones = {
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
};

export function RatioBar({ parts, className }: RatioBarProps) {
  const total = parts.reduce((acc, p) => acc + p.value, 0);
  if (total === 0) {
    return (
      <div
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800",
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800",
        className,
      )}
    >
      {parts.map((p, i) => {
        const pct = (p.value / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={i}
            className={cn("h-full", tones[p.tone])}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}
