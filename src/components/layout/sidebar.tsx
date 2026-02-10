"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GitBranch, CheckSquare, FileText, Bot, Users, BarChart3,
  Settings, ChevronLeft, ChevronRight, Menu, X, Bell, Plus, Sun, Moon, MessageSquare,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workflows", icon: GitBranch, label: "Workflows" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/agents", icon: Bot, label: "AI Agents" },
  { href: "/agents/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/people", icon: Users, label: "People" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (current) setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return { theme, toggle };
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
              <GitBranch size={16} className="text-white" />
            </div>
            <span className="font-semibold text-[var(--text-primary)] text-sm">EvalFlow</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center mx-auto">
            <GitBranch size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md hover:bg-[var(--surface-sunken)] text-[var(--text-tertiary)]"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-1">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full
            text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
        </button>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
            ${isActive("/settings")
              ? "bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
            }
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen glass z-40 transition-all duration-200
          ${collapsed ? "w-16" : "w-60"}
        `}
        style={{ borderRadius: 0, borderLeft: "none", borderTop: "none", borderBottom: "none" }}
      >
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass flex items-center justify-between px-4 h-14"
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-[var(--text-primary)]">
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
            <GitBranch size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[var(--text-primary)] text-sm">EvalFlow</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)]">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="p-2 text-[var(--text-secondary)]"><Bell size={18} /></button>
          <Link href="/tasks" className="p-2 text-[var(--accent-primary)]"><Plus size={18} /></Link>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 glass flex flex-col"
            style={{ borderRadius: 0, borderLeft: "none", borderTop: "none", borderBottom: "none" }}>
            <div className="flex justify-end p-2">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-[var(--text-secondary)]">
                <X size={18} />
              </button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Desktop spacer */}
      <div className={`hidden lg:block flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`} />
    </>
  );
}
