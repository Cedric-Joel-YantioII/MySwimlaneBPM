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
  getSmoothStepPath,
  type EdgeProps,
  MarkerType,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Bot,
  User,
  Plus,
  X,
  RotateCw,
  Trash2,
  Copy,
  UserPlus,
  Save,
} from "lucide-react";
import { mockWorkflow, mockProjects } from "@/lib/mock-data";

// ═══════════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════
const LANE_HEADER_W = 120;
const LANE_H = 200;
const PHASE_W = 300;
const POOL_HEADER_H = 40;
const NODE_W = 160;
const NODE_H = 70;
const EVENT_SIZE = 50;
const GATEWAY_SIZE = 56;

// ═══════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════
const STATUS_COLOR: Record<string, string> = {
  completed: "#30D158",
  active: "#0A84FF",
  pending: "#8E8E93",
  blocked: "#FF453A",
};

const STATUS_BG: Record<string, string> = {
  completed: "rgba(48,209,88,0.12)",
  active: "rgba(10,132,255,0.12)",
  pending: "rgba(142,142,147,0.08)",
  blocked: "rgba(255,69,58,0.12)",
};

const LANE_COLORS = [
  "rgba(59,130,246,0.06)",
  "rgba(34,197,94,0.06)",
  "rgba(249,115,22,0.06)",
  "rgba(168,85,247,0.06)",
  "rgba(236,72,153,0.06)",
  "rgba(14,165,233,0.06)",
];

// ═══════════════════════════════════════════════════════
// NODE COMPONENTS
// ═══════════════════════════════════════════════════════

function StartEventNode({ data }: { data: Record<string, unknown> }) {
  const s = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <svg width={EVENT_SIZE} height={EVENT_SIZE} viewBox={`0 0 ${EVENT_SIZE} ${EVENT_SIZE}`}>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-2} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="2"/>
        <polygon points={`${EVENT_SIZE*0.38},${EVENT_SIZE*0.28} ${EVENT_SIZE*0.38},${EVENT_SIZE*0.72} ${EVENT_SIZE*0.72},${EVENT_SIZE*0.5}`} fill={STATUS_COLOR[s]} opacity="0.6"/>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[80px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function EndEventNode({ data }: { data: Record<string, unknown> }) {
  const s = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={EVENT_SIZE} height={EVENT_SIZE} viewBox={`0 0 ${EVENT_SIZE} ${EVENT_SIZE}`}>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-2} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="4"/>
        <rect x={EVENT_SIZE*0.32} y={EVENT_SIZE*0.32} width={EVENT_SIZE*0.36} height={EVENT_SIZE*0.36} rx="2" fill={STATUS_COLOR[s]} opacity="0.7"/>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[80px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
    </div>
  );
}

