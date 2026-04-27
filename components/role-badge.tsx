import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/types";

const map: Record<Role, { label: string; variant: "orange" | "teal" | "coral" }> = {
  owner: { label: "Owner", variant: "orange" },
  contributor: { label: "Contributor", variant: "teal" },
  reviewer: { label: "Reviewer", variant: "coral" },
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = map[role];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
