"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useAppStore } from "@/lib/store";
import { RoleSwitcher } from "@/components/role-switcher";
import { RoleBadge } from "@/components/role-badge";
import { NotificationsBell } from "@/components/notifications-bell";

const sectionLabels: { match: RegExp; label: string }[] = [
  { match: /\/dashboard$/, label: "Dashboard" },
  { match: /\/api-management\/upload$/, label: "Upload API" },
  { match: /\/api-management\/docs$/, label: "Documentation" },
  { match: /\/api-management\/versions\/[^/]+$/, label: "Version detail" },
  { match: /\/api-management\/versions$/, label: "Versions" },
  { match: /\/api-management$/, label: "API Files" },
  { match: /\/compare$/, label: "Compare" },
  { match: /\/workflow\/[^/]+$/, label: "Approval detail" },
  { match: /\/workflow$/, label: "Workflow" },
  { match: /\/notifications$/, label: "Notifications" },
  { match: /\/settings\/members$/, label: "Team members" },
  { match: /\/settings\/history$/, label: "History" },
  { match: /\/settings$/, label: "Project settings" },
];

export function TopNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const project = useAppStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const user = useAppStore((s) => s.currentUser);

  const sectionLabel =
    sectionLabels.find((sl) => sl.match.test(pathname))?.label ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 bg-white/40 px-4 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/40 sm:px-6 lg:px-8">
      <nav className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href="/projects"
          className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
        >
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700" />
        <Link
          href={`/projects/${projectId}/dashboard`}
          className="font-medium text-stone-900 hover:text-orange-600 dark:text-stone-100 dark:hover:text-orange-300"
        >
          {project?.name ?? "—"}
        </Link>
        {sectionLabel && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700" />
            <span className="truncate text-stone-500 dark:text-stone-400">
              {sectionLabel}
            </span>
          </>
        )}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">
        <RoleSwitcher />
        <NotificationsBell projectId={projectId} />
        <Dropdown>
          <DropdownTrigger className="ml-1 flex items-center gap-2 rounded-full ring-offset-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 dark:ring-offset-stone-950">
            <Avatar name={user.name} size="sm" />
          </DropdownTrigger>
          <DropdownMenu className="w-56">
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                  {user.name}
                </div>
                <div className="truncate text-xs text-stone-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="px-3 pb-2">
              <RoleBadge role={user.role} />
            </div>
            <DropdownSeparator />
            <DropdownItem onSelect={() => router.push("/profile")}>
              <UserCog className="h-4 w-4" /> Profile
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={() => router.push("/sign-in")}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
