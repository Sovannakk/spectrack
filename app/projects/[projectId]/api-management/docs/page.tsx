"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { BookOpen, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EndpointDoc } from "@/components/endpoint-doc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { downloadApiFile } from "@/lib/download";

export default function DocsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const loading = usePageLoader();
  const allVersions = useAppStore((s) => s.versions);
  const allEndpoints = useAppStore((s) => s.endpoints);
  const allApiFiles = useAppStore((s) => s.apiFiles);
  const versions = React.useMemo(
    () => allVersions.filter((v) => v.projectId === projectId),
    [allVersions, projectId],
  );

  // default to latest approved (or any latest)
  const defaultVersionId = React.useMemo(() => {
    const approved = versions
      .filter((v) => v.status === "approved")
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
    return approved?.id ?? versions[0]?.id ?? "";
  }, [versions]);

  const [versionId, setVersionId] = React.useState<string>("");
  React.useEffect(() => {
    if (!versionId && defaultVersionId) setVersionId(defaultVersionId);
  }, [defaultVersionId, versionId]);

  const version = versions.find((v) => v.id === versionId);
  const endpoints = React.useMemo(
    () =>
      allEndpoints.filter(
        (e) => e.projectId === projectId && e.versionId === versionId,
      ),
    [allEndpoints, projectId, versionId],
  );

  const [search, setSearch] = React.useState("");
  const filtered = endpoints.filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.method.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDownload = () => {
    if (!version) return;
    const file = allApiFiles.find((f) => f.id === version.fileId);
    if (!file) {
      toast.error("Source file missing");
      return;
    }
    downloadApiFile(file, endpoints);
    toast.success(`Downloading ${file.name}…`);
  };

  if (loading) return <Skeleton className="h-96" />;

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-5 w-5" />}
        title="No documentation yet"
        description="Upload an API spec to browse its documentation here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        description="Browse all endpoints across versions of this project."
        actions={
          <Button variant="outline" onClick={handleDownload} disabled={!version}>
            <Download className="h-4 w-4" /> Download spec
          </Button>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Version</Label>
            <Select
              options={versions.map((v) => ({
                value: v.id,
                label: `${v.name} (${v.status})`,
              }))}
              value={versionId}
              onValueChange={setVersionId}
            />
          </div>
          {version && (
            <div className="flex items-center gap-2">
              <StatusBadge status={version.status} />
              {version.tags.map((t) => (
                <Badge key={t} variant="violet">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>
            Endpoints{" "}
            <span className="text-xs font-normal text-stone-500">
              ({endpoints.length})
            </span>
          </CardTitle>
          <div className="relative w-64 max-w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search method, path, or summary…"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              No endpoints match your search.
            </p>
          ) : (
            filtered.map((e) => <EndpointDoc key={e.id} endpoint={e} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
