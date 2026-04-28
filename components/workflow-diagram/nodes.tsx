"use client";

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

/**
 * Custom React Flow node types matching the strict legend:
 *   web       — green rectangle  (#DCFCE7 / #86EFAC)
 *   action    — blue pill         (#BFDBFE / #93C5FD)
 *   feature   — purple rectangle  (#EDE9FE / #C4B5FD)
 *   process   — gray rectangle    (#F3F4F6 / #D1D5DB)
 *   condition — amber diamond     (#FED7AA / #FDBA74)
 *   section   — dark strip header (#1F2937 / white text)
 *
 * Every shape exposes 8 handles (4 sides × {source, target}) so edges can
 * route through specific sides without overlapping nodes:
 *
 *   IDs: t-src · t-tgt · r-src · r-tgt · b-src · b-tgt · l-src · l-tgt
 */

interface NodeData extends Record<string, unknown> {
  label: string;
}

const HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "transparent",
  border: "none",
  pointerEvents: "none",
};

function AllHandles() {
  return (
    <>
      <Handle id="t-tgt" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="t-src" type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="r-tgt" type="target" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="r-src" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="b-tgt" type="target" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle id="b-src" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle id="l-tgt" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <Handle id="l-src" type="source" position={Position.Left} style={HANDLE_STYLE} />
    </>
  );
}

const NODE_BASE =
  "flex items-center justify-center px-3 py-2 text-[12px] font-medium leading-snug text-stone-900 select-none";

// Standardized width so chains of mixed node types align centers cleanly
// (prevents smoothstep edges from adding zigzag corrections).
const RECT_W = 210;
const RECT_MIN_H = 50;

export function WebPageNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div
      className={`${NODE_BASE} rounded-lg border-2 text-center shadow-sm`}
      style={{
        background: "#DCFCE7",
        borderColor: "#86EFAC",
        width: RECT_W,
        minHeight: RECT_MIN_H,
      }}
    >
      <AllHandles />
      <span className="block">{d.label}</span>
    </div>
  );
}

export function ActionNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div
      className={`${NODE_BASE} border-2 text-center shadow-sm`}
      style={{
        background: "#BFDBFE",
        borderColor: "#93C5FD",
        width: RECT_W,
        minHeight: RECT_MIN_H,
        borderRadius: 9999,
      }}
    >
      <AllHandles />
      <span className="block">{d.label}</span>
    </div>
  );
}

export function FeatureNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div
      className={`${NODE_BASE} rounded-lg border-2 text-center shadow-sm`}
      style={{
        background: "#EDE9FE",
        borderColor: "#C4B5FD",
        width: RECT_W,
        minHeight: RECT_MIN_H,
      }}
    >
      <AllHandles />
      <span className="block">{d.label}</span>
    </div>
  );
}

export function ProcessNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div
      className={`${NODE_BASE} rounded-lg border-2 text-center shadow-sm`}
      style={{
        background: "#F3F4F6",
        borderColor: "#D1D5DB",
        width: RECT_W,
        minHeight: RECT_MIN_H,
      }}
    >
      <AllHandles />
      <span className="block">{d.label}</span>
    </div>
  );
}

export function ConditionNode({ data }: NodeProps) {
  const d = data as NodeData;
  // Container size 160×120; visible diamond = 110×110 rotated 45° centered.
  // Handles attach to the container's edges, which align with diamond points.
  return (
    <div className="relative" style={{ width: 160, height: 120 }}>
      <AllHandles />
      <div
        className="absolute border-2 shadow-sm"
        style={{
          background: "#FED7AA",
          borderColor: "#FDBA74",
          width: 100,
          height: 100,
          transform: "rotate(45deg)",
          top: 10,
          left: 30,
          borderRadius: 6,
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] font-medium leading-tight text-stone-900"
        style={{ pointerEvents: "none" }}
      >
        <span className="block max-w-[110px]">{d.label}</span>
      </div>
    </div>
  );
}

export function SectionHeaderNode({ data }: NodeProps) {
  const d = data as NodeData & { width?: number };
  return (
    <div
      className="rounded-md px-4 py-2 text-[13px] font-bold tracking-tight text-white shadow-sm"
      style={{ background: "#1F2937", width: d.width ?? 1300 }}
    >
      {d.label}
    </div>
  );
}

export const NODE_TYPES = {
  web: WebPageNode,
  action: ActionNode,
  feature: FeatureNode,
  process: ProcessNode,
  condition: ConditionNode,
  section: SectionHeaderNode,
};
