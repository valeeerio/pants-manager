"use client";

import { useEffect, useState } from "react";
import { Clock, Package, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { RicaviGiornoChart } from "@/components/statistiche/ricavi-giorno-chart";
import { MixLavorazioniChart } from "@/components/statistiche/mix-lavorazioni-chart";

type RicavoGiorno = {
  date: string;
  giorno: string;
  totale: number;
};

type MixLavorazione = {
  typeRaw: string;
  type: string;
  count: number;
  percentuale: number;
};

type StatisticheData = {
  ricaviPerGiorno: RicavoGiorno[];
  mixLavorazioni: MixLavorazione[];
  kpi: {
    tempoMedioModificaGiorni: number | null;
    consegnePuntualiPercentuale: number | null;
    lavoriCompletatiMese: number;
  };
};

export default function StatsPage() {
  const [data, setData] = useState<StatisticheData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistiche() {
      try {
        const res = await fetch("/api/statistiche");
        if (!res.ok) throw new Error("Risposta non valida");
        const json: StatisticheData = await res.json();
        setData(json);
      } catch {
        setError("Non è stato possibile caricare le statistiche. Riprova tra un attimo.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatistiche();
  }, []);

  const kpi = data?.kpi;

  const kpiCards = [
    {
      label: "Tempo medio modifica",
      value:
        kpi?.tempoMedioModificaGiorni != null
          ? `${kpi.tempoMedioModificaGiorni.toString().replace(".", ",")} giorni`
          : "—",
      icon: Clock,
      detail: "Su ultimi 30 lavori completati",
    },
    {
      label: "Consegne puntuali",
      value:
        kpi?.consegnePuntualiPercentuale != null
          ? `${kpi.consegnePuntualiPercentuale}%`
          : "—",
      icon: Truck,
      detail: "Nel mese corrente",
    },
    {
      label: "Lavori completati",
      value: kpi ? `${kpi.lavoriCompletatiMese}` : "—",
      icon: Package,
      detail: "Questo mese",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiche"
        description="Indicatori utili per capire capacità produttiva, ricavi e mix di lavorazioni."
      />

      {loading ? (
        <p className="text-[13px] text-slate-400">Caricamento…</p>
      ) : error ? (
        <p className="text-[13px] text-red-600">{error}</p>
      ) : (
        <>
          <section className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
            {/* Ricavi per giorno */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  Ricavi per giorno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RicaviGiornoChart data={data?.ricaviPerGiorno ?? []} />
              </CardContent>
            </Card>

            {/* Mix lavorazioni */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Mix lavorazioni</CardTitle>
              </CardHeader>
              <CardContent>
                <MixLavorazioniChart data={data?.mixLavorazioni ?? []} />
              </CardContent>
            </Card>
          </section>

          {/* KPI cards */}
          <section className="grid gap-3.5 md:grid-cols-3">
            {kpiCards.map((kpiCard) => {
              const Icon = kpiCard.icon;
              return (
                <TiltCard key={kpiCard.label}>
                  <Card className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                    <div className="relative p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400/80">
                          {kpiCard.label}
                        </p>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">
                        {kpiCard.value}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                        {kpiCard.detail}
                      </p>
                    </div>
                  </Card>
                </TiltCard>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
