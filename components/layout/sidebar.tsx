"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Scissors,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clienti", href: "/clienti", icon: Users },
  { name: "Lavori", href: "/lavori", icon: BriefcaseBusiness },
  { name: "Pagamenti", href: "/pagamenti", icon: CreditCard },
  { name: "Statistiche", href: "/statistiche", icon: BarChart3 },
  { name: "Impostazioni", href: "/impostazioni", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#111214] lg:flex">
      {/* Top shimmer line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-700/25 to-transparent" />

      {/* Subtle grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Logo header */}
      <div className="relative flex h-[64px] items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-900/40">
          <Scissors className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-white">
            Gestionale Sartoria
          </p>
          <p className="text-[11px] text-white/35 mt-0.5">Laboratorio sartoriale</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-all duration-150",
                active
                  ? "sidebar-active text-white"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              {/* Left glow indicator for active */}
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              )}

              <Icon
                className={cn(
                  "h-[15px] w-[15px] shrink-0 transition-colors duration-150",
                  active ? "text-white" : "text-white/35 group-hover:text-white/65"
                )}
              />
              <span className="flex-1">{item.name}</span>

              {active && (
                <ChevronRight className="h-3 w-3 shrink-0 text-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom footer */}
      <div className="relative border-t border-white/[0.06] px-4 py-3">
        <p className="text-[11px] text-white/20">Gestionale Sartoria · v1.0</p>
      </div>
    </aside>
  );
}
