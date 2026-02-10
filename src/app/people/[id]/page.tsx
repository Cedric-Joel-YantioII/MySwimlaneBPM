"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Briefcase, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { mockPeople, mockTasks, mockActivities } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";

const statusColor: Record<string, string> = {
  available: "var(--accent-secondary)",
  busy: "var(--accent-warning)",
  away: "var(--text-tertiary)",
};

const statusBadge: Record<string, "green" | "orange" | "gray"> = {
  available: "green",
  busy: "orange",
  away: "gray",
};

const taskStatusColors: Record<string, string> = {
  todo: "#8E8E93",
  "in-progress": "#0A84FF",
  review: "#BF5AF2",
  done: "#30D158",
  blocked: "#FF453A",
};

const activityIcons: Record<string, typeof CheckCircle2> = {
  task_completed: CheckCircle2,
  document_submitted: Circle,
  document_approved: CheckCircle2,
  document_rejected: AlertCircle,
  agent_output: Circle,
  workflow_started: Circle,
  comment: Circle,
};

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const person = mockPeople.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p style={{ color: "var(--text-secondary)" }}>Person not found</p>
        <Link href="/people"><GlassButton>Back to People</GlassButton></Link>
      </div>
    );
  }

  const personTasks = mockTasks.filter((t) => t.assignee === person.name);
  const personActivities = mockActivities.filter((a) => a.actor === person.name).slice(0, 5);

  const workloadData = Object.entries(
    personTasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  // If no tasks, show placeholder data
  const chartData = workloadData.length > 0 ? workloadData : [
    { status: "todo", count: person.activeTasks },
    { status: "done", count: person.completedTasks },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/people">
        <GlassButton variant="ghost" size="sm">
          <ArrowLeft size={16} /> Back
        </GlassButton>
      </Link>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{
                  background: person.type === "staff" ? "var(--lane-blue)" : "var(--lane-orange)",
                  color: person.type === "staff" ? "var(--accent-primary)" : "var(--accent-warning)",
                }}
              >
                {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                style={{ background: statusColor[person.status], borderColor: "var(--glass-bg)" }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{person.name}</h1>
                <GlassBadge variant={person.type === "staff" ? "blue" : "orange"}>{person.type}</GlassBadge>
                <GlassBadge variant={statusBadge[person.status]} dot>{person.status}</GlassBadge>
              </div>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{person.role}</p>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span className="flex items-center gap-1"><Briefcase size={12} />{person.department}</span>
                <span className="flex items-center gap-1"><Mail size={12} />{person.email}</span>
              </div>
            </div>
            <div className="flex gap-3 text-center">
              <div className="rounded-xl p-3" style={{ background: "var(--surface-sunken)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--accent-primary)" }}>{person.activeTasks}</p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Active</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "var(--surface-sunken)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--accent-secondary)" }}>{person.completedTasks}</p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Done</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Workload by Status
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--radius-md)",
                      backdropFilter: "blur(20px)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.status} fill={taskStatusColors[entry.status] || "#8E8E93"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Assigned Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Assigned Tasks
            </h2>
            {personTasks.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No tasks found in mock data</p>
            ) : (
              <div className="space-y-2">
                {personTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg p-2.5"
                    style={{ background: "var(--surface-sunken)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {task.title}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Due {task.dueDate}
                      </p>
                    </div>
                    <GlassBadge
                      variant={
                        task.status === "done" ? "green" :
                        task.status === "in-progress" ? "blue" :
                        task.status === "blocked" ? "red" :
                        task.status === "review" ? "purple" : "gray"
                      }
                    >
                      {task.status}
                    </GlassBadge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Activity
          </h2>
          {personActivities.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No recent activity</p>
          ) : (
            <div className="space-y-3">
              {personActivities.map((act) => {
                const Icon = activityIcons[act.type] || Circle;
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon size={14} style={{ color: "var(--text-tertiary)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: "var(--text-primary)" }}>{act.message}</p>
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        <Clock size={10} />
                        {new Date(act.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
