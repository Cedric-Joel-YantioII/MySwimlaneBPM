"use client";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 shadow-sm",
  secondary: "glass hover:bg-[var(--glass-bg-hover)] text-[var(--text-primary)]",
  danger: "bg-[var(--accent-danger)] text-white hover:bg-[var(--accent-danger)]/90",
  ghost: "hover:bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

export function GlassButton({ children, variant = "secondary", size = "md", disabled, onClick, className = "", type = "button" }: GlassButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
