import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { payments } from "@/lib/mock-data";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagamenti"
        description="Incassi, acconti e saldi collegati alle commesse del laboratorio."
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Esporta
            </Button>
            <Button className="bg-amber-600 text-white hover:bg-amber-700">
              <Plus className="h-4 w-4" />
              Registra
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Incassato oggi</p>
            <p className="mt-2 text-3xl font-semibold">€ 65</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Da saldare</p>
            <p className="mt-2 text-3xl font-semibold">€ 85</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Media ordine</p>
            <p className="mt-2 text-3xl font-semibold">€ 18</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Movimenti recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Lavoro</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Importo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell>{payment.job}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
