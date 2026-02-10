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
  type EdgeProps,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Circle,
  Square,
  Diamond,
  Bot,
  StopCircle,
  GripVertical,
  User,
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBadge } from "@/components/ui/glass-badge";
import { mockWorkflow, mockProjects } from "@/lib/mock-data";

// ─── Status Colors ────────────────────────────────────
const statusColor: Record<string, string> = {
  completed: "#30D158",
  active: "#0A84FF",
  pending: "#8E8E93",
  blocked: "#FF453A",
};

const statusBg: Record<string, string> = {
  completed: "rgba(48, 209, 88, 0.12)",
  active: "rgba(10, 132, 255, 0.12)",
  pending: "rgba(142, 142, 147, 0.10)",
  blocked: "rgba(255, 69, 58, 0.12)",
};

// ─── Custom Nodes ─────────────────────────────────────
function StartNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: `3px solid ${statusColor[status]}`,
          background: statusBg[status],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Circle size={20} style={{ color: statusColor[status] }} />
      </div>
      <span
        className="text-[10px] mt-1 font-medium text-center max-w-[80px]"
        style={{ color: "var(--text-primary)" }}
      >
        {data.label as string}
      </span>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 8, height: 8 }} />
    </div>
  );
}

function EndNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 8, height: 8 }} />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: `4px solid ${statusColor[status]}`,
          background: statusBg[status],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StopCircle size={20} style={{ color: statusColor[status] }} />
      </div>
      <span
        className="text-[10px] mt-1 font-medium text-center max-w-[80px]"
        style={{ color: "var(--text-primary)" }}
      >
        {data.label as string}
      </span>
    </div>
  );
}

function TaskNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div
      className="glass"
      style={{
        minWidth: 140,
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        borderLeft: `4px solid ${statusColor[status]}`,
        background: statusBg[status],
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 8, height: 8 }} />
      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
        {data.label as string}
      </p>
      {!!data.assignee && (
        <div className="flex items-center gap-1 mt-1.5">
          <User size={10} style={{ color: "var(--text-secondary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {data.assignee as string}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 8, height: 8 }} />
    </div>
  );
}

function GatewayNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 8, height: 8 }} />
      <div
        style={{
          width: 48,
          height: 48,
          transform: "rotate(45deg)",
          border: `3px solid ${statusColor[status]}`,
          background: statusBg[status],
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Diamond
          size={18}
          style={{ color: statusColor[status], transform: "rotate(-45deg)" }}
        />
      </div>
      <span
        className="text-[10px] mt-1 font-medium text-center max-w-[80px]"
        style={{ color: "var(--text-primary)" }}
      >
        {data.label as string}
      </span>
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 8, height: 8 }} />
    </div>
  );
}

function AgentTaskNode({ data }: { data: Record<string, unknown> }) {
  const status = (data.status as string) || "pending";
  return (
    <div
      className="glass"
      style={{
        minWidth: 140,
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        borderLeft: `4px solid ${statusColor[status]}`,
        background: statusBg[status],
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusColor[status], width: 8, height: 8 }} />
      <div className="flex items-center gap-1.5 mb-1">
        <Bot size={12} style={{ color: "var(--accent-purple)" }} />
        <span className="text-[9px] font-medium" style={{ color: "var(--accent-purple)" }}>
          AI AGENT
        </span>
      </div>
      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
        {data.label as string}
      </p>
      {!!data.assignee && (
        <div className="flex items-center gap-1 mt-1.5">
          <Bot size={10} style={{ color: "var(--text-secondary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {data.assignee as string}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: statusColor[status], width: 8, height: 8 }} />
    </div>
  );
}

// ─── Custom Edge ──────────────────────────────────────
function CustomEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "var(--text-tertiary)",
        }}
      />
      {label && (
        <text
          x={labelX}
          y={labelY - 8}
          textAnchor="middle"
          fontSize={10}
          fill="var(--text-secondary)"
          fontWeight={500}
        >
          {label as string}
        </text>
      )}
    </>
  );
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  task: TaskNode,
  gateway: GatewayNode,
  "agent-task": AgentTaskNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// ─── Toolbar palette items ────────────────────────────
const paletteItems = [
  { type: "start", label: "Start", icon: Circle, color: "#30D158" },
  { type: "end", label: "End", icon: StopCircle, color: "#8E8E93" },
  { type: "task", label: "Task", icon: Square, color: "#0A84FF" },
  { type: "gateway", label: "Gateway", icon: Diamond, color: "#FF9F0A" },
  { type: "agent-task", label: "Agent", icon: Bot, color: "#BF5AF2" },
];

// ─── Convert mock data → ReactFlow format ─────────────
function buildFlowData() {
  const laneHeight = 120;
  const laneGap = 10;

  // Calculate lane Y ranges
  const laneYMap: Record<string, number> = {};
  mockWorkflow.lanes.forEach((lane, i) => {
    laneYMap[lane.id] = i * (laneHeight + laneGap);
  });

  const nodes: Node[] = mockWorkflow.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { label: n.label, status: n.status, assignee: n.assignee },
  }));

  const edges: Edge[] = mockWorkflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "custom",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary)" },
  }));

  return { nodes, edges };
}

