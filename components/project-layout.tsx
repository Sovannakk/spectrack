"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { Breadcrumb } from "@/components/breadcrumb";
import { RoleExplainerModal } from "@/components/role-explainer-modal";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { useAppStore } from "@/lib/store";

interface Props {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectLayout({ projectId, children }: Props) {
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const role = useAppStore((s) => s.currentUser.role);
  const firstVisit = useAppStore((s) => s.firstVisit);
  const markFirstVisit = useAppStore((s) => s.markFirstVisit);
  const project = projects.find((p) => p.id === projectId);
  const exists = !!project;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [explainerOpen, setExplainerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!exists) {
      router.replace("/projects");
      return;
    }
    setActiveProjectId(projectId);
    return () => setActiveProjectId(null);
  }, [exists, projectId, router, setActiveProjectId]);

  // UX-ONB-02: show the role explainer once per project
  React.useEffect(() => {
    if (!exists) return;
    if (firstVisit[projectId]) return;
    setExplainerOpen(true);
  }, [exists, firstVisit, projectId]);

  // Lock body scroll when mobile drawer open
  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  if (!exists) return null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        projectId={projectId}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          projectId={projectId}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <Breadcrumb />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
      <RoleExplainerModal
        open={explainerOpen}
        onOpenChange={(o) => {
          setExplainerOpen(o);
          if (!o) markFirstVisit(projectId);
        }}
        projectName={project?.name ?? "this project"}
        role={role}
      />
      <KeyboardShortcuts />
    </div>
  );
}
