"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Boxes,
  Check,
  ChevronsUpDown,
  ClipboardCheck,
  FolderKanban,
  GitBranch,
  GitCompare,
  History,
  LayoutDashboard,
  Settings,
  Upload,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, useUnreadCount } from "@/lib/store";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { Brand } from "@/components/brand";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
  icon: React.ReactNode;
  roles?: Role[];
  badge?: { value: number | string; tone: "default" | "blue" | "red" };
}

interface NavSection {
  label: string;
  items: NavItem[];
  roles?: Role[];
}

export function Sidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAppStore((s) => s.currentUser.role);
  const projects = useAppStore((s) => s.projects);
  const allApprovals = useAppStore((s) => s.approvals);
  const project = projects.find((p) => p.id === projectId);
  const unread = useUnreadCount(projectId);
  const pendingApprovals = allApprovals.filter(
    (a) => a.projectId === projectId && a.status === "pending",
  ).length;

  const sections: NavSection[] = [
    {
      label: "Main",
      items: [
        {
          label: "Dashboard",
          href: `/projects/${projectId}/dashboard`,
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "API",
      items: [
        {
          label: "API files",
          href: `/projects/${projectId}/api-management`,
          exact: true,
          icon: <Boxes className="h-4 w-4" />,
        },
        {
          label: "Versions",
          href: `/projects/${projectId}/api-management/versions`,
          icon: <GitBranch className="h-4 w-4" />,
        },
        {
          label: "Documentation",
          href: `/projects/${projectId}/api-management/docs`,
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: "Upload",
          href: `/projects/${projectId}/api-management/upload`,
          icon: <Upload className="h-4 w-4" />,
          roles: ["owner", "contributor"],
        },
        {
          label: "Compare / diff",
          href: `/projects/${projectId}/compare`,
          icon: <GitCompare className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Workflow",
      items: [
        {
          label: "Approvals",
          href: `/projects/${projectId}/workflow`,
          icon: <ClipboardCheck className="h-4 w-4" />,
          badge:
            pendingApprovals > 0
              ? { value: pendingApprovals, tone: "blue" }
              : undefined,
        },
        {
          label: "Notifications",
          href: `/projects/${projectId}/notifications`,
          icon: <Bell className="h-4 w-4" />,
          badge: unread > 0 ? { value: unread, tone: "red" } : undefined,
        },
      ],
    },
    {
      label: "Project",
      roles: ["owner"],
      items: [
        {
          label: "Team members",
          href: `/projects/${projectId}/settings/members`,
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: "History & activity",
          href: `/projects/${projectId}/settings/history`,
          icon: <History className="h-4 w-4" />,
        },
        {
          label: "Project settings",
          href: `/projects/${projectId}/settings`,
          exact: true,
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-white/40 bg-white/40 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/40 sticky top-0 h-screen">
      <div className="flex h-14 items-center px-4 border-b border-white/40 dark:border-stone-800/60">
        <Brand size="md" />
      </div>

      <div className="px-3 pt-3">
        <Dropdown>
          <DropdownTrigger className="group flex w-full items-center gap-2 rounded-lg border border-white/60 bg-white/60 backdrop-blur px-2.5 py-1.5 text-left text-sm shadow-sm transition-colors hover:border-orange-200/80 hover:bg-white/80 dark:border-stone-800/80 dark:bg-stone-900/60 dark:hover:bg-stone-800/70">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_2px_4px_-1px_rgba(249,115,22,0.4)]">
              <FolderKanban className="h-3 w-3" />
            </span>
            <span className="truncate font-medium text-stone-900 dark:text-stone-100">
              {project?.name ?? "—"}
            </span>
            <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-stone-400" />
          </DropdownTrigger>
          <DropdownMenu align="start" className="w-56">
            <DropdownLabel>Switch project</DropdownLabel>
            <DropdownSeparator />
            {projects.map((p) => (
              <DropdownItem
                key={p.id}
                onSelect={() => router.push(`/projects/${p.id}/dashboard`)}
              >
                <span className="flex-1 truncate">{p.name}</span>
                {p.id === projectId && (
                  <Check className="h-3.5 w-3.5 text-orange-500" />
                )}
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem onSelect={() => router.push("/projects")}>
              <FolderKanban className="h-3.5 w-3.5" />
              All projects
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {sections.map((section) => {
            if (section.roles && !section.roles.includes(role)) return null;
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role),
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <h4 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-500">
                  {section.label}
                </h4>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.href}>
                      <SidebarLink
                        href={item.href}
                        active={isActive(item.href, item.exact)}
                        icon={item.icon}
                        badge={item.badge}
                      >
                        {item.label}
                      </SidebarLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/40 p-3 dark:border-stone-800/60">
        <SidebarLink
          href="/profile"
          active={pathname === "/profile"}
          icon={<UserCog className="h-4 w-4" />}
        >
          Profile
        </SidebarLink>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  badge?: { value: number | string; tone: "default" | "blue" | "red" };
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all",
        active
          ? "bg-gradient-to-r from-orange-50 via-white to-orange-50/40 text-orange-700 shadow-[0_1px_2px_rgba(249,115,22,0.06),0_0_0_1px_rgba(251,146,60,0.18)] dark:from-orange-950/40 dark:via-stone-900/60 dark:to-orange-950/20 dark:text-orange-200 dark:shadow-[0_0_0_1px_rgba(251,146,60,0.3)]"
          : "text-stone-600 hover:bg-white/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/40 dark:hover:text-stone-100",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-orange-500" />
      )}
      <span
        className={cn(
          "transition-colors shrink-0",
          active
            ? "text-orange-600 dark:text-orange-300"
            : "text-stone-400 group-hover:text-stone-700 dark:text-stone-500 dark:group-hover:text-stone-200",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 truncate font-medium">{children}</span>
      {badge && <SidebarBadge value={badge.value} tone={badge.tone} />}
    </Link>
  );
}

function SidebarBadge({
  value,
  tone,
}: {
  value: number | string;
  tone: "default" | "blue" | "red";
}) {
  const tones = {
    default:
      "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200",
    red: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
        tones[tone],
      )}
    >
      {value}
    </span>
  );
}
