"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bot,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  Filter,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import {
  mockTasks,
  mockProjects,
  mockPeople,
  mockAgents,
  mockWorkflow,
  type Task,
} from "@/lib/mock-data";

const COLUMNS = [
  { key: "todo" as const, label: "Todo", emoji: "📋" },
  { key: "in-progress" as const, label: "In Progress", emoji: "🔄" },
  { key: "review" as const, label: "Review", emoji: "👀" },
  { key: "done" as const, label: "Done", emoji: "✅" },
  { key: "blocked" as const, label: "Blocked", emoji: "🚫" },
];

const priorityConfig: Record<string, { variant: "red" | "orange" | "blue" | "gray"; label: string }> = {
  critical: { variant: "red", label: "Critical" },
  high: { variant: "orange", label: "High" },
  medium: { variant: "blue", label: "Medium" },
  low: { variant: "gray", label: "Low" },
};

const laneColors: Record<string, string> = {
  "Principal Officer": "var(--accent-primary)",
  "Task Manager": "var(--accent-primary)",
  "Evaluation Officer": "var(--accent-secondary)",
  "Data Analyst": "var(--accent-secondary)",
  "Consultants": "var(--accent-warning)",
  "Peer Reviewer": "var(--accent-warning)",
  "AI Agent": "var(--accent-purple)",
};

function getLaneColor(lane: string) {
  return laneColors[lane] || "var(--accent-primary)";
}

const allAssignees = Array.from(new Set(mockTasks.map((t) => t.assignee)));
const allLanes = Array.from(new Set(mockTasks.map((t) => t.lane)));
const allPriorities = ["critical", "high", "medium", "low"];

export default function TaskBoardPage() {
  const [filterLane, setFilterLane] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const filtered = useMemo(() => {
    return mockTasks.filter((t) => {
      if (filterLane && t.lane !== filterLane) return false;
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [filterLane, filterAssignee, filterPriority, filterProject]);

  const hasFilters = filterLane || filterAssignee || filterPriority || filterProject;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Task Board
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {filtered.length} tasks across {COLUMNS.length} columns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {hasFilters && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--accent-primary)" }}
              />
            )}
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            Add Task
          </GlassButton>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass p-4 flex flex-wrap items-center gap-3">
              <Select
                value={filterLane}
                onChange={setFilterLane}
                placeholder="All Lanes"
                options={allLanes}
              />
              <Select
                value={filterAssignee}
                onChange={setFilterAssignee}
                placeholder="All Assignees"
                options={allAssignees}
              />
              <Select
                value={filterPriority}
                onChange={setFilterPriority}
                placeholder="All Priorities"
                options={allPriorities}
                labelFn={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              {hasFilters && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterLane("");
                    setFilterAssignee("");
                    setFilterPriority("");
                    setFilterProject("");
                  }}
                >
                  <X size={14} />
                  Clear
                </GlassButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <div className="glass p-4 flex items-center gap-3">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New task title..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--text-primary)" }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowAddForm(false);
                }}
              />
              <GlassButton variant="primary" size="sm" onClick={() => setShowAddForm(false)}>
                Create
              </GlassButton>
              <GlassButton variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </GlassButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {COLUMNS.map((col, colIdx) => {
          const columnTasks = filtered.filter((t) => t.status === col.key);
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.05 }}
              className="flex-shrink-0 w-[300px] flex flex-col"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-base">{col.emoji}</span>
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.label}
                </h2>
                <span
                  className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--surface-sunken)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className="flex-1 flex flex-col gap-3 p-2 rounded-2xl"
                style={{ background: "var(--surface-sunken)" }}
              >
                <AnimatePresence>
                  {columnTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} index={i} />
                  ))}
                </AnimatePresence>
                {columnTasks.length === 0 && (
                  <div
                    className="text-center py-8 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    No tasks
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  const pc = priorityConfig[task.priority];
  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== "done";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={`/tasks/${task.id}`}>
        <GlassCard hover className="relative overflow-hidden">
          {/* Lane color accent */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: getLaneColor(task.lane) }}
          />

          <div className="pl-3">
            {/* Title + Priority */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className="text-sm font-medium leading-snug line-clamp-2"
                style={{ color: "var(--text-primary)" }}
              >
                {task.title}
              </h3>
              <GlassBadge variant={pc.variant} className="flex-shrink-0">
                {pc.label}
              </GlassBadge>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-1.5 mb-2">
              {task.assigneeType === "agent" ? (
                <Bot size={13} style={{ color: "var(--accent-purple)" }} />
              ) : (
                <User size={13} style={{ color: "var(--text-secondary)" }} />
              )}
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {task.assignee}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <span
                className="flex items-center gap-1"
                style={isOverdue ? { color: "var(--accent-danger)" } : {}}
              >
                <Calendar size={11} />
                {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              {task.documentsCount > 0 && (
                <span className="flex items-center gap-1">
                  <FileText size={11} />
                  {task.documentsCount}
                </span>
              )}
              {task.commentsCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={11} />
                  {task.commentsCount}
                </span>
              )}
              <span className="ml-auto flex items-center gap-0.5">
                {task.lane}
                <ChevronRight size={10} />
              </span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
  labelFn,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  labelFn?: (v: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-3 py-1.5 rounded-lg border outline-none bg-transparent"
      style={{
        borderColor: "var(--glass-border)",
        color: "var(--text-primary)",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {labelFn ? labelFn(o) : o}
        </option>
      ))}
    </select>
  );
}
