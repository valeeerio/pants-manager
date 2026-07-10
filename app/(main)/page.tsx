"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scissors, CalendarCheck, Banknote, Users, Bell, ArrowRight } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Topbar } from "@/components/layout/topbar";
import { NotificationBanner } from "@/components/ui/notification-banner";

const icons = [Scissors, CalendarCheck, Banknote, Users];

const MESI_IT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

function formatDataIt(iso: string | null): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${d} ${MESI_IT[m - 1]} ${y}`;
}

function formatEur(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

type LavoroRecente = {
  id: string;
  code: string;
  clientName: string;
  type: string;
  status: string;
  statusRaw: string;
  dueDate: string | null;
  price: number | null;
};

type Scadenza = {
  id: string;
  code: string;
  clientName: string;
  dueDate: string | null;
  status: string;
  statusRaw: string;
};

type DistribuzioneTipo = {
  typeRaw: string;
  type: string;
  count: number;
  percentuale: number;
};

type DashboardData = {
  kpi: {
    lavoriAttivi: number;
    consegneOggi: number;
    daIncassare: number;
    clientiTotali: number;
  };
  lavoriRecenti: LavoroRecente[];
  scadenzeSettimana: Scadenza[];
  distribuzioneTipi: DistribuzioneTipo[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  useEffect(() => {
    async function caricaDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Errore nel caricamento della dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: "Impossibile caricare i dati della dashboard. Riprova." });
      } finally {
        setLoading(false);
      }
    }
    caricaDashboard();
  }, []);

  const metrics = data
    ? [
        { label: "Lavori attivi", value: String(data.kpi.lavoriAttivi), change: "In corso al laboratorio" },
        { label: "Consegne oggi", value: String(data.kpi.consegneOggi), change: "Da consegnare entro oggi" },
        { label: "Da incassare", value: formatEur(data.kpi.daIncassare), change: "Lavori non ancora pagati" },
        { label: "Clienti registrati", value: String(data.kpi.clientiTotali), change: "Totale anagrafica" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      <div className="-mx-4 -mt-6 mb-6 sm:-mx-6 lg:-mx-8">
        <Topbar />
      </div>

      <PageHeader
        title="Dashboard"
        description="Riepilogo dei lavori, consegne e pagamenti del laboratorio."
        actions={
          <Button className="bg-amber-700 text-white shadow-sm shadow-amber-900/25 hover:bg-amber-800 hover:shadow-amber-glow active:scale-[0.98]">
            Nuovo lavoro
          </Button>
        }
      />

      {/* Sezione 1 — 4 metric cards con TiltCard 3D */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !data
          ? icons.map((Icon, index) => (
              <MetricCard key={index} label="—" value="—" change="Caricamento…" icon={Icon} />
            ))
          : metrics.map((metric, index) => {
              const Icon = icons[index];
              return (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  change={metric.change}
                  icon={Icon}
                />
              );
            })}
      </section>

      {/* Sezione 2 — Tabella lavori + Scadenze */}
      <section className="grid gap-3.5 xl:grid-cols-[1.85fr_1fr]">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-[13px] font-semibold text-slate-800">Lavori recenti</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Codice
                  </TableHead>
                  <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Cliente
                  </TableHead>
                  <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Lavorazione
                  </TableHead>
                  <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Stato
                  </TableHead>
                  <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Scadenza
                  </TableHead>
                  <TableHead className="py-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Importo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                      <p className="text-sm">Caricamento lavori…</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && data?.lavoriRecenti.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                      <p className="text-sm">Nessun lavoro recente.</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  data?.lavoriRecenti.map((job) => (
                    <TableRow
                      key={job.id}
                      className="border-b border-slate-100/60 transition-colors hover:bg-slate-50/60"
                    >
                      <TableCell className="px-5 py-3 font-mono text-[12px] font-semibold text-slate-600">
                        {job.code}
                      </TableCell>
                      <TableCell className="py-3 text-[13px] font-medium text-slate-800">
                        {job.clientName}
                      </TableCell>
                      <TableCell className="min-w-44 py-3 text-[13px] text-slate-600">{job.type}</TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="py-3 text-[12px] text-slate-500">
                        {formatDataIt(job.dueDate)}
                      </TableCell>
                      <TableCell className="py-3 pr-5 text-right text-[13px] font-semibold text-slate-800">
                        {formatEur(job.price)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <div className="border-t border-slate-100 px-5 py-3">
              <Link
                href="/lavori"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 transition-colors hover:text-amber-800"
              >
                Vedi tutti i lavori
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>In scadenza questa settimana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {loading && <p className="px-1 py-4 text-[13px] text-slate-400">Caricamento…</p>}
            {!loading && data?.scadenzeSettimana.length === 0 && (
              <p className="px-1 py-4 text-[13px] text-slate-400">Nessuna scadenza nei prossimi 7 giorni.</p>
            )}
            {!loading &&
              data?.scadenzeSettimana.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start justify-between gap-3 rounded-lg border border-slate-100/80 bg-slate-50/50 px-3 py-2.5 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-800">{item.clientName}</p>
                    <p className="truncate text-[11px] text-slate-400 mt-0.5">{item.code}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[11px] font-semibold text-amber-700">{formatDataIt(item.dueDate)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>

      {/* Sezione 3 — Tipologie di produzione */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {(loading ? [] : data?.distribuzioneTipi ?? []).map((item) => (
          <Card key={item.typeRaw} className="group">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-600">{item.type}</span>
                <span className="text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                  {item.percentuale}
                  <span className="text-sm font-medium text-slate-400">%</span>
                </span>
              </div>
              {/* Track */}
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${item.percentuale}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Sezione 4 — Promemoria premium */}
      <Card className="border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200/60">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-amber-900">Promemoria</p>
            <p className="text-[12px] text-amber-800/70 mt-0.5">
              {loading
                ? "Caricamento…"
                : `${data?.kpi.consegneOggi ?? 0} consegn${data?.kpi.consegneOggi === 1 ? "a prevista" : "e previste"} oggi`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
