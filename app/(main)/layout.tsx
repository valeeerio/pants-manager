import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { Topbar } from "@/components/layout/topbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarShell>
      <div className="flex min-h-screen w-full flex-col pb-20 lg:pb-0">
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <MobileNav />
    </SidebarShell>
  );
}
