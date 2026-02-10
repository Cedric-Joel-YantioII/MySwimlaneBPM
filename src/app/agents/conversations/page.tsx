"use client";

import { useState } from "react";
import { MessageSquare, Bot, Clock, ChevronDown } from "lucide-react";

/* ── Accent colors per agent ── */
const AGENT_COLORS: Record<string, { bg: string; text: string }> = {
  researcher: { bg: "rgba(37,99,235,0.15)", text: "#2563EB" },
  frontend: { bg: "rgba(5,150,105,0.15)", text: "#059669" },
  backend: { bg: "rgba(217,119,6,0.15)", text: "#D97706" },
  monitoring: { bg: "rgba(124,58,237,0.15)", text: "#7C3AED" },
};

interface Agent {
  id: string;
  name: string;
  initials: string;
  colorKey: string;
}

interface Message {
  id: string;
  agentId: string | null; // null = system message
  content: string;
  timestamp: string;
}

interface Thread {
  id: string;
  topic: string;
  agents: Agent[];
  messages: Message[];
  updatedAt: string;
}

const agents: Record<string, Agent> = {
  researcher: { id: "researcher", name: "The Researcher", initials: "TR", colorKey: "researcher" },
  frontend: { id: "frontend", name: "The Frontend Expert", initials: "FE", colorKey: "frontend" },
  backend: { id: "backend", name: "The Backend Expert", initials: "BE", colorKey: "backend" },
  monitoring: { id: "monitoring", name: "The Monitoring Expert", initials: "ME", colorKey: "monitoring" },
};

const THREADS: Thread[] = [
  {
    id: "t1",
    topic: "Document Review - Q3 Evaluation Report",
    agents: [agents.researcher, agents.frontend],
    updatedAt: "2026-02-10T11:45:00Z",
    messages: [
      { id: "m1", agentId: null, content: "Workflow started: Document Review Pipeline", timestamp: "2026-02-10T09:00:00Z" },
      { id: "m2", agentId: "researcher", content: "I've completed the initial literature scan for the Q3 Evaluation Report. Found 14 relevant source documents from the AfDB project repository. Key themes: infrastructure investment outcomes, gender mainstreaming compliance, and climate resilience indicators.", timestamp: "2026-02-10T09:12:00Z" },
      { id: "m3", agentId: "frontend", content: "Thanks. I'll start structuring the review dashboard layout. Should I prioritize the gender mainstreaming section? The board requested that as a highlight for the upcoming session.", timestamp: "2026-02-10T09:18:00Z" },
      { id: "m4", agentId: "researcher", content: "Yes, prioritize it. I've flagged 3 documents with significant gender-disaggregated data. I'm also cross-referencing the Results Measurement Framework indicators — some baseline figures look inconsistent with the mid-term report.", timestamp: "2026-02-10T09:30:00Z" },
      { id: "m5", agentId: null, content: "Task assigned: Verify baseline data consistency", timestamp: "2026-02-10T09:31:00Z" },
      { id: "m6", agentId: "frontend", content: "Good catch. I'll add a data discrepancy panel to the review view so the Task Manager can see flagged inconsistencies at a glance. Rendering the comparison table now.", timestamp: "2026-02-10T09:45:00Z" },
      { id: "m7", agentId: "researcher", content: "Confirmed: 2 of the 3 baseline figures were updated in an addendum that wasn't linked to the main report. I've reconciled them. The corrected dataset is ready for visualization.", timestamp: "2026-02-10T11:45:00Z" },
    ],
  },
  {
    id: "t2",
    topic: "Data Analysis - Project Impact Metrics",
    agents: [agents.backend, agents.monitoring],
    updatedAt: "2026-02-10T10:30:00Z",
    messages: [
      { id: "m10", agentId: null, content: "Workflow started: Impact Analysis Pipeline", timestamp: "2026-02-10T08:00:00Z" },
      { id: "m11", agentId: "backend", content: "I've ingested the project impact dataset — 2,340 records across 12 country programs. Running aggregation queries for the composite impact score now.", timestamp: "2026-02-10T08:15:00Z" },
      { id: "m12", agentId: "monitoring", content: "Before you aggregate, can you apply the updated weighting matrix? The Evaluation Office revised the weights for environmental sustainability indicators last week.", timestamp: "2026-02-10T08:22:00Z" },
      { id: "m13", agentId: "backend", content: "Good call. I've pulled the revised matrix from the config store. Rerunning with updated weights. ETA: 3 minutes.", timestamp: "2026-02-10T08:25:00Z" },
      { id: "m14", agentId: null, content: "Task completed: Data aggregation with revised weights", timestamp: "2026-02-10T08:28:00Z" },
      { id: "m15", agentId: "monitoring", content: "Results look solid. The composite scores for West Africa cluster are notably higher this quarter — up 12%. I'll generate the trend comparison charts and flag any outlier programs for manual review.", timestamp: "2026-02-10T09:00:00Z" },
      { id: "m16", agentId: "backend", content: "I've also detected a data quality issue: 47 records from the Sahel program are missing beneficiary counts. Marking them for the Task Manager's attention.", timestamp: "2026-02-10T10:30:00Z" },
    ],
  },
  {
    id: "t3",
    topic: "Compliance Check - ESG Framework Alignment",
    agents: [agents.researcher, agents.monitoring],
    updatedAt: "2026-02-10T11:00:00Z",
    messages: [
      { id: "m20", agentId: null, content: "Workflow started: ESG Compliance Verification", timestamp: "2026-02-10T10:00:00Z" },
      { id: "m21", agentId: "researcher", content: "Starting the ESG framework alignment check against the 2025 AfDB Sustainability Policy. I'll compare each project's self-assessment against the mandatory disclosure requirements.", timestamp: "2026-02-10T10:10:00Z" },
      { id: "m22", agentId: "monitoring", content: "I have real-time monitoring data for 8 of the 15 projects in scope. Sharing the environmental KPI snapshots now — these should help validate the self-assessments.", timestamp: "2026-02-10T10:20:00Z" },
      { id: "m23", agentId: "researcher", content: "Received. Cross-referencing now. Initial finding: 3 projects have material gaps between reported and monitored emissions data. Documenting for escalation.", timestamp: "2026-02-10T11:00:00Z" },
    ],
  },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ agent }: { agent: Agent }) {
  const c = AGENT_COLORS[agent.colorKey];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {agent.initials}
    </div>
  );
}

