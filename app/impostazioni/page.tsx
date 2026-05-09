import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Impostazioni"
        description="Preferenze operative del laboratorio e parametri base della futura integrazione dati."
        actions={
          <Button className="bg-amber-600 text-white hover:bg-amber-700">
            <Save className="h-4 w-4" />
            Salva
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Laboratorio</CardTitle>
            <CardDescription>Dati mostrati nei documenti e nelle ricevute.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="shop-name">Nome laboratorio</label>
              <Input id="shop-name" defaultValue="Laboratorio Sartoriale" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="shop-phone">Telefono</label>
              <Input id="shop-phone" defaultValue="+39 02 0000 0000" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="shop-address">Indirizzo</label>
              <Input id="shop-address" defaultValue="Via Sartoria 12, Milano" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operativita</CardTitle>
            <CardDescription>Valori mock pronti per essere salvati su MySQL.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="currency">Valuta</label>
              <Input id="currency" defaultValue="EUR" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="default-vat">IVA predefinita</label>
              <Input id="default-vat" defaultValue="22%" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="lead-time">Tempo consegna standard</label>
              <Input id="lead-time" defaultValue="5 giorni lavorativi" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
