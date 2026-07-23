"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NotifichePanel,
  MiniCalendario,
  BellBadge,
  type Notifica,
  type CalendarioGiorno,
} from "@/components/layout/notifiche-dropdown";
import { LavoroDetailModal } from "@/components/lavori/lavoro-detail-modal";

export function Topbar() {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [calendario, setCalendario] = useState<CalendarioGiorno[]>([]);
  const [loading, setLoading] = useState(true);
  const [pannelloAperto, setPannelloAperto] = useState<"campanella" | "calendario" | null>(null);
  const [lavoroApertoId, setLavoroApertoId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function caricaNotifiche() {
      try {
        setLoading(true);
        const res = await fetch("/api/notifiche");
        if (!res.ok) throw new Error("Errore nel caricamento delle notifiche");
        const json = await res.json();
        setNotifiche(json.notifiche ?? []);
        setCalendario(json.calendario ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    caricaNotifiche();
  }, []);

  useEffect(() => {
    if (!pannelloAperto) return;

    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPannelloAperto(null);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setPannelloAperto(null);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [pannelloAperto]);

  const countAlta = notifiche.filter((n) => n.severita === "alta").length;

  function apriLavoro(id: string) {
    setPannelloAperto(null);
    setLavoroApertoId(id);
  }

  async function dismissNotifiche(ids: string[]) {
    setNotifiche((prev) => prev.filter((n) => !ids.includes(n.id)));
    try {
      await fetch("/api/notifiche/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificaIds: ids }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/82 backdrop-blur-xl backdrop-saturate-150">
      {/* Top micro-border highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />

      <div className="flex min-h-[60px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Title area */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/55">
            Buongiorno, Valerio
          </p>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.025em] text-foreground sm:text-lg">
            Gestione laboratorio
          </h1>
        </div>

        {/* Search */}
        <div className="hidden w-full max-w-[260px] md:flex">
          <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 transition-all duration-150 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <Input
              className="h-auto border-0 bg-transparent p-0 text-[13px] shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
              placeholder="Cerca cliente, lavoro..."
            />
          </div>
        </div>

        {/* Action buttons */}
        <div ref={containerRef} className="flex items-center gap-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
              aria-label="Calendario"
              onClick={() => setPannelloAperto((p) => (p === "calendario" ? null : "calendario"))}
            >
              <CalendarDays className="h-[15px] w-[15px]" />
            </Button>

            {pannelloAperto === "calendario" && (
              <div className="absolute right-0 top-full z-20 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
                <MiniCalendario
                  calendario={calendario}
                  onApriLavoro={apriLavoro}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
              aria-label="Notifiche"
              onClick={() => setPannelloAperto((p) => (p === "campanella" ? null : "campanella"))}
            >
              <Bell className="h-[15px] w-[15px]" />
            </Button>
            <BellBadge count={countAlta} />

            {pannelloAperto === "campanella" && (
              <div className="absolute right-0 top-full z-20 mt-2 w-[26rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
                <NotifichePanel
                  notifiche={notifiche}
                  loading={loading}
                  onApriLavoro={apriLavoro}
                  onDismiss={(id) => dismissNotifiche([id])}
                  onDismissAll={() => dismissNotifiche(notifiche.map((n) => n.id))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <LavoroDetailModal projectId={lavoroApertoId} onClose={() => setLavoroApertoId(null)} />
    </header>
  );
}
