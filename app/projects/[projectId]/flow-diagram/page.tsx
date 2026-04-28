"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { WorkflowDiagram } from "@/components/workflow-diagram";

export default function WorkflowDiagramPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Flow diagram"
        description="Complete user-flow map of APILens — every page, action, feature, process, and decision point across all 9 feature areas."
      />
      <WorkflowDiagram />
    </div>
  );
}
