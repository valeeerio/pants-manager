import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { production, weeklySchedule } from "@/lib/mock-data";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiche"
        description="Indicatori utili per capire capacita produttiva, ricavi e mix di lavorazioni."
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ricavi per giorno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklySchedule.map((item, index) => (
              <div key={item.day} className="grid grid-cols-[48px_1fr_80px] items-center gap-3">
                <span className="text-sm font-medium">{item.day}</span>
                <div className="h-9 rounded-md bg-muted">
                  <div
                    className="h-9 rounded-md bg-amber-500"
                    style={{ width: `${52 + index * 8}%` }}
                    aria-label={`Ricavi ${item.day}`}
                  />
                </div>
                <span className="text-right text-sm font-medium">{item.revenue}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mix lavorazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {production.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tempo medio modifica</p>
            <p className="mt-2 text-3xl font-semibold">2,4 giorni</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Consegne puntuali</p>
            <p className="mt-2 text-3xl font-semibold">94%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Lavori completati</p>
            <p className="mt-2 text-3xl font-semibold">18</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
