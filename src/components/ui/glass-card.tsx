"use client";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", hover, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`glass ${hover ? "cursor-pointer" : ""} ${className}`}
      style={{ padding: "16px" }}
    >
      {children}
    </motion.div>
  );
}
