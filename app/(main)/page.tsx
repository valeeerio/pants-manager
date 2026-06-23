import { Scissors, CalendarCheck, Banknote, Users, Bell } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { JobsTable } from "@/components/shared/jobs-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { metrics, production, deadlines } from "@/lib/mock-data";

const icons = [Scissors, CalendarCheck, Banknote, Users];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
        {metrics.map((metric, index) => {
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
        <JobsTable compact />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>In scadenza questa settimana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {deadlines.map((item, index) => (
              <div
                key={index}
                className="group flex items-start justify-between gap-3 rounded-lg border border-slate-100/80 bg-slate-50/50 px-3 py-2.5 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800">{item.customer}</p>
                  <p className="truncate text-[11px] text-slate-400 mt-0.5">{item.work}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] font-semibold text-amber-700">{item.due}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Sezione 3 — Tipologie di produzione */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {production.map((item) => (
          <Card key={item.label} className="group">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-600">{item.label}</span>
                <span className="text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                  {item.value}
                  <span className="text-sm font-medium text-slate-400">%</span>
                </span>
              </div>
              {/* Track */}
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${item.value}%` }}
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
            <p className="text-[12px] text-amber-800/70 mt-0.5">2 consegne previste oggi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
