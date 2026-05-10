import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { jobs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobsTable({ compact = false }: { compact?: boolean }) {
  const visibleJobs = compact ? jobs.slice(0, 4) : jobs;

  return (
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
            {visibleJobs.map((job) => (
              <TableRow
                key={job.code}
                className="border-b border-slate-100/60 transition-colors hover:bg-slate-50/60"
              >
                <TableCell className="px-5 py-3 font-mono text-[12px] font-semibold text-slate-600">
                  {job.code}
                </TableCell>
                <TableCell className="py-3 text-[13px] font-medium text-slate-800">
                  {job.customer}
                </TableCell>
                <TableCell className="min-w-44 py-3 text-[13px] text-slate-600">{job.work}</TableCell>
                <TableCell className="py-3">
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell className="py-3 text-[12px] text-slate-500">{job.due}</TableCell>
                <TableCell className="py-3 pr-5 text-right text-[13px] font-semibold text-slate-800">
                  {job.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {compact && (
          <div className="border-t border-slate-100 px-5 py-3">
            <Link
              href="/lavori"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 transition-colors hover:text-amber-800"
            >
              Vedi tutti i lavori
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
