import { Bell, CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
            aria-label="Calendario"
          >
            <CalendarDays className="h-[15px] w-[15px]" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground/70 hover:bg-slate-100 hover:text-foreground"
              aria-label="Notifiche"
            >
              <Bell className="h-[15px] w-[15px]" />
            </Button>
            {/* Notification dot */}
            <span className="animate-pulse-dot absolute right-1.5 top-1.5 h-[6px] w-[6px] rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.6)]" />
          </div>
        </div>
      </div>
    </header>
  );
}
