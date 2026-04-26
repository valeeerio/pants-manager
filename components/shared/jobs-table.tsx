import { jobs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobsTable({ compact = false }: { compact?: boolean }) {
  const visibleJobs = compact ? jobs.slice(0, 3) : jobs;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lavori recenti</CardTitle>
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
                <TableCell className="font-medium">{job.code}</TableCell>
                <TableCell>{job.customer}</TableCell>
                <TableCell className="min-w-56">{job.work}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell>{job.due}</TableCell>
                <TableCell className="text-right font-medium">{job.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
