"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  User,
  History,
  MessageSquare,
  File,
  HardDrive,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { mockDocuments, mockProjects } from "@/lib/mock-data";

const statusVariant: Record<string, "gray" | "orange" | "blue" | "green" | "red"> = {
  draft: "gray",
  submitted: "orange",
  "under-review": "blue",
  approved: "green",
  rejected: "red",
};

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText size={24} style={{ color: "var(--accent-danger)" }} />,
  docx: <FileText size={24} style={{ color: "var(--accent-primary)" }} />,
  xlsx: <FileSpreadsheet size={24} style={{ color: "var(--accent-secondary)" }} />,
};

function formatSize(bytes: number) {
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

const mockVersionHistory = [
  { version: 3, uploadedBy: "Amina Diallo", date: "Feb 8, 2026", note: "Revised methodology section per feedback" },
  { version: 2, uploadedBy: "Amina Diallo", date: "Feb 3, 2026", note: "Added stakeholder analysis annex" },
  { version: 1, uploadedBy: "Amina Diallo", date: "Jan 25, 2026", note: "Initial draft" },
];

const mockReviewThread = [
  { id: "r1", author: "You", text: "The methodology section needs to reference the updated OECD-DAC criteria. Also check alignment with AfDB's new evaluation policy.", time: "Feb 9, 2026 at 3:30 PM", isAction: false },
  { id: "r2", author: "Amina Diallo", text: "Updated. I've also added a section on theory-based evaluation approach as discussed.", time: "Feb 8, 2026 at 2:15 PM", isAction: false },
  { id: "r3", author: "Dr. James Okonkwo", text: "Looks solid. Minor suggestion: strengthen the counterfactual discussion in section 3.2.", time: "Feb 7, 2026 at 11:00 AM", isAction: false },
  { id: "r4", author: "System", text: "Document submitted for review by Amina Diallo", time: "Feb 8, 2026 at 2:30 PM", isAction: true },
];

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;
  const doc = mockDocuments.find((d) => d.id === docId) || mockDocuments[0];
  const project = mockProjects.find((p) => p.id === doc.projectId);
  const [comment, setComment] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const needsReview = doc.status === "submitted" || doc.status === "under-review";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition" style={{ color: "var(--accent-primary)" }}>
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          {/* File Info Card */}
          <GlassCard>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface-sunken)" }}>
                {typeIcons[doc.type] || <File size={24} style={{ color: "var(--text-secondary)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>{doc.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <GlassBadge variant={statusVariant[doc.status]} dot>{doc.status.replace("-", " ")}</GlassBadge>
                  <span className="flex items-center gap-1"><HardDrive size={11} />{formatSize(doc.size)}</span>
                  <span>Version {doc.version}</span>
                  <span className="uppercase">{doc.type}</span>
                </div>
                {project && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                    Project: {project.name}
                  </p>
                )}
              </div>
              <GlassButton variant="secondary" size="sm">
                <Download size={14} />
                Download
              </GlassButton>
            </div>
          </GlassCard>

          {/* Review Thread */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              <MessageSquare size={15} className="inline mr-2" />
              Review Thread
            </h2>
            <div className="space-y-4 mb-4">
              {mockReviewThread.map((r) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                  {r.isAction ? (
                    <div className="flex items-center gap-2 py-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                      <span>{r.text}</span>
                      <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--lane-blue)" }}>
                        <User size={14} style={{ color: "var(--accent-primary)" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.author}</span>
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{r.time}</span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Comment input */}
            <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add review comment..."
                className="flex-1 text-sm bg-transparent outline-none px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-sunken)", color: "var(--text-primary)" }}
              />
              <GlassButton variant="primary" size="sm">
                <Send size={14} />
              </GlassButton>
            </div>
          </GlassCard>

          {/* Approve/Reject */}
          {needsReview && !actionDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Review Actions</h2>
                <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                  This document is awaiting your review decision.
                </p>
                <div className="flex gap-3">
                  <GlassButton variant="primary" size="md" onClick={() => setActionDone("approved")} className="flex-1">
                    <CheckCircle size={16} />
                    Approve Document
                  </GlassButton>
                  <GlassButton variant="danger" size="md" onClick={() => setActionDone("rejected")} className="flex-1">
                    <XCircle size={16} />
                    Reject & Request Changes
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
          {actionDone && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: actionDone === "approved" ? "var(--lane-green)" : "var(--lane-pink)" }}>
                {actionDone === "approved" ? <CheckCircle size={20} style={{ color: "var(--accent-secondary)" }} /> : <XCircle size={20} style={{ color: "var(--accent-danger)" }} />}
                <span className="text-sm font-medium" style={{ color: actionDone === "approved" ? "var(--accent-secondary)" : "var(--accent-danger)" }}>
                  Document {actionDone}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Details */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Details</h2>
            <div className="space-y-3">
              <DetailRow label="Submitted By" value={doc.submittedBy} />
              <DetailRow label="Uploaded" value={new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
              {doc.reviewedAt && <DetailRow label="Reviewed" value={new Date(doc.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />}
              {doc.reviewNote && (
                <div className="pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Review Note</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{doc.reviewNote}</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Version History */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              <History size={15} className="inline mr-2" />
              Version History
            </h2>
            <div className="space-y-3">
              {mockVersionHistory.map((v, i) => (
                <div key={v.version} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: i === 0 ? "var(--accent-primary)" : "var(--surface-sunken)",
                        color: i === 0 ? "white" : "var(--text-secondary)",
                      }}
                    >
                      {v.version}
                    </div>
                    {i < mockVersionHistory.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "var(--glass-border)", minHeight: 16 }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{v.note}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{v.uploadedBy} · {v.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Re-upload */}
          <GlassCard>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              <Upload size={15} className="inline mr-2" />
              Upload New Version
            </h2>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-[var(--glass-bg-hover)] transition"
              style={{ borderColor: "var(--glass-border)" }}
            >
              <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Drop file here or click to browse
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                This will create version {doc.version + 1}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
