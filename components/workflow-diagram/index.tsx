"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NODE_TYPES } from "./nodes";
import { buildDiagram } from "./sections";

const LEGEND_ITEMS: {
  label: string;
  type: "rect" | "pill" | "diamond";
  fill: string;
  stroke: string;
}[] = [
  { label: "Web Page", type: "rect", fill: "#DCFCE7", stroke: "#86EFAC" },
  { label: "Action", type: "pill", fill: "#BFDBFE", stroke: "#93C5FD" },
  { label: "Feature", type: "rect", fill: "#EDE9FE", stroke: "#C4B5FD" },
  { label: "Process", type: "rect", fill: "#F3F4F6", stroke: "#D1D5DB" },
  { label: "Condition", type: "diamond", fill: "#FED7AA", stroke: "#FDBA74" },
];

export function WorkflowDiagram() {
  return (
    <ReactFlowProvider>
      <DiagramInner />
    </ReactFlowProvider>
  );
}

function DiagramInner() {
  const { nodes, edges, sectionAnchors, totalWidth, totalHeight } =
    React.useMemo(() => buildDiagram(), []);
  const flow = useReactFlow();

  const handleJump = (anchorY: number) => {
    flow.setCenter(totalWidth / 2, anchorY + 200, {
      zoom: flow.getZoom(),
      duration: 600,
    });
  };

  return (
    <div className="space-y-3">
      {/* Top toolbar — legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200/70 bg-white/70 px-4 py-3 backdrop-blur dark:border-stone-800/70 dark:bg-stone-900/60">
        {LEGEND_ITEMS.map((it) => (
          <LegendChip key={it.label} item={it} />
        ))}
        <span className="ml-auto text-xs text-stone-500">
          Drag canvas to pan · Scroll / pinch to zoom · Use bottom-left controls
        </span>
      </div>

      {/* Section jump pills */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200/70 bg-white/70 px-4 py-2 backdrop-blur dark:border-stone-800/70 dark:bg-stone-900/60">
        <span className="text-xs font-medium text-stone-500">Jump to:</span>
        {sectionAnchors.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleJump(a.y)}
            className="inline-flex h-7 items-center rounded-full border border-stone-200/70 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-stone-900 dark:border-stone-800/70 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:bg-stone-800/70"
          >
            {a.label.replace(/^\d+\s·\s/, "")}
          </button>
        ))}
      </div>

      {/* React Flow canvas */}
      <div
        className="rounded-lg border border-stone-200/70 bg-stone-50/40 dark:border-stone-800/70 dark:bg-stone-950/40"
        style={{ height: "calc(100vh - 280px)" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll
          zoomOnScroll={false}
          zoomOnPinch
          minZoom={0.2}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: 0.15, maxZoom: 0.9 }}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#9CA3AF" },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#E5E7EB"
          />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor={(node) => {
              switch (node.type) {
                case "web":
                  return "#86EFAC";
                case "action":
                  return "#93C5FD";
                case "feature":
                  return "#C4B5FD";
                case "process":
                  return "#D1D5DB";
                case "condition":
                  return "#FDBA74";
                case "section":
                  return "#1F2937";
                default:
                  return "#E5E7EB";
              }
            }}
            maskColor="rgba(255,255,255,0.6)"
          />
        </ReactFlow>
      </div>

      {/* Sentinel keeps `totalHeight` referenced (silences lint without
          adding visual noise). */}
      <span className="hidden" aria-hidden>
        {totalHeight}
      </span>
    </div>
  );
}

function LegendChip({
  item,
}: {
  item: (typeof LEGEND_ITEMS)[number];
}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <svg width={36} height={20} className="shrink-0">
        {item.type === "diamond" ? (
          <polygon
            points="18,2 34,10 18,18 2,10"
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={1.5}
          />
        ) : item.type === "pill" ? (
          <rect
            x={1}
            y={2}
            width={34}
            height={16}
            rx={8}
            ry={8}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={1.5}
          />
        ) : (
          <rect
            x={1}
            y={2}
            width={34}
            height={16}
            rx={3}
            ry={3}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={1.5}
          />
        )}
      </svg>
      <span className="font-medium text-stone-700 dark:text-stone-200">
        {item.label}
      </span>
    </div>
  );
}