export default function AgentConversationsPage() {
  const [activeThreadId, setActiveThreadId] = useState(THREADS[0].id);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const activeThread = THREADS.find((t) => t.id === activeThreadId)!;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(37,99,235,0.12)" }}>
          <MessageSquare size={18} style={{ color: "#2563EB" }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Agent Conversations</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Observe AI agent collaboration in real-time</p>
        </div>
      </div>

      {/* Mobile thread selector */}
      <div className="md:hidden mb-3 flex-shrink-0">
        <button
          onClick={() => setMobileThreadOpen(!mobileThreadOpen)}
          className="glass w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="truncate">{activeThread.topic}</span>
          <ChevronDown size={16} className={`transition-transform ${mobileThreadOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileThreadOpen && (
          <div className="glass mt-1 rounded-xl overflow-hidden">
            {THREADS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveThreadId(t.id); setMobileThreadOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm transition-colors"
                style={{
                  color: "var(--text-primary)",
                  backgroundColor: t.id === activeThreadId ? "var(--surface-sunken)" : "transparent",
                }}
              >
                {t.topic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main panels */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Thread list — desktop */}
        <div className="hidden md:flex md:w-1/3 flex-col glass rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Threads</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {THREADS.map((t) => {
              const active = t.id === activeThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className="w-full text-left px-4 py-3 transition-colors border-b"
                  style={{
                    borderColor: "var(--glass-border)",
                    backgroundColor: active ? "var(--surface-sunken)" : "transparent",
                  }}
                >
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{t.topic}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex -space-x-1.5">
                      {t.agents.map((a) => (
                        <div
                          key={a.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                          style={{
                            backgroundColor: AGENT_COLORS[a.colorKey].bg,
                            color: AGENT_COLORS[a.colorKey].text,
                            borderColor: "var(--glass-bg)",
                          }}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                      <MessageSquare size={10} /> {t.messages.length}
                    </span>
                    <span className="text-[11px] flex items-center gap-1 ml-auto" style={{ color: "var(--text-tertiary)" }}>
                      <Clock size={10} /> {formatDate(t.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message feed */}
        <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden min-w-0">
          {/* Thread header */}
          <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--glass-border)" }}>
            <Bot size={16} style={{ color: "var(--text-tertiary)" }} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{activeThread.topic}</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {activeThread.agents.map((a) => a.name).join(" · ")} — read-only
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {activeThread.messages.map((msg) => {
              if (msg.agentId === null) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span
                      className="text-[11px] px-3 py-1 rounded-full"
                      style={{ backgroundColor: "var(--surface-sunken)", color: "var(--text-tertiary)" }}
                    >
                      {msg.content} · {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              }
              const agent = agents[msg.agentId];
              const c = AGENT_COLORS[agent.colorKey];
              return (
                <div key={msg.id} className="flex gap-2.5 items-start">
                  <Avatar agent={agent} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold" style={{ color: c.text }}>{agent.name}</span>
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "var(--text-primary)" }}>{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
