"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Workflow,
  Users,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassProgress } from "@/components/ui/glass-progress";
import { mockProjects, mockWorkflow, mockTasks } from "@/lib/mock-data";

const statusVariant = {
  planning: "gray",
  active: "green",
  review: "purple",
  completed: "blue",
  archived: "gray",
} as const;

const taskStatusVariant = {
  "todo": "gray",
  "in-progress": "blue",
  "review": "purple",
  "done": "green",
  "blocked": "red",
} as const;

const laneColorMap: Record<string, string> = {
  "var(--lane-blue)": "blue",
  "var(--lane-green)": "green",
  "var(--lane-orange)": "orange",
  "var(--lane-purple)": "purple",
};

export default function WorkflowDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
  const workflow = mockWorkflow; // Use single mock workflow for all
  const linkedTasks = mockTasks.filter((t) => t.workflowId === workflow.id);

  const nodesByStatus = {
    completed: workflow.nodes.filter((n) => n.status === "completed").length,
    active: workflow.nodes.filter((n) => n.status === "active").length,
    pending: workflow.nodes.filter((n) => n.status === "pending").length,
    blocked: workflow.nodes.filter((n) => n.status === "blocked").length,
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push("/workflows")}
          className="flex items-center gap-1 text-sm mb-4 transition-colors"
          style={{ color: "var(--accent-primary)" }}
        >
          <ArrowLeft size={16} /> Back to Workflows
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {project.name}
              </h1>
              <GlassBadge variant={statusVariant[project.status]} dot>
                {project.status}
              </GlassBadge>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {project.description}
            </p>
          </div>
          <GlassButton
            variant="primary"
            onClick={() => router.push(`/workflows/${id}/builder`)}
          >
            <Workflow size={16} /> Open Builder
          </GlassButton>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Nodes", value: workflow.nodes.length, icon: Workflow, color: "var(--accent-primary)" },
          { label: "Completed", value: nodesByStatus.completed, icon: CheckCircle2, color: "var(--accent-secondary)" },
          { label: "Active", value: nodesByStatus.active, icon: Play, color: "var(--accent-primary)" },
          { label: "Team Size", value: project.teamSize, icon: Users, color: "var(--accent-purple)" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lanes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              Swimlanes
            </h2>
            <div className="space-y-3">
              {workflow.lanes.map((lane) => {
                const laneNodes = workflow.nodes.filter((n) => n.lane === lane.id);
                const completed = laneNodes.filter((n) => n.status === "completed").length;
                const variant = laneColorMap[lane.color] ?? "blue";
                return (
                  <div
                    key={lane.id}
                    className="p-3 rounded-xl"
                    style={{ background: lane.color }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {lane.name}
                      </p>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {lane.role}
                      </span>
                    </div>
                    <GlassProgress
                      value={laneNodes.length ? (completed / laneNodes.length) * 100 : 0}
                      variant={variant as "blue" | "green" | "orange" | "red"}
                      size="sm"
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      {completed}/{laneNodes.length} nodes completed
                    </p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Phase Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              Phase Progress
            </h2>
            <div className="space-y-3">
              {workflow.phases.map((phase) => {
                const phaseNodes = workflow.nodes.filter((n) => n.phase === phase.id);
                const completed = phaseNodes.filter((n) => n.status === "completed").length;
                const hasActive = phaseNodes.some((n) => n.status === "active");
                return (
                  <div key={phase.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {phase.name}
                        </p>
                        {hasActive && (
                          <GlassBadge variant="blue" dot>active</GlassBadge>
                        )}
                        {!hasActive && completed === phaseNodes.length && phaseNodes.length > 0 && (
                          <GlassBadge variant="green" dot>done</GlassBadge>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {completed}/{phaseNodes.length}
                      </span>
                    </div>
                    <GlassProgress
                      value={phaseNodes.length ? (completed / phaseNodes.length) * 100 : 0}
                      variant={hasActive ? "blue" : "green"}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Linked Tasks */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                Linked Tasks
              </h2>
              <GlassBadge variant="blue">{linkedTasks.length}</GlassBadge>
            </div>
            <div className="space-y-2">
              {linkedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {task.assignee}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        •
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                        <Clock size={11} /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <GlassBadge variant={taskStatusVariant[task.status]}>{task.status}</GlassBadge>
                    <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
