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
import { Brand } from "@/components/brand";

interface Props {
  trail?: { label: string; href?: string }[];
}

export function GlobalNav({ trail }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((s) => s.currentUser);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 bg-white/40 px-4 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/40 sm:px-6 lg:px-8">
      <Brand size="md" />
      <nav className="flex min-w-0 items-center gap-1.5 text-sm">
        {trail?.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700" />
            {t.href ? (
              <Link
                href={t.href}
                className="font-medium text-stone-900 hover:text-orange-600 dark:text-stone-100 dark:hover:text-orange-300"
              >
                {t.label}
              </Link>
            ) : (
              <span className="text-stone-500 dark:text-stone-400">{t.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">
        <RoleSwitcher />
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
            <DropdownItem
              onSelect={() => router.push("/profile")}
              className={pathname === "/profile" ? "bg-orange-50/80 dark:bg-stone-800/60" : ""}
            >
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
