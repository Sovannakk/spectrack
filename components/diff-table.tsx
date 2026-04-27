import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ChangeTypeBadge, ImpactDot } from "@/components/change-type-badge";
import { cn } from "@/lib/utils";
import type { Diff } from "@/lib/types";

interface Props {
  diffs: Diff[];
  /** Show old/new value columns (Compare page). Default true. */
  showValues?: boolean;
  /** Show impact dot before sub-type. Default false. */
  showImpact?: boolean;
}

export function DiffTable({
  diffs,
  showValues = true,
  showImpact = false,
}: Props) {
  if (diffs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-200 px-6 py-10 text-center text-sm text-stone-500 dark:border-stone-800">
        No differences detected.
      </div>
    );
  }
  return (
    <Table>
      <THead>
        <TR>
          <TH>Endpoint</TH>
          <TH className="w-44">Change</TH>
          {showValues && <TH className="w-44">Old</TH>}
          {showValues && <TH className="w-44">New</TH>}
          <TH>Description</TH>
        </TR>
      </THead>
      <TBody>
        {diffs.map((d) => {
          const breaking = d.changeType === "breaking";
          return (
            <TR
              key={d.id}
              className={cn(
                breaking
                  ? "bg-red-50/30 hover:bg-red-50/60 dark:bg-red-950/15 dark:hover:bg-red-950/25"
                  : "bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25",
              )}
            >
              <TD className="font-mono text-xs">{d.endpoint}</TD>
              <TD>
                <div className="flex items-center gap-1.5">
                  {showImpact && <ImpactDot level={d.impactLevel} />}
                  <ChangeTypeBadge subType={d.subType} />
                </div>
              </TD>
              {showValues && (
                <TD>
                  <ValueCell value={d.oldValue} tone="old" />
                </TD>
              )}
              {showValues && (
                <TD>
                  <ValueCell value={d.newValue} tone="new" />
                </TD>
              )}
              <TD className="text-stone-700 dark:text-stone-300">
                {d.description}
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}

function ValueCell({ value, tone }: { value: string; tone: "old" | "new" }) {
  if (value === "-") {
    return <span className="text-stone-400">—</span>;
  }
  return (
    <code
      className={cn(
        "inline-block max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[11px]",
        tone === "old"
          ? "border-red-200/70 bg-red-50 text-red-800 line-through decoration-red-400/60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
          : "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
      )}
      title={value}
    >
      {value}
    </code>
  );
}
