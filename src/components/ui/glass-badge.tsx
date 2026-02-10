"use client";

type Variant = "blue" | "green" | "orange" | "purple" | "red" | "gray";

const colors: Record<Variant, string> = {
  blue: "bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
  green: "bg-[var(--accent-secondary)]/12 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/20",
  orange: "bg-[var(--accent-warning)]/12 text-[var(--accent-warning)] border-[var(--accent-warning)]/20",
  purple: "bg-[var(--accent-purple)]/12 text-[var(--accent-purple)] border-[var(--accent-purple)]/20",
  red: "bg-[var(--accent-danger)]/12 text-[var(--accent-danger)] border-[var(--accent-danger)]/20",
  gray: "bg-[var(--surface-sunken)] text-[var(--text-secondary)] border-[var(--glass-border)]",
};

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

export function GlassBadge({ children, variant = "gray", dot, className = "" }: GlassBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
