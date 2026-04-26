import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const metadata: Metadata = {
  title: "Pants Manager",
  description: "Gestionale per laboratorio artigianale di pantaloni"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <Sidebar />
        <div className="min-h-screen pb-20 lg:pl-72 lg:pb-0">
          <Topbar />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
