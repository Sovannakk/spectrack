"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { RoleBadge } from "@/components/role-badge";
import type { Role } from "@/lib/types";

const roles: Role[] = ["owner", "contributor", "reviewer"];

export function RoleSwitcher() {
  const role = useAppStore((s) => s.currentUser.role);
  const setRole = useAppStore((s) => s.setRole);

  return (
    <Dropdown>
      <DropdownTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-stone-600 transition-colors hover:bg-white/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100">
        <ShieldCheck className="h-3.5 w-3.5" />
        <RoleBadge role={role} />
        <ChevronDown className="h-3 w-3 text-stone-400" />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownLabel>View as (dev)</DropdownLabel>
        <DropdownSeparator />
        {roles.map((r) => (
          <DropdownItem
            key={r}
            onSelect={() => setRole(r)}
            className={r === role ? "bg-orange-50/80 dark:bg-stone-800/60" : ""}
          >
            <RoleBadge role={r} />
            <span className="ml-2 text-stone-500 dark:text-stone-400">
              {r === role ? "Current" : ""}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
