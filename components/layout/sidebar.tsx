"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
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
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-stone-900 lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-stone-800 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-700 text-white">
          <Scissors className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Gestionale Sartoria</p>
          <p className="text-xs text-stone-400">Laboratorio sartoriale</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-700 text-white shadow-sm"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
