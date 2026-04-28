"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(28,25,23,0.08),0_2px_8px_-2px_rgba(249,115,22,0.4)] hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_2px_4px_rgba(28,25,23,0.1),0_4px_12px_-2px_rgba(249,115,22,0.5)] hover:from-orange-500 hover:to-orange-700",
        primary:
          "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(28,25,23,0.08),0_2px_8px_-2px_rgba(249,115,22,0.4)] hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_2px_4px_rgba(28,25,23,0.1),0_4px_12px_-2px_rgba(249,115,22,0.5)] hover:from-orange-500 hover:to-orange-700",
        secondary:
          "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700",
        outline:
          "bg-white/70 backdrop-blur border border-stone-200/80 text-stone-800 shadow-sm hover:bg-white hover:border-stone-300 dark:bg-stone-900/60 dark:border-stone-700/80 dark:text-stone-100 dark:hover:bg-stone-800",
        ghost:
          "text-stone-700 hover:bg-stone-100/80 dark:text-stone-300 dark:hover:bg-stone-800/60",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_2px_8px_-2px_rgba(220,38,38,0.4)] hover:from-red-500 hover:to-red-700",
        link: "text-orange-600 underline-offset-4 hover:underline dark:text-orange-300",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
