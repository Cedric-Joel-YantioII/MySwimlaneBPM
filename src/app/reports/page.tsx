"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid,
} from "recharts";
import { mockProjects, mockTasks, mockDocuments, mockPeople } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";

const COLORS = {
  primary: "#0A84FF",
  secondary: "#30D158",
  warning: "#FF9F0A",
  danger: "#FF453A",
  purple: "#BF5AF2",
  gray: "#8E8E93",
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--radius-md)",
    backdropFilter: "blur(20px)",
    fontSize: 12,
  },
};

// Project progress
const projectData = mockProjects.map((p) => ({
  name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
  progress: p.progress,
}));

// Tasks by status
const taskStatusCounts = mockTasks.reduce<Record<string, number>>((a, t) => {
  a[t.status] = (a[t.status] || 0) + 1;
  return a;
}, {});
const pieData = Object.entries(taskStatusCounts).map(([name, value]) => ({ name, value }));
const pieColors: Record<string, string> = {
  todo: COLORS.gray,
  "in-progress": COLORS.primary,
  review: COLORS.purple,
  done: COLORS.secondary,
  blocked: COLORS.danger,
};

// Tasks over time (mock 4 weeks)
const weeklyData = [
  { week: "Jan 20", completed: 3 },
  { week: "Jan 27", completed: 5 },
  { week: "Feb 3", completed: 7 },
  { week: "Feb 10", completed: 4 },
];

// Team workload
const workloadData = mockPeople.map((p) => ({
  name: p.name === "You" ? "You" : p.name.split(" ")[0],
  tasks: p.activeTasks,
}));

// Document metrics
const docStatuses = mockDocuments.reduce<Record<string, number>>((a, d) => {
  const key = d.status === "approved" ? "Approved" : d.status === "rejected" ? "Rejected" : "Pending";
  a[key] = (a[key] || 0) + 1;
  return a;
}, {});
const docData = Object.entries(docStatuses).map(([name, value]) => ({ name, value }));
const docColors: Record<string, string> = { Approved: COLORS.secondary, Rejected: COLORS.danger, Pending: COLORS.warning };

function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <div className="h-56">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Analytics and insights across all projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <ChartCard title="Project Progress" delay={0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
              <Bar dataKey="progress" radius={[0, 6, 6, 0]} fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tasks by Status */}
        <ChartCard title="Tasks by Status" delay={0.05}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={pieColors[entry.name] || COLORS.gray} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center -mt-4">
            {pieData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: pieColors[entry.name] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Completed Over Time */}
        <ChartCard title="Tasks Completed (Last 4 Weeks)" delay={0.1}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="completed" stroke={COLORS.primary} strokeWidth={2.5} dot={{ fill: COLORS.primary, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Team Workload */}
        <ChartCard title="Team Workload" delay={0.15}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="tasks" radius={[0, 6, 6, 0]} fill={COLORS.purple} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Document Review Metrics */}
        <ChartCard title="Document Review Metrics" delay={0.2}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={docData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {docData.map((entry) => (
                  <Cell key={entry.name} fill={docColors[entry.name] || COLORS.gray} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
