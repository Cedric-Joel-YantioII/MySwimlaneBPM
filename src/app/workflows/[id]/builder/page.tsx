"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  User,
  Plus,
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { mockWorkflow, mockProjects } from "@/lib/mock-data";

// ─── Layout Constants ─────────────────────────────────
const LANE_HEADER_WIDTH = 140;
const LANE_HEIGHT = 160;
const LANE_GAP = 4;
const PHASE_WIDTH = 340;
const POOL_HEADER_HEIGHT = 44;
const TOTAL_WIDTH = LANE_HEADER_WIDTH + mockWorkflow.phases.length * PHASE_WIDTH;
const TOTAL_HEIGHT = POOL_HEADER_HEIGHT + mockWorkflow.lanes.length * (LANE_HEIGHT + LANE_GAP);

// ─── Status Colors ────────────────────────────────────
const statusColor: Record<string, string> = {
  completed: "#30D158",
  active: "#0A84FF",
  pending: "#8E8E93",
  blocked: "#FF453A",
};

const statusBg: Record<string, string> = {
  completed: "rgba(48, 209, 88, 0.15)",
  active: "rgba(10, 132, 255, 0.15)",
  pending: "rgba(142, 142, 147, 0.10)",
  blocked: "rgba(255, 69, 58, 0.15)",
};

const laneBgColors = [
  "rgba(59, 130, 246, 0.04)",
  "rgba(34, 197, 94, 0.04)",
  "rgba(249, 115, 22, 0.04)",
  "rgba(168, 85, 247, 0.04)",
];

// ─── BPMN Start Event Node ───────────────────────────
function StartEventNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center" style={{ padding: 4 }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle
          cx="26" cy="26" r="23"
          fill={statusBg[status]}
          stroke={statusColor[status]}
          strokeWidth="2"
        />
        {/* Play triangle */}
        <polygon
          points="21,16 21,36 37,26"
          fill={statusColor[status]}
          opacity="0.6"
        />
      </svg>
      <span
        className="text-[11px] mt-1.5 font-semibold text-center"
        style={{ color: "var(--text-primary)", maxWidth: 100 }}
      >
        {data.label as string}
      </span>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── BPMN End Event Node ──────────────────────────────
function EndEventNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center" style={{ padding: 4 }}>
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle
          cx="26" cy="26" r="23"
          fill={statusBg[status]}
          stroke={statusColor[status]}
          strokeWidth="4"
        />
        <rect
          x="18" y="18" width="16" height="16" rx="2"
          fill={statusColor[status]}
          opacity="0.7"
        />
      </svg>
      <span
        className="text-[11px] mt-1.5 font-semibold text-center"
        style={{ color: "var(--text-primary)", maxWidth: 100 }}
      >
        {data.label as string}
      </span>
    </div>
  );
}

