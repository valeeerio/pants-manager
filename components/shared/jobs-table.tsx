import Link from "next/link";
import { jobs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobsTable({ compact = false }: { compact?: boolean }) {
  const visibleJobs = compact ? jobs.slice(0, 4) : jobs;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-800">Lavori recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codice</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Lavorazione</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead className="text-right">Importo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleJobs.map((job) => (
              <TableRow key={job.code}>
                <TableCell className="font-medium text-slate-700">{job.code}</TableCell>
                <TableCell>{job.customer}</TableCell>
                <TableCell className="min-w-48">{job.work}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-slate-600">{job.due}</TableCell>
                <TableCell className="text-right font-medium">{job.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {compact && (
          <div className="mt-3 border-t pt-3">
            <Link
              href="/lavori"
              className="text-sm text-amber-700 hover:text-amber-800 hover:underline"
            >
              Vedi tutti i lavori →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
