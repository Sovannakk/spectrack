import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
};

const palette = [
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-rose-400 to-orange-500",
  "bg-gradient-to-br from-orange-400 to-red-500",
  "bg-gradient-to-br from-amber-500 to-rose-500",
  "bg-gradient-to-br from-orange-500 to-amber-600",
  "bg-gradient-to-br from-rose-500 to-orange-600",
  "bg-gradient-to-br from-amber-400 to-orange-600",
];

function colorFor(name: string): string {
  if (!name) return palette[0];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.2)_inset]",
        colorFor(name),
        sizes[size],
        className,
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
