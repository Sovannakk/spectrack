import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, VersionStatus } from "@/lib/types";

const map: Record<
  VersionStatus | ApprovalStatus,
  { label: string; variant: "gray" | "blue" | "green" | "red" }
> = {
  draft: { label: "Draft", variant: "gray" },
  pending: { label: "Pending", variant: "blue" },
  approved: { label: "Approved", variant: "green" },
  rejected: { label: "Rejected", variant: "red" },
};

export function StatusBadge({
  status,
}: {
  status: VersionStatus | ApprovalStatus;
}) {
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
