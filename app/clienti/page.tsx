import { Plus, UserRoundSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clienti"
        description="Anagrafiche, contatti e storico rapido dei clienti privati e partner."
        actions={
          <Button className="bg-amber-600 text-white hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            Nuovo cliente
          </Button>
        }
      />

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Archivio clienti</CardTitle>
          <div className="flex w-full items-center gap-2 sm:max-w-xs">
            <UserRoundSearch className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filtra per nome o telefono" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Lavori</TableHead>
                <TableHead>Ultimo contatto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.email}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="text-right">{customer.jobs}</TableCell>
                  <TableCell>{customer.lastVisit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
