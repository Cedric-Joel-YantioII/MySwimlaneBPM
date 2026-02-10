"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Plug, Info, Mail, Bot, Save } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";
import { GlassButton } from "@/components/ui/glass-button";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200"
      style={{ background: checked ? "var(--accent-primary)" : "var(--surface-sunken)", border: "1px solid var(--glass-border)" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} style={{ color: "var(--accent-primary)" }} />
      <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-150 glass focus:ring-2 focus:ring-[var(--accent-primary)]/40";

export default function SettingsPage() {
  const [name, setName] = useState("Joel");
  const [email, setEmail] = useState("you@afdb.org");
  const [role, setRole] = useState("Principal Evaluation Officer");

  const [notifs, setNotifs] = useState({
    taskAssigned: true,
    documentReview: true,
    agentCompleted: true,
    weeklyDigest: false,
  });

  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <SectionHeader icon={User} title="Profile" />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Role</label>
              <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <SectionHeader icon={Bell} title="Notifications" />
          <div className="space-y-3">
            {([
              ["taskAssigned", "Task Assigned", "Get notified when a task is assigned to you"],
              ["documentReview", "Document Reviews", "Alerts for documents needing your review"],
              ["agentCompleted", "Agent Completions", "When an AI agent completes a task"],
              ["weeklyDigest", "Weekly Digest", "Summary email every Monday morning"],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                </div>
                <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Integrations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard>
          <SectionHeader icon={Plug} title="Integrations" />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--lane-blue)" }}>
                  <Mail size={16} style={{ color: "var(--accent-primary)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{email}</p>
                </div>
              </div>
              <GlassBadge variant="green" dot>Connected</GlassBadge>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--lane-purple)" }}>
                  <Bot size={16} style={{ color: "var(--accent-purple)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>OpenClaw</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>AI agent orchestration</p>
                </div>
              </div>
              <GlassBadge variant="green" dot>Active</GlassBadge>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard>
          <SectionHeader icon={Info} title="About" />
          <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            <p><strong>EvalFlow</strong> v0.1.0</p>
            <p>Evaluation workflow management with AI-powered agents</p>
            <p style={{ color: "var(--text-tertiary)" }}>Built with Next.js 15 · Apple Liquid Glass Design</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <GlassButton variant="primary" size="lg" className="w-full" onClick={handleSave}>
          <Save size={16} />
          {saved ? "Saved!" : "Save Changes"}
        </GlassButton>
      </motion.div>
    </div>
  );
}
