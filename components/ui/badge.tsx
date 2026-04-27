import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-stone-200/70 bg-white/70 text-stone-700 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300",
        outline:
          "border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-300",
        gray: "border-stone-200/70 bg-stone-50/80 text-stone-700 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300",
        blue: "border-blue-200/70 bg-blue-50/80 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200",
        green:
          "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
        red: "border-red-200/70 bg-red-50/80 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
        amber:
          "border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
        orange:
          "border-orange-200/70 bg-orange-50/80 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200",
        /** previously brand-violet — kept name for back-compat, now resolves to orange */
        violet:
          "border-orange-200/70 bg-orange-50/80 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200",
        teal: "border-teal-200/70 bg-teal-50/80 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200",
        coral:
          "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
