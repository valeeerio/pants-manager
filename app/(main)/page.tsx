"use client";

import { useEffect, useState } from "react";
import { Scissors, CalendarCheck, Banknote, Wallet } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  KpiModals,
  type KpiModalTipo,
  type DettaglioAttivi,
  type Consegne,
  type DaIncassareRiga,
  type PagamentoMese,
} from "@/components/dashboard/kpi-modals";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { LavoroDetailModal } from "@/components/lavori/lavoro-detail-modal";

const icons = [Scissors, CalendarCheck, Banknote, Wallet];

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

function classeUrgenza(iso: string | null): string {
  if (!iso) return "text-slate-700";
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const scadenza = new Date(iso + "T00:00:00");
  const giorni = Math.round((scadenza.getTime() - oggi.getTime()) / 86400000);
  if (giorni <= 0) return "text-red-600";
  if (giorni <= 3) return "text-amber-700";
  return "text-slate-700";
}

type ProssimaScadenza = {
  id: string;
  code: string;
  clientName: string;
  type: string;
  status: string;
  statusRaw: string;
  dueDate: string | null;
  price: number | null;
};

function giorniDa(iso: string): number {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const inizio = new Date(iso + "T00:00:00");
  return Math.max(0, Math.round((oggi.getTime() - inizio.getTime()) / 86400000));
}

const PAGAMENTO_BADGE: Record<string, { label: string; className: string }> = {
  DEPOSIT_PAID: { label: "Acconto", className: "bg-amber-50 text-amber-700 border-amber-200" },
  UNPAID: { label: "Da pagare", className: "bg-stone-50 text-stone-600 border-stone-200" },
};

