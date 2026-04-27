"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-stone-200 bg-white/80 backdrop-blur px-3 py-1 text-sm text-stone-900 transition-shadow placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-100 dark:placeholder:text-stone-500",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-stone-200 bg-white/80 backdrop-blur px-3 py-2 text-sm text-stone-900 transition-shadow placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-100 dark:placeholder:text-stone-500",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-stone-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-stone-100",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
