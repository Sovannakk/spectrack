"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";

interface ShortcutDef {
  keys: string[];
  label: string;
  group: "Navigation" | "Actions";
}

const SHORTCUTS: ShortcutDef[] = [
  { keys: ["⌘", "K"], label: "Global search", group: "Navigation" },
  { keys: ["?"], label: "Show this cheatsheet", group: "Navigation" },
  { keys: ["Esc"], label: "Close modal", group: "Navigation" },
  { keys: ["N"], label: "New version", group: "Actions" },
  { keys: ["U"], label: "Upload API", group: "Actions" },
  { keys: ["C"], label: "Compare versions", group: "Actions" },
];

/**
 * UX-QW-01 — Global keyboard shortcuts. Registers listeners for `?`, `N`,
 * `U`, `C` and renders a cheatsheet dialog.
 *
 * Shortcuts are suppressed while typing in inputs / textareas / selects.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const role = useAppStore((s) => s.currentUser.role);
  const [cheatsheetOpen, setCheatsheetOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't fire while typing
      const t = document.activeElement;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "?":
          e.preventDefault();
          setCheatsheetOpen(true);
          return;
        case "n":
        case "N":
          if (
            activeProjectId &&
            (role === "owner" || role === "contributor")
          ) {
            e.preventDefault();
            router.push(
              `/projects/${activeProjectId}/api-management/upload`,
            );
          }
          return;
        case "u":
        case "U":
          if (
            activeProjectId &&
            (role === "owner" || role === "contributor")
          ) {
            e.preventDefault();
            router.push(
              `/projects/${activeProjectId}/api-management/upload`,
            );
          }
          return;
        case "c":
        case "C":
          if (activeProjectId) {
            e.preventDefault();
            router.push(`/projects/${activeProjectId}/compare`);
          }
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, activeProjectId, role]);

  const grouped = React.useMemo(() => {
    const nav = SHORTCUTS.filter((s) => s.group === "Navigation");
    const act = SHORTCUTS.filter((s) => s.group === "Actions");
    return { nav, act };
  }, []);

  return (
    <Dialog open={cheatsheetOpen} onOpenChange={setCheatsheetOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ShortcutColumn title="Navigation" items={grouped.nav} />
          <ShortcutColumn title="Actions" items={grouped.act} />
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Tip: shortcuts are paused while you&apos;re typing in a field.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutColumn({
  title,
  items,
}: {
  title: string;
  items: ShortcutDef[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-stone-700 dark:text-stone-200">{s.label}</span>
            <span className="inline-flex items-center gap-1">
              {s.keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
