"use client";

import * as React from "react";
import { ChevronDown, Play } from "lucide-react";
import { toast } from "sonner";
import { MethodBadge } from "@/components/method-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Endpoint, SchemaField } from "@/lib/types";

type Tab = "params" | "body" | "responses";

export function EndpointDoc({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("params");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "params", label: "Parameters", count: endpoint.parameters.length },
    {
      key: "body",
      label: "Request body",
      count: endpoint.requestBody?.length ?? 0,
    },
    { key: "responses", label: "Responses", count: endpoint.responses.length },
  ];

  return (
    <div
      className={cn(
        "glass rounded-xl transition-all",
        open ? "ring-1 ring-orange-200/60 dark:ring-orange-900/40" : "",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <MethodBadge method={endpoint.method} />
        <span className="font-mono text-sm font-semibold text-stone-900 dark:text-stone-100">
          {endpoint.path}
        </span>
        <span className="ml-2 truncate text-sm text-stone-500">
          {endpoint.summary}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-stone-400 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-white/40 px-4 pb-4 dark:border-stone-800/60">
          {endpoint.description && (
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {endpoint.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-5 border-b border-stone-200/60 dark:border-stone-800/60">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative -mb-px py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "text-stone-900 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100",
                  )}
                >
                  <span>
                    {t.label}{" "}
                    <span className="text-stone-400">({t.count})</span>
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-orange-500" />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => toast.message("API testing coming soon")}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-stone-200/70 bg-white/80 backdrop-blur px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-white dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Play className="h-3 w-3" /> Try it
            </button>
          </div>

          <div className="pt-3">
            {tab === "params" && (
              <ParametersTable parameters={endpoint.parameters} />
            )}
            {tab === "body" && <FieldsTable fields={endpoint.requestBody} />}
            {tab === "responses" && (
              <ResponsesList responses={endpoint.responses} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ParametersTable({
  parameters,
}: {
  parameters: Endpoint["parameters"];
}) {
  if (parameters.length === 0) {
    return <p className="py-2 text-sm text-stone-500">No parameters.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-stone-200/60 dark:border-stone-800/60">
      <table className="w-full text-sm">
        <thead className="bg-white/40 text-[11px] uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Name</th>
            <th className="px-3 py-2 text-left font-medium">In</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Required</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p) => (
            <tr
              key={p.name}
              className="border-t border-stone-100/60 dark:border-stone-800/60"
            >
              <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
              <td className="px-3 py-2 text-xs">
                <Badge variant="gray">{p.in}</Badge>
              </td>
              <td className="px-3 py-2 font-mono text-xs">{p.type}</td>
              <td className="px-3 py-2 text-xs">
                {p.required ? (
                  <Badge variant="red">Required</Badge>
                ) : (
                  <Badge variant="gray">Optional</Badge>
                )}
              </td>
              <td className="px-3 py-2 text-xs text-stone-600 dark:text-stone-300">
                {p.description ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldsTable({ fields }: { fields?: SchemaField[] }) {
  if (!fields || fields.length === 0) {
    return <p className="py-2 text-sm text-stone-500">No request body.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-stone-200/60 dark:border-stone-800/60">
      <table className="w-full text-sm">
        <thead className="bg-white/40 text-[11px] uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Field</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Required</th>
            <th className="px-3 py-2 text-left font-medium">Example</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr
              key={f.name}
              className="border-t border-stone-100/60 dark:border-stone-800/60"
            >
              <td className="px-3 py-2 font-mono text-xs">{f.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{f.type}</td>
              <td className="px-3 py-2 text-xs">
                {f.required ? (
                  <Badge variant="red">Required</Badge>
                ) : (
                  <Badge variant="gray">Optional</Badge>
                )}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-stone-500">
                {f.example ?? "—"}
              </td>
              <td className="px-3 py-2 text-xs text-stone-600 dark:text-stone-300">
                {f.description ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResponsesList({
  responses,
}: {
  responses: Endpoint["responses"];
}) {
  if (responses.length === 0) {
    return <p className="py-2 text-sm text-stone-500">No responses defined.</p>;
  }
  return (
    <ul className="space-y-2">
      {responses.map((r) => (
        <li
          key={r.status}
          className="rounded-md border border-stone-200/60 bg-white/40 p-3 dark:border-stone-800/60 dark:bg-stone-900/40"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                r.status.startsWith("2")
                  ? "green"
                  : r.status.startsWith("4")
                    ? "amber"
                    : r.status.startsWith("5")
                      ? "red"
                      : "gray"
              }
            >
              {r.status}
            </Badge>
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {r.description}
            </span>
            {r.schemaName && (
              <span className="ml-auto font-mono text-xs text-stone-500">
                {r.schemaName}
              </span>
            )}
          </div>
          {r.fields && r.fields.length > 0 && (
            <div className="mt-2">
              <FieldsTable fields={r.fields} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
