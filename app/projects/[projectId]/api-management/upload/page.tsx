"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileQuestion,
  FileSearch,
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
import type { Endpoint } from "@/lib/types";

const versionSchema = z.string().min(1, "Version name is required");
const urlSchema = z
  .string()
  .min(1, "URL is required")
  .regex(/^https?:\/\//i, "Must start with http:// or https://");

type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

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

  const [valStatus, setValStatus] = React.useState<ValidationStatus>("idle");
  const [valError, setValError] = React.useState<string | null>(null);
  const [extension, setExtension] = React.useState<string>("");

  const [createdUrl, setCreatedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loading) return;
    if (role === "reviewer") router.replace(`/projects/${projectId}/dashboard`);
  }, [loading, role, projectId, router]);

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
  const canSubmit = isValid && versionName.trim().length > 0;

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
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Upload API specification"
        description="Upload an OpenAPI file or import from a URL to create a new version."
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              <UploadIcon className="h-4 w-4" /> Create version
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: source + extracted preview */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as "file" | "url")}
              >
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

              <FormatGuide />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Extracted preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isValid ? (
                <ExtractedPreview
                  endpoints={initialEndpoints}
                  params={PREVIEW_PARAMS}
                  schemas={PREVIEW_SCHEMAS}
                />
              ) : (
                <PreviewEmptyState />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: version metadata */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>3. Version metadata</CardTitle>
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
              <div className="border-t border-stone-200/60 pt-4 dark:border-stone-800/60">
                <Button
                  className="w-full"
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  <UploadIcon className="h-4 w-4" /> Create version
                </Button>
                {!canSubmit && (
                  <p className="mt-2 text-center text-xs text-stone-500">
                    {!isValid
                      ? "Provide a valid file or URL first"
                      : "Enter a version name to continue"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PreviewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-stone-200/80 bg-stone-50/40 px-6 py-10 text-center dark:border-stone-800/70 dark:bg-stone-900/20">
      <FileSearch className="h-6 w-6 text-stone-400" />
      <div className="text-sm font-medium text-stone-700 dark:text-stone-200">
        Nothing to preview yet
      </div>
      <p className="max-w-sm text-xs text-stone-500">
        Upload a file or paste a URL above. Once it validates, we&apos;ll show
        the extracted endpoints, parameters, and schemas here.
      </p>
    </div>
  );
}

function ExtractedPreview({
  endpoints,
  params,
  schemas,
}: {
  endpoints: Endpoint[];
  params: typeof PREVIEW_PARAMS;
  schemas: typeof PREVIEW_SCHEMAS;
}) {
  return (
    <Tabs defaultValue="endpoints">
      <TabsList>
        <TabsTrigger value="endpoints">
          Endpoints
          <Badge variant="gray" className="ml-1">
            {endpoints.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="params">
          Parameters
          <Badge variant="gray" className="ml-1">
            {params.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="schemas">
          Schemas
          <Badge variant="gray" className="ml-1">
            {schemas.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="endpoints">
        <ul className="divide-y divide-stone-100 rounded-md border border-stone-200/70 dark:divide-stone-800/60 dark:border-stone-800/70">
          {endpoints.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 px-3 py-2"
            >
              <MethodBadge method={e.method} />
              <span className="font-mono text-sm">{e.path}</span>
              <span className="ml-auto truncate text-xs text-stone-500">
                {e.summary}
              </span>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="params">
        <div className="overflow-x-auto rounded-md border border-stone-200/70 dark:border-stone-800/70">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/60 text-[11px] uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">In</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Required</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr
                  key={p.name + p.in}
                  className="border-t border-stone-100 dark:border-stone-800/60"
                >
                  <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                  <td className="px-3 py-2 text-xs">
                    <Badge variant="gray">{p.in}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.type}</td>
                  <td className="px-3 py-2 text-xs">
                    {p.required ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="schemas">
        <div className="space-y-2">
          {schemas.map((s) => (
            <SchemaItem key={s.name} schema={s} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
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
          className={`h-3.5 w-3.5 text-stone-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
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

const YAML_EXAMPLE = `openapi: "3.0.0"
info:
  title: Payment API
  version: "1.0.0"
paths:
  /payments:
    get:
      summary: List payments
      responses:
        "200":
          description: Success`;

const JSON_EXAMPLE = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Payment API",
    "version": "1.0.0"
  },
  "paths": {
    "/payments": {
      "get": {
        "summary": "List payments",
        "responses": {
          "200": { "description": "Success" }
        }
      }
    }
  }
}`;

function FormatGuide() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-4 rounded-md border border-stone-200/70 dark:border-stone-800/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50/60 dark:text-stone-200 dark:hover:bg-stone-900/40"
      >
        <FileQuestion className="h-3.5 w-3.5 text-stone-400" />
        <span className="font-medium">What format is accepted?</span>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 text-stone-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-stone-200/70 px-3 py-3 dark:border-stone-800/70">
          <Tabs defaultValue="yaml">
            <TabsList>
              <TabsTrigger value="yaml">YAML example</TabsTrigger>
              <TabsTrigger value="json">JSON example</TabsTrigger>
            </TabsList>
            <TabsContent value="yaml">
              <CodeBlock content={YAML_EXAMPLE} />
            </TabsContent>
            <TabsContent value="json">
              <CodeBlock content={JSON_EXAMPLE} />
            </TabsContent>
          </Tabs>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href="#"
              className="text-orange-600 hover:underline dark:text-orange-300"
              onClick={(e) => e.preventDefault()}
            >
              Learn more about OpenAPI 3.0 →
            </a>
            <a
              href="#"
              className="text-orange-600 hover:underline dark:text-orange-300"
              onClick={(e) => e.preventDefault()}
            >
              Convert Swagger 2.0 to OpenAPI 3.0 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-stone-200/60 bg-stone-50/70 p-3 font-mono text-[12px] leading-relaxed text-stone-800 dark:border-stone-800/60 dark:bg-stone-900/50 dark:text-stone-200">
      <code>{content}</code>
    </pre>
  );
}

function SuccessView({ url }: { url: string }) {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
