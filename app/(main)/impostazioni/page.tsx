"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormErrors = {
  shopName: string;
  defaultVatRate: string;
  leadTimeDays: string;
};

function emptyErrors(): FormErrors {
  return { shopName: "", defaultVatRate: "", leadTimeDays: "" };
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  type?: string;
};

function FormField({ id, label, value, onChange, hint, error, type = "text" }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-300 focus-visible:ring-red-400/25" : undefined}
      />
      {error ? (
        <p className="text-[11px] text-red-600">{error}</p>
      ) : (
        hint && <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors());

  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [defaultVatRate, setDefaultVatRate] = useState("22");
  const [leadTimeDays, setLeadTimeDays] = useState("5");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function caricaImpostazioni() {
      try {
        setLoading(true);
        const res = await fetch("/api/impostazioni");
        if (!res.ok) throw new Error("Errore nel caricamento delle impostazioni");
        const data = await res.json();
        setShopName(data.shopName ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setCurrency(data.currency ?? "EUR");
        setDefaultVatRate(String(data.defaultVatRate ?? 22));
        setLeadTimeDays(String(data.leadTimeDays ?? 5));
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: "Impossibile caricare le impostazioni" });
      } finally {
        setLoading(false);
      }
    }
    caricaImpostazioni();
  }, []);

  function validate(): boolean {
    const errs = emptyErrors();
    let ok = true;

    if (!shopName.trim()) {
      errs.shopName = "Inserisci il nome del laboratorio";
      ok = false;
    }

    const vat = Number(defaultVatRate);
    if (defaultVatRate.trim() === "" || isNaN(vat) || vat < 0 || vat > 100) {
      errs.defaultVatRate = "Inserisci un'IVA valida tra 0 e 100";
      ok = false;
    }

    const leadTime = Number(leadTimeDays);
    if (leadTimeDays.trim() === "" || !Number.isInteger(leadTime) || leadTime <= 0) {
      errs.leadTimeDays = "Inserisci un numero di giorni valido";
      ok = false;
    }

    setErrors(errs);
    return ok;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/impostazioni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          currency: currency.trim() || "EUR",
          defaultVatRate: Number(defaultVatRate),
          leadTimeDays: Number(leadTimeDays),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nel salvataggio");
      }

      setNotification({ type: "success", message: "Impostazioni salvate" });
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Errore nel salvataggio delle impostazioni",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impostazioni"
        description="Preferenze operative del laboratorio e parametri base della futura integrazione dati."
        actions={
          <Button
            className="bg-amber-700 text-white shadow-sm shadow-amber-900/25 hover:bg-amber-800 active:scale-[0.98]"
            onClick={handleSave}
            disabled={loading || saving}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Salvataggio..." : "Salva modifiche"}
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
              value={shopName}
              onChange={setShopName}
              error={errors.shopName}
            />
            <FormField
              id="shop-phone"
              label="Telefono"
              value={phone}
              onChange={setPhone}
            />
            <FormField
              id="shop-address"
              label="Indirizzo"
              value={address}
              onChange={setAddress}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Operatività</CardTitle>
            <CardDescription>Parametri applicati automaticamente a fatture e commesse.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-slate-100 pt-4">
            <FormField
              id="currency"
              label="Valuta"
              value={currency}
              onChange={setCurrency}
              hint="Utilizzata in fatture e ricevute"
            />
            <FormField
              id="default-vat"
              label="IVA predefinita (%)"
              value={defaultVatRate}
              onChange={setDefaultVatRate}
              hint="Applicata automaticamente alle commesse"
              error={errors.defaultVatRate}
              type="number"
            />
            <FormField
              id="lead-time"
              label="Tempo consegna standard (giorni lavorativi)"
              value={leadTimeDays}
              onChange={setLeadTimeDays}
              hint="Mostrato ai clienti come stima"
              error={errors.leadTimeDays}
              type="number"
            />
          </CardContent>
        </Card>
      </section>

      {isMounted && notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}
    </div>
  );
}
