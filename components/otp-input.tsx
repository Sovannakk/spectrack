"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  className,
}: OTPInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join("");
    onChange(joined);
    if (joined.length === length && !joined.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    const ch = raw.slice(-1);
    setDigit(index, ch);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!text) return;
    e.preventDefault();
    const next = text.slice(0, length).padEnd(length, "").slice(0, length);
    onChange(next);
    const lastFilled = Math.min(text.length, length) - 1;
    refs.current[Math.max(0, lastFilled)]?.focus();
    if (next.length === length && !next.includes("")) onComplete?.(next);
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-lg border border-stone-200 bg-white/80 backdrop-blur text-center text-lg font-semibold text-stone-900 shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-100"
        />
      ))}
    </div>
  );
}
