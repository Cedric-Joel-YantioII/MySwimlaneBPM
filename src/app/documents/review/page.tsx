"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  User,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { mockDocuments, mockProjects, type Document } from "@/lib/mock-data";

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} style={{ color: "var(--accent-danger)" }} />,
  docx: <FileText size={18} style={{ color: "var(--accent-primary)" }} />,
  xlsx: <FileSpreadsheet size={18} style={{ color: "var(--accent-secondary)" }} />,
};

function getProjectName(id: string) {
  return mockProjects.find((p) => p.id === id)?.name.split(" - ")[0] || id;
}

export default function DocumentReviewPage() {
  const reviewDocs = mockDocuments.filter((d) => d.status === "submitted" || d.status === "under-review");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [actioned, setActioned] = useState<Record<string, "approved" | "rejected">>({});

  const handleAction = (docId: string, action: "approved" | "rejected") => {
    setActioned((prev) => ({ ...prev, [docId]: action }));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition" style={{ color: "var(--accent-primary)" }}>
          <ArrowLeft size={16} />
          Back to Documents
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Review Queue</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Documents waiting for your review. Approve or reject with feedback.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {reviewDocs.map((doc, i) => {
            const action = actioned[doc.id];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className={action ? "opacity-60" : ""}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Doc info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface-sunken)" }}>
                        {typeIcons[doc.type] || <FileText size={18} style={{ color: "var(--text-secondary)" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/documents/${doc.id}`} className="hover:underline">
                          <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                          <span className="flex items-center gap-1"><User size={11} />{doc.submittedBy}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>{getProjectName(doc.projectId)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <GlassBadge variant={doc.status === "under-review" ? "blue" : "orange"} dot>
                            {doc.status === "under-review" ? "Under Review" : "Submitted"}
                          </GlassBadge>
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>v{doc.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-[280px]">
                      {action ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: action === "approved" ? "var(--lane-green)" : "var(--lane-pink)" }}>
                          {action === "approved" ? (
                            <CheckCircle size={16} style={{ color: "var(--accent-secondary)" }} />
                          ) : (
                            <XCircle size={16} style={{ color: "var(--accent-danger)" }} />
                          )}
                          <span className="text-sm font-medium" style={{ color: action === "approved" ? "var(--accent-secondary)" : "var(--accent-danger)" }}>
                            {action === "approved" ? "Approved" : "Rejected"}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              value={comments[doc.id] || ""}
                              onChange={(e) => setComments((p) => ({ ...p, [doc.id]: e.target.value }))}
                              placeholder="Review comment..."
                              className="flex-1 text-xs bg-transparent outline-none px-3 py-2 rounded-lg"
                              style={{ background: "var(--surface-sunken)", color: "var(--text-primary)" }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <GlassButton variant="primary" size="sm" className="flex-1" onClick={() => handleAction(doc.id, "approved")}>
                              <CheckCircle size={14} />
                              Approve
                            </GlassButton>
                            <GlassButton variant="danger" size="sm" className="flex-1" onClick={() => handleAction(doc.id, "rejected")}>
                              <XCircle size={14} />
                              Reject
                            </GlassButton>
                            <Link href={`/documents/${doc.id}`}>
                              <GlassButton variant="ghost" size="sm">
                                <Eye size={14} />
                              </GlassButton>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {reviewDocs.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: "var(--accent-secondary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>All caught up!</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>No documents pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
