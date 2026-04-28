"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  GitBranch,
  GitCompare,
  History,
  LayoutDashboard,
  Search,
  Settings,
  Upload,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Kbd, Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ReactNode;
  href: string;
  keywords?: string[];
}

const platform =
  typeof navigator !== "undefined" && /mac/i.test(navigator.platform)
    ? "mac"
    : "other";

export function CommandTrigger() {
  return (
    <Tooltip
      label={
        <span className="inline-flex items-center gap-1">
          Quick navigation <Kbd>{platform === "mac" ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
      }
      side="bottom"
    >
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("apilens:open-command"));
        }}
        className="hidden sm:inline-flex h-8 items-center gap-2 rounded-md border border-stone-200/70 bg-white/70 backdrop-blur px-2 text-xs text-stone-500 transition-colors hover:border-orange-300 hover:bg-white hover:text-stone-700 dark:border-stone-800/70 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-200"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search…</span>
        <span className="ml-1 inline-flex items-center gap-0.5">
          <Kbd>{platform === "mac" ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
    </Tooltip>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const role = useAppStore((s) => s.currentUser.role);
  const endpoints = useAppStore((s) => s.endpoints);
  const versions = useAppStore((s) => s.versions);
  const members = useAppStore((s) => s.members);
  const approvals = useAppStore((s) => s.approvals);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  // Build command list
  const commands = React.useMemo<Command[]>(() => {
    const list: Command[] = [];

    // Projects
    list.push({
      id: "all-projects",
      label: "All projects",
      group: "Navigate",
      icon: <FolderKanban className="h-4 w-4" />,
      href: "/projects",
      keywords: ["projects", "list", "home"],
    });
    list.push({
      id: "profile",
      label: "Profile",
      group: "Navigate",
      icon: <UserCog className="h-4 w-4" />,
      href: "/profile",
      keywords: ["account", "me"],
    });

    // Active project sections
    if (activeProjectId) {
      const p = projects.find((x) => x.id === activeProjectId);
      if (p) {
        list.push(
          {
            id: "p-dashboard",
            label: "Dashboard",
            hint: p.name,
            group: p.name,
            icon: <LayoutDashboard className="h-4 w-4" />,
            href: `/projects/${p.id}/dashboard`,
            keywords: ["overview", "metrics"],
          },
          {
            id: "p-files",
            label: "API files",
            hint: p.name,
            group: p.name,
            icon: <FolderKanban className="h-4 w-4" />,
            href: `/projects/${p.id}/api-management`,
            keywords: ["specs", "json", "yaml"],
          },
          {
            id: "p-versions",
            label: "Versions",
            hint: p.name,
            group: p.name,
            icon: <GitBranch className="h-4 w-4" />,
            href: `/projects/${p.id}/api-management/versions`,
          },
          {
            id: "p-docs",
            label: "Documentation",
            hint: p.name,
            group: p.name,
            icon: <BookOpen className="h-4 w-4" />,
            href: `/projects/${p.id}/api-management/docs`,
            keywords: ["swagger", "endpoints"],
          },
          {
            id: "p-compare",
            label: "Compare / diff",
            hint: p.name,
            group: p.name,
            icon: <GitCompare className="h-4 w-4" />,
            href: `/projects/${p.id}/compare`,
            keywords: ["diff", "changes"],
          },
          {
            id: "p-workflow",
            label: "Approvals",
            hint: p.name,
            group: p.name,
            icon: <ClipboardCheck className="h-4 w-4" />,
            href: `/projects/${p.id}/workflow`,
            keywords: ["review", "pending"],
          },
          {
            id: "p-notif",
            label: "Notifications",
            hint: p.name,
            group: p.name,
            icon: <Bell className="h-4 w-4" />,
            href: `/projects/${p.id}/notifications`,
          },
        );
        if (role === "owner" || role === "contributor") {
          list.push({
            id: "p-upload",
            label: "Upload API",
            hint: p.name,
            group: p.name,
            icon: <Upload className="h-4 w-4" />,
            href: `/projects/${p.id}/api-management/upload`,
            keywords: ["new", "create"],
          });
        }
        if (role === "owner") {
          list.push(
            {
              id: "p-members",
              label: "Team members",
              hint: p.name,
              group: p.name,
              icon: <Users className="h-4 w-4" />,
              href: `/projects/${p.id}/settings/members`,
            },
            {
              id: "p-history",
              label: "History & activity",
              hint: p.name,
              group: p.name,
              icon: <History className="h-4 w-4" />,
              href: `/projects/${p.id}/settings/history`,
            },
            {
              id: "p-settings",
              label: "Project settings",
              hint: p.name,
              group: p.name,
              icon: <Settings className="h-4 w-4" />,
              href: `/projects/${p.id}/settings`,
            },
          );
        }
      }
    }

    // UX-NAV-03 — searchable data scoped to active project
    if (activeProjectId) {
      // Endpoints — navigate to version detail with anchor
      for (const e of endpoints.filter(
        (e) => e.projectId === activeProjectId,
      )) {
        list.push({
          id: `ep-${e.id}`,
          label: `${e.method} ${e.path}`,
          hint: e.summary,
          group: "Endpoints",
          icon: <GitBranch className="h-4 w-4" />,
          href: `/projects/${activeProjectId}/api-management/versions/${e.versionId}#${e.id}`,
          keywords: [e.method, e.path, e.summary],
        });
      }
      // Versions
      for (const v of versions.filter(
        (v) => v.projectId === activeProjectId,
      )) {
        list.push({
          id: `ver-${v.id}`,
          label: v.name,
          hint: `${v.status}${v.tags.length ? " · " + v.tags.join(", ") : ""}`,
          group: "Versions",
          icon: <GitBranch className="h-4 w-4" />,
          href: `/projects/${activeProjectId}/api-management/versions/${v.id}`,
          keywords: [v.name, v.status, ...v.tags],
        });
      }
      // Members (owner-only nav, but searching still useful for everyone)
      for (const m of members.filter(
        (m) => m.projectId === activeProjectId,
      )) {
        list.push({
          id: `mem-${m.id}`,
          label: m.name,
          hint: `${m.role} · ${m.email}`,
          group: "Members",
          icon: <User className="h-4 w-4" />,
          href:
            role === "owner"
              ? `/projects/${activeProjectId}/settings/members`
              : `/projects/${activeProjectId}/dashboard`,
          keywords: [m.name, m.email, m.role],
        });
      }
      // Approvals
      for (const a of approvals.filter(
        (a) => a.projectId === activeProjectId,
      )) {
        list.push({
          id: `apr-${a.id}`,
          label: `${a.fromVersion} → ${a.toVersion}`,
          hint: `${a.status} · by ${a.submittedBy}`,
          group: "Approvals",
          icon: <ClipboardCheck className="h-4 w-4" />,
          href: `/projects/${activeProjectId}/workflow/${a.id}`,
          keywords: [a.fromVersion, a.toVersion, a.status, a.submittedBy],
        });
      }
    }

    // Other projects
    for (const p of projects) {
      if (p.id === activeProjectId) continue;
      list.push({
        id: `proj-${p.id}`,
        label: p.name,
        hint: p.description,
        group: "Switch project",
        icon: <FolderKanban className="h-4 w-4" />,
        href: `/projects/${p.id}/dashboard`,
        keywords: ["project", "switch"],
      });
    }

    return list;
  }, [projects, activeProjectId, role, endpoints, versions, members, approvals]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const haystack = [c.label, c.hint, c.group, ...(c.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  // Group commands
  const grouped = React.useMemo(() => {
    const groups: { group: string; items: Command[] }[] = [];
    for (const cmd of filtered) {
      let g = groups.find((x) => x.group === cmd.group);
      if (!g) {
        g = { group: cmd.group, items: [] };
        groups.push(g);
      }
      g.items.push(cmd);
    }
    return groups;
  }, [filtered]);

  // Reset highlight when filtered list changes
  React.useEffect(() => {
    setHighlight(0);
  }, [filtered.length, query, open]);

  // Global keyboard shortcut + custom event handler
  React.useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setQuery("");
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("apilens:open-command", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("apilens:open-command", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleSelect = (cmd: Command) => {
    setOpen(false);
    router.push(cmd.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div
        aria-hidden
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick navigation"
        className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/40 px-4 py-3 dark:border-stone-800/60">
          <Search className="h-4 w-4 shrink-0 text-stone-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const target = filtered[highlight];
                if (target) handleSelect(target);
              }
            }}
            placeholder="Search endpoints, versions, members…"
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul ref={listRef} className="max-h-[60vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-stone-500">
              <Search className="h-5 w-5 text-stone-300" />
              No results for &quot;{query}&quot;
            </li>
          ) : (
            grouped.map((g) => (
              <li key={g.group}>
                <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  {g.group}
                </div>
                <ul>
                  {g.items.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    const active = idx === highlight;
                    return (
                      <li key={cmd.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlight(idx)}
                          onClick={() => handleSelect(cmd)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                            active
                              ? "bg-orange-50/80 text-stone-900 dark:bg-stone-800/60 dark:text-stone-100"
                              : "text-stone-700 dark:text-stone-300",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md",
                              active
                                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_2px_4px_-1px_rgba(249,115,22,0.4)]"
                                : "bg-stone-100/80 text-stone-600 dark:bg-stone-800/80 dark:text-stone-300",
                            )}
                          >
                            {cmd.icon}
                          </span>
                          <span className="flex-1 min-w-0 truncate">
                            {cmd.label}
                          </span>
                          {cmd.hint && (
                            <span className="text-xs text-stone-400">
                              {cmd.hint}
                            </span>
                          )}
                          {active && (
                            <Kbd className="ml-2">↵</Kbd>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-white/40 bg-white/30 px-4 py-2 text-[11px] text-stone-500 dark:border-stone-800/60 dark:bg-stone-950/30">
          <div className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            select
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            close
          </div>
        </div>
      </div>
    </div>
  );
}
