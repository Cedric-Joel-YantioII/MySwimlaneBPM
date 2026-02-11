"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Diamond,
  User,
  Target,
} from "lucide-react";

/* ───────── Types ───────── */
interface Task {
  id: string;
  name: string;
  assignee: string;
  start: string; // YYYY-MM-DD
  end: string;
  status: "completed" | "active" | "pending" | "blocked";
  dependsOn?: string[];
}

interface Milestone {
  id: string;
  name: string;
  date: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

/* ───────── Mock Data ───────── */
const projects: Project[] = [
  {
    id: "p1",
    name: "Country Strategy Evaluation – Mozambique",
    color: "var(--accent-primary)",
    tasks: [
      { id: "p1t1", name: "Desk Review & Document Analysis", assignee: "Amina Diallo", start: "2026-01-05", end: "2026-02-06", status: "completed" },
      { id: "p1t2", name: "Stakeholder Mapping", assignee: "Kwame Asante", start: "2026-01-19", end: "2026-02-13", status: "completed", dependsOn: ["p1t1"] },
      { id: "p1t3", name: "Field Mission – Maputo", assignee: "Amina Diallo", start: "2026-02-16", end: "2026-03-13", status: "active", dependsOn: ["p1t2"] },
      { id: "p1t4", name: "Data Analysis & Triangulation", assignee: "Jean-Pierre Nkurunziza", start: "2026-03-16", end: "2026-04-17", status: "pending", dependsOn: ["p1t3"] },
      { id: "p1t5", name: "Draft Report Writing", assignee: "Amina Diallo", start: "2026-04-20", end: "2026-05-22", status: "pending", dependsOn: ["p1t4"] },
      { id: "p1t6", name: "Peer Review & Quality Assurance", assignee: "Fatima El-Amin", start: "2026-05-25", end: "2026-06-12", status: "pending", dependsOn: ["p1t5"] },
    ],
  },
  {
    id: "p2",
    name: "Impact Evaluation – Agricultural Value Chains",
    color: "var(--accent-secondary)",
    tasks: [
      { id: "p2t1", name: "Theory of Change Workshop", assignee: "Kwame Asante", start: "2026-01-12", end: "2026-01-30", status: "completed" },
      { id: "p2t2", name: "Baseline Data Collection", assignee: "Ngozi Okonkwo", start: "2026-02-02", end: "2026-03-06", status: "active", dependsOn: ["p2t1"] },
      { id: "p2t3", name: "Counterfactual Design", assignee: "Jean-Pierre Nkurunziza", start: "2026-02-16", end: "2026-03-20", status: "active" },
      { id: "p2t4", name: "Endline Survey Preparation", assignee: "Ngozi Okonkwo", start: "2026-03-23", end: "2026-04-24", status: "pending", dependsOn: ["p2t2", "p2t3"] },
      { id: "p2t5", name: "Impact Analysis & Reporting", assignee: "Kwame Asante", start: "2026-04-27", end: "2026-06-05", status: "pending", dependsOn: ["p2t4"] },
    ],
  },
  {
    id: "p3",
    name: "Thematic Evaluation – Gender Mainstreaming",
    color: "var(--accent-purple)",
    tasks: [
      { id: "p3t1", name: "Literature Review & Framework", assignee: "Fatima El-Amin", start: "2026-01-05", end: "2026-02-06", status: "completed" },
      { id: "p3t2", name: "Portfolio Analysis", assignee: "Fatima El-Amin", start: "2026-02-09", end: "2026-03-13", status: "active", dependsOn: ["p3t1"] },
      { id: "p3t3", name: "Case Studies – 5 Countries", assignee: "Amina Diallo", start: "2026-03-02", end: "2026-04-17", status: "blocked", dependsOn: ["p3t1"] },
      { id: "p3t4", name: "Synthesis & Recommendations", assignee: "Fatima El-Amin", start: "2026-04-20", end: "2026-05-29", status: "pending", dependsOn: ["p3t2", "p3t3"] },
    ],
  },
];

const milestones: Milestone[] = [
  { id: "m1", name: "Board Presentation – Mozambique CSE", date: "2026-06-19", projectId: "p1" },
  { id: "m2", name: "Report Submission – Ag. Value Chains", date: "2026-06-12", projectId: "p2" },
  { id: "m3", name: "Mid-Term Review Meeting", date: "2026-03-27", projectId: "p3" },
];

type ViewMode = "day" | "week" | "month" | "quarter";

/* ───────── Helpers ───────── */
const DAY_MS = 86400000;

function toDate(s: string) {
  return new Date(s + "T00:00:00");
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * DAY_MS);
}

