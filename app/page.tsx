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
          <Button className="bg-amber-700 text-white hover:bg-amber-800">
            Nuovo lavoro
          </Button>
        }
      />

      {/* Sezione 1 — 4 card principali */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Sezione 2 — Tabella + Widget scadenze */}
      <section className="grid gap-4 xl:grid-cols-[1.85fr_1fr]">
        <JobsTable compact />

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800">In scadenza questa settimana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadlines.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 rounded-md border border-slate-100 bg-stone-50 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{item.customer}</p>
                  <p className="truncate text-xs text-slate-500">{item.work}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-medium text-amber-700">{item.due}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Sezione 3 — 4 card tipologie */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {production.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-xl font-semibold text-slate-800">{item.value}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-stone-200">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Sezione 4 — Promemoria */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700">Promemoria</p>
            <p className="text-sm text-stone-600">2 consegne previste oggi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
