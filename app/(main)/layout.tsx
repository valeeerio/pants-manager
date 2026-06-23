import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen pb-20 lg:pl-64 lg:pb-0">
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <MobileNav />
    </>
  );
}
