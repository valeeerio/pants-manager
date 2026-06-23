import { Banknote, Download, Plus, TrendingDown, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { payments } from "@/lib/mock-data";

const statCards = [
  {
    label: "Incassato oggi",
    value: "€ 65",
    icon: Banknote,
    trend: "+€ 20 rispetto a ieri",
    positive: true
  },
  {
    label: "Da saldare",
    value: "€ 85",
    icon: TrendingDown,
    trend: "4 commesse in attesa",
    positive: false
  },
  {
    label: "Media ordine",
    value: "€ 18",
    icon: Wallet,
    trend: "Ultimi 30 giorni",
    positive: null
  }
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagamenti"
        description="Incassi, acconti e saldi collegati alle commesse del laboratorio."
        actions={
          <>
            <Button variant="outline">
              <Download className="h-3.5 w-3.5" />
              Esporta
            </Button>
            <Button className="bg-amber-700 text-white shadow-sm shadow-amber-900/25 hover:bg-amber-800 active:scale-[0.98]">
              <Plus className="h-3.5 w-3.5" />
              Registra
            </Button>
          </>
        }
      />

      <section className="grid gap-3.5 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <TiltCard key={stat.label}>
              <Card className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                <div className="relative p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400/80">
                      {stat.label}
                    </p>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{stat.value}</p>
                  <p className={`mt-1.5 text-[11px] font-medium ${
                    stat.positive === true ? "text-emerald-600" :
                    stat.positive === false ? "text-amber-600" :
                    "text-slate-400"
                  }`}>
                    {stat.trend}
                  </p>
                </div>
              </Card>
            </TiltCard>
          );
        })}
      </section>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Movimenti recenti</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Lavoro</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="pr-5 text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="px-5 font-mono text-[12px] font-semibold text-slate-600">
                    {payment.id}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{payment.customer}</TableCell>
                  <TableCell className="text-slate-500">{payment.job}</TableCell>
                  <TableCell>
                    <span className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {payment.method}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-right text-[13px] font-bold tracking-tight text-slate-900">
                    {payment.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
