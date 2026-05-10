"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CreditCard, LayoutDashboard, MoreHorizontal, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Clienti", href: "/clienti", icon: Users },
  { name: "Lavori", href: "/lavori", icon: BriefcaseBusiness },
  { name: "Pagamenti", href: "/pagamenti", icon: CreditCard }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
      {/* Frosted glass background */}
      <div className="absolute inset-0 border-t border-white/60 bg-white/85 backdrop-blur-xl backdrop-saturate-150" />

      <div className="relative grid grid-cols-5 gap-0.5 px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-150",
                active
                  ? "bg-amber-700 text-white shadow-sm shadow-amber-900/25"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              <Icon className="h-[17px] w-[17px]" />
              {item.name}
            </Link>
          );
        })}

        <Link
          href="/impostazioni"
          className={cn(
            "flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-150",
            pathname === "/impostazioni"
              ? "bg-amber-700 text-white shadow-sm shadow-amber-900/25"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          <MoreHorizontal className="h-[17px] w-[17px]" />
          Altro
        </Link>
      </div>
    </div>
  );
}
