"use client";

import type { ApiFile, Endpoint } from "./types";

function buildOpenApiYaml(file: ApiFile, endpoints: Endpoint[]): string {
  const lines: string[] = [];
  lines.push(`openapi: 3.0.0`);
  lines.push(`info:`);
  lines.push(`  title: ${file.name}`);
  lines.push(`  version: 1.0.0`);
  lines.push(`paths:`);
  if (endpoints.length === 0) {
    lines.push(`  {}`);
  } else {
    const grouped: Record<string, Endpoint[]> = {};
    for (const e of endpoints) {
      grouped[e.path] = grouped[e.path] ?? [];
      grouped[e.path].push(e);
    }
    for (const [path, eps] of Object.entries(grouped)) {
      lines.push(`  ${path}:`);
      for (const e of eps) {
        lines.push(`    ${e.method.toLowerCase()}:`);
        lines.push(`      summary: ${JSON.stringify(e.summary)}`);
        if (e.parameters.length > 0) {
          lines.push(`      parameters:`);
          for (const p of e.parameters) {
            lines.push(`        - name: ${p.name}`);
            lines.push(`          in: ${p.in}`);
            lines.push(`          required: ${p.required}`);
            lines.push(`          schema:`);
            lines.push(`            type: ${p.type}`);
          }
        }
        lines.push(`      responses:`);
        for (const r of e.responses) {
          lines.push(`        '${r.status}':`);
          lines.push(
            `          description: ${JSON.stringify(r.description)}`,
          );
        }
      }
    }
  }
  return lines.join("\n") + "\n";
}

function buildOpenApiJson(file: ApiFile, endpoints: Endpoint[]): string {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const e of endpoints) {
    paths[e.path] = paths[e.path] ?? {};
    paths[e.path][e.method.toLowerCase()] = {
      summary: e.summary,
      parameters: e.parameters.map((p) => ({
        name: p.name,
        in: p.in,
        required: p.required,
        schema: { type: p.type },
      })),
      responses: Object.fromEntries(
        e.responses.map((r) => [r.status, { description: r.description }]),
      ),
    };
  }
  return JSON.stringify(
    {
      openapi: "3.0.0",
      info: { title: file.name, version: "1.0.0" },
      paths,
    },
    null,
    2,
  );
}

export function downloadApiFile(file: ApiFile, endpoints: Endpoint[]) {
  const content =
    file.format === "JSON"
      ? buildOpenApiJson(file, endpoints)
      : buildOpenApiYaml(file, endpoints);
  const mime =
    file.format === "JSON" ? "application/json" : "text/yaml";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(filename: string, rows: string[][]) {
  const escape = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
