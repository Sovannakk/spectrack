"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Globe2,
  Loader2,
  Upload as UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileDropzone,
  type DroppedFile,
} from "@/components/file-dropzone";
import { TagInput } from "@/components/tag-input";
import { MethodBadge } from "@/components/method-badge";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

const versionSchema = z.string().min(1, "Version name is required");
const urlSchema = z
  .string()
  .min(1, "URL is required")
  .regex(/^https?:\/\//i, "Must start with http:// or https://");

type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

type CollapsibleKey = "endpoints" | "params" | "schemas";

const PREVIEW_PARAMS = [
  { name: "page", in: "query", type: "integer", required: false },
  { name: "limit", in: "query", type: "integer", required: false },
  { name: "id", in: "path", type: "string", required: true },
  { name: "currency", in: "body", type: "string", required: true },
  { name: "amount", in: "body", type: "number", required: true },
];

const PREVIEW_SCHEMAS = [
  {
    name: "Payment",
    fields: [
      { name: "id", type: "string", required: true },
      { name: "amount", type: "number", required: true },
      { name: "currency", type: "string", required: true },
      { name: "createdAt", type: "string (ISO date)", required: true },
    ],
  },
  {
    name: "PaymentList",
    fields: [
      { name: "data", type: "Payment[]", required: true },
      { name: "total", type: "integer", required: true },
    ],
  },
];

export default function UploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const loading = usePageLoader();
  const role = useAppStore((s) => s.currentUser.role);
  const uploadApiFile = useAppStore((s) => s.uploadApiFile);
  const allEndpoints = useAppStore((s) => s.endpoints);
  const initialEndpoints = React.useMemo(
    () => allEndpoints.filter((e) => e.versionId === "v1"),
    [allEndpoints],
  );

  const [tab, setTab] = React.useState<"file" | "url">("file");
  const [file, setFile] = React.useState<DroppedFile | null>(null);
  const [url, setUrl] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [errs, setErrs] = React.useState<{ source?: string; version?: string }>(
    {},
  );

  // APIM-01 — validation state
  const [valStatus, setValStatus] = React.useState<ValidationStatus>("idle");
  const [valError, setValError] = React.useState<string | null>(null);
  const [extension, setExtension] = React.useState<string>("");

  // APIM-02 — collapsibles
  const [open, setOpen] = React.useState<Record<CollapsibleKey, boolean>>({
    endpoints: false,
    params: false,
    schemas: false,
  });

  // ADD-02 — uploaded fileUrl after success
  const [createdUrl, setCreatedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loading) return;
    if (role === "reviewer") router.replace(`/projects/${projectId}/dashboard`);
  }, [loading, role, projectId, router]);

  // Run fake validation when file/url changes
  React.useEffect(() => {
    setValError(null);
    setExtension("");
    if (tab === "file") {
      if (!file) {
        setValStatus("idle");
        return;
      }
      setValStatus("checking");
      const t = setTimeout(() => {
        const ext = "." + file.name.split(".").pop()!.toLowerCase();
        setExtension(ext);
        if (![".json", ".yaml", ".yml"].includes(ext)) {
          setValStatus("invalid");
          setValError(`Expected JSON or YAML. Received: \`${ext}\``);
        } else {
          setValStatus("valid");
        }
      }, 800);
      return () => clearTimeout(t);
    } else {
      if (!url.trim()) {
        setValStatus("idle");
        return;
      }
      const result = urlSchema.safeParse(url.trim());
      if (!result.success) {
        setValStatus("invalid");
        setValError(result.error.issues[0]?.message ?? "Invalid URL");
        return;
      }
      setValStatus("checking");
      const t = setTimeout(() => {
        const ext =
          "." + (url.split(".").pop()?.toLowerCase().split("?")[0] ?? "json");
        setExtension(ext);
        setValStatus("valid");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [tab, file, url]);

  if (loading) return <Skeleton className="h-96" />;
  if (role === "reviewer") return null;
  if (createdUrl) return <SuccessView url={createdUrl} />;

  const isValid = valStatus === "valid";

  const submit = () => {
    const next: typeof errs = {};
    if (!isValid) {
      next.source = "Please provide a valid file or URL.";
    }
    const vRes = versionSchema.safeParse(versionName);
    if (!vRes.success) next.version = vRes.error.issues[0]?.message;
    setErrs(next);
    if (Object.keys(next).length > 0) return;

    let fileName = file?.name ?? "";
    let format: "JSON" | "YAML" = file?.format ?? "JSON";
    if (tab === "url") {
      try {
        const u = new URL(url);
        fileName = u.pathname.split("/").pop() || `imported-${Date.now()}.json`;
      } catch {
        fileName = `imported-${Date.now()}.json`;
      }
      format = fileName.toLowerCase().endsWith(".yaml") ||
        fileName.toLowerCase().endsWith(".yml")
        ? "YAML"
        : "JSON";
    }

    const { file: created } = uploadApiFile(projectId, {
      fileName,
      format,
      versionName,
      tags,
    });
    toast.success(`Version ${versionName} created`);
    setCreatedUrl(created.fileUrl);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Upload API specification"
        description="Upload an OpenAPI file or import from a URL to create a new version."
      />

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "file" | "url")}>
            <TabsList>
              <TabsTrigger value="file">
                <UploadIcon className="h-3.5 w-3.5" /> File upload
              </TabsTrigger>
              <TabsTrigger value="url">
                <Globe2 className="h-3.5 w-3.5" /> URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file">
              <FileDropzone
                value={file}
                onChange={(f) => {
                  setFile(f);
                  setErrs((e) => ({ ...e, source: undefined }));
                }}
                onError={(msg) => toast.error(msg)}
              />
            </TabsContent>
            <TabsContent value="url">
              <div className="space-y-1.5">
                <Label htmlFor="url">API spec URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/openapi.json"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setErrs((er) => ({ ...er, source: undefined }));
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
          {errs.source && (
            <p className="mt-2 text-xs text-red-500">{errs.source}</p>
          )}

          <ValidationPanel
            status={valStatus}
            error={valError}
            extension={extension}
            onReset={() => {
              setFile(null);
              setUrl("");
            }}
          />
        </CardContent>
      </Card>

      {/* APIM-02 — Extracted preview with collapsibles */}
      {isValid && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CollapsibleSection
              label={`Endpoints (${initialEndpoints.length})`}
              open={open.endpoints}
              onToggle={() =>
                setOpen((o) => ({ ...o, endpoints: !o.endpoints }))
              }
            >
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {initialEndpoints.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2">
                    <MethodBadge method={e.method} />
                    <span className="font-mono text-sm">{e.path}</span>
                    <span className="ml-auto text-xs text-stone-500">
                      {e.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection
              label={`Parameters (${PREVIEW_PARAMS.length})`}
              open={open.params}
              onToggle={() => setOpen((o) => ({ ...o, params: !o.params }))}
            >
              <div className="overflow-x-auto rounded-md border border-stone-200/70 dark:border-stone-800/70">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50/60 text-[11px] uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">In</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PREVIEW_PARAMS.map((p) => (
                      <tr
                        key={p.name + p.in}
                        className="border-t border-stone-100 dark:border-stone-800/60"
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          {p.name}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <Badge variant="gray">{p.in}</Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {p.type}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {p.required ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              label={`Schemas (${PREVIEW_SCHEMAS.length})`}
              open={open.schemas}
              onToggle={() => setOpen((o) => ({ ...o, schemas: !o.schemas }))}
            >
              <div className="space-y-2">
                {PREVIEW_SCHEMAS.map((s) => (
                  <SchemaItem key={s.name} schema={s} />
                ))}
              </div>
            </CollapsibleSection>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Version metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="version">Version name</Label>
            <Input
              id="version"
              placeholder="v3"
              value={versionName}
              onChange={(e) => {
                setVersionName(e.target.value);
                setErrs((er) => ({ ...er, version: undefined }));
              }}
            />
            {errs.version && (
              <p className="text-xs text-red-500">{errs.version}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Press Enter to add (e.g. beta-release)"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!isValid || !versionName}>
          <UploadIcon className="h-4 w-4" /> Create version
        </Button>
      </div>
    </div>
  );
}

function ValidationPanel({
  status,
  error,
  extension,
  onReset,
}: {
  status: ValidationStatus;
  error: string | null;
  extension: string;
  onReset: () => void;
}) {
  if (status === "idle") return null;
  if (status === "checking") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md border border-stone-200/70 bg-stone-50/60 px-3 py-2 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
        <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
        Validating…
      </div>
    );
  }
  if (status === "invalid") {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200/70 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <div className="font-medium">Invalid file format</div>
          <p className="mt-0.5 text-xs text-red-700/90 dark:text-red-200/90">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <div className="font-medium">File is valid</div>
        <p className="mt-0.5 text-xs">
          Found 4 endpoints, 5 parameters, 2 schemas
          {extension && (
            <>
              {" "}
              · format <span className="font-mono">{extension}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function CollapsibleSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-stone-200/70 dark:border-stone-800/70">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-stone-400 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-stone-200/70 px-3 py-3 dark:border-stone-800/70">
          {children}
        </div>
      )}
    </div>
  );
}

function SchemaItem({
  schema,
}: {
  schema: { name: string; fields: { name: string; type: string; required: boolean }[] };
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-md border border-stone-200/70 dark:border-stone-800/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm"
      >
        <span className="font-mono font-medium">{schema.name}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-stone-400 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <ul className="border-t border-stone-200/70 px-3 py-2 text-xs dark:border-stone-800/70">
          {schema.fields.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between border-b border-stone-100 py-1 last:border-0 dark:border-stone-800/60"
            >
              <span className="font-mono">{f.name}</span>
              <span className="font-mono text-stone-500">{f.type}</span>
              <span className="text-stone-500">
                {f.required ? "required" : "optional"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SuccessView({ url }: { url: string }) {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Version created"
        description="Your specification was uploaded and a new version was created."
      />
      <Card>
        <CardHeader>
          <CardTitle>File URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input value={url} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
          <p className="text-xs text-stone-500">
            This is a simulated cloud URL — no actual file is hosted.
          </p>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            window.location.assign(
              `/projects/${projectId}/api-management/versions`,
            )
          }
        >
          View versions
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.location.assign(`/projects/${projectId}/api-management/upload`)
          }
        >
          Upload another
        </Button>
      </div>
    </div>
  );
}
