"use client";

import { useState, useMemo } from "react";
import {
  Bell, BellRing, Calendar, Clock, AlertTriangle, CheckCircle,
  RotateCcw, ChevronLeft, ChevronRight, X, Plus, Mail, BellDot,
  User, Flag,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Deadline {
  id: string;
  task: string;
  project: string;
  assignee: string;
  initials: string;
  dueDate: Date;
  priority: "Critical" | "High" | "Medium" | "Low";
  completed: boolean;
  reminder: { type: "email" | "in-app" | "both"; nextDate: Date; repeat: "once" | "daily" | "weekly" } | null;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const today = new Date(2026, 1, 10); // Feb 10, 2026

const INITIAL_DEADLINES: Deadline[] = [
  // Overdue
  { id: "1", task: "Submit Mid-Term Review Report", project: "Tanzania Energy Sector Evaluation", assignee: "Amina Diallo", initials: "AD", dueDate: new Date(2026, 1, 5), priority: "Critical", completed: false, reminder: { type: "both", nextDate: new Date(2026, 1, 4), repeat: "daily" } },
  { id: "2", task: "Finalize Stakeholder Interview Notes", project: "West Africa Agricultural Program", assignee: "Kwame Asante", initials: "KA", dueDate: new Date(2026, 1, 7), priority: "High", completed: false, reminder: null },
  { id: "3", task: "Update Logical Framework Matrix", project: "Morocco Infrastructure Assessment", assignee: "Fatima Benali", initials: "FB", dueDate: new Date(2026, 1, 8), priority: "Medium", completed: false, reminder: { type: "email", nextDate: new Date(2026, 1, 7), repeat: "once" } },
  // Today
  { id: "4", task: "Review Evaluation TOR Draft", project: "Ethiopia Health Systems Evaluation", assignee: "Joel Carter", initials: "JC", dueDate: new Date(2026, 1, 10), priority: "High", completed: false, reminder: { type: "in-app", nextDate: new Date(2026, 1, 10), repeat: "once" } },
  // This week
  { id: "5", task: "Send Data Collection Instruments", project: "Tanzania Energy Sector Evaluation", assignee: "Amina Diallo", initials: "AD", dueDate: new Date(2026, 1, 12), priority: "High", completed: false, reminder: { type: "both", nextDate: new Date(2026, 1, 11), repeat: "once" } },
  { id: "6", task: "Peer Review Quality Check", project: "Sahel Resilience Program", assignee: "Ousmane Sy", initials: "OS", dueDate: new Date(2026, 1, 13), priority: "Medium", completed: false, reminder: null },
  { id: "7", task: "Budget Reconciliation for Q1", project: "West Africa Agricultural Program", assignee: "Kwame Asante", initials: "KA", dueDate: new Date(2026, 1, 14), priority: "Low", completed: false, reminder: null },
  // Next week
  { id: "8", task: "Present Preliminary Findings", project: "Ethiopia Health Systems Evaluation", assignee: "Joel Carter", initials: "JC", dueDate: new Date(2026, 1, 18), priority: "Critical", completed: false, reminder: { type: "both", nextDate: new Date(2026, 1, 17), repeat: "once" } },
  { id: "9", task: "Country Office Coordination Meeting", project: "Morocco Infrastructure Assessment", assignee: "Fatima Benali", initials: "FB", dueDate: new Date(2026, 1, 19), priority: "Medium", completed: false, reminder: null },
  // This month
  { id: "10", task: "Draft Evaluation Synthesis Report", project: "Sahel Resilience Program", assignee: "Ousmane Sy", initials: "OS", dueDate: new Date(2026, 1, 25), priority: "High", completed: false, reminder: { type: "email", nextDate: new Date(2026, 1, 22), repeat: "weekly" } },
  { id: "11", task: "Validation Workshop Preparation", project: "Tanzania Energy Sector Evaluation", assignee: "Amina Diallo", initials: "AD", dueDate: new Date(2026, 1, 27), priority: "Medium", completed: false, reminder: null },
  // Later
  { id: "12", task: "Final Report Submission to Board", project: "West Africa Agricultural Program", assignee: "Kwame Asante", initials: "KA", dueDate: new Date(2026, 2, 15), priority: "Critical", completed: false, reminder: null },
  { id: "13", task: "Impact Assessment Field Visit", project: "Ethiopia Health Systems Evaluation", assignee: "Joel Carter", initials: "JC", dueDate: new Date(2026, 2, 22), priority: "High", completed: false, reminder: null },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function relative(d: Date) {
  const diff = daysBetween(d, today);
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `in ${diff} days`;
}

function getGroup(d: Date): string {
  const diff = daysBetween(d, today);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  const endOfWeek = 7 - today.getDay(); // days until Saturday
  if (diff <= endOfWeek) return "This Week";
  if (diff <= endOfWeek + 7) return "Next Week";
  if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) return "This Month";
  return "Later";
}

const GROUP_ORDER = ["Overdue", "Today", "This Week", "Next Week", "This Month", "Later"];

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "var(--accent-danger)",
  High: "var(--accent-warning)",
  Medium: "var(--accent-primary)",
  Low: "var(--text-tertiary)",
};

/* ------------------------------------------------------------------ */
/*  Calendar helpers                                                   */
/* ------------------------------------------------------------------ */

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay(); // 0=Sun
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RemindersPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(INITIAL_DEADLINES);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [overdueBannerOpen, setOverdueBannerOpen] = useState(true);
  const [reminderDropdown, setReminderDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState("");
  const [modalType, setModalType] = useState<"email" | "in-app" | "both">("both");
  const [modalRepeat, setModalRepeat] = useState<"once" | "daily" | "weekly">("once");
  const [modalPreset, setModalPreset] = useState("3");

  const active = deadlines.filter((d) => !d.completed);
  const overdue = active.filter((d) => daysBetween(d.dueDate, today) < 0);

  const filtered = useMemo(() => {
    if (selectedDay) return active.filter((d) => sameDay(d.dueDate, selectedDay));
    return active;
  }, [active, selectedDay]);

  const grouped = useMemo(() => {
    const map: Record<string, Deadline[]> = {};
    for (const d of filtered) {
      const g = getGroup(d.dueDate);
      (map[g] ??= []).push(d);
    }
    return GROUP_ORDER.filter((g) => map[g]).map((g) => ({ group: g, items: map[g] }));
  }, [filtered]);

  const days = calendarDays(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  function markComplete(id: string) {
    setDeadlines((prev) => prev.map((d) => (d.id === id ? { ...d, completed: true } : d)));
  }

  function snooze(id: string, addDays: number) {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const nd = new Date(d.dueDate);
        nd.setDate(nd.getDate() + addDays);
        return { ...d, dueDate: nd };
      })
    );
  }

  function setReminder(id: string, daysBefore: number) {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const nd = new Date(d.dueDate);
        nd.setDate(nd.getDate() - daysBefore);
        return { ...d, reminder: { type: "both", nextDate: nd, repeat: "once" } };
      })
    );
    setReminderDropdown(null);
  }

  function addReminder() {
    if (!modalTask) return;
    const daysB = parseInt(modalPreset) || 3;
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id !== modalTask) return d;
        const nd = new Date(d.dueDate);
        nd.setDate(nd.getDate() - daysB);
        return { ...d, reminder: { type: modalType, nextDate: nd, repeat: modalRepeat } };
      })
    );
    setShowModal(false);
    setModalTask("");
  }

  function dotColor(day: Date) {
    const tasks = active.filter((d) => sameDay(d.dueDate, day));
    if (!tasks.length) return null;
    if (tasks.some((d) => daysBetween(d.dueDate, today) < 0)) return "var(--accent-danger)";
    if (sameDay(day, today)) return "var(--accent-warning)";
    return "var(--accent-primary)";
  }

  /* ---- render ---- */

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Reminders & Deadlines</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Track evaluation deadlines across all projects
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "var(--accent-primary)", color: "white", border: "none",
            borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}
        >
          <Plus size={16} /> Add Reminder
        </button>
      </div>

      {/* Overdue Banner */}
      {overdue.length > 0 && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: "var(--radius-lg)", marginBottom: 24, overflow: "hidden",
          }}
        >
          <button
            onClick={() => setOverdueBannerOpen(!overdueBannerOpen)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
              background: "none", border: "none", cursor: "pointer", color: "var(--accent-danger)",
              fontWeight: 600, fontSize: 15,
            }}
          >
            <AlertTriangle size={20} />
            <span>{overdue.length} overdue task{overdue.length > 1 ? "s" : ""} require attention</span>
            <ChevronRight size={16} style={{ marginLeft: "auto", transform: overdueBannerOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {overdueBannerOpen && (
            <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {overdue.map((d) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(220,38,38,0.05)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-danger)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{d.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{d.task}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.project} · {d.assignee} · {Math.abs(daysBetween(d.dueDate, today))} days overdue</div>
                  </div>
                  <button onClick={() => markComplete(d.id)} style={{ padding: "6px 12px", background: "var(--accent-secondary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Complete</button>
                  <button onClick={() => snooze(d.id, 3)} style={{ padding: "6px 12px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>Snooze 3d</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* Left: deadline list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedDay && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Filtering: {fmt(selectedDay)}</span>
              <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={14} /></button>
            </div>
          )}
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  color: group === "Overdue" ? "var(--accent-danger)" : group === "Today" ? "var(--accent-warning)" : "var(--text-secondary)",
                }}>{group}</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", background: "var(--surface-sunken)", padding: "2px 8px", borderRadius: 99 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((d) => {
                  const isOverdue = daysBetween(d.dueDate, today) < 0;
                  const isToday = sameDay(d.dueDate, today);
                  return (
                    <div
                      key={d.id}
                      style={{
                        padding: "16px 20px", borderRadius: "var(--radius-md)",
                        background: isOverdue ? "rgba(220,38,38,0.04)" : isToday ? "rgba(217,119,6,0.04)" : "var(--glass-bg)",
                        border: `1px solid ${isOverdue ? "rgba(220,38,38,0.15)" : "var(--glass-border)"}`,
                        backdropFilter: "blur(var(--glass-blur))",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `${PRIORITY_COLORS[d.priority]}20`,
                        color: PRIORITY_COLORS[d.priority],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                      }}>{d.initials}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{d.task}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center" }}>
                          <span>{d.project}</span>
                          <span>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><User size={11} />{d.assignee}</span>
                          <span>·</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{fmt(d.dueDate)}</span>
                          <span style={{ fontWeight: 600, color: isOverdue ? "var(--accent-danger)" : isToday ? "var(--accent-warning)" : "var(--text-tertiary)" }}>{relative(d.dueDate)}</span>
                        </div>
                      </div>

                      {/* Priority */}
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        background: `${PRIORITY_COLORS[d.priority]}18`,
                        color: PRIORITY_COLORS[d.priority],
                      }}>{d.priority}</span>

                      {/* Reminder indicator */}
                      {d.reminder ? (
                        <span title={`Reminder: ${fmt(d.reminder.nextDate)}`} style={{ color: "var(--accent-primary)", display: "flex" }}><BellRing size={16} /></span>
                      ) : (
                        <span style={{ color: "var(--text-tertiary)", display: "flex" }}><Bell size={16} /></span>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 4, position: "relative" }}>
                        <button onClick={() => markComplete(d.id)} title="Complete" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--accent-secondary)" }}><CheckCircle size={14} /></button>
                        <button onClick={() => snooze(d.id, 1)} title="Snooze 1 day" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)" }}><RotateCcw size={14} /></button>
                        <button onClick={() => setReminderDropdown(reminderDropdown === d.id ? null : d.id)} title="Set Reminder" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)" }}><Clock size={14} /></button>
                        {reminderDropdown === d.id && (
                          <div style={{
                            position: "absolute", top: 36, right: 0, background: "var(--glass-bg)", backdropFilter: "blur(20px)",
                            border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: 6, zIndex: 20,
                            boxShadow: "var(--glass-shadow)", minWidth: 150,
                          }}>
                            {[{ label: "1 day before", days: 1 }, { label: "3 days before", days: 3 }, { label: "1 week before", days: 7 }].map((opt) => (
                              <button
                                key={opt.days}
                                onClick={() => setReminder(d.id, opt.days)}
                                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunken)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                              >{opt.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
              <CheckCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p>No deadlines{selectedDay ? " on this date" : ""}</p>
            </div>
          )}
        </div>

        {/* Right: calendar */}
        <div style={{
          background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)",
          padding: 20, position: "sticky", top: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{monthLabel}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}><ChevronRight size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", padding: "6px 0" }}>{d}</div>
            ))}
            {days.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const dot = dotColor(day);
              const isSelected = selectedDay && sameDay(day, selectedDay);
              const isTd = sameDay(day, today);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    width: "100%", aspectRatio: "1", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 3,
                    background: isSelected ? "var(--accent-primary)" : isTd ? "rgba(217,119,6,0.1)" : "none",
                    color: isSelected ? "white" : "var(--text-primary)",
                    border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    fontSize: 13, fontWeight: isTd ? 700 : 400, position: "relative",
                  }}
                >
                  {day.getDate()}
                  {dot && !isSelected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot, position: "absolute", bottom: 3 }} />}
                </button>
              );
            })}
          </div>
          {/* Calendar legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "center" }}>
            {[{ color: "var(--accent-danger)", label: "Overdue" }, { color: "var(--accent-warning)", label: "Today" }, { color: "var(--accent-primary)", label: "Upcoming" }].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--glass-bg)", backdropFilter: "blur(24px)",
            border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)",
            padding: 28, width: 440, boxShadow: "var(--glass-shadow)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Add Reminder</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Task</span>
                <select value={modalTask} onChange={(e) => setModalTask(e.target.value)} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--surface-sunken)", color: "var(--text-primary)", fontSize: 14 }}>
                  <option value="">Select a task…</option>
                  {active.map((d) => <option key={d.id} value={d.id}>{d.task}</option>)}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Reminder Type</span>
                <select value={modalType} onChange={(e) => setModalType(e.target.value as "email" | "in-app" | "both")} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--surface-sunken)", color: "var(--text-primary)", fontSize: 14 }}>
                  <option value="email">Email</option>
                  <option value="in-app">In-app Notification</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Remind Before</span>
                <select value={modalPreset} onChange={(e) => setModalPreset(e.target.value)} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--surface-sunken)", color: "var(--text-primary)", fontSize: 14 }}>
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                  <option value="14">2 weeks before</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Repeat</span>
                <select value={modalRepeat} onChange={(e) => setModalRepeat(e.target.value as "once" | "daily" | "weekly")} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "var(--surface-sunken)", color: "var(--text-primary)", fontSize: 14 }}>
                  <option value="once">Once</option>
                  <option value="daily">Daily until complete</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <button onClick={addReminder} style={{
                padding: "12px", background: "var(--accent-primary)", color: "white",
                border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
                fontSize: 14, fontWeight: 600, marginTop: 4,
              }}>Set Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
