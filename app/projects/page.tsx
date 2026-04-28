"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  FileCode,
  FolderKanban,
  GitBranch,
  Plus,
  Users,
} from "lucide-react";
import { GlobalNav } from "@/components/global-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardListSkeleton } from "@/components/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(2, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectsPage() {
  const router = useRouter();
  const loading = usePageLoader();
  const projects = useAppStore((s) => s.projects);
  const createProject = useAppStore((s) => s.createProject);
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const project = createProject(values);
    toast.success(`Created "${project.name}"`);
    setOpen(false);
    reset();
    router.push(`/projects/${project.id}/dashboard`);
  };

  return (
    <div className="min-h-screen">
      <GlobalNav trail={[{ label: "Projects" }]} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          title="Projects"
          description="Manage API specs, versions, and review workflows for each project."
          actions={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New project
            </Button>
          }
        />

        {loading ? (
          <CardListSkeleton />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="No projects yet"
            description="Create your first project to start managing API versions."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Create project
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="group relative cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(249,115,22,0.35),0_2px_4px_-2px_rgba(28,25,23,0.08)]"
                onClick={() => router.push(`/projects/${p.id}/dashboard`)}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-200/40 blur-2xl transition-all group-hover:bg-orange-300/50"
                />
                <CardContent className="relative p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_2px_8px_-2px_rgba(249,115,22,0.5)]">
                      <FolderKanban className="h-4 w-4" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-stone-300 transition-all group-hover:translate-x-0.5 group-hover:text-orange-500 dark:text-stone-700 dark:group-hover:text-orange-300" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-stone-900 group-hover:text-orange-700 dark:text-stone-50 dark:group-hover:text-orange-300">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
                    {p.description}
                  </p>
                  <div className="mt-5 flex items-center gap-4 border-t border-white/40 pt-3 text-xs text-stone-500 dark:border-stone-800/60 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {p.memberCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileCode className="h-3.5 w-3.5" /> {p.apiCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" /> {p.versionCount}
                    </span>
                    <span className="ml-auto">{formatDate(p.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Payment API" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Core payment gateway APIs"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
