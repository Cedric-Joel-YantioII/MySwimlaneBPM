"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowLeft, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";

const models = ["Claude Opus 4.6", "Claude Sonnet 4", "GPT-4o"];
const specializations = ["Research", "Document Analysis", "Data Processing", "Drafting", "Custom"];

export default function CreateAgentPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [model, setModel] = useState(models[0]);
  const [specialization, setSpecialization] = useState("");
  const [created, setCreated] = useState(false);

  const canCreate = name.trim() && role.trim() && specialization;

  const handleCreate = () => {
    if (!canCreate) return;
    setCreated(true);
  };

  const inputClass =
    "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--accent-primary)]/40";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/agents">
          <GlassButton variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Create Agent
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Configure a new AI agent for your workflows
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {created ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-secondary)", color: "white" }}
            >
              <Check size={32} />
            </motion.div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Agent Created!
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong>{name}</strong> is ready to go.
            </p>
            <Link href="/agents">
              <GlassButton variant="primary">Back to Agents</GlassButton>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Form */}
            <div className="lg:col-span-3 space-y-5">
              <GlassCard>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Agent Name
                    </label>
                    <input
                      className={`${inputClass} glass`}
                      placeholder="e.g. Research Agent"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Role Description
                    </label>
                    <textarea
                      className={`${inputClass} glass min-h-[80px] resize-none`}
                      placeholder="Describe what this agent does..."
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Model
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {models.map((m) => (
                        <button
                          key={m}
                          onClick={() => setModel(m)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            model === m
                              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]"
                              : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Specialization
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpecialization(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            specialization === s
                              ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/12 text-[var(--accent-purple)]"
                              : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassButton variant="primary" size="lg" disabled={!canCreate} onClick={handleCreate} className="w-full">
                <Sparkles size={16} />
                Create Agent
              </GlassButton>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>
                PREVIEW
              </p>
              <GlassCard>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--lane-purple)" }}
                  >
                    <Bot size={28} style={{ color: "var(--accent-purple)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: name ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                      {name || "Agent Name"}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {role || "Role description..."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <GlassBadge variant="green" dot>active</GlassBadge>
                    <GlassBadge variant="purple">{model.split(" ").slice(-1)[0]}</GlassBadge>
                  </div>
                  {specialization && (
                    <GlassBadge variant="blue">{specialization}</GlassBadge>
                  )}
                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <div className="rounded-lg p-2" style={{ background: "var(--surface-sunken)" }}>
                      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>0</p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Completed</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: "var(--surface-sunken)" }}>
                      <p className="text-lg font-semibold" style={{ color: "var(--accent-primary)" }}>0</p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Active</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
