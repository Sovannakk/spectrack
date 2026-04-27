"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const role = useAppStore((s) => s.currentUser.role);
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  React.useEffect(() => {
    if (role !== "owner") {
      const t = setTimeout(
        () => router.replace(`/projects/${projectId}/dashboard`),
        1500,
      );
      return () => clearTimeout(t);
    }
  }, [role, router, projectId]);

  if (role !== "owner") {
    return (
      <EmptyState
        icon={<Lock className="h-6 w-6" />}
        title="Owner access required"
        description="Redirecting you to the dashboard…"
      />
    );
  }
  return <>{children}</>;
}
