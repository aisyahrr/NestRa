import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Database, BarChart3, GitCompareArrows, X, Menu, Map } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Data Kost", to: "/data-kost", icon: Database },
  { title: "Peta Kost", to: "/peta", icon: Map },
  { title: "Analisis SPK", to: "/analisis", icon: BarChart3 },
  { title: "Perbandingan", to: "/perbandingan", icon: GitCompareArrows },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const nav = (
    <nav className="flex flex-col gap-1 p-4 h-full">
      <div className="px-2 py-4 mb-4">
        <h1 className="font-heading text-3xl font-black text-sidebar-foreground tracking-tight leading-none">
          Kost<br /><span className="italic">SPK</span><span className="text-primary">.</span>
        </h1>
        <p className="font-hand text-foreground/60 mt-2 text-lg">find your nest ✦</p>
      </div>
      {navItems.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to as string}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
              active
                ? "bg-primary text-foreground border-2 border-foreground shadow-[3px_3px_0_0_var(--color-border)]"
                : "text-sidebar-foreground hover:bg-sidebar-accent border-2 border-transparent"
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r-[2.5px] border-sidebar-border bg-sidebar shrink-0">
        {nav}
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-16 left-6 z-50 md:hidden rounded-full bg-primary p-2 text-foreground nb-border-thin nb-shadow-sm"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-60 h-full bg-sidebar border-r border-sidebar-border md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <X size={20} />
              </button>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
