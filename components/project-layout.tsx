"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { useAppStore } from "@/lib/store";

interface Props {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectLayout({ projectId, children }: Props) {
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const exists = projects.some((p) => p.id === projectId);

  React.useEffect(() => {
    if (!exists) {
      router.replace("/projects");
      return;
    }
    setActiveProjectId(projectId);
    return () => setActiveProjectId(null);
  }, [exists, projectId, router, setActiveProjectId]);

  if (!exists) return null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar projectId={projectId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav projectId={projectId} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
