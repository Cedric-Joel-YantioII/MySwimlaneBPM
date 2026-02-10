"use client";

import { useState, useRef } from "react";
import {
  FileText, Upload, Search, Filter, Tag, Link2, Grid3X3, List, X,
  ChevronDown, BookOpen, File, Clock, User, Hash, CheckCircle2,
} from "lucide-react";

type Category = "Standards" | "Guidelines" | "Templates" | "Policies" | "Previous Reports";
type DocTag = "Required" | "Reference";

interface Document {
  id: string;
  name: string;
  category: Category;
  uploadDate: string;
  size: string;
  pages: number;
  uploadedBy: string;
  tags: DocTag[];
  linkedWorkflows: string[];
}

const categoryColors: Record<Category, string> = {
  Standards: "#2563EB",
  Guidelines: "#059669",
  Templates: "#7C3AED",
  Policies: "#D97706",
  "Previous Reports": "#6B7280",
};

const initialDocuments: Document[] = [
  { id: "1", name: "AfDB Evaluation Guidelines 2024", category: "Standards", uploadDate: "2024-11-15", size: "4.2 MB", pages: 156, uploadedBy: "Dr. Amina Diallo", tags: ["Required"], linkedWorkflows: ["Country Program Evaluation"] },
  { id: "2", name: "Results Measurement Framework v3.2", category: "Standards", uploadDate: "2024-10-03", size: "2.8 MB", pages: 89, uploadedBy: "Jean-Pierre Kouassi", tags: ["Required"], linkedWorkflows: ["Impact Assessment", "Country Program Evaluation"] },
  { id: "3", name: "Gender Mainstreaming Policy", category: "Policies", uploadDate: "2024-09-20", size: "1.5 MB", pages: 42, uploadedBy: "Fatima El-Amin", tags: ["Required"], linkedWorkflows: ["Gender Review"] },
  { id: "4", name: "Climate Adaptation Evaluation Template", category: "Templates", uploadDate: "2024-12-01", size: "890 KB", pages: 28, uploadedBy: "Samuel Okonkwo", tags: ["Reference"], linkedWorkflows: ["Climate Resilience Assessment"] },
  { id: "5", name: "Country Strategy Evaluation Methodology", category: "Guidelines", uploadDate: "2024-08-14", size: "3.6 MB", pages: 134, uploadedBy: "Dr. Amina Diallo", tags: ["Required"], linkedWorkflows: ["Country Program Evaluation"] },
  { id: "6", name: "PMBOK 6th Edition", category: "Standards", uploadDate: "2024-06-10", size: "12.4 MB", pages: 978, uploadedBy: "Jean-Pierre Kouassi", tags: ["Reference"], linkedWorkflows: [] },
  { id: "7", name: "Independent Development Evaluation Policy", category: "Policies", uploadDate: "2024-07-22", size: "2.1 MB", pages: 67, uploadedBy: "Fatima El-Amin", tags: ["Required"], linkedWorkflows: ["Impact Assessment"] },
  { id: "8", name: "Data Collection Interview Protocol", category: "Templates", uploadDate: "2025-01-05", size: "420 KB", pages: 15, uploadedBy: "Samuel Okonkwo", tags: ["Reference"], linkedWorkflows: ["Field Data Collection"] },
];

const categories: Category[] = ["Standards", "Guidelines", "Templates", "Policies", "Previous Reports"];
const availableWorkflows = ["Country Program Evaluation", "Impact Assessment", "Gender Review", "Climate Resilience Assessment", "Field Data Collection"];

