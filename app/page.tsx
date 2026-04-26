import { CalendarClock, Euro, PackageCheck, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { JobsTable } from "@/components/shared/jobs-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { metrics, production, weeklySchedule } from "@/lib/mock-data";

const icons = [PackageCheck, CalendarClock, Euro, Users];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Riepilogo dei lavori, consegne e pagamenti del laboratorio."
        actions={<Button>Nuovo lavoro</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} icon={icons[index]} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <JobsTable compact />

        <Card>
          <CardHeader>
            <CardTitle>Carico settimanale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklySchedule.map((day) => (
              <div key={day.day} className="grid grid-cols-[42px_1fr_72px] items-center gap-3">
                <span className="text-sm font-medium">{day.day}</span>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${day.jobs * 7}%` }} />
                </div>
                <span className="text-right text-sm text-muted-foreground">{day.revenue}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {production.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-xl font-semibold">{item.value}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-accent-foreground" style={{ width: `${item.value}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
