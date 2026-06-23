import { Clock, Package, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { production, weeklySchedule } from "@/lib/mock-data";

const kpiCards = [
  {
    label: "Tempo medio modifica",
    value: "2,4 giorni",
    icon: Clock,
    detail: "Su ultimi 30 lavori completati"
  },
  {
    label: "Consegne puntuali",
    value: "94%",
    icon: Truck,
    detail: "+2% rispetto al mese scorso"
  },
  {
    label: "Lavori completati",
    value: "18",
    icon: Package,
    detail: "Questo mese"
  }
];

const barColors = [
  "from-amber-500 to-amber-400",
  "from-amber-400 to-amber-300",
  "from-amber-500 to-amber-400",
  "from-amber-600 to-amber-500",
  "from-amber-400 to-amber-300"
];

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiche"
        description="Indicatori utili per capire capacità produttiva, ricavi e mix di lavorazioni."
      />

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
          <CardContent className="space-y-3">
            {weeklySchedule.map((item, index) => (
              <div key={item.day} className="grid grid-cols-[44px_1fr_72px] items-center gap-3">
                <span className="text-[12px] font-medium text-slate-500">{item.day}</span>
                <div className="h-8 overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${barColors[index] ?? "from-amber-500 to-amber-400"} transition-all duration-700`}
                    style={{ width: `${52 + index * 8}%` }}
                    aria-label={`Ricavi ${item.day}`}
                  />
                </div>
                <span className="text-right text-[13px] font-semibold text-slate-800">{item.revenue}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mix lavorazioni */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Mix lavorazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {production.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                  <span className="text-[13px] font-bold text-slate-900">{item.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* KPI cards */}
      <section className="grid gap-3.5 md:grid-cols-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <TiltCard key={kpi.label}>
              <Card className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                <div className="relative p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400/80">
                      {kpi.label}
                    </p>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{kpi.value}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-slate-400">{kpi.detail}</p>
                </div>
              </Card>
            </TiltCard>
          );
        })}
      </section>
    </div>
  );
}
