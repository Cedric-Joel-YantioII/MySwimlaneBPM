"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  ClipboardCheck,
  ListTodo,
  Bot,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Play,
  AlertCircle,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassProgress } from "@/components/ui/glass-progress";
import {
  mockStats,
  mockTasks,
  mockDocuments,
  mockActivities,
  mockProjects,
} from "@/lib/mock-data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const priorityVariant = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
} as const;

const statusVariant = {
  "todo": "gray",
  "in-progress": "blue",
  "review": "purple",
  "done": "green",
  "blocked": "red",
} as const;

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const activityIcons: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle2 size={16} style={{ color: "var(--accent-secondary)" }} />,
  document_submitted: <FileText size={16} style={{ color: "var(--accent-primary)" }} />,
  document_approved: <CheckCircle2 size={16} style={{ color: "var(--accent-secondary)" }} />,
  document_rejected: <XCircle size={16} style={{ color: "var(--accent-danger)" }} />,
  agent_output: <Bot size={16} style={{ color: "var(--accent-purple)" }} />,
  workflow_started: <Play size={16} style={{ color: "var(--accent-primary)" }} />,
  comment: <MessageSquare size={16} style={{ color: "var(--accent-warning)" }} />,
};

const kpis = [
  { label: "Active Projects", value: mockStats.activeProjects, icon: FolderOpen, color: "var(--accent-primary)" },
  { label: "Pending Reviews", value: mockStats.pendingReviews, icon: ClipboardCheck, color: "var(--accent-warning)" },
  { label: "Active Tasks", value: mockStats.activeTasks, icon: ListTodo, color: "var(--accent-secondary)" },
  { label: "Active Agents", value: mockStats.activeAgents, icon: Bot, color: "var(--accent-purple)" },
];

export default function DashboardPage() {
  const myTasks = mockTasks.filter((t) => t.assignee === "You");
  const [reviewDocs, setReviewDocs] = useState(
    mockDocuments.filter((d) => d.status === "submitted" || d.status === "under-review")
  );
  const [actioned, setActioned] = useState<Record<string, "approved" | "rejected">>({});
  const activeProjects = mockProjects.filter(
    (p) => p.status === "active" || p.status === "planning" || p.status === "review"
  );

  const handleReview = (docId: string, action: "approved" | "rejected") => {
    setActioned((prev) => ({ ...prev, [docId]: action }));
    setTimeout(() => {
      setReviewDocs((prev) => prev.filter((d) => d.id !== docId));
    }, 600);
  };

  const pendingDocs = reviewDocs;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Your command center. Track projects, review documents, and monitor your team at a glance.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}15` }}
                >
                  <kpi.icon size={20} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {kpi.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {kpi.label}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                My Tasks
              </h2>
              <GlassBadge variant="blue">{myTasks.length}</GlassBadge>
            </div>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <GlassBadge variant={priorityVariant[task.priority]} dot>
                        {task.priority}
                      </GlassBadge>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <Clock size={12} /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <GlassBadge variant={statusVariant[task.status]}>{task.status}</GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Pending Reviews */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                Pending Reviews
              </h2>
              <GlassBadge variant="orange">{pendingDocs.length}</GlassBadge>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
              {pendingDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  exit={{ opacity: 0, x: 80, transition: { duration: 0.3 } }}
                  className="p-3 rounded-xl"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={14} style={{ color: "var(--accent-primary)" }} />
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {doc.name}
                        </p>
                      </div>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Submitted by {doc.submittedBy} • v{doc.version}
                      </p>
                    </div>
                    {actioned[doc.id] ? (
                      <GlassBadge variant={actioned[doc.id] === "approved" ? "green" : "red"} dot>
                        {actioned[doc.id]}
                      </GlassBadge>
                    ) : (
                      <GlassBadge
                        variant={doc.status === "under-review" ? "purple" : "orange"}
                      >
                        {doc.status}
                      </GlassBadge>
                    )}
                  </div>
                  {!actioned[doc.id] && (
                    <div className="flex gap-2 mt-3">
                      <GlassButton size="sm" variant="primary" onClick={() => handleReview(doc.id, "approved")}>
                        <CheckCircle2 size={14} /> Approve
                      </GlassButton>
                      <GlassButton size="sm" variant="danger" onClick={() => handleReview(doc.id, "rejected")}>
                        <XCircle size={14} /> Reject
                      </GlassButton>
                    </div>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard>
            <h2
              className="font-semibold text-lg mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Activity
            </h2>
            <div className="space-y-3">
              {mockActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--surface-sunken)" }}
                  >
                    {activityIcons[act.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {act.message}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {act.actor} • {relativeTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Active Projects */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                Active Projects
              </h2>
              <GlassButton size="sm" variant="ghost">
                View All <ChevronRight size={14} />
              </GlassButton>
            </div>
            <div className="space-y-3">
              {activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 rounded-xl"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {proj.name}
                    </p>
                    <GlassBadge
                      variant={
                        proj.status === "active"
                          ? "green"
                          : proj.status === "review"
                          ? "purple"
                          : "gray"
                      }
                      dot
                    >
                      {proj.phase}
                    </GlassBadge>
                  </div>
                  <GlassProgress value={proj.progress} />
                  <div
                    className="flex items-center justify-between mt-2 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <span>{proj.progress}% complete</span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {proj.teamSize}
                    </span>
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
