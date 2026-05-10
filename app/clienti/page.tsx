import { Plus, UserRoundSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers } from "@/lib/mock-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clienti"
        description="Anagrafiche, contatti e storico rapido dei clienti privati e partner."
        actions={
          <Button className="bg-amber-700 text-white shadow-sm shadow-amber-900/25 hover:bg-amber-800 active:scale-[0.98]">
            <Plus className="h-3.5 w-3.5" />
            Nuovo cliente
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-0">
          <CardTitle>Archivio clienti</CardTitle>
          <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 transition-all focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-sm">
            <UserRoundSearch className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <Input
              className="h-auto border-0 bg-transparent p-0 text-[13px] shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
              placeholder="Filtra per nome o telefono"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5">Cliente</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Lavori</TableHead>
                <TableHead>Ultimo contatto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.email} className="cursor-pointer">
                  <TableCell className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200/60">
                        {getInitials(customer.name)}
                      </div>
                      <span className="font-medium text-slate-800">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-slate-600">{customer.phone}</TableCell>
                  <TableCell className="text-slate-500">{customer.email}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">{customer.jobs}</TableCell>
                  <TableCell className="text-[12px] text-slate-500">{customer.lastVisit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
