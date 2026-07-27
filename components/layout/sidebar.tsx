"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Scissors,
  Settings,
  User,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clienti", href: "/clienti", icon: Users },
  { name: "Lavori", href: "/lavori", icon: BriefcaseBusiness },
  { name: "Magazzino", href: "/magazzino", icon: Package },
  { name: "Pagamenti", href: "/pagamenti", icon: CreditCard },
  { name: "Statistiche", href: "/statistiche", icon: BarChart3 },
  { name: "Impostazioni", href: "/impostazioni", icon: Settings }
];

export function Sidebar(props: React.ComponentProps<typeof SidebarPrimitive>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <SidebarPrimitive
      {...props}
      collapsible="icon"
      className={cn(
        "border-r-0 [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:bg-stone-900",
        props.className
      )}
    >
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
      <SidebarHeader className="relative h-[64px] justify-center border-b border-white/[0.06] px-4 py-0 group-data-[collapsible=icon]:px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-900/40">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-white">
              Gestionale Sartoria
            </p>
            <p className="mt-0.5 text-[11px] text-white/35">Laboratorio sartoriale</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="relative px-3 py-3">
        <SidebarMenu className="gap-0.5">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.name}
                  className={cn(
                    "h-9 gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-white/45 transition-all duration-150 hover:bg-white/[0.06] hover:text-white/80",
                    "data-[active=true]:bg-transparent data-[active=true]:text-white",
                    active && "sidebar-active"
                  )}
                >
                  <Link href={item.href}>
                    {/* Left glow indicator for active */}
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.6)] group-data-[collapsible=icon]:hidden" />
                    )}

                    <Icon
                      className={cn(
                        "h-[15px] w-[15px] shrink-0 transition-colors duration-150",
                        active ? "text-white" : "text-white/35 group-hover/menu-item:text-white/65"
                      )}
                    />
                    <span className="flex-1">{item.name}</span>

                    {active && (
                      <ChevronRight className="h-3 w-3 shrink-0 text-white/40 group-data-[collapsible=icon]:hidden" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Utente + Logout */}
      <SidebarFooter className="relative border-t border-stone-700 px-3 py-4">
        <div className="mb-3 flex items-center gap-2 px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <User className="h-4 w-4 shrink-0 text-stone-400" />
          <span className="truncate text-sm text-stone-400 group-data-[collapsible=icon]:hidden">
            {session?.user?.name ?? ""}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Esci</span>
        </button>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