// ─── Swimlane background groups ───────────────────────
function SwimlaneBg() {
  const lanes = mockWorkflow.lanes;
  const laneHeight = 120;
  const totalWidth = 1800;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: totalWidth, height: lanes.length * (laneHeight + 10) + 100 }}
    >
      {lanes.map((lane, i) => {
        const y = i * (laneHeight + 10) + 30;
        return (
          <g key={lane.id}>
            <rect
              x={0}
              y={y}
              width={totalWidth}
              height={laneHeight}
              fill={lane.color}
              rx={12}
            />
            <text
              x={10}
              y={y + 18}
              fontSize={11}
              fontWeight={600}
              fill="var(--text-secondary)"
            >
              {lane.name}
            </text>
          </g>
        );
      })}
      {/* Phase separators */}
      {mockWorkflow.phases.map((phase, i) => {
        const x = i * (totalWidth / mockWorkflow.phases.length);
        return (
          <g key={phase.id}>
            {i > 0 && (
              <line
                x1={x}
                y1={20}
                x2={x}
                y2={lanes.length * (laneHeight + 10) + 30}
                stroke="var(--glass-border)"
                strokeWidth={1}
                strokeDasharray="6 4"
              />
            )}
            <text
              x={x + (totalWidth / mockWorkflow.phases.length) / 2}
              y={16}
              fontSize={10}
              fontWeight={600}
              fill="var(--text-tertiary)"
              textAnchor="middle"
              style={{ textTransform: "uppercase" }}
            >
              {phase.name}
            </text>
          </g>
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

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...connection, type: "custom", markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary)" } },
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
  };

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
          defaultEdgeOptions={{ type: "custom" }}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          style={{ borderRadius: "var(--radius-lg)" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="var(--glass-border)" />
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

          {/* Toolbar Panel */}
          <Panel position="top-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-2 flex flex-col gap-1"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              <p
                className="text-[10px] font-semibold px-2 py-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                NODES
              </p>
              {paletteItems.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--glass-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <GripVertical size={12} style={{ color: "var(--text-tertiary)" }} />
                  <item.icon size={14} style={{ color: item.color }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </Panel>

          {/* Legend Panel */}
          <Panel position="bottom-left">
            <div className="glass p-2 flex gap-3" style={{ borderRadius: "var(--radius-md)" }}>
              {Object.entries(statusColor).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] capitalize" style={{ color: "var(--text-secondary)" }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Lane Labels Panel */}
          <Panel position="top-right">
            <div className="glass p-2" style={{ borderRadius: "var(--radius-md)" }}>
              <p className="text-[10px] font-semibold px-1 mb-1" style={{ color: "var(--text-tertiary)" }}>
                LANES
              </p>
              {mockWorkflow.lanes.map((lane) => (
                <div key={lane.id} className="flex items-center gap-2 px-1 py-0.5">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: lane.color, border: "1px solid var(--glass-border)" }}
                  />
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {lane.name}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