export default function LibraryPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filtered = documents.filter((d) => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <BookOpen size={28} />
          Reference Library
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Standards, guidelines, and reference documents for evaluation compliance.
        </p>
      </div>

      {/* Top bar */}
      <div className="glass p-4 flex flex-wrap items-center gap-3" style={{ borderRadius: "var(--radius-lg)" }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-sunken)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-sunken)] border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Filter size={14} />
            {categoryFilter === "All" ? "All Categories" : categoryFilter}
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full mt-1 right-0 z-50 glass p-1 min-w-[180px]" style={{ borderRadius: "var(--radius-md)" }}>
              <button onClick={() => { setCategoryFilter("All"); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-primary)]">All Categories</button>
              {categories.map((c) => (
                <button key={c} onClick={() => { setCategoryFilter(c); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[c] }} />
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[var(--surface-sunken)] rounded-xl p-1 border border-[var(--glass-border)]">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}><Grid3X3 size={14} /></button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}><List size={14} /></button>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Upload size={14} />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {(["Standards", "Guidelines", "Templates", "Policies"] as Category[]).map((cat) => {
          const count = documents.filter((d) => d.category === cat).length;
          return (
            <div key={cat} className="glass px-4 py-2 flex items-center gap-2" style={{ borderRadius: "var(--radius-md)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
              <span className="text-sm text-[var(--text-secondary)]">{cat}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="glass p-4 hover:scale-[1.01] transition-transform cursor-pointer" style={{ borderRadius: "var(--radius-lg)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: categoryColors[doc.category] + "18" }}>
                  <FileText size={20} style={{ color: categoryColors[doc.category] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{doc.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: categoryColors[doc.category] }}>
                    {doc.category}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1"><Hash size={11} />{doc.pages} pages</span>
                <span className="flex items-center gap-1"><File size={11} />{doc.size}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{doc.uploadDate}</span>
                <span className="flex items-center gap-1"><User size={11} />{doc.uploadedBy.split(" ").pop()}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${t === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    <Tag size={9} />{t}
                  </span>
                ))}
                {doc.linkedWorkflows.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
                    <Link2 size={9} />{doc.linkedWorkflows.length} workflow{doc.linkedWorkflows.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Document</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Pages</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Size</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Uploaded</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">By</th>
                  <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--surface-sunken)] cursor-pointer transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <FileText size={16} style={{ color: categoryColors[doc.category] }} />
                      <span className="text-[var(--text-primary)] font-medium">{doc.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: categoryColors[doc.category] }}>{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{doc.pages}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{doc.size}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{doc.uploadDate}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{doc.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {doc.tags.map((t) => (
                          <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="glass p-12 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
          <FileText size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-[var(--text-secondary)]">No documents match your search.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={(doc) => {
            setDocuments((prev) => [doc, ...prev]);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (doc: Document) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<Category>("Standards");
  const [selectedTags, setSelectedTags] = useState<DocTag[]>(["Reference"]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!fileName) return;
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          onUpload({
            id: Date.now().toString(),
            name: fileName.replace(/\.\w+$/, ""),
            category,
            uploadDate: new Date().toISOString().split("T")[0],
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            pages: Math.floor(Math.random() * 200 + 10),
            uploadedBy: "Current User",
            tags: selectedTags,
            linkedWorkflows: selectedWorkflows,
          });
          return 100;
        }
        return p + 8;
      });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass w-full max-w-lg p-6 space-y-5" style={{ borderRadius: "var(--radius-xl)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upload Document</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-tertiary)]"><X size={18} /></button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5" : "border-[var(--glass-border)] hover:border-[var(--text-tertiary)]"}`}
        >
          <Upload size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
          {fileName ? (
            <p className="text-sm text-[var(--text-primary)] font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-[var(--text-secondary)]">Drag & drop a file or click to browse</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">PDF, DOCX, XLSX up to 50 MB</p>
            </>
          )}
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.xlsx,.doc,.xls,.pptx" onChange={(e) => { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-sunken)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] outline-none"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tags</label>
          <div className="flex gap-2">
            {(["Required", "Reference"] as DocTag[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(t) ? (t === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700") : "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]"}`}
              >
                {selectedTags.includes(t) && <CheckCircle2 size={12} />}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow linking */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Link to Workflows (optional)</label>
          <div className="flex flex-wrap gap-1.5">
            {availableWorkflows.map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWorkflows((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w])}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${selectedWorkflows.includes(w) ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                <Link2 size={10} />{w}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
              <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-[var(--text-tertiary)] text-center">{progress < 100 ? `Uploading... ${progress}%` : "Complete!"}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={!fileName || uploading}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