// ─── BPMN Task Node ───────────────────────────────────
function TaskNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div
      style={{
        minWidth: 170,
        padding: "12px 16px",
        borderRadius: 10,
        border: `2px solid ${statusColor[status]}`,
        background: statusBg[status],
        boxShadow: `0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ${statusColor[status]}22`,
        backdropFilter: "blur(8px)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      {/* BPMN task icon - person silhouette */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" opacity={0.5}>
          <circle cx="8" cy="5" r="3" fill={statusColor[status]} />
          <path d="M2,14 Q2,9 8,9 Q14,9 14,14" fill={statusColor[status]} />
        </svg>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: statusColor[status], opacity: 0.7 }}>
          Task
        </span>
      </div>
      <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
        {data.label as string}
      </p>
      {!!data.assignee && (
        <div className="flex items-center gap-1.5 mt-2" style={{ opacity: 0.7 }}>
          <User size={11} style={{ color: "var(--text-secondary)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {data.assignee as string}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── BPMN Gateway (Diamond) Node ──────────────────────
function GatewayNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  const size = 56;
  return (
    <div className="flex flex-col items-center" style={{ padding: 4 }}>
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      <svg width={size + 8} height={size + 8} viewBox={`0 0 ${size + 8} ${size + 8}`}>
        <g transform={`translate(${(size + 8) / 2}, ${(size + 8) / 2})`}>
          <rect
            x={-size / 2} y={-size / 2}
            width={size} height={size}
            rx={4}
            transform="rotate(45)"
            fill={statusBg[status]}
            stroke={statusColor[status]}
            strokeWidth="2.5"
          />
          {/* X marker for exclusive gateway */}
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={statusColor[status]} strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={statusColor[status]} strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      <span
        className="text-[11px] mt-1.5 font-semibold text-center"
        style={{ color: "var(--text-primary)", maxWidth: 110 }}
      >
        {data.label as string}
      </span>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── BPMN Agent Task Node ─────────────────────────────
function AgentTaskNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div
      style={{
        minWidth: 170,
        padding: "12px 16px",
        borderRadius: 10,
        border: `2px solid ${statusColor[status]}`,
        background: statusBg[status],
        boxShadow: `0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px ${statusColor[status]}22`,
        backdropFilter: "blur(8px)",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      {/* Gear icon in top-right corner */}
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="4" fill="none" stroke="var(--accent-purple, #BF5AF2)" strokeWidth="1.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={10 + 5 * Math.cos((angle * Math.PI) / 180)}
              y1={10 + 5 * Math.sin((angle * Math.PI) / 180)}
              x2={10 + 8 * Math.cos((angle * Math.PI) / 180)}
              y2={10 + 8 * Math.sin((angle * Math.PI) / 180)}
              stroke="var(--accent-purple, #BF5AF2)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Bot size={13} style={{ color: "var(--accent-purple, #BF5AF2)" }} />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--accent-purple, #BF5AF2)" }}>
          AI Agent
        </span>
      </div>
      <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
        {data.label as string}
      </p>
      {!!data.assignee && (
        <div className="flex items-center gap-1.5 mt-2" style={{ opacity: 0.7 }}>
          <Bot size={11} style={{ color: "var(--text-secondary)" }} />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {data.assignee as string}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── BPMN Sub-Process Node ────────────────────────────
function SubProcessNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div
      style={{
        minWidth: 170,
        padding: "12px 16px 20px",
        borderRadius: 10,
        border: `2px solid ${statusColor[status]}`,
        background: statusBg[status],
        boxShadow: `0 2px 8px rgba(0,0,0,0.08)`,
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
        {data.label as string}
      </p>
      {/* + symbol at the bottom */}
      <div style={{
        position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
        width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <rect x="0" y="0" width="14" height="14" rx="2" fill="none" stroke={statusColor[status]} strokeWidth="1.5" />
          <line x1="7" y1="3" x2="7" y2="11" stroke={statusColor[status]} strokeWidth="1.5" />
          <line x1="3" y1="7" x2="11" y2="7" stroke={statusColor[status]} strokeWidth="1.5" />
        </svg>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── BPMN Intermediate Event Node ─────────────────────
function IntermediateEventNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center" style={{ padding: 4 }}>
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="23" fill={statusBg[status]} stroke={statusColor[status]} strokeWidth="2" />
        <circle cx="26" cy="26" r="19" fill="none" stroke={statusColor[status]} strokeWidth="1.5" />
      </svg>
      <span
        className="text-[11px] mt-1.5 font-semibold text-center"
        style={{ color: "var(--text-primary)", maxWidth: 100 }}
      >
        {data.label as string}
      </span>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 10, height: 10, border: "2px solid white" }} />
    </div>
  );
}

// ─── Sequence Flow Edge (solid) ───────────────────────
function SequenceFlowEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style } = props;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16,
  });
  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...style, strokeWidth: 2, stroke: "var(--text-tertiary, #666)" }}
      />
      {label && (
        <foreignObject
          x={labelX - 50} y={labelY - 14}
          width={100} height={28}
          style={{ overflow: "visible" }}
        >
          <div style={{
            background: "var(--surface-base, #fff)",
            border: "1px solid var(--glass-border, #ddd)",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-secondary, #666)",
            textAlign: "center",
            whiteSpace: "nowrap",
            width: "fit-content",
            margin: "0 auto",
          }}>
            {label as string}
          </div>
        </foreignObject>
      )}
    </>
  );
}

// ─── Message Flow Edge (dashed) ───────────────────────
function MessageFlowEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });
  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...style, strokeWidth: 1.5, stroke: "var(--text-tertiary, #666)", strokeDasharray: "8 4" }}
      />
      {label && (
        <text x={labelX} y={labelY - 8} textAnchor="middle" fontSize={11} fill="var(--text-secondary)" fontWeight={600}>
          {label as string}
        </text>
      )}
    </>
  );
}

// ─── Node & Edge Type Registrations ───────────────────
const nodeTypes: NodeTypes = {
  start: StartEventNode,
  end: EndEventNode,
  task: TaskNode,
  gateway: GatewayNode,
  "agent-task": AgentTaskNode,
  "sub-process": SubProcessNode,
  "intermediate-event": IntermediateEventNode,
};

