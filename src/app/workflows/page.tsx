"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  LayoutGrid,
  List,
  Users,
  ListTodo,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassProgress } from "@/components/ui/glass-progress";
import { mockProjects } from "@/lib/mock-data";

const statusVariant = {
  planning: "gray",
  active: "green",
  review: "purple",
  completed: "blue",
  archived: "gray",
} as const;

const priorityVariant = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function WorkflowsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Workflows
          </h1>
          <GlassBadge variant="blue">{mockProjects.length}</GlassBadge>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass flex rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className="p-2 transition-colors"
              style={{
                background:
                  viewMode === "grid"
                    ? "var(--glass-bg-active)"
                    : "transparent",
                color:
                  viewMode === "grid"
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-2 transition-colors"
              style={{
                background:
                  viewMode === "list"
                    ? "var(--glass-bg-active)"
                    : "transparent",
                color:
                  viewMode === "list"
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <List size={18} />
            </button>
          </div>
          <GlassButton variant="primary">
            <Plus size={16} /> New Workflow
          </GlassButton>
        </div>
      </motion.div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockProjects.map((proj, i) => (
            <motion.div
              key={proj.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <GlassCard
                hover
                onClick={() => router.push(`/workflows/${proj.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <p
                      className="font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {proj.name}
                    </p>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {proj.description}
                    </p>
                  </div>
                  <GlassBadge variant={statusVariant[proj.status]} dot>
                    {proj.status}
                  </GlassBadge>
                </div>

                <GlassBadge variant="gray" className="mb-3">
                  {proj.phase}
                </GlassBadge>

                <GlassProgress value={proj.progress} className="mb-2" />
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <span>{proj.progress}%</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ListTodo size={12} /> {proj.completedTasks}/{proj.taskCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {proj.teamSize}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <GlassBadge variant={priorityVariant[proj.priority]} dot>
                    {proj.priority}
                  </GlassBadge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {mockProjects.map((proj, i) => (
            <motion.div
              key={proj.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <GlassCard
                hover
                onClick={() => router.push(`/workflows/${proj.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className="font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {proj.name}
                      </p>
                      <GlassBadge variant={statusVariant[proj.status]} dot>
                        {proj.status}
                      </GlassBadge>
                      <GlassBadge variant={priorityVariant[proj.priority]}>
                        {proj.priority}
                      </GlassBadge>
                    </div>
                    <div className="flex items-center gap-4">
                      <GlassBadge variant="gray">{proj.phase}</GlassBadge>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <ListTodo size={12} /> {proj.completedTasks}/{proj.taskCount}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <Users size={12} /> {proj.teamSize}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <GlassProgress value={proj.progress} size="sm" />
                      <p
                        className="text-xs text-right mt-0.5"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {proj.progress}%
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
