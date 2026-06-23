import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FieldProps = {
  id: string;
  label: string;
  defaultValue: string;
  hint?: string;
};

function FormField({ id, label, defaultValue, hint }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500" htmlFor={id}>
        {label}
      </label>
      <Input id={id} defaultValue={defaultValue} />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Impostazioni"
        description="Preferenze operative del laboratorio e parametri base della futura integrazione dati."
        actions={
          <Button className="bg-amber-700 text-white shadow-sm shadow-amber-900/25 hover:bg-amber-800 active:scale-[0.98]">
            <Save className="h-3.5 w-3.5" />
            Salva modifiche
          </Button>
        }
      />

      <section className="grid gap-3.5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Laboratorio</CardTitle>
            <CardDescription>Dati mostrati nei documenti e nelle ricevute.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-slate-100 pt-4">
            <FormField
              id="shop-name"
              label="Nome laboratorio"
              defaultValue="Laboratorio Sartoriale"
            />
            <FormField
              id="shop-phone"
              label="Telefono"
              defaultValue="+39 02 0000 0000"
            />
            <FormField
              id="shop-address"
              label="Indirizzo"
              defaultValue="Via Sartoria 12, Milano"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Operatività</CardTitle>
            <CardDescription>Valori mock pronti per essere salvati su MySQL.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-slate-100 pt-4">
            <FormField
              id="currency"
              label="Valuta"
              defaultValue="EUR"
              hint="Utilizzata in fatture e ricevute"
            />
            <FormField
              id="default-vat"
              label="IVA predefinita"
              defaultValue="22%"
              hint="Applicata automaticamente alle commesse"
            />
            <FormField
              id="lead-time"
              label="Tempo consegna standard"
              defaultValue="5 giorni lavorativi"
              hint="Mostrato ai clienti come stima"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