const edgeTypes: EdgeTypes = {
  sequence: SequenceFlowEdge,
  message: MessageFlowEdge,
};

// ─── Palette Items (grouped) ──────────────────────────
interface PaletteItem {
  type: string;
  label: string;
  group: "Events" | "Activities" | "Gateways";
  preview: React.ReactNode;
}

const paletteItems: PaletteItem[] = [
  {
    type: "start", label: "Start Event", group: "Events",
    preview: (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="rgba(48,209,88,0.15)" stroke="#30D158" strokeWidth="1.5" />
        <polygon points="11,8 11,20 21,14" fill="#30D158" opacity="0.6" />
      </svg>
    ),
  },
  {
    type: "intermediate-event", label: "Intermediate", group: "Events",
    preview: (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="rgba(255,159,10,0.15)" stroke="#FF9F0A" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="9" fill="none" stroke="#FF9F0A" strokeWidth="1" />
      </svg>
    ),
  },
  {
    type: "end", label: "End Event", group: "Events",
    preview: (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="rgba(142,142,147,0.15)" stroke="#8E8E93" strokeWidth="3" />
        <rect x="9" y="9" width="10" height="10" rx="1.5" fill="#8E8E93" opacity="0.7" />
      </svg>
    ),
  },
  {
    type: "task", label: "Task", group: "Activities",
    preview: (
      <svg width="32" height="22" viewBox="0 0 32 22">
        <rect x="1" y="1" width="30" height="20" rx="4" fill="rgba(10,132,255,0.15)" stroke="#0A84FF" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: "agent-task", label: "Agent Task", group: "Activities",
    preview: (
      <svg width="32" height="22" viewBox="0 0 32 22">
        <rect x="1" y="1" width="30" height="20" rx="4" fill="rgba(191,90,242,0.15)" stroke="#BF5AF2" strokeWidth="1.5" />
        <circle cx="24" cy="7" r="3" fill="none" stroke="#BF5AF2" strokeWidth="1" />
      </svg>
    ),
  },
  {
    type: "sub-process", label: "Sub-Process", group: "Activities",
    preview: (
      <svg width="32" height="22" viewBox="0 0 32 22">
        <rect x="1" y="1" width="30" height="20" rx="4" fill="rgba(10,132,255,0.1)" stroke="#0A84FF" strokeWidth="1.5" />
        <rect x="12" y="15" width="8" height="5" rx="1" fill="none" stroke="#0A84FF" strokeWidth="1" />
        <line x1="16" y1="16" x2="16" y2="19" stroke="#0A84FF" strokeWidth="1" />
        <line x1="14" y1="17.5" x2="18" y2="17.5" stroke="#0A84FF" strokeWidth="1" />
      </svg>
    ),
  },
  {
    type: "gateway", label: "Exclusive", group: "Gateways",
    preview: (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <rect x="14" y="2" width="16" height="16" rx="2" transform="rotate(45, 14, 14)" fill="rgba(255,159,10,0.15)" stroke="#FF9F0A" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="18" y2="18" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="10" x2="10" y2="18" stroke="#FF9F0A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Build nodes with proper swimlane positioning ─────
function buildFlowData() {
  // Map lane ID to Y position
  const laneYMap: Record<string, number> = {};
  mockWorkflow.lanes.forEach((lane, i) => {
    laneYMap[lane.id] = POOL_HEADER_HEIGHT + i * (LANE_HEIGHT + LANE_GAP) + LANE_HEIGHT / 2;
  });

  // Map phase ID to X position
  const phaseXMap: Record<string, number> = {};
  mockWorkflow.phases.forEach((phase, i) => {
    phaseXMap[phase.id] = LANE_HEADER_WIDTH + i * PHASE_WIDTH + PHASE_WIDTH / 2;
  });

  // Track how many nodes per (lane, phase) cell for stacking
  const cellCount: Record<string, number> = {};
  const cellIndex: Record<string, number> = {};

  // First pass: count nodes per cell
  mockWorkflow.nodes.forEach((n) => {
    const key = `${n.lane}-${n.phase}`;
    cellCount[key] = (cellCount[key] || 0) + 1;
  });

  const nodes: Node[] = mockWorkflow.nodes.map((n) => {
    const key = `${n.lane}-${n.phase}`;
    const idx = cellIndex[key] || 0;
    cellIndex[key] = idx + 1;
    const total = cellCount[key];

    // Center nodes within their cell, offset if multiple
    const baseX = phaseXMap[n.phase] || n.position.x;
    const baseY = laneYMap[n.lane] || n.position.y;
    const offsetX = total > 1 ? (idx - (total - 1) / 2) * 90 : 0;

    return {
      id: n.id,
      type: n.type,
      position: { x: baseX + offsetX - 85, y: baseY - 40 },
      data: { label: n.label, status: n.status, assignee: n.assignee },
    };
  });

  const edges: Edge[] = mockWorkflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "sequence",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary, #666)", width: 16, height: 16 },
  }));

  return { nodes, edges };
}

// ─── Pool & Swimlane Background (SVG overlay) ─────────
function PoolBackground() {
  const lanes = mockWorkflow.lanes;
  const phases = mockWorkflow.phases;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: TOTAL_WIDTH + 40, height: TOTAL_HEIGHT + 40 }}
    >
      {/* Pool outer border */}
      <rect
        x={0} y={0}
        width={TOTAL_WIDTH} height={TOTAL_HEIGHT}
        fill="none"
        stroke="var(--glass-border, #ccc)"
        strokeWidth={2}
        rx={8}
      />

      {/* Pool header bar */}
      <rect
        x={0} y={0}
        width={TOTAL_WIDTH} height={POOL_HEADER_HEIGHT}
        fill="var(--glass-bg, rgba(255,255,255,0.05))"
        stroke="var(--glass-border, #ccc)"
        strokeWidth={1}
        rx={8}
      />
      <text
        x={TOTAL_WIDTH / 2} y={POOL_HEADER_HEIGHT / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight={700}
        fill="var(--text-primary, #333)"
        style={{ textTransform: "uppercase" } as React.CSSProperties}
        letterSpacing={2}
      >
        {mockWorkflow.name}
      </text>

      {/* Phase column headers */}
      {phases.map((phase, i) => {
        const x = LANE_HEADER_WIDTH + i * PHASE_WIDTH;
        return (
          <g key={phase.id}>
            <text
              x={x + PHASE_WIDTH / 2}
              y={POOL_HEADER_HEIGHT / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight={600}
              fill="var(--text-tertiary, #999)"
              style={{ textTransform: "uppercase" } as React.CSSProperties}
              letterSpacing={1.5}
            >
              {phase.name}
            </text>
          </g>
        );
      })}

      {/* Swimlane rows */}
      {lanes.map((lane, i) => {
        const y = POOL_HEADER_HEIGHT + i * (LANE_HEIGHT + LANE_GAP);
        return (
          <g key={lane.id}>
            {/* Lane background */}
            <rect
              x={0} y={y}
              width={TOTAL_WIDTH} height={LANE_HEIGHT}
              fill={laneBgColors[i % laneBgColors.length]}
            />
            {/* Lane header (left side) */}
            <rect
              x={0} y={y}
              width={LANE_HEADER_WIDTH} height={LANE_HEIGHT}
              fill="var(--glass-bg, rgba(255,255,255,0.08))"
              stroke="var(--glass-border, #ccc)"
              strokeWidth={1}
            />
            {/* Rotated lane name */}
            <text
              x={LANE_HEADER_WIDTH / 2}
              y={y + LANE_HEIGHT / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={12} fontWeight={700}
              fill="var(--text-primary, #333)"
              transform={`rotate(-90, ${LANE_HEADER_WIDTH / 2}, ${y + LANE_HEIGHT / 2})`}
            >
              {lane.name}
            </text>
            {/* Role subtitle */}
            <text
              x={LANE_HEADER_WIDTH / 2}
              y={y + LANE_HEIGHT / 2 + 40}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fontWeight={500}
              fill="var(--text-tertiary, #999)"
              transform={`rotate(-90, ${LANE_HEADER_WIDTH / 2}, ${y + LANE_HEIGHT / 2 + 40})`}
            >
              {lane.role}
            </text>
            {/* Lane separator line */}
            {i < lanes.length - 1 && (
              <line
                x1={0} y1={y + LANE_HEIGHT}
                x2={TOTAL_WIDTH} y2={y + LANE_HEIGHT}
                stroke="var(--glass-border, #ccc)"
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}

      {/* Phase vertical separators (dashed) */}
      {phases.map((phase, i) => {
        if (i === 0) return null;
        const x = LANE_HEADER_WIDTH + i * PHASE_WIDTH;
        return (
          <line
            key={`sep-${phase.id}`}
            x1={x} y1={POOL_HEADER_HEIGHT}
            x2={x} y2={TOTAL_HEIGHT}
            stroke="var(--glass-border, #ccc)"
            strokeWidth={1}
            strokeDasharray="8 5"
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Builder Page ────────────────────────────────
export default function BuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
  const { nodes: initNodes, edges: initEdges } = useMemo(buildFlowData, []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "sequence",
            markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary, #666)", width: 16, height: 16 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;
      const newNode: Node = {
        id: `new-${Date.now()}`,
        type,
        position: { x: e.clientX - bounds.left - 60, y: e.clientY - bounds.top - 20 },
        data: { label: `New ${type}`, status: "pending", assignee: "" },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
    // Create a ghost element showing the node type
    const ghost = document.createElement("div");
    ghost.style.cssText = "padding:6px 14px;border-radius:8px;background:rgba(10,132,255,0.15);border:2px solid #0A84FF;font-size:12px;font-weight:600;color:#0A84FF;position:absolute;top:-1000px;";
    ghost.textContent = nodeType;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 40, 16);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  // Group palette items
  const groups = ["Events", "Activities", "Gateways"] as const;

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--surface-base)" }}>
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass flex items-center justify-between px-4 py-3 m-2 mb-0"
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        <div className="flex items-center gap-3">
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/workflows/${id}`)}
          >
            <ArrowLeft size={16} />
          </GlassButton>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {mockWorkflow.name}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              {project.name} — BPMN Builder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassBadge variant="green" dot>
            {mockWorkflow.status}
          </GlassBadge>
          <GlassButton size="sm" variant="primary">
            Save
          </GlassButton>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="flex-1 relative m-2" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: "sequence" }}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          style={{ borderRadius: "var(--radius-lg)" }}
          proOptions={{ hideAttribution: true }}
          snapToGrid
          snapGrid={[20, 20]}
        >
          <Background gap={20} size={1} color="var(--glass-border, #e5e5e5)" />

          {/* Pool & Swimlane Background */}
          <Panel position="top-left" style={{ margin: 0, padding: 0, pointerEvents: "none" }}>
            <PoolBackground />
          </Panel>

          <MiniMap
            nodeStrokeColor={(n) => statusColor[(n.data as Record<string, string>)?.status] || "#8E8E93"}
            nodeColor={(n) => statusBg[(n.data as Record<string, string>)?.status] || "rgba(142,142,147,0.1)"}
            maskColor="rgba(0,0,0,0.08)"
            style={{
              background: "var(--glass-bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--glass-border)",
            }}
          />
          <Controls
            style={{
              background: "var(--glass-bg)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--glass-border)",
            }}
          />

          {/* BPMN Node Palette */}
          <Panel position="top-left" style={{ marginLeft: 10, marginTop: 10 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass"
              style={{
                borderRadius: "var(--radius-md)",
                padding: paletteOpen ? 10 : 6,
                minWidth: paletteOpen ? 180 : 40,
                transition: "all 0.2s ease",
              }}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                style={{ padding: "4px 6px", marginBottom: paletteOpen ? 4 : 0 }}
                onClick={() => setPaletteOpen(!paletteOpen)}
              >
                {paletteOpen && (
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    BPMN Palette
                  </span>
                )}
                <Plus
                  size={14}
                  style={{
                    color: "var(--text-tertiary)",
                    transform: paletteOpen ? "rotate(45deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
              {paletteOpen && groups.map((group) => (
                <div key={group} style={{ marginBottom: 6 }}>
                  <div
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-tertiary)", padding: "4px 6px 2px", opacity: 0.6 }}
                  >
                    {group}
                  </div>
                  {paletteItems
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, item.type)}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all"
                        style={{ background: "transparent" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--glass-bg-hover, rgba(255,255,255,0.1))";
                          e.currentTarget.style.transform = "translateX(2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div style={{ width: 32, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.preview}
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </motion.div>
          </Panel>

          {/* Legend */}
          <Panel position="bottom-left">
            <div className="glass p-2 flex gap-4" style={{ borderRadius: "var(--radius-md)" }}>
              {Object.entries(statusColor).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] capitalize font-medium" style={{ color: "var(--text-secondary)" }}>
                    {status}
                  </span>
                </div>
              ))}
              <div style={{ width: 1, background: "var(--glass-border)" }} />
              <div className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--text-tertiary)" strokeWidth="2" /></svg>
                <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Sequence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Message</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
