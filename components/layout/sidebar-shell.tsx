"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  const [isHovering, setIsHovering] = useState(false);
  const open = isDashboard || isHovering;

  return (
    <SidebarProvider open={open}>
      <Sidebar
        onMouseEnter={() => !isDashboard && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
      {children}
    </SidebarProvider>
  );
}
