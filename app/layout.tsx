import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pants Manager",
  description: "Gestionale per laboratorio artigianale di pantaloni"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
