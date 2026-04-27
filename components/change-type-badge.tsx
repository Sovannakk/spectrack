import {
  ArrowLeftRight,
  Asterisk,
  LayoutPanelTop,
  ListPlus,
  PencilLine,
  Plus,
  PlusCircle,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import type { DiffSubType, ChangeType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Cfg {
  label: string;
  icon: React.ReactNode;
  changeType: ChangeType;
}

export const subTypeConfig: Record<DiffSubType, Cfg> = {
  endpoint_removed: {
    label: "Endpoint removed",
    icon: <Trash2 className="h-3 w-3" />,
    changeType: "breaking",
  },
  field_renamed: {
    label: "Field renamed",
    icon: <PencilLine className="h-3 w-3" />,
    changeType: "breaking",
  },
  type_changed: {
    label: "Type changed",
    icon: <ArrowLeftRight className="h-3 w-3" />,
    changeType: "breaking",
  },
  optional_to_required: {
    label: "Now required",
    icon: <Asterisk className="h-3 w-3" />,
    changeType: "breaking",
  },
  response_structure: {
    label: "Response changed",
    icon: <LayoutPanelTop className="h-3 w-3" />,
    changeType: "breaking",
  },
  method_changed: {
    label: "Method changed",
    icon: <RefreshCcw className="h-3 w-3" />,
    changeType: "breaking",
  },
  endpoint_added: {
    label: "Endpoint added",
    icon: <Plus className="h-3 w-3" />,
    changeType: "non-breaking",
  },
  optional_field_added: {
    label: "Optional field added",
    icon: <PlusCircle className="h-3 w-3" />,
    changeType: "non-breaking",
  },
  response_data_added: {
    label: "Response data added",
    icon: <PlusCircle className="h-3 w-3" />,
    changeType: "non-breaking",
  },
  optional_param_added: {
    label: "Optional param added",
    icon: <Plus className="h-3 w-3" />,
    changeType: "non-breaking",
  },
  enum_expanded: {
    label: "Enum expanded",
    icon: <ListPlus className="h-3 w-3" />,
    changeType: "non-breaking",
  },
};

export function ChangeTypeBadge({ subType }: { subType: DiffSubType }) {
  const cfg = subTypeConfig[subType];
  const breaking = cfg.changeType === "breaking";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight",
        breaking
          ? "border-red-200/70 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          : "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function ImpactDot({
  level,
  className,
}: {
  level: "high" | "medium" | "low";
  className?: string;
}) {
  const map = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };
  return (
    <span
      title={`${level} impact`}
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        map[level],
        className,
      )}
    />
  );
}
