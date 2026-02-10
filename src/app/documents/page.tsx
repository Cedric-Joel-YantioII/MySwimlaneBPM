"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileSpreadsheet,
  File,
  Presentation,
  Search,
  Grid3X3,
  List,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";
import { mockDocuments, mockProjects, type Document } from "@/lib/mock-data";

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} style={{ color: "var(--accent-danger)" }} />,
  docx: <FileText size={16} style={{ color: "var(--accent-primary)" }} />,
  xlsx: <FileSpreadsheet size={16} style={{ color: "var(--accent-secondary)" }} />,
  pptx: <Presentation size={16} style={{ color: "var(--accent-warning)" }} />,
  other: <File size={16} style={{ color: "var(--text-secondary)" }} />,
};

const statusVariant: Record<string, "gray" | "orange" | "blue" | "green" | "red"> = {
  draft: "gray",
  submitted: "orange",
  "under-review": "blue",
  approved: "green",
  rejected: "red",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getProjectName(id: string) {
  return mockProjects.find((p) => p.id === id)?.name || id;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  const filtered = useMemo(() => {
    let docs = [...mockDocuments];
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.name.toLowerCase().includes(q) || d.submittedBy.toLowerCase().includes(q));
    }
    if (statusFilter) docs = docs.filter((d) => d.status === statusFilter);
    docs.sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return docs;
  }, [search, statusFilter, sortBy]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Document Hub</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{filtered.length} documents</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/documents/review">
              <GlassButton variant="primary" size="sm">
                Review Queue
                <GlassBadge variant="orange" className="ml-1">
                  {mockDocuments.filter((d) => d.status === "submitted" || d.status === "under-review").length}
                </GlassBadge>
              </GlassButton>
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass p-3 flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={15} style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border bg-transparent outline-none"
            style={{ borderColor: "var(--glass-border)", color: "var(--text-primary)" }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <GlassButton variant="ghost" size="sm" onClick={() => setSortBy(sortBy === "date" ? "name" : "date")}>
            <ArrowUpDown size={14} />
            {sortBy === "date" ? "Date" : "Name"}
          </GlassButton>
          <div className="flex gap-1">
            <GlassButton variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")}>
              <List size={14} />
            </GlassButton>
            <GlassButton variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 size={14} />
            </GlassButton>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                      {["Name", "Type", "Version", "Status", "Submitted By", "Date", "Project"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc, i) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[var(--glass-bg-hover)] transition cursor-pointer"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}
                        onClick={() => window.location.href = `/documents/${doc.id}`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {typeIcons[doc.type]}
                            <span className="font-medium truncate max-w-[250px]" style={{ color: "var(--text-primary)" }}>{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 uppercase text-xs" style={{ color: "var(--text-tertiary)" }}>{doc.type}</td>
                        <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>v{doc.version}</td>
                        <td className="py-3 px-3">
                          <GlassBadge variant={statusVariant[doc.status]} dot>{doc.status.replace("-", " ")}</GlassBadge>
                        </td>
                        <td className="py-3 px-3" style={{ color: "var(--text-secondary)" }}>{doc.submittedBy}</td>
                        <td className="py-3 px-3" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-3 px-3 text-xs truncate max-w-[150px]" style={{ color: "var(--text-tertiary)" }}>
                          {getProjectName(doc.projectId)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/documents/${doc.id}`}>
                  <GlassCard hover>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-sunken)" }}>
                        {typeIcons[doc.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{formatSize(doc.size)} · v{doc.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <GlassBadge variant={statusVariant[doc.status]} dot>{doc.status.replace("-", " ")}</GlassBadge>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{doc.submittedBy}</span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