type ProntoDaRitirare = {
  id: string;
  code: string;
  clientName: string;
  type: string;
  price: number | null;
  prontoDa: string;
  pagamento: "DEPOSIT_PAID" | "UNPAID";
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
    lavoriInLavorazione: number;
    consegneSettimana: number;
    lavoriDaSaldare: number;
    clientiNuoviMese: number;
    incassatoMese: number;
  };
  scaduti: ProssimaScadenza[];
  inArrivo: ProssimaScadenza[];
  prontiDaRitirare: ProntoDaRitirare[];
  distribuzioneTipi: DistribuzioneTipo[];
  dettaglioAttivi: DettaglioAttivi;
  consegne: Consegne;
  daIncassareLista: DaIncassareRiga[];
  incassatoMeseLista: PagamentoMese[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [lavoroApertoId, setLavoroApertoId] = useState<string | null>(null);
  const [kpiModalAperto, setKpiModalAperto] = useState<KpiModalTipo | null>(null);

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

  useEffect(() => {
    caricaDashboard();
  }, []);

  function renderRigaLavoro(job: ProssimaScadenza, scaduto: boolean) {
    return (
      <TableRow
        key={job.id}
        onClick={() => setLavoroApertoId(job.id)}
        className={`cursor-pointer border-b border-slate-100/60 transition-colors ${
          scaduto ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50/60"
        }`}
      >
        <TableCell className="px-5 py-3 font-mono text-[12px] font-normal text-slate-400">
          {job.code}
        </TableCell>
        <TableCell className="py-3 text-[13px] font-semibold text-slate-800">
          {job.clientName}
        </TableCell>
        <TableCell className="min-w-44 py-3 text-[13px] text-slate-600">{job.type}</TableCell>
        <TableCell className="py-3">
          <StatusBadge status={job.status} />
        </TableCell>
        <TableCell className={`py-3 text-[13px] font-semibold ${classeUrgenza(job.dueDate)}`}>
          {formatDataIt(job.dueDate)}
        </TableCell>
        <TableCell className="py-3 pr-5 text-right text-[13px] font-semibold text-slate-800">
          {formatEur(job.price)}
        </TableCell>
      </TableRow>
    );
  }

  const metrics = data
    ? [
        {
          label: "Lavori attivi",
          value: String(data.kpi.lavoriAttivi),
          change: `${data.kpi.lavoriInLavorazione} in lavorazione`,
          tipo: "attivi" as const,
        },
        {
          label: "Consegne oggi",
          value: String(data.kpi.consegneOggi),
          change: `${data.kpi.consegneSettimana} nei prossimi 7 giorni`,
          tipo: "consegne" as const,
        },
        {
          label: "Da incassare",
          value: formatEur(data.kpi.daIncassare),
          change: `${data.kpi.lavoriDaSaldare} lavori da saldare`,
          tipo: "incassare" as const,
        },
        {
          label: "Incassato questo mese",
          value: formatEur(data.kpi.incassatoMese),
          change: `${data.incassatoMeseLista.length} pagamenti registrati`,
          tipo: "incassato" as const,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-3rem-61px)]">
      {notification && (
        <div className="shrink-0">
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onDismiss={() => setNotification(null)}
          />
        </div>
      )}

      <div className="shrink-0">
        <PageHeader
          title="Dashboard"
          description="Riepilogo dei lavori, consegne e pagamenti del laboratorio."
        />
      </div>

      {/* Sezione 1 — 4 metric cards */}
      <section className="grid shrink-0 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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
                  onClick={() => setKpiModalAperto(metric.tipo)}
                />
              );
            })}
      </section>

      {/* Sezione 2 — Tabella lavori + Scadenze */}
      <section className="grid gap-3.5 xl:grid-cols-[1.85fr_1fr] lg:flex-1 lg:min-h-0">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-0">
            <CardTitle className="text-[13px] font-semibold text-slate-800">Prossime scadenze</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
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
                {!loading && data?.scaduti.length === 0 && data?.inArrivo.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                      <p className="text-sm">Nessuna scadenza in programma.</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && data && data.scaduti.length > 0 && (
                  <>
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="bg-red-50/60 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-700"
                      >
                        Scaduti · {data.scaduti.length}
                      </TableCell>
                    </TableRow>
                    {data.scaduti.map((j) => renderRigaLavoro(j, true))}
                  </>
                )}
                {!loading && data && data.scaduti.length > 0 && data.inArrivo.length > 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-3 border-0 p-0" />
                  </TableRow>
                )}
                {!loading && data && data.inArrivo.length > 0 && (
                  <>
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Prossime consegne
                      </TableCell>
                    </TableRow>
                    {data.inArrivo.map((j) => renderRigaLavoro(j, false))}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-3">
            <CardTitle className="text-[13px] font-semibold text-slate-800">
              Pronti da ritirare
              {!loading && data && data.prontiDaRitirare.length > 0 && (
                <span className="text-slate-400"> · {data.prontiDaRitirare.length}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="space-y-2">
              {loading && <p className="px-1 py-4 text-[13px] text-slate-400">Caricamento…</p>}
              {!loading && data?.prontiDaRitirare.length === 0 && (
                <p className="px-1 py-4 text-[13px] text-slate-400">Nessun lavoro in attesa di ritiro.</p>
              )}
              {!loading &&
                data?.prontiDaRitirare.map((item) => {
                  const giorni = giorniDa(item.prontoDa);
                  const badge = PAGAMENTO_BADGE[item.pagamento];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLavoroApertoId(item.id)}
                      className="group flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-slate-100/80 bg-slate-50/50 px-3 py-2.5 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-slate-800">{item.clientName}</p>
                        <p className="truncate text-[11px] text-slate-400 mt-0.5">
                          {item.code} · {item.type}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={`text-[11px] font-medium ${giorni >= 7 ? "text-amber-700" : "text-slate-500"}`}
                        >
                          {giorni === 0 ? "Pronto oggi" : `Pronto da ${giorni} giorn${giorni === 1 ? "o" : "i"}`}
                        </span>
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                        >
                          {badge.label}
                          {item.price != null && ` · ${formatEur(item.price)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </section>

      <KpiModals
        tipo={kpiModalAperto}
        dettaglioAttivi={data?.dettaglioAttivi ?? null}
        consegne={data?.consegne ?? null}
        daIncassareLista={data?.daIncassareLista ?? null}
        incassatoMeseLista={data?.incassatoMeseLista ?? null}
        totaleDaIncassare={data?.kpi.daIncassare ?? 0}
        totaleIncassato={data?.kpi.incassatoMese ?? 0}
        onClose={() => setKpiModalAperto(null)}
        onApriLavoro={(id) => {
          setKpiModalAperto(null);
          setLavoroApertoId(id);
        }}
      />

      <LavoroDetailModal
        projectId={lavoroApertoId}
        onClose={() => {
          setLavoroApertoId(null);
          caricaDashboard();
        }}
      />
    </div>
  );
}
