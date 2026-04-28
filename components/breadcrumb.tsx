"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

const STATIC_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "api-management": "API Management",
  versions: "Versions",
  docs: "Documentation",
  upload: "Upload",
  compare: "Compare",
  workflow: "Workflow",
  notifications: "Notifications",
  settings: "Settings",
  members: "Team members",
  history: "History",
};

/**
 * UX-NAV-01: Breadcrumb trail rendered below TopNav. Resolves project IDs,
 * version IDs, and approval IDs to display names from global state.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const projects = useAppStore((s) => s.projects);
  const versions = useAppStore((s) => s.versions);
  const approvals = useAppStore((s) => s.approvals);

  const crumbs: Crumb[] = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "projects" || !parts[1]) return [];

    const projectId = parts[1];
    const project = projects.find((p) => p.id === projectId);
    const out: Crumb[] = [
      {
        label: project?.name ?? "Project",
        href: `/projects/${projectId}/dashboard`,
      },
    ];

    // Build remaining segments after /projects/<id>
    const tail = parts.slice(2);
    let acc = `/projects/${projectId}`;
    for (let i = 0; i < tail.length; i++) {
      const seg = tail[i];
      acc += `/${seg}`;
      let label: string = STATIC_LABELS[seg] ?? seg;

      // Dynamic resolution: version id, approval id
      if (tail[i - 1] === "versions") {
        const v = versions.find((v) => v.id === seg);
        if (v) label = v.name;
      } else if (tail[i - 1] === "workflow") {
        const a = approvals.find((a) => a.id === seg);
        if (a) label = `${a.fromVersion} → ${a.toVersion}`;
        else label = `Approval`;
      }

      out.push({
        label,
        href: i === tail.length - 1 ? undefined : acc,
      });
    }
    return out;
  }, [pathname, projects, versions, approvals]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-white/40 bg-white/30 px-3 py-2 backdrop-blur dark:border-stone-800/60 dark:bg-stone-950/30 sm:px-6 lg:px-8"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <span
                  aria-hidden
                  className="text-stone-300 dark:text-stone-700"
                >
                  /
                </span>
              )}
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className={cn(
                    "truncate text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className="truncate font-medium text-stone-700 dark:text-stone-200"
                  aria-current="page"
                >
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
