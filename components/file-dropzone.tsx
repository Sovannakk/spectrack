"use client";

import * as React from "react";
import { UploadCloud, FileCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileFormat } from "@/lib/types";

const ACCEPTED = [".json", ".yaml", ".yml"];

export interface DroppedFile {
  name: string;
  format: FileFormat;
}

function inferFormat(name: string): FileFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".json")) return "JSON";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "YAML";
  return null;
}

interface Props {
  value: DroppedFile | null;
  onChange: (file: DroppedFile | null) => void;
  onError?: (msg: string) => void;
}

export function FileDropzone({ value, onChange, onError }: Props) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const accept = (file: File) => {
    const format = inferFormat(file.name);
    if (!format) {
      onError?.("Only .json, .yaml, or .yml files are allowed.");
      return;
    }
    onChange({ name: file.name, format });
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) accept(file);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-all",
        dragOver
          ? "border-orange-400 bg-orange-50/60 shadow-[0_0_0_4px_rgba(251,146,60,0.18)] dark:border-orange-700 dark:bg-orange-950/20"
          : "border-stone-300/80 bg-white/50 backdrop-blur hover:border-orange-300 hover:bg-white/70 dark:border-stone-700 dark:bg-stone-900/40 dark:hover:border-stone-600",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) accept(f);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200/70 bg-orange-50/80 px-4 py-2.5 dark:border-orange-900/50 dark:bg-orange-950/30">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_2px_4px_-1px_rgba(249,115,22,0.4)]">
            <FileCode className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {value.name}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {value.format}
            </div>
          </div>
          <button
            type="button"
            className="ml-2 rounded p-1 text-stone-400 hover:bg-white/60 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            onClick={() => onChange(null)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 shadow-[0_2px_8px_-2px_rgba(249,115,22,0.4)] dark:from-orange-950/60 dark:to-orange-900/60 dark:text-orange-300">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
            Drop your API spec here
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Accepts <span className="font-mono">.json</span>,{" "}
            <span className="font-mono">.yaml</span>, or{" "}
            <span className="font-mono">.yml</span>
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex h-8 items-center rounded-md border border-stone-200 bg-white/80 backdrop-blur px-3 text-xs font-medium text-stone-800 transition-colors hover:bg-white dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            Browse files
          </button>
        </>
      )}
    </div>
  );
}
