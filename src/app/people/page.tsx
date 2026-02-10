"use client";

import { motion } from "framer-motion";
import { Users, Mail, Briefcase, ListTodo } from "lucide-react";
import Link from "next/link";
import { mockPeople } from "@/lib/mock-data";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassBadge } from "@/components/ui/glass-badge";

const statusColor: Record<string, string> = {
  available: "var(--accent-secondary)",
  busy: "var(--accent-warning)",
  away: "var(--text-tertiary)",
};

const statusBadge: Record<string, "green" | "orange" | "gray"> = {
  available: "green",
  busy: "orange",
  away: "gray",
};

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          People
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Your team directory. Staff, consultants, and their current workload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockPeople.map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/people/${person.id}`}>
              <GlassCard hover className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{
                          background: person.type === "staff" ? "var(--lane-blue)" : "var(--lane-orange)",
                          color: person.type === "staff" ? "var(--accent-primary)" : "var(--accent-warning)",
                        }}
                      >
                        {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                          background: statusColor[person.status],
                          borderColor: "var(--glass-bg)",
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {person.name}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <GlassBadge variant={person.type === "staff" ? "blue" : "orange"}>
                    {person.type}
                  </GlassBadge>
                </div>

                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} />
                    {person.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo size={12} />
                    {person.activeTasks} active
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {person.completedTasks} tasks completed
                  </span>
                  <GlassBadge variant={statusBadge[person.status]} dot>
                    {person.status}
                  </GlassBadge>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
