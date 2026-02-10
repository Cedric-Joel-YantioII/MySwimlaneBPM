"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GitBranch, Plus, X, RotateCcw } from "lucide-react";
import Link from "next/link";

const templates = [
  { id: "blank", name: "Blank Workflow", desc: "Start from scratch with an empty canvas", lanes: 2, phases: 2 },
  { id: "evaluation", name: "Evaluation Process", desc: "Standard AfDB evaluation with planning, fieldwork, and reporting phases", lanes: 4, phases: 5 },
  { id: "review", name: "Document Review", desc: "Multi-stage document review and approval workflow", lanes: 3, phases: 4 },
  { id: "procurement", name: "Procurement Cycle", desc: "End-to-end procurement from requisition to delivery", lanes: 5, phases: 6 },
];

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [lanes, setLanes] = useState<string[]>(["Task Manager", "Consultant"]);
  const [phases, setPhases] = useState<string[]>(["Planning", "Execution"]);
  const [newLane, setNewLane] = useState("");
  const [newPhase, setNewPhase] = useState("");

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplate(id);
    const t = templates.find((x) => x.id === id);
    if (id === "evaluation") {
      setLanes(["Task Manager", "Evaluation Team", "External Consultants", "AI Agents"]);
      setPhases(["Scoping", "Planning", "Data Collection", "Analysis", "Reporting"]);
    } else if (id === "review") {
      setLanes(["Author", "Reviewer", "Approver"]);
      setPhases(["Draft", "Review", "Revision", "Approval"]);
    } else if (id === "procurement") {
      setLanes(["Requestor", "Procurement Officer", "Evaluation Committee", "Finance", "Supplier"]);
      setPhases(["Requisition", "Solicitation", "Evaluation", "Award", "Contract", "Delivery"]);
    } else {
      setLanes(["Task Manager", "Consultant"]);
      setPhases(["Planning", "Execution"]);
    }
  };

  const addLane = () => {
    if (newLane.trim() && !lanes.includes(newLane.trim())) {
      setLanes([...lanes, newLane.trim()]);
      setNewLane("");
    }
  };

  const addPhase = () => {
    if (newPhase.trim() && !phases.includes(newPhase.trim())) {
      setPhases([...phases, newPhase.trim()]);
      setNewPhase("");
    }
  };

  const removeLane = (i: number) => setLanes(lanes.filter((_, idx) => idx !== i));
  const removePhase = (i: number) => setPhases(phases.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!name.trim()) return;
    // In real app, save to state/API. For now, navigate to builder with first workflow
    router.push("/workflows/w1/builder");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/workflows" className="p-2 rounded-xl hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Workflow</h1>
          <p className="text-sm text-[var(--text-secondary)]">Set up your workflow structure, then build the process in the editor.</p>
        </div>
      </div>

      {/* Name & Description */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Workflow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Country Strategy Evaluation - Tanzania"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-sunken)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this evaluation or process..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-sunken)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none text-sm resize-none"
          />
        </div>
      </div>

      {/* Templates */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Start from a Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateSelect(t.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedTemplate === t.id
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/8"
                  : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="font-medium text-sm text-[var(--text-primary)]">{t.name}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">{t.desc}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">{t.lanes} lanes, {t.phases} phases</div>
            </button>
          ))}
        </div>
      </div>

      {/* Swimlanes */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Swimlanes (Participants)</h2>
        <p className="text-xs text-[var(--text-secondary)]">Each lane represents a role or team responsible for tasks in the workflow.</p>
        <div className="flex flex-wrap gap-2">
          {lanes.map((lane, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)]">
              {lane}
              <button onClick={() => removeLane(i)} className="text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newLane}
            onChange={(e) => setNewLane(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLane()}
            placeholder="Add a lane (e.g. External Reviewer)"
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          <button onClick={addLane} className="px-3 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Phases */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Phases (Columns)</h2>
        <p className="text-xs text-[var(--text-secondary)]">Phases represent stages of the process, shown as columns in the swimlane diagram.</p>
        <div className="flex flex-wrap gap-2">
          {phases.map((phase, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)]">
              {phase}
              <button onClick={() => removePhase(i)} className="text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhase()}
            placeholder="Add a phase (e.g. Fieldwork)"
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          <button onClick={addPhase} className="px-3 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end gap-3">
        <Link href="/workflows" className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]">
          Cancel
        </Link>
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all ${
            name.trim() ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90" : "bg-[var(--accent-primary)]/40 cursor-not-allowed"
          }`}
        >
          Create & Open Builder
        </button>
      </div>
    </div>
  );
}
