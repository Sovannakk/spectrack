"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, UserCog } from "lucide-react";
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
import { Tooltip } from "@/components/ui/tooltip";
import { CommandTrigger } from "@/components/command-palette";

interface TopNavProps {
  projectId: string;
  onMobileMenuClick?: () => void;
}

export function TopNav({ projectId, onMobileMenuClick }: TopNavProps) {
  const router = useRouter();
  const user = useAppStore((s) => s.currentUser);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/40 bg-white/40 px-3 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/40 sm:gap-3 sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMobileMenuClick}
        className="md:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-stone-600 hover:bg-white/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        href="/projects"
        className="hidden sm:inline text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
      >
        All projects
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        <CommandTrigger />
        <RoleSwitcher />
        <NotificationsBell projectId={projectId} />
        <Dropdown>
          <DropdownTrigger className="ml-1 flex items-center gap-2 rounded-full ring-offset-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 dark:ring-offset-stone-950">
            <Tooltip label="Account">
              <span className="inline-flex">
                <Avatar name={user.name} size="sm" />
              </span>
            </Tooltip>
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
