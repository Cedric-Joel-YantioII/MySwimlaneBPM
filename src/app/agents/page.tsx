"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Pause, Play, Trash2, Clock, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { mockAgents, Agent } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";

const statusConfig: Record<Agent["status"], { variant: "green" | "orange" | "gray" | "red"; icon: typeof Zap }> = {
  active: { variant: "green", icon: Zap },
  paused: { variant: "orange", icon: Pause },
  idle: { variant: "gray", icon: Clock },
  error: { variant: "red", icon: AlertCircle },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  const togglePause = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "paused" ? "active" : "paused" }
          : a
      )
    );
  };

  const deleteAgent = (id: string, name: string) => {
    if (!confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            AI Agents
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Your AI workforce. Create, manage, and monitor intelligent agents.
          </p>
        </div>
        <Link href="/agents/new">
          <GlassButton variant="primary">
            <Plus size={16} />
            Create Agent
          </GlassButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {agents.map((agent, i) => {
            const sc = statusConfig[agent.status];
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--lane-purple)" }}
                      >
                        <Bot size={20} style={{ color: "var(--accent-purple)" }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {agent.name}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {agent.role}
                        </p>
                      </div>
                    </div>
                    <GlassBadge variant={sc.variant} dot>
                      {agent.status}
                    </GlassBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg p-2" style={{ background: "var(--surface-sunken)" }}>
                      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {agent.tasksCompleted}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Completed
                      </p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: "var(--surface-sunken)" }}>
                      <p className="text-lg font-semibold" style={{ color: "var(--accent-primary)" }}>
                        {agent.tasksActive}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Active
                      </p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: "var(--surface-sunken)" }}>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {agent.model.split(" ").slice(-1)[0]}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Model
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                      <Clock size={12} />
                      {timeAgo(agent.lastActive)}
                    </span>
                    <div className="flex gap-1">
                      <GlassButton size="sm" variant="ghost" onClick={() => togglePause(agent.id)}>
                        {agent.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
                      </GlassButton>
                      <GlassButton size="sm" variant="ghost" onClick={() => deleteAgent(agent.id, agent.name)}>
                        <Trash2 size={14} style={{ color: "var(--accent-danger)" }} />
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
