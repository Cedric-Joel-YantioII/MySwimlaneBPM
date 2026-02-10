"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Bot,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Tag,
  Send,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { mockTasks, mockDocuments } from "@/lib/mock-data";

const priorityConfig: Record<string, { variant: "red" | "orange" | "blue" | "gray"; label: string }> = {
  critical: { variant: "red", label: "Critical" },
  high: { variant: "orange", label: "High" },
  medium: { variant: "blue", label: "Medium" },
  low: { variant: "gray", label: "Low" },
};

const statusConfig: Record<string, { variant: "orange" | "blue" | "purple" | "green" | "red"; label: string }> = {
  todo: { variant: "blue", label: "Todo" },
  "in-progress": { variant: "orange", label: "In Progress" },
  review: { variant: "purple", label: "Review" },
  done: { variant: "green", label: "Done" },
  blocked: { variant: "red", label: "Blocked" },
};

const mockComments = [
  { id: "c1", author: "Amina Diallo", text: "I've uploaded the updated version with the revised methodology section.", time: "2 hours ago", isAgent: false },
  { id: "c2", author: "Research Agent", text: "Cross-referenced 12 additional sources from the AfDB evaluation database. Added to the literature matrix.", time: "4 hours ago", isAgent: true },
  { id: "c3", author: "You", text: "Please ensure the evaluation questions align with CODE's latest guidance note.", time: "Yesterday", isAgent: false },
];

const mockActivityHistory = [
  { id: "h1", action: "Status changed to In Progress", actor: "Sarah Chen", time: "2 hours ago", icon: "edit" },
  { id: "h2", action: "Document attached: Interview_Transcript_07.docx", actor: "Sarah Chen", time: "3 hours ago", icon: "file" },
  { id: "h3", action: "Comment added", actor: "You", time: "Yesterday", icon: "comment" },
  { id: "h4", action: "Priority changed from Medium to High", actor: "Amina Diallo", time: "2 days ago", icon: "alert" },
  { id: "h5", action: "Task created", actor: "You", time: "Jan 20, 2026", icon: "create" },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const task = mockTasks.find((t) => t.id === taskId) || mockTasks[0];
  const pc = priorityConfig[task.priority];
  const sc = statusConfig[task.status];
  const linkedDocs = mockDocuments.filter((d) => d.projectId === "p1").slice(0, 3);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(task.status);

  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== "done";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back nav */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition" style={{ color: "var(--accent-primary)" }}>
          <ArrowLeft size={16} />
          Back to Board
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          {/* Title card */}
          <GlassCard>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {task.title}
              </h1>
              <GlassBadge variant={pc.variant}>{pc.label}</GlassBadge>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {task.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-sunken)", color: "var(--text-secondary)" }}>
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Comments / Timeline */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              <MessageSquare size={15} className="inline mr-2" />
              Comments & Discussion
            </h2>
            <div className="space-y-4 mb-4">
              {mockComments.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.isAgent ? "var(--lane-purple)" : "var(--lane-blue)" }}>
                    {c.isAgent ? <Bot size={14} style={{ color: "var(--accent-purple)" }} /> : <User size={14} style={{ color: "var(--accent-primary)" }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.author}</span>
                      {c.isAgent && <GlassBadge variant="purple">AI</GlassBadge>}
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{c.time}</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Comment input */}
            <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm bg-transparent outline-none px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-sunken)", color: "var(--text-primary)" }}
              />
              <GlassButton variant="primary" size="sm">
                <Send size={14} />
              </GlassButton>
            </div>
          </GlassCard>

          {/* Activity History */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              <Clock size={15} className="inline mr-2" />
              Activity History
            </h2>
            <div className="space-y-3">
              {mockActivityHistory.map((a, i) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: i === 0 ? "var(--accent-primary)" : "var(--text-tertiary)" }} />
                    {i < mockActivityHistory.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "var(--glass-border)", minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{a.action}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {a.actor} · {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Details card */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Details</h2>
            <div className="space-y-4">
              <DetailRow label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="text-xs px-2 py-1 rounded-lg border bg-transparent outline-none"
                  style={{ borderColor: "var(--glass-border)", color: "var(--text-primary)" }}
                >
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </DetailRow>
              <DetailRow label="Priority">
                <GlassBadge variant={pc.variant} dot>{pc.label}</GlassBadge>
              </DetailRow>
              <DetailRow label="Assignee">
                <div className="flex items-center gap-1.5">
                  {task.assigneeType === "agent" ? <Bot size={13} style={{ color: "var(--accent-purple)" }} /> : <User size={13} style={{ color: "var(--text-secondary)" }} />}
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{task.assignee}</span>
                </div>
              </DetailRow>
              <DetailRow label="Lane">
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{task.lane}</span>
              </DetailRow>
              <DetailRow label="Phase">
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{task.phase}</span>
              </DetailRow>
              <DetailRow label="Due Date">
                <span className="flex items-center gap-1 text-sm" style={{ color: isOverdue ? "var(--accent-danger)" : "var(--text-primary)" }}>
                  <Calendar size={13} />
                  {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </DetailRow>
              <DetailRow label="Created">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </DetailRow>
            </div>
          </GlassCard>

          {/* Linked Documents */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                <Link2 size={15} className="inline mr-2" />
                Linked Documents
              </h2>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{task.documentsCount}</span>
            </div>
            <div className="space-y-2">
              {linkedDocs.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`}>
                  <div className="flex items-center gap-2 p-2 rounded-xl transition hover:bg-[var(--glass-bg-hover)]">
                    <FileText size={14} style={{ color: "var(--accent-primary)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>v{doc.version}</p>
                    </div>
                    <GlassBadge variant={doc.status === "approved" ? "green" : doc.status === "rejected" ? "red" : "orange"}>
                      {doc.status}
                    </GlassBadge>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      {children}
    </div>
  );
}
