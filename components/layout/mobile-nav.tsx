"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CreditCard, LayoutDashboard, Menu, Users } from "lucide-react";
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white px-3 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground",
                active && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
        <Link
          href="/impostazioni"
          className={cn(
            "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground",
            pathname === "/impostazioni" && "bg-primary text-primary-foreground"
          )}
        >
          <Menu className="h-4 w-4" />
          Altro
        </Link>
      </div>
    </div>
  );
}