function formatMonth(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#059669",
  active: "#2563EB",
  pending: "#9CA3AF",
  blocked: "#DC2626",
};

/* ───────── Component ───────── */
export default function SchedulingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // For Day view: which week are we looking at (Sunday start)
  const [calWeekStart, setCalWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    return addDays(now, -day); // Go back to Sunday
  });

  // Timeline range: Jan 1 2026 – Jun 30 2026
  const rangeStart = useMemo(() => toDate("2026-01-01"), []);
  const rangeEnd = useMemo(() => toDate("2026-06-30"), []);
  const totalDays = useMemo(() => diffDays(rangeStart, rangeEnd) + 1, [rangeStart, rangeEnd]);

  const dayWidth = viewMode === "day" ? 192 : viewMode === "week" ? 40 : viewMode === "month" ? 14 : 5;
  const totalWidth = totalDays * dayWidth;

  const today = useMemo(() => new Date(), []);
  const todayOffset = diffDays(rangeStart, today);

  // Build all rows
  const rows = useMemo(() => {
    const r: { type: "project" | "task"; project: Project; task?: Task }[] = [];
    for (const p of projects) {
      r.push({ type: "project", project: p });
      for (const t of p.tasks) {
        r.push({ type: "task", project: p, task: t });
      }
    }
    return r;
  }, []);

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Generate header columns (top row)
  const headerCols = useMemo(() => {
    const cols: { label: string; left: number; width: number }[] = [];
    if (viewMode === "day") {
      // Day view uses separate calendar layout
    } else if (viewMode === "week" || viewMode === "month") {
      // Top row: months
      let d = new Date(rangeStart);
      while (d <= rangeEnd) {
        const offset = diffDays(rangeStart, d);
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        cols.push({ label: formatMonth(d), left: offset * dayWidth, width: daysInMonth * dayWidth });
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    } else {
      const quarters = [
        { label: "Q1 2026", start: "2026-01-01", end: "2026-03-31" },
        { label: "Q2 2026", start: "2026-04-01", end: "2026-06-30" },
      ];
      for (const q of quarters) {
        const s = toDate(q.start);
        const e = toDate(q.end);
        const offset = diffDays(rangeStart, s);
        const w = diffDays(s, e) + 1;
        cols.push({ label: q.label, left: offset * dayWidth, width: w * dayWidth });
      }
    }
    return cols;
  }, [viewMode, dayWidth, rangeStart, rangeEnd, totalDays]);

  // Generate sub-header columns (bottom row)
  const subHeaderCols = useMemo(() => {
    const cols: { label: string; left: number; width: number; isWeekend?: boolean }[] = [];
    if (viewMode === "day") {
      // Day view uses separate calendar layout, no sub-headers needed
    } else if (viewMode === "week") {
      for (let i = 0; i <= totalDays; i++) {
        const d = addDays(rangeStart, i);
        const dayOfWeek = d.getDay();
        const dayNum = d.getDate();
        cols.push({
          label: `${DAY_NAMES[dayOfWeek]} ${dayNum}`,
          left: i * dayWidth,
          width: dayWidth,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
    } else if (viewMode === "month") {
      for (let i = 0; i <= totalDays; i++) {
        const d = addDays(rangeStart, i);
        const dayNum = d.getDate();
        const dayOfWeek = d.getDay();
        const showLabel = dayNum === 1 || dayOfWeek === 1;
        cols.push({
          label: showLabel ? `${DAY_NAMES[dayOfWeek]} ${dayNum}` : "",
          left: i * dayWidth,
          width: dayWidth,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        });
      }
    } else {
      // Quarter view: show months as sub-header
      let d = new Date(rangeStart);
      while (d <= rangeEnd) {
        const offset = diffDays(rangeStart, d);
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const monthName = d.toLocaleDateString("en-US", { month: "short" });
        cols.push({ label: monthName, left: offset * dayWidth, width: daysInMonth * dayWidth });
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    }
    return cols;
  }, [viewMode, dayWidth, rangeStart, rangeEnd, totalDays]);

  // Scroll to today on mount
  useEffect(() => {
    if (timelineRef.current && todayOffset > 0) {
      const scrollTo = todayOffset * dayWidth - 200;
      timelineRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, [todayOffset, dayWidth]);

  // Sync header scroll with timeline scroll
  const onTimelineScroll = () => {
    if (timelineRef.current && headerRef.current) {
      headerRef.current.scrollLeft = timelineRef.current.scrollLeft;
    }
  };

  const scrollTimeline = (dir: number) => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

  const scrollToToday = () => {
    if (timelineRef.current) {
      const scrollTo = todayOffset * dayWidth - 200;
      timelineRef.current.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
    }
  };

  const ROW_H = 40;
  const HEADER_TOP = 28;
  const HEADER_SUB = viewMode === "day" ? 24 : viewMode === "quarter" ? 24 : 22;
  const HEADER_H = HEADER_TOP + HEADER_SUB;

  // Find task position for dependency arrows
  const taskRowIndex = useMemo(() => {
    const map: Record<string, number> = {};
    let idx = 0;
    for (const row of rows) {
      if (row.type === "task" && row.task) {
        map[row.task.id] = idx;
      }
      idx++;
    }
    return map;
  }, [rows]);

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Calendar size={24} />
          Schedule
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Plan timelines, set deadlines, and track milestones across projects.
        </p>
      </div>

      {/* Toolbar */}
      <div className="glass flex flex-wrap items-center gap-3 p-3 rounded-xl">
        <div className="flex items-center rounded-lg overflow-hidden border border-[var(--glass-border)]">
          {(["day", "week", "month", "quarter"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === m
                  ? "bg-[var(--accent-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={scrollToToday}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] flex items-center gap-1"
        >
          <Target size={12} />
          Today
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => scrollTimeline(-1)} className="p-1.5 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-[var(--text-secondary)] min-w-[120px] text-center">
            Jan 2026 – Jun 2026
          </span>
          <button onClick={() => scrollTimeline(1)} className="p-1.5 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5 capitalize">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            {status}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <Diamond size={12} className="text-[var(--accent-warning)]" fill="var(--accent-warning)" />
          Milestone
        </span>
      </div>

      {/* Day View: Weekly Calendar with hours on left, days as columns */}
      {viewMode === "day" && (() => {
        const HOURS = Array.from({ length: 24 }, (_, i) => {
          if (i === 0) return "12 AM";
          if (i < 12) return `${i} AM`;
          if (i === 12) return "12 PM";
          return `${i - 12} PM`;
        });
        const DAY_LETTERS_CAL = ["S", "M", "T", "W", "T", "F", "S"];
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(calWeekStart, i));
        const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectColor: p.color })));
        const todayStr = new Date().toISOString().slice(0, 10);
        const selectedDay = weekDays.find(d => d.toISOString().slice(0, 10) === todayStr) || weekDays[0];
        const selectedDayStr = selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
        const monthLabel = calWeekStart.toLocaleDateString("en-US", { month: "long" });
        // Tasks active on selected day
        const selectedDateStr = selectedDay.toISOString().slice(0, 10);
        const dayTasks = allTasks.filter(t => t.start <= selectedDateStr && t.end >= selectedDateStr);

        return (
          <div className="glass rounded-xl overflow-hidden">
            {/* Month name + nav (Apple style: month top-left, arrows top-right) */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <button
                onClick={() => setCalWeekStart(addDays(calWeekStart, -7))}
                className="flex items-center gap-1 text-[var(--accent-primary)] text-sm font-medium"
              >
                <ChevronLeft size={14} />
                {monthLabel}
              </button>
              <button
                onClick={() => setCalWeekStart(addDays(calWeekStart, 7))}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day letter row (S M T W T F S) */}
            <div className="grid grid-cols-7 px-4 pb-1">
              {DAY_LETTERS_CAL.map((letter, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-[var(--text-tertiary)]">
                  {letter}
                </div>
              ))}
            </div>

            {/* Date numbers row with today circled */}
            <div className="grid grid-cols-7 px-4 pb-3">
              {weekDays.map((d, i) => {
                const isToday = d.toISOString().slice(0, 10) === todayStr;
                return (
                  <div key={i} className="flex justify-center">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: isToday ? "#DC2626" : "transparent",
                        color: isToday ? "white" : "var(--text-primary)",
                      }}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day label */}
            <div className="px-4 py-2 border-t border-b border-[var(--glass-border)] text-center">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {selectedDayStr}
              </span>
            </div>

            {/* All-day events */}
            {dayTasks.length > 0 && (
              <div className="px-4 py-2 border-b border-[var(--glass-border)]">
                <span className="text-[10px] text-[var(--text-tertiary)] mr-2">all-day</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayTasks.map((t, i) => (
                    <div
                      key={i}
                      className="text-[11px] text-white px-2 py-0.5 rounded"
                      style={{ backgroundColor: STATUS_COLORS[t.status], opacity: t.status === "pending" ? 0.6 : 0.85 }}
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly timeline (hours on left, content area on right) */}
            <div className="overflow-auto" style={{ maxHeight: 480 }}>
              {HOURS.map((label, hourIdx) => (
                <div key={hourIdx} className="flex" style={{ height: 56 }}>
                  {/* Hour label on the left */}
                  <div
                    className="flex-shrink-0 text-right pr-2 text-[10px] text-[var(--text-tertiary)]"
                    style={{ width: 48, paddingTop: 2 }}
                  >
                    {label}
                  </div>
                  {/* Hour row */}
                  <div
                    className="flex-1 relative"
                    style={{ borderTop: "1px solid var(--glass-border)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Gantt Chart */}
      {viewMode !== "day" && <div className="glass rounded-xl overflow-hidden">
        <div className="flex">
          {/* Left panel - task list */}
          <div className="hidden md:block flex-shrink-0" style={{ width: 250 }}>
            {/* Left header - sticky style */}
            <div
              className="border-b-2 border-[var(--glass-border)] px-3 flex items-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide"
              style={{
                height: HEADER_H,
                position: "sticky",
                top: 0,
                zIndex: 10,
                backgroundColor: "var(--surface-raised, var(--surface-sunken))",
                backdropFilter: "blur(8px)",
              }}
            >
              Tasks
            </div>
            {/* Left rows */}
            <div>
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center px-3"
                  style={{
                    height: ROW_H,
                    borderBottom: "1px solid var(--glass-border)",
                    backgroundColor: row.type === "project"
                      ? "var(--surface-sunken)"
                      : i % 2 === 0
                        ? "rgba(0,0,0,0.02)"
                        : "transparent",
                  }}
                >
                  {row.type === "project" ? (
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.project.color }} />
                      {row.project.name}
                    </span>
                  ) : (
                    <div className="pl-4 flex flex-col min-w-0">
                      <span className="text-xs text-[var(--text-primary)] truncate">{row.task!.name}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 truncate">
                        <User size={9} />
                        {row.task!.assignee}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - timeline */}
          <div className="flex-1 min-w-0 border-l border-[var(--glass-border)]">
            {/* Timeline header - sticky spreadsheet style */}
            <div
              ref={headerRef}
              className="overflow-hidden"
              style={{
                height: HEADER_H,
                position: "sticky",
                top: 0,
                zIndex: 10,
                borderBottom: "2px solid var(--glass-border)",
                backgroundColor: "var(--surface-raised, var(--surface-sunken))",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="relative" style={{ width: totalWidth, height: HEADER_H }}>
                {/* Top row: months or quarters */}
                {headerCols.map((col, i) => (
                  <div
                    key={`top-${i}`}
                    className="absolute flex items-center justify-center text-[11px] font-semibold text-[var(--text-secondary)]"
                    style={{
                      left: col.left,
                      width: col.width,
                      top: 0,
                      height: HEADER_TOP,
                      borderRight: "1px solid var(--glass-border)",
                      borderBottom: "1px solid var(--glass-border)",
                    }}
                  >
                    {col.label}
                  </div>
                ))}
                {/* Bottom row: days or weeks */}
                {subHeaderCols.map((col, i) => (
                  <div
                    key={`sub-${i}`}
                    className="absolute flex items-center justify-center leading-tight"
                    style={{
                      left: col.left,
                      width: col.width,
                      top: HEADER_TOP,
                      height: HEADER_SUB,
                      borderRight: viewMode === "week" || (viewMode === "month" && col.label) ? "1px solid var(--glass-border)" : "none",
                      fontSize: viewMode === "week" ? 9 : 9,
                      fontWeight: 500,
                      color: col.isWeekend ? "var(--text-tertiary)" : "var(--text-secondary)",
                      backgroundColor: col.isWeekend ? "rgba(0,0,0,0.03)" : "transparent",
                      whiteSpace: "pre-line",
                      textAlign: "center",
                    }}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline body */}
            <div
              ref={timelineRef}
              className="overflow-x-auto"
              onScroll={onTimelineScroll}
              style={{ maxHeight: rows.length * ROW_H + 20 }}
            >
              <div className="relative" style={{ width: totalWidth, height: rows.length * ROW_H }}>
                {/* Weekend shading (week view) */}
                {viewMode === "week" && subHeaderCols.filter(c => c.isWeekend).map((col, i) => (
                  <div
                    key={`wkend-${i}`}
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      left: col.left,
                      width: col.width,
                      backgroundColor: "rgba(0,0,0,0.04)",
                    }}
                  />
                ))}

                {/* Column grid lines - dashed at each boundary */}
                {headerCols.map((col, i) => (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                      left: col.left + col.width,
                      width: 0,
                      borderLeft: "1px dashed var(--glass-border)",
                      opacity: 0.6,
                    }}
                  />
                ))}

                {/* Today column highlight */}
                {todayOffset >= 0 && todayOffset <= totalDays && (
                  <div
                    className="absolute top-0 bottom-0 z-[5] pointer-events-none"
                    style={{
                      left: todayOffset * dayWidth,
                      width: dayWidth,
                      backgroundColor: "rgba(220, 38, 38, 0.03)",
                    }}
                  />
                )}

                {/* Today line */}
                {todayOffset >= 0 && todayOffset <= totalDays && (
                  <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{
                      left: todayOffset * dayWidth + dayWidth / 2,
                      width: 2,
                      backgroundColor: "#DC2626",
                    }}
                  >
                    <div className="absolute -top-0 -left-[18px] bg-[#DC2626] text-white text-[9px] px-1.5 py-0.5 rounded-b font-medium">
                      Today
                    </div>
                  </div>
                )}

                {/* Dependency arrows (SVG) */}
                <svg className="absolute inset-0 pointer-events-none z-10" width={totalWidth} height={rows.length * ROW_H}>
                  {rows.map((row) => {
                    if (row.type !== "task" || !row.task?.dependsOn) return null;
                    return row.task.dependsOn.map((depId) => {
                      const fromIdx = taskRowIndex[depId];
                      const toIdx = taskRowIndex[row.task!.id];
                      if (fromIdx === undefined || toIdx === undefined) return null;

                      // Find dep task
                      const depTask = projects.flatMap((p) => p.tasks).find((t) => t.id === depId);
                      if (!depTask) return null;

                      const fromEnd = diffDays(rangeStart, toDate(depTask.end));
                      const toStart = diffDays(rangeStart, toDate(row.task!.start));

                      const x1 = fromEnd * dayWidth;
                      const y1 = fromIdx * ROW_H + ROW_H / 2;
                      const x2 = toStart * dayWidth;
                      const y2 = toIdx * ROW_H + ROW_H / 2;
                      const mx = (x1 + x2) / 2;

                      return (
                        <g key={`${depId}-${row.task!.id}`}>
                          <path
                            d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                            fill="none"
                            stroke="var(--text-tertiary)"
                            strokeWidth={1.5}
                            opacity={0.5}
                          />
                          <polygon
                            points={`${x2},${y2} ${x2 - 5},${y2 - 3} ${x2 - 5},${y2 + 3}`}
                            fill="var(--text-tertiary)"
                            opacity={0.5}
                          />
                        </g>
                      );
                    });
                  })}
                </svg>

                {/* Row backgrounds + task bars */}
                {rows.map((row, i) => {
                  if (row.type === "project") {
                    return (
                      <div
                        key={i}
                        className="absolute left-0 right-0"
                        style={{
                          top: i * ROW_H,
                          height: ROW_H,
                          width: totalWidth,
                          backgroundColor: "var(--surface-sunken)",
                          borderBottom: "1px solid var(--glass-border)",
                        }}
                      >
                        {/* Mobile: project label */}
                        <div className="md:hidden flex items-center h-full px-3">
                          <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.project.color }} />
                            {row.project.name}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const task = row.task!;
                  const taskStart = diffDays(rangeStart, toDate(task.start));
                  const taskEnd = diffDays(rangeStart, toDate(task.end));
                  const barLeft = taskStart * dayWidth;
                  const barWidth = Math.max((taskEnd - taskStart + 1) * dayWidth, 8);

                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0"
                      style={{
                        top: i * ROW_H,
                        height: ROW_H,
                        width: totalWidth,
                        borderBottom: "1px solid var(--glass-border)",
                        backgroundColor: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                      }}
                    >
                      <div
                        className="absolute top-[8px] z-10 cursor-pointer transition-all hover:brightness-110 group"
                        style={{
                          left: barLeft,
                          width: barWidth,
                          height: ROW_H - 16,
                          borderRadius: 4,
                          backgroundColor: STATUS_COLORS[task.status],
                          opacity: task.status === "pending" ? 0.5 : 0.85,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
                          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)",
                        }}
                        title={`${task.name}\n${task.assignee}\n${task.start} → ${task.end}\nStatus: ${task.status}`}
                      >
                        {/* Task name ON the bar */}
                        <span
                          className="text-[10px] text-white font-medium px-2 truncate block leading-[24px]"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                          }}
                        >
                          {barWidth > 30 ? task.name : ""}
                        </span>
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none">
                          <div className="glass rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--text-primary)] whitespace-nowrap shadow-lg">
                            <div className="font-semibold">{task.name}</div>
                            <div className="text-[var(--text-secondary)]">{task.assignee}</div>
                            <div className="text-[var(--text-tertiary)]">{task.start} → {task.end}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Milestones */}
                {milestones.map((ms) => {
                  const msDate = toDate(ms.date);
                  const offset = diffDays(rangeStart, msDate);
                  if (offset < 0 || offset > totalDays) return null;

                  // Find which project row
                  const projIdx = rows.findIndex((r) => r.type === "project" && r.project.id === ms.projectId);
                  if (projIdx < 0) return null;

                  return (
                    <div
                      key={ms.id}
                      className="absolute z-30 group cursor-pointer"
                      style={{
                        left: offset * dayWidth - 8,
                        top: projIdx * ROW_H + 8,
                      }}
                      title={`${ms.name}\n${ms.date}`}
                    >
                      <Diamond
                        size={16}
                        className="text-[var(--accent-warning)] drop-shadow-sm"
                        fill="var(--accent-warning)"
                      />
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none">
                        <div className="glass rounded-lg px-2.5 py-1.5 text-[10px] text-[var(--text-primary)] whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{ms.name}</div>
                          <div className="text-[var(--text-tertiary)]">{ms.date}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: projects.reduce((a, p) => a + p.tasks.length, 0), icon: Clock },
          { label: "Completed", value: projects.flatMap((p) => p.tasks).filter((t) => t.status === "completed").length, color: STATUS_COLORS.completed },
          { label: "Active", value: projects.flatMap((p) => p.tasks).filter((t) => t.status === "active").length, color: STATUS_COLORS.active },
          { label: "Blocked", value: projects.flatMap((p) => p.tasks).filter((t) => t.status === "blocked").length, color: STATUS_COLORS.blocked },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1">
              {"color" in s && s.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />}
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
