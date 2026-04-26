import { Bell, CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">Buongiorno, Valerio</p>
          <h1 className="truncate text-xl font-semibold tracking-normal sm:text-2xl">Gestione laboratorio</h1>
        </div>
        <div className="hidden w-full max-w-sm items-center gap-2 rounded-md border bg-white px-3 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input className="border-0 px-0 shadow-none focus-visible:ring-0" placeholder="Cerca clienti, lavori, pagamenti" />
        </div>
        <Button variant="outline" size="icon" aria-label="Calendario">
          <CalendarDays className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Notifiche">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
