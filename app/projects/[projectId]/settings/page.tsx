"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { OwnerGuard } from "@/components/owner-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectSettingsPage() {
  return (
    <OwnerGuard>
      <Inner />
    </OwnerGuard>
  );
}

function Inner() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const loading = usePageLoader();
  const project = useAppStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const updateProject = useAppStore((s) => s.updateProject);
  const deleteProject = useAppStore((s) => s.deleteProject);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmName, setConfirmName] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  React.useEffect(() => {
    if (project) {
      reset({ name: project.name, description: project.description });
    }
  }, [project, reset]);

  if (loading) return <Skeleton className="h-64" />;
  if (!project) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Project settings"
        description="Update general information for this project."
      />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => {
              updateProject(projectId, v);
              toast.success("Project updated");
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200/70 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Delete this project
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                All API files, versions, approvals, and members will be
                permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmName("");
                setConfirmOpen(true);
              }}
            >
              Delete project
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{project.name}"?</DialogTitle>
            <DialogDescription>
              This action is irreversible. Type{" "}
              <span className="font-semibold">{project.name}</span> below to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={project.name}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmName !== project.name}
              onClick={() => {
                deleteProject(projectId);
                toast.success("Project deleted");
                router.push("/projects");
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
