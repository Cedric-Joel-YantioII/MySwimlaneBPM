"use client";

interface GlassProgressProps {
  value: number;
  variant?: "blue" | "green" | "orange" | "red";
  size?: "sm" | "md";
  className?: string;
}

const barColors = {
  blue: "bg-[var(--accent-primary)]",
  green: "bg-[var(--accent-secondary)]",
  orange: "bg-[var(--accent-warning)]",
  red: "bg-[var(--accent-danger)]",
};

export function GlassProgress({ value, variant = "blue", size = "md", className = "" }: GlassProgressProps) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full ${h} rounded-full bg-[var(--surface-sunken)] overflow-hidden ${className}`}>
      <div
        className={`${h} rounded-full ${barColors[variant]} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
