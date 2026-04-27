import Link from "next/link";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-6 w-6", glyph: 12, text: "text-sm" },
  md: { box: "h-7 w-7", glyph: 13, text: "text-sm" },
  lg: { box: "h-10 w-10", glyph: 18, text: "text-base" },
};

interface Props {
  size?: keyof typeof sizes;
  showText?: boolean;
  href?: string | null;
  className?: string;
}

export function Brand({
  size = "md",
  showText = true,
  href = "/projects",
  className,
}: Props) {
  const cfg = sizes[size];
  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-lg text-white",
          "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
          "shadow-[0_4px_12px_-2px_rgba(249,115,22,0.45),0_1px_0_rgba(255,255,255,0.3)_inset]",
          cfg.box,
        )}
      >
        <svg
          width={cfg.glyph}
          height={cfg.glyph}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="8" r="2.2" fill="currentColor" />
          <path
            d="M12.5 12.5L15 15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight text-stone-900 dark:text-stone-50",
            cfg.text,
          )}
        >
          APILens
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex items-center gap-2 select-none">
      {inner}
    </Link>
  );
}