function IntermediateEventNode({ data }: { data: Record<string, unknown> }) {
  const s = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={EVENT_SIZE} height={EVENT_SIZE} viewBox={`0 0 ${EVENT_SIZE} ${EVENT_SIZE}`}>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-2} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="2"/>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-6} fill="none" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[80px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function TimerEventNode({ data }: { data: Record<string, unknown> }) {
  const s = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={EVENT_SIZE} height={EVENT_SIZE} viewBox={`0 0 ${EVENT_SIZE} ${EVENT_SIZE}`}>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-2} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="2"/>
        <circle cx={EVENT_SIZE/2} cy={EVENT_SIZE/2} r={EVENT_SIZE/2-6} fill="none" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
        <line x1={EVENT_SIZE/2} y1={EVENT_SIZE/2} x2={EVENT_SIZE/2} y2={EVENT_SIZE*0.24} stroke={STATUS_COLOR[s]} strokeWidth="2" strokeLinecap="round"/>
        <line x1={EVENT_SIZE/2} y1={EVENT_SIZE/2} x2={EVENT_SIZE*0.68} y2={EVENT_SIZE/2} stroke={STATUS_COLOR[s]} strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[80px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function TaskNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  return (
    <div style={{
      width: NODE_W, padding: "10px 14px", borderRadius: 8,
      border: `2px solid ${selected ? "var(--accent-primary)" : STATUS_COLOR[s]}`,
      background: STATUS_BG[s],
      boxShadow: selected ? "0 0 0 2px var(--accent-primary)" : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <div className="flex items-center gap-1.5 mb-1">
        <User size={11} style={{color:STATUS_COLOR[s], opacity:0.6}}/>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{color:STATUS_COLOR[s], opacity:0.7}}>Task</span>
      </div>
      <p className="text-[12px] font-semibold leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</p>
      {!!data.assignee && (
        <div className="flex items-center gap-1 mt-1.5" style={{opacity:0.6}}>
          <User size={10} style={{color:"var(--text-secondary)"}}/>
          <span className="text-[10px]" style={{color:"var(--text-secondary)"}}>{String(data.assignee)}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function AgentTaskNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  return (
    <div style={{
      width: NODE_W, padding: "10px 14px", borderRadius: 8,
      border: `2px solid ${selected ? "var(--accent-primary)" : "#BF5AF2"}`,
      background: "rgba(191,90,242,0.1)",
      boxShadow: selected ? "0 0 0 2px var(--accent-primary)" : "0 1px 4px rgba(0,0,0,0.06)",
      position: "relative",
    }}>
      <Handle type="target" position={Position.Left} style={{background:"#BF5AF2",width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:"#BF5AF2",width:8,height:8,border:"2px solid white"}}/>
      <div style={{position:"absolute",top:8,right:8}}>
        <Bot size={14} style={{color:"#BF5AF2",opacity:0.5}}/>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <Bot size={11} style={{color:"#BF5AF2"}}/>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{color:"#BF5AF2",opacity:0.7}}>AI Agent</span>
      </div>
      <p className="text-[12px] font-semibold leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</p>
      {!!data.assignee && (
        <div className="flex items-center gap-1 mt-1.5" style={{opacity:0.6}}>
          <Bot size={10} style={{color:"var(--text-secondary)"}}/>
          <span className="text-[10px]" style={{color:"var(--text-secondary)"}}>{String(data.assignee)}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{background:"#BF5AF2",width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:"#BF5AF2",width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function SubProcessNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  return (
    <div style={{
      width: NODE_W, padding: "10px 14px 18px", borderRadius: 8,
      border: `2px solid ${selected ? "var(--accent-primary)" : STATUS_COLOR[s]}`,
      background: STATUS_BG[s], position: "relative",
    }}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <p className="text-[12px] font-semibold leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</p>
      <div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)"}}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <rect x="0" y="0" width="14" height="14" rx="2" fill="none" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
          <line x1="7" y1="3" x2="7" y2="11" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
          <line x1="3" y1="7" x2="11" y2="7" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
        </svg>
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

// Gateway base component with different markers
function GatewayNodeBase({ data, selected, marker }: { data: Record<string, unknown>; selected?: boolean; marker: React.ReactNode }) {
  const s = (data.status as string) || "pending";
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={GATEWAY_SIZE+8} height={GATEWAY_SIZE+8} viewBox={`0 0 ${GATEWAY_SIZE+8} ${GATEWAY_SIZE+8}`}>
        <g transform={`translate(${(GATEWAY_SIZE+8)/2},${(GATEWAY_SIZE+8)/2})`}>
          <rect x={-GATEWAY_SIZE/2+4} y={-GATEWAY_SIZE/2+4} width={GATEWAY_SIZE-8} height={GATEWAY_SIZE-8} rx={3}
            transform="rotate(45)"
            fill={STATUS_BG[s]}
            stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]}
            strokeWidth={selected ? "3" : "2.5"}/>
          {marker}
        </g>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[100px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function ExclusiveGatewayNode(props: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (props.data.status as string) || "pending";
  return <GatewayNodeBase {...props} marker={
    <>
      <line x1="-8" y1="-8" x2="8" y2="8" stroke={STATUS_COLOR[s]} strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="-8" x2="-8" y2="8" stroke={STATUS_COLOR[s]} strokeWidth="3" strokeLinecap="round"/>
    </>
  }/>;
}

function ParallelGatewayNode(props: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (props.data.status as string) || "pending";
  return <GatewayNodeBase {...props} marker={
    <>
      <line x1="0" y1="-10" x2="0" y2="10" stroke={STATUS_COLOR[s]} strokeWidth="3" strokeLinecap="round"/>
      <line x1="-10" y1="0" x2="10" y2="0" stroke={STATUS_COLOR[s]} strokeWidth="3" strokeLinecap="round"/>
    </>
  }/>;
}

function InclusiveGatewayNode(props: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (props.data.status as string) || "pending";
  return <GatewayNodeBase {...props} marker={
    <circle cx="0" cy="0" r="9" fill="none" stroke={STATUS_COLOR[s]} strokeWidth="3"/>
  }/>;
}

function EventBasedGatewayNode(props: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (props.data.status as string) || "pending";
  return <GatewayNodeBase {...props} marker={
    <>
      <circle cx="0" cy="0" r="9" fill="none" stroke={STATUS_COLOR[s]} strokeWidth="1.5"/>
      <polygon points="0,-7 6,4 -6,4" fill="none" stroke={STATUS_COLOR[s]} strokeWidth="2"/>
    </>
  }/>;
}

// ═══════════════════════════════════════════════════════
// FLOWCHART NODE COMPONENTS
// ═══════════════════════════════════════════════════════

const FC_H = 60;

function FcTerminatorNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const r = FC_H / 2;
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={NODE_W} height={FC_H} viewBox={`0 0 ${NODE_W} ${FC_H}`}>
        <rect x="1" y="1" width={NODE_W-2} height={FC_H-2} rx={r} ry={r}
          fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,width:NODE_W,height:FC_H,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcProcessNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  return (
    <div style={{width:NODE_W,height:FC_H,position:"relative"}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <div style={{
        width:"100%",height:"100%",
        border:`2px solid ${selected ? "var(--accent-primary)" : STATUS_COLOR[s]}`,
        background:STATUS_BG[s],
        display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
        boxShadow: selected ? "0 0 0 2px var(--accent-primary)" : undefined,
      }}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcOptionalProcessNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  return (
    <div style={{width:NODE_W,height:FC_H,position:"relative"}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={NODE_W} height={FC_H} viewBox={`0 0 ${NODE_W} ${FC_H}`} style={{position:"absolute",top:0,left:0}}>
        <rect x="2" y="2" width={NODE_W-4} height={FC_H-4}
          fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2" strokeDasharray="6 3"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,width:NODE_W,height:FC_H,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcDecisionNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const sz = GATEWAY_SIZE;
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={sz+8} height={sz+8} viewBox={`0 0 ${sz+8} ${sz+8}`}>
        <g transform={`translate(${(sz+8)/2},${(sz+8)/2})`}>
          <rect x={-sz/2+4} y={-sz/2+4} width={sz-8} height={sz-8} rx={3}
            transform="rotate(45)"
            fill={STATUS_BG[s]}
            stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]}
            strokeWidth={selected ? "3" : "2.5"}/>
        </g>
      </svg>
      <span className="text-[10px] font-medium text-center mt-1 max-w-[100px] leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcDocumentNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const w = NODE_W, h = FC_H;
  // wavy bottom: straight top, sides, then cubic bezier wave at bottom
  const path = `M 2,2 L ${w-2},2 L ${w-2},${h-14} C ${w*0.75},${h+2} ${w*0.25},${h-22} 2,${h-10} Z`;
  return (
    <div className="flex flex-col items-center" style={{position:"relative",width:w,height:h}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",top:0,left:0}}>
        <path d={path} fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,width:w,height:h-10,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcOptionalDocumentNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const w = NODE_W, h = FC_H;
  const path = `M 2,2 L ${w-2},2 L ${w-2},${h-14} C ${w*0.75},${h+2} ${w*0.25},${h-22} 2,${h-10} Z`;
  return (
    <div className="flex flex-col items-center" style={{position:"relative",width:w,height:h}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",top:0,left:0}}>
        <path d={path} fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2" strokeDasharray="6 3"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,width:w,height:h-10,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcMultiDocumentNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const w = NODE_W, h = FC_H;
  const off = 4;
  const docPath = (dx: number, dy: number) => {
    const x1 = 2+dx, x2 = w-2+dx-off*2, y1 = 2+dy, yb = h-14+dy-off*2;
    return `M ${x1},${y1} L ${x2},${y1} L ${x2},${yb} C ${(x1+x2)*0.75},${yb+16} ${(x1+x2)*0.25},${yb-8} ${x1},${yb+4} Z`;
  };
  return (
    <div className="flex flex-col items-center" style={{position:"relative",width:w+off*2,height:h+off*2}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={w+off*2} height={h+off*2} viewBox={`0 0 ${w+off*2} ${h+off*2}`} style={{position:"absolute",top:0,left:0}}>
        {/* Back docs */}
        <path d={docPath(off*2,0)} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="1.5" opacity="0.4"/>
        <path d={docPath(off,off)} fill={STATUS_BG[s]} stroke={STATUS_COLOR[s]} strokeWidth="1.5" opacity="0.6"/>
        {/* Front doc */}
        <path d={docPath(0,off*2)} fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2"/>
      </svg>
      <div style={{position:"absolute",top:off*2,left:0,width:w,height:h-10,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

function FcOffpageNode({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) {
  const s = (data.status as string) || "pending";
  const w = NODE_W, h = FC_H;
  // Pentagon: rect with right side as arrow point
  const path = `M 2,2 L ${w-30},2 L ${w-2},${h/2} L ${w-30},${h-2} L 2,${h-2} Z`;
  return (
    <div className="flex flex-col items-center" style={{position:"relative",width:w,height:h}}>
      <Handle type="target" position={Position.Left} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="target" position={Position.Top} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",top:0,left:0}}>
        <path d={path} fill={STATUS_BG[s]} stroke={selected ? "var(--accent-primary)" : STATUS_COLOR[s]} strokeWidth="2"/>
      </svg>
      <div style={{position:"absolute",top:0,left:0,width:w-20,height:h,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <span className="text-[11px] font-semibold text-center px-2 leading-tight" style={{color:"var(--text-primary)"}}>{String(data.label)}</span>
        {!!data.assignee && <span className="text-[9px] mt-0.5" style={{color:"var(--text-tertiary)"}}>{String(data.assignee)}</span>}
      </div>
      <Handle type="source" position={Position.Right} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
      <Handle type="source" position={Position.Bottom} style={{background:STATUS_COLOR[s],width:8,height:8,border:"2px solid white"}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EDGE COMPONENTS
// ═══════════════════════════════════════════════════════

function SequenceFlowEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style } = props;
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12 });
  return (
    <>
      <BaseEdge path={path} style={{...style, strokeWidth:2, stroke:"var(--text-tertiary,#888)"}}/>
      {label && (
        <foreignObject x={labelX-45} y={labelY-12} width={90} height={24} style={{overflow:"visible"}}>
          <div style={{
            background:"var(--surface-base,#fff)", border:"1px solid var(--glass-border,#ddd)",
            borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:600,
            color:"var(--text-secondary,#666)", textAlign:"center", whiteSpace:"nowrap",
            width:"fit-content", margin:"0 auto",
          }}>{label as string}</div>
        </foreignObject>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// TYPE REGISTRATIONS
// ═══════════════════════════════════════════════════════
const nodeTypes: NodeTypes = {
  start: StartEventNode,
  end: EndEventNode,
  "intermediate-event": IntermediateEventNode,
  "timer-event": TimerEventNode,
  task: TaskNode,
  "agent-task": AgentTaskNode,
  "sub-process": SubProcessNode,
  "gateway-exclusive": ExclusiveGatewayNode,
  "gateway-parallel": ParallelGatewayNode,
  "gateway-inclusive": InclusiveGatewayNode,
  "gateway-event": EventBasedGatewayNode,
  "fc-terminator": FcTerminatorNode,
  "fc-process": FcProcessNode,
  "fc-optional-process": FcOptionalProcessNode,
  "fc-decision": FcDecisionNode,
  "fc-document": FcDocumentNode,
  "fc-optional-document": FcOptionalDocumentNode,
  "fc-multi-document": FcMultiDocumentNode,
  "fc-offpage": FcOffpageNode,
  "swimlane-grid": SwimlaneGridNode,
};

const edgeTypes: EdgeTypes = { sequence: SequenceFlowEdge };

// ═══════════════════════════════════════════════════════
// PALETTE DEFINITION
// ═══════════════════════════════════════════════════════
interface PaletteItem {
  type: string;
  label: string;
  group: string;
  icon: React.ReactNode;
}

const paletteItems: PaletteItem[] = [
  { type:"start", label:"Start", group:"Events", icon:<svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="rgba(48,209,88,0.2)" stroke="#30D158" strokeWidth="1.5"/><polygon points="8,6 8,14 14,10" fill="#30D158" opacity="0.6"/></svg> },
  { type:"intermediate-event", label:"Intermediate", group:"Events", icon:<svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="rgba(255,159,10,0.2)" stroke="#FF9F0A" strokeWidth="1.5"/><circle cx="10" cy="10" r="5.5" fill="none" stroke="#FF9F0A" strokeWidth="1"/></svg> },
  { type:"timer-event", label:"Timer", group:"Events", icon:<svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="rgba(10,132,255,0.2)" stroke="#0A84FF" strokeWidth="1.5"/><line x1="10" y1="10" x2="10" y2="5" stroke="#0A84FF" strokeWidth="1.5"/><line x1="10" y1="10" x2="14" y2="10" stroke="#0A84FF" strokeWidth="1.5"/></svg> },
  { type:"end", label:"End", group:"Events", icon:<svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="rgba(142,142,147,0.2)" stroke="#8E8E93" strokeWidth="3"/></svg> },
  { type:"task", label:"Task", group:"Activities", icon:<svg width="24" height="16"><rect x="1" y="1" width="22" height="14" rx="3" fill="rgba(10,132,255,0.15)" stroke="#0A84FF" strokeWidth="1.5"/></svg> },
  { type:"agent-task", label:"Agent Task", group:"Activities", icon:<svg width="24" height="16"><rect x="1" y="1" width="22" height="14" rx="3" fill="rgba(191,90,242,0.15)" stroke="#BF5AF2" strokeWidth="1.5"/></svg> },
  { type:"sub-process", label:"Sub-Process", group:"Activities", icon:<svg width="24" height="16"><rect x="1" y="1" width="22" height="14" rx="3" fill="rgba(10,132,255,0.1)" stroke="#0A84FF" strokeWidth="1.5"/><line x1="12" y1="11" x2="12" y2="14" stroke="#0A84FF" strokeWidth="1"/><line x1="10" y1="12.5" x2="14" y2="12.5" stroke="#0A84FF" strokeWidth="1"/></svg> },
  { type:"gateway-exclusive", label:"Exclusive (XOR)", group:"Gateways", icon:<svg width="20" height="20"><rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(45,10,10)" fill="rgba(255,159,10,0.2)" stroke="#FF9F0A" strokeWidth="1.5"/><line x1="7" y1="7" x2="13" y2="13" stroke="#FF9F0A" strokeWidth="1.5"/><line x1="13" y1="7" x2="7" y2="13" stroke="#FF9F0A" strokeWidth="1.5"/></svg> },
  { type:"gateway-parallel", label:"Parallel (AND)", group:"Gateways", icon:<svg width="20" height="20"><rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(45,10,10)" fill="rgba(48,209,88,0.2)" stroke="#30D158" strokeWidth="1.5"/><line x1="10" y1="6" x2="10" y2="14" stroke="#30D158" strokeWidth="1.5"/><line x1="6" y1="10" x2="14" y2="10" stroke="#30D158" strokeWidth="1.5"/></svg> },
  { type:"gateway-inclusive", label:"Inclusive (OR)", group:"Gateways", icon:<svg width="20" height="20"><rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(45,10,10)" fill="rgba(10,132,255,0.2)" stroke="#0A84FF" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" fill="none" stroke="#0A84FF" strokeWidth="1.5"/></svg> },
  { type:"gateway-event", label:"Event-Based", group:"Gateways", icon:<svg width="20" height="20"><rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(45,10,10)" fill="rgba(142,142,147,0.2)" stroke="#8E8E93" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" fill="none" stroke="#8E8E93" strokeWidth="1"/></svg> },
  // Flowchart shapes
  { type:"fc-terminator", label:"Start / End", group:"Flowchart", icon:<svg width="24" height="14"><rect x="1" y="1" width="22" height="12" rx="6" ry="6" fill="rgba(10,132,255,0.15)" stroke="#0A84FF" strokeWidth="1.5"/></svg> },
  { type:"fc-process", label:"Process", group:"Flowchart", icon:<svg width="24" height="14"><rect x="1" y="1" width="22" height="12" fill="rgba(10,132,255,0.15)" stroke="#0A84FF" strokeWidth="1.5"/></svg> },
  { type:"fc-optional-process", label:"Optional Process", group:"Flowchart", icon:<svg width="24" height="14"><rect x="1" y="1" width="22" height="12" fill="rgba(142,142,147,0.1)" stroke="#8E8E93" strokeWidth="1.5" strokeDasharray="3 2"/></svg> },
  { type:"fc-decision", label:"Decision", group:"Flowchart", icon:<svg width="20" height="20"><rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(45,10,10)" fill="rgba(255,159,10,0.2)" stroke="#FF9F0A" strokeWidth="1.5"/></svg> },
  { type:"fc-document", label:"Document", group:"Flowchart", icon:<svg width="24" height="16"><path d="M 1,1 L 23,1 L 23,11 C 18,16 6,6 1,13 Z" fill="rgba(48,209,88,0.15)" stroke="#30D158" strokeWidth="1.5"/></svg> },
  { type:"fc-optional-document", label:"Optional Doc", group:"Flowchart", icon:<svg width="24" height="16"><path d="M 1,1 L 23,1 L 23,11 C 18,16 6,6 1,13 Z" fill="rgba(142,142,147,0.1)" stroke="#8E8E93" strokeWidth="1.5" strokeDasharray="3 2"/></svg> },
  { type:"fc-multi-document", label:"Multi-Document", group:"Flowchart", icon:<svg width="24" height="18"><path d="M 5,1 L 23,1 L 23,11 C 18,15 10,7 5,12 Z" fill="rgba(48,209,88,0.1)" stroke="#30D158" strokeWidth="1" opacity="0.5"/><path d="M 3,3 L 21,3 L 21,13 C 16,17 8,9 3,14 Z" fill="rgba(48,209,88,0.15)" stroke="#30D158" strokeWidth="1.5"/></svg> },
  { type:"fc-offpage", label:"Off-page Ref", group:"Flowchart", icon:<svg width="24" height="14"><path d="M 1,1 L 17,1 L 23,7 L 17,13 L 1,13 Z" fill="rgba(191,90,242,0.15)" stroke="#BF5AF2" strokeWidth="1.5"/></svg> },
];

// ═══════════════════════════════════════════════════════
// BUILD FLOW DATA FROM MOCK
// ═══════════════════════════════════════════════════════
function buildFlowData(orientation: "horizontal" | "vertical") {
  const lanes = mockWorkflow.lanes;
  const phases = mockWorkflow.phases;
  const isH = orientation === "horizontal";

  // Phase positions
  const phaseXMap: Record<string, number> = {};
  phases.forEach((p, i) => {
    if (isH) phaseXMap[p.id] = LANE_HEADER_W + i * PHASE_W;
    else phaseXMap[p.id] = i * LANE_H; // in vertical mode, phases go down
  });

  // Lane positions
  const laneYMap: Record<string, number> = {};
  lanes.forEach((l, i) => {
    if (isH) laneYMap[l.id] = POOL_HEADER_H + i * LANE_H;
    else laneYMap[l.id] = POOL_HEADER_H + i * PHASE_W; // in vertical mode, lanes go across
  });

  // Track cell occupancy for stacking
  const cellCount: Record<string, number> = {};
  const cellIdx: Record<string, number> = {};
  mockWorkflow.nodes.forEach((n) => {
    const key = `${n.lane}-${n.phase}`;
    cellCount[key] = (cellCount[key] || 0) + 1;
  });

  const flowNodes: Node[] = [
    // Grid background node (rendered behind everything)
    {
      id: "__grid__",
      type: "swimlane-grid",
      position: { x: 0, y: 0 },
      data: { orientation },
      selectable: false,
      draggable: false,
      connectable: false,
      zIndex: -10,
    },
  ];
  
  // Map old gateway type to new type
  const typeMap: Record<string, string> = { gateway: "gateway-exclusive" };

  mockWorkflow.nodes.forEach((n) => {
    const key = `${n.lane}-${n.phase}`;
    const idx = cellIdx[key] || 0;
    cellIdx[key] = idx + 1;
    const total = cellCount[key];

    const phasePos = phaseXMap[n.phase] ?? 0;
    const lanePos = laneYMap[n.lane] ?? 0;

    let x: number, y: number;
    if (isH) {
      x = phasePos + PHASE_W / 2 - NODE_W / 2 + (total > 1 ? (idx - (total - 1) / 2) * (NODE_W + 10) : 0);
      y = lanePos + LANE_H / 2 - NODE_H / 2;
    } else {
      x = lanePos + PHASE_W / 2 - NODE_W / 2;
      y = phasePos + LANE_H / 2 - NODE_H / 2 + (total > 1 ? (idx - (total - 1) / 2) * (NODE_H + 10) : 0);
    }

    flowNodes.push({
      id: n.id,
      type: typeMap[n.type] || n.type,
      position: { x, y },
      data: { label: n.label, status: n.status, assignee: n.assignee, lane: n.lane, phase: n.phase },
    });
  });

  const flowEdges: Edge[] = mockWorkflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "sequence",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary,#888)", width: 14, height: 14 },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

// ═══════════════════════════════════════════════════════
// SWIMLANE GRID NODE (rendered as a ReactFlow node so it moves with pan/zoom)
// ═══════════════════════════════════════════════════════
function SwimlaneGridNode({ data }: { data: Record<string, unknown> }) {
  const orientation = (data.orientation as string) || "horizontal";
  const lanes = mockWorkflow.lanes;
  const phases = mockWorkflow.phases;
  const isH = orientation === "horizontal";
  const w = isH ? LANE_HEADER_W + phases.length * PHASE_W : POOL_HEADER_H + lanes.length * PHASE_W;
  const h = isH ? POOL_HEADER_H + lanes.length * LANE_H : phases.length * LANE_H + LANE_HEADER_W;
  return (
    <div style={{ width: w, height: h, pointerEvents: "none" }}>
      <SwimlaneGridSVG orientation={orientation as "horizontal" | "vertical"} />
    </div>
  );
}

function SwimlaneGridSVG({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const lanes = mockWorkflow.lanes;
  const phases = mockWorkflow.phases;
  const isH = orientation === "horizontal";

  const totalW = isH ? LANE_HEADER_W + phases.length * PHASE_W : POOL_HEADER_H + lanes.length * PHASE_W;
  const totalH = isH ? POOL_HEADER_H + lanes.length * LANE_H : phases.length * LANE_H + LANE_HEADER_W;

  if (isH) {
    return (
      <svg width={totalW} height={totalH} style={{position:"absolute",top:0,left:0,pointerEvents:"none",zIndex:0}}>
        {/* Pool border */}
        <rect x={0} y={0} width={totalW} height={totalH} fill="none" stroke="var(--glass-border,#ccc)" strokeWidth={1.5} rx={6}/>
        
        {/* Pool header (top bar with workflow name) */}
        <rect x={LANE_HEADER_W} y={0} width={totalW-LANE_HEADER_W} height={POOL_HEADER_H} fill="var(--glass-bg,rgba(255,255,255,0.3))" stroke="var(--glass-border,#ccc)" strokeWidth={1}/>
        
        {/* Phase headers in pool header */}
        {phases.map((phase, i) => {
          const x = LANE_HEADER_W + i * PHASE_W;
          return (
            <g key={phase.id}>
              <text x={x + PHASE_W / 2} y={POOL_HEADER_H / 2} textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={700} fill="var(--text-secondary,#666)"
                style={{ textTransform: "uppercase" } as React.CSSProperties} letterSpacing={1.5}>
                {phase.name}
              </text>
              {/* Phase vertical separator */}
              {i > 0 && <line x1={x} y1={POOL_HEADER_H} x2={x} y2={totalH} stroke="var(--glass-border,#ccc)" strokeWidth={1} strokeDasharray="6 4" opacity={0.5}/>}
            </g>
          );
        })}

        {/* Lane rows */}
        {lanes.map((lane, i) => {
          const y = POOL_HEADER_H + i * LANE_H;
          return (
            <g key={lane.id}>
              {/* Lane background */}
              <rect x={LANE_HEADER_W} y={y} width={totalW-LANE_HEADER_W} height={LANE_H} fill={LANE_COLORS[i % LANE_COLORS.length]}/>
              {/* Lane header */}
              <rect x={0} y={y} width={LANE_HEADER_W} height={LANE_H} fill="var(--glass-bg,rgba(255,255,255,0.4))" stroke="var(--glass-border,#ccc)" strokeWidth={1}/>
              {/* Lane name (rotated) */}
              <text x={LANE_HEADER_W/2} y={y + LANE_H/2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={12} fontWeight={700} fill="var(--text-primary,#333)"
                transform={`rotate(-90,${LANE_HEADER_W/2},${y + LANE_H/2})`}>
                {lane.name}
              </text>
              {/* Role subtitle */}
              {lane.role && (
                <text x={LANE_HEADER_W/2} y={y + LANE_H/2 + 30}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontWeight={500} fill="var(--text-tertiary,#999)"
                  transform={`rotate(-90,${LANE_HEADER_W/2},${y + LANE_H/2 + 30})`}>
                  {lane.role}
                </text>
              )}
              {/* Lane horizontal separator */}
              {i > 0 && <line x1={0} y1={y} x2={totalW} y2={y} stroke="var(--glass-border,#ccc)" strokeWidth={1}/>}
            </g>
          );
        })}

        {/* Corner cell (top-left) */}
        <rect x={0} y={0} width={LANE_HEADER_W} height={POOL_HEADER_H} fill="var(--glass-bg,rgba(255,255,255,0.5))" stroke="var(--glass-border,#ccc)" strokeWidth={1} rx={6}/>
        <text x={LANE_HEADER_W/2} y={POOL_HEADER_H/2} textAnchor="middle" dominantBaseline="central"
          fontSize={9} fontWeight={700} fill="var(--text-tertiary,#999)" letterSpacing={1}
          style={{ textTransform: "uppercase" } as React.CSSProperties}>
          ROLES
        </text>
      </svg>
    );
  }

  // Vertical orientation
  return (
    <svg width={totalW} height={totalH} style={{position:"absolute",top:0,left:0,pointerEvents:"none",zIndex:0}}>
      <rect x={0} y={0} width={totalW} height={totalH} fill="none" stroke="var(--glass-border,#ccc)" strokeWidth={1.5} rx={6}/>
      
      {/* Lane column headers */}
      {lanes.map((lane, i) => {
        const x = POOL_HEADER_H + i * PHASE_W;
        return (
          <g key={lane.id}>
            <rect x={x} y={0} width={PHASE_W} height={LANE_HEADER_W} fill="var(--glass-bg,rgba(255,255,255,0.4))" stroke="var(--glass-border,#ccc)" strokeWidth={1}/>
            <text x={x + PHASE_W/2} y={LANE_HEADER_W/2} textAnchor="middle" dominantBaseline="central"
              fontSize={12} fontWeight={700} fill="var(--text-primary,#333)">
              {lane.name}
            </text>
            <rect x={x} y={LANE_HEADER_W} width={PHASE_W} height={totalH-LANE_HEADER_W} fill={LANE_COLORS[i % LANE_COLORS.length]}/>
            {i > 0 && <line x1={x} y1={LANE_HEADER_W} x2={x} y2={totalH} stroke="var(--glass-border,#ccc)" strokeWidth={1}/>}
          </g>
        );
      })}

      {/* Phase row headers */}
      {phases.map((phase, i) => {
        const y = i * LANE_H + LANE_HEADER_W;
        return (
          <g key={phase.id}>
            <rect x={0} y={y} width={POOL_HEADER_H} height={LANE_H} fill="var(--glass-bg,rgba(255,255,255,0.3))" stroke="var(--glass-border,#ccc)" strokeWidth={1}/>
            <text x={POOL_HEADER_H/2} y={y + LANE_H/2} textAnchor="middle" dominantBaseline="central"
              fontSize={10} fontWeight={600} fill="var(--text-secondary,#666)"
              transform={`rotate(-90,${POOL_HEADER_H/2},${y + LANE_H/2})`}
              style={{ textTransform: "uppercase" } as React.CSSProperties} letterSpacing={1}>
              {phase.name}
            </text>
            {i > 0 && <line x1={POOL_HEADER_H} y1={y} x2={totalW} y2={y} stroke="var(--glass-border,#ccc)" strokeWidth={1} strokeDasharray="6 4" opacity={0.5}/>}
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// NODE EDIT PANEL
// ═══════════════════════════════════════════════════════
function NodeEditPanel({ node, onUpdate, onDelete, onClose, lanes }: {
  node: Node;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  lanes: { id: string; name: string }[];
}) {
  const d = node.data as Record<string, unknown>;
  const [label, setLabel] = useState((d.label as string) || "");
  const [assignee, setAssignee] = useState((d.assignee as string) || "");
  const [lane, setLane] = useState((d.lane as string) || "");
  const [status, setStatus] = useState((d.status as string) || "pending");

  const save = () => {
    onUpdate(node.id, { ...d, label, assignee, lane, status });
    onClose();
  };

  return (
    <div className="glass" style={{borderRadius:12,padding:16,width:260,fontSize:13}}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider" style={{color:"var(--text-tertiary)"}}>Edit Node</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--surface-sunken)]"><X size={14} style={{color:"var(--text-tertiary)"}}/></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{color:"var(--text-tertiary)"}}>Label</label>
          <input value={label} onChange={e=>setLabel(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none"
            style={{color:"var(--text-primary)"}}/>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{color:"var(--text-tertiary)"}}>
            <UserPlus size={10} className="inline mr-1"/>Assignee
          </label>
          <input value={assignee} onChange={e=>setAssignee(e.target.value)} placeholder="Person or agent name"
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none"
            style={{color:"var(--text-primary)"}}/>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{color:"var(--text-tertiary)"}}>Lane</label>
          <select value={lane} onChange={e=>setLane(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:outline-none"
            style={{color:"var(--text-primary)"}}>
            <option value="">None</option>
            {lanes.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{color:"var(--text-tertiary)"}}>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:outline-none"
            style={{color:"var(--text-primary)"}}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={save} className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-primary)] text-white">Save</button>
          <button onClick={()=>onDelete(node.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-danger,#FF453A)] text-white"><Trash2 size={12}/></button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN BUILDER PAGE
// ═══════════════════════════════════════════════════════
export default function BuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const { nodes: initNodes, edges: initEdges } = useMemo(() => buildFlowData(orientation), [orientation]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [connecting, setConnecting] = useState(false);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, type: "sequence", markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-tertiary,#888)", width: 14, height: 14 } }, eds)
      ),
    [setEdges]
  );

  const onSelectionChange = useCallback(({ nodes: sel }: OnSelectionChangeParams) => {
    if (sel.length === 1) setSelectedNode(sel[0]);
    else setSelectedNode(null);
  }, []);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

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
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const newNode: Node = {
        id: `n-${Date.now()}`,
        type,
        position: { x: x - 60, y: y - 30 },
        data: { label: `New ${paletteItems.find(p=>p.type===type)?.label || type}`, status: "pending", assignee: "", lane: "", phase: "" },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const updateNodeData = (nodeId: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data } : n));
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const toggleOrientation = () => {
    const next = orientation === "horizontal" ? "vertical" : "horizontal";
    setOrientation(next);
  };

  const groups = [...new Set(paletteItems.map((p) => p.group))];

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--surface-base)" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 glass m-2 mb-0" style={{ borderRadius: 12 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/workflows/${id}`)}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{mockWorkflow.name}</p>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{project.name} — BPMN Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleOrientation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--surface-sunken)]"
            style={{ color: "var(--text-secondary)" }}
            title={`Switch to ${orientation === "horizontal" ? "vertical" : "horizontal"} layout`}>
            <RotateCw size={14} />
            <span className="hidden sm:inline">{orientation === "horizontal" ? "Vertical" : "Horizontal"}</span>
          </button>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{
            background: STATUS_BG[mockWorkflow.status] || STATUS_BG.active,
            color: STATUS_COLOR[mockWorkflow.status] || STATUS_COLOR.active,
          }}>{mockWorkflow.status}</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-primary)] text-white">
            <Save size={14}/> Save
          </button>
        </div>
      </div>

      {/* Hint bar */}
      <div className="mx-2 mt-1 px-4 py-1.5 text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
        Drag shapes from the palette. Drag between handles to connect. Double-click a node to edit. Drag nodes to reposition.
      </div>

      {/* Canvas */}
      <div className="flex-1 relative mx-2 mb-2" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: "sequence" }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ borderRadius: 12 }}
          proOptions={{ hideAttribution: true }}
          snapToGrid
          snapGrid={[10, 10]}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background gap={20} size={1} color="var(--glass-border,#e5e5e5)" />

          <Controls style={{ background: "var(--glass-bg)", borderRadius: 8, border: "1px solid var(--glass-border)" }} />
          <MiniMap
            nodeStrokeColor={() => "#8E8E93"}
            nodeColor={() => "rgba(142,142,147,0.1)"}
            maskColor="rgba(0,0,0,0.06)"
            style={{ background: "var(--glass-bg)", borderRadius: 8, border: "1px solid var(--glass-border)" }}
          />

          {/* Palette */}
          <Panel position="top-left" style={{ marginLeft: 8, marginTop: 8 }}>
            <div className="glass" style={{ borderRadius: 10, padding: paletteOpen ? 10 : 6, minWidth: paletteOpen ? 170 : 36, transition: "all 0.15s ease" }}>
              <div className="flex items-center justify-between cursor-pointer" style={{ padding: "2px 4px", marginBottom: paletteOpen ? 4 : 0 }}
                onClick={() => setPaletteOpen(!paletteOpen)}>
                {paletteOpen && <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Shapes</span>}
                <Plus size={12} style={{ color: "var(--text-tertiary)", transform: paletteOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
              </div>
              {paletteOpen && groups.map((group) => (
                <div key={group} style={{ marginBottom: 4 }}>
                  <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--text-tertiary)", padding: "3px 4px 1px", opacity: 0.5 }}>{group}</div>
                  {paletteItems.filter((item) => item.group === group).map((item) => (
                    <div key={item.type} draggable onDragStart={(e) => onDragStart(e, item.type)}
                      className="flex items-center gap-2 px-2 py-1 rounded-md cursor-grab active:cursor-grabbing hover:bg-[var(--surface-sunken)] transition-colors"
                      title={item.label}>
                      <div style={{ width: 24, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                      <span className="text-[10px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Panel>

          {/* Node Edit Panel */}
          {selectedNode && (
            <Panel position="top-right" style={{ marginRight: 8, marginTop: 8 }}>
              <NodeEditPanel
                node={selectedNode}
                onUpdate={updateNodeData}
                onDelete={deleteNode}
                onClose={() => setSelectedNode(null)}
                lanes={mockWorkflow.lanes}
              />
            </Panel>
          )}

          {/* Legend */}
          <Panel position="bottom-left">
            <div className="glass p-2 flex flex-wrap gap-3" style={{ borderRadius: 8, fontSize: 10 }}>
              {Object.entries(STATUS_COLOR).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="capitalize font-medium" style={{ color: "var(--text-secondary)" }}>{s}</span>
                </div>
              ))}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
