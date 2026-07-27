"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { NotificationBanner } from "@/components/ui/notification-banner";

type PosizionePannello = { top: number; right: number };

export function Topbar() {
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [calendario, setCalendario] = useState<CalendarioGiorno[]>([]);
  const [loading, setLoading] = useState(true);
  const [pannelloAperto, setPannelloAperto] = useState<"campanella" | "calendario" | null>(null);
  const [posizionePannello, setPosizionePannello] = useState<PosizionePannello | null>(null);
  const [lavoroApertoId, setLavoroApertoId] = useState<string | null>(null);
  const [erroreDismiss, setErroreDismiss] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarioBtnRef = useRef<HTMLButtonElement>(null);
  const notificheBtnRef = useRef<HTMLButtonElement>(null);
  const pannelloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function caricaNotifiche() {
      try {
        setLoading(true);
        const res = await fetch("/api/notifiche", { signal: controller.signal });
        if (!res.ok) throw new Error("Errore nel caricamento delle notifiche");
        const json = await res.json();
        setNotifiche(json.notifiche ?? []);
        setCalendario(json.calendario ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    caricaNotifiche();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!pannelloAperto) return;

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        (!containerRef.current || !containerRef.current.contains(target)) &&
        (!pannelloRef.current || !pannelloRef.current.contains(target))
      ) {
        setPannelloAperto(null);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setPannelloAperto(null);
    }
    function onRicalcolaPosizione() {
      const btn = pannelloAperto === "calendario" ? calendarioBtnRef.current : notificheBtnRef.current;
      const rect = btn?.getBoundingClientRect();
      if (rect) setPosizionePannello({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", onRicalcolaPosizione);
    window.addEventListener("scroll", onRicalcolaPosizione, true);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", onRicalcolaPosizione);
      window.removeEventListener("scroll", onRicalcolaPosizione, true);
    };
  }, [pannelloAperto]);

  const countAlta = notifiche.filter((n) => n.severita === "alta").length;

  function apriLavoro(id: string) {
    setPannelloAperto(null);
    setLavoroApertoId(id);
  }

  function togglePannello(tipo: "campanella" | "calendario", btnRef: React.RefObject<HTMLButtonElement | null>) {
    setPannelloAperto((p) => {
      if (p === tipo) return null;
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) setPosizionePannello({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      return tipo;
    });
  }

  async function dismissNotifiche(ids: string[]) {
    const notificheRimosse = notifiche.filter((n) => ids.includes(n.id));
    setNotifiche((prev) => prev.filter((n) => !ids.includes(n.id)));
    try {
      const res = await fetch("/api/notifiche/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificaIds: ids }),
      });
      if (!res.ok) throw new Error("Errore nella rimozione delle notifiche");
    } catch (err) {
      console.error(err);
      setNotifiche((prev) => {
        const idsPresenti = new Set(prev.map((n) => n.id));
        const daRipristinare = notificheRimosse.filter((n) => !idsPresenti.has(n.id));
        return [...prev, ...daRipristinare];
      });
      setErroreDismiss("Impossibile rimuovere la notifica. Riprova.");
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
              ref={calendarioBtnRef}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
              aria-label="Calendario"
              onClick={() => togglePannello("calendario", calendarioBtnRef)}
            >
              <CalendarDays className="h-[15px] w-[15px]" />
            </Button>
          </div>

          <div className="relative">
            <Button
              ref={notificheBtnRef}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
              aria-label="Notifiche"
              onClick={() => togglePannello("campanella", notificheBtnRef)}
            >
              <Bell className="h-[15px] w-[15px]" />
            </Button>
            <BellBadge count={countAlta} />
          </div>
        </div>
      </div>

      {pannelloAperto && posizionePannello &&
        createPortal(
          <div
            ref={pannelloRef}
            style={{ top: posizionePannello.top, right: posizionePannello.right }}
            className={`fixed z-[100] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg ${
              pannelloAperto === "calendario" ? "w-96" : "w-[26rem]"
            }`}
          >
            {pannelloAperto === "calendario" ? (
              <MiniCalendario calendario={calendario} onApriLavoro={apriLavoro} />
            ) : (
              <NotifichePanel
                notifiche={notifiche}
                loading={loading}
                onApriLavoro={apriLavoro}
                onDismiss={(id) => dismissNotifiche([id])}
                onDismissAll={() => dismissNotifiche(notifiche.map((n) => n.id))}
              />
            )}
          </div>,
          document.body
        )}

      {erroreDismiss && (
        <NotificationBanner
          type="error"
          message={erroreDismiss}
          onDismiss={() => setErroreDismiss(null)}
        />
      )}

      <LavoroDetailModal projectId={lavoroApertoId} onClose={() => setLavoroApertoId(null)} />
    </header>
  );
}
