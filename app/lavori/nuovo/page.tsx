"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLIENTI = [
  "Mario Rossi",
  "Luca Bianchi",
  "Anna Verdi",
  "Giuseppe Neri",
  "Francesca Conti",
  "Roberto Ferrara",
];

const TIPI_LAVORO = [
  "Orlo pantalone",
  "Stringere vita",
  "Accorciare gamba",
  "Allargare pantalone",
  "Sostituzione zip",
  "Riparazione strappo",
  "Pantalone su misura",
  "Altro",
];

const INPUT_CLASS =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

type Errors = {
  cliente: string;
  titolo: string;
  tipoLavoro: string;
  dataConsegna: string;
  prezzoStimato: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const g = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${g}`;
}

export default function NuovoLavoroPage() {
  const router = useRouter();

  const [cliente, setCliente] = useState("");
  const [titolo, setTitolo] = useState("");
  const [tipoLavoro, setTipoLavoro] = useState("");
  const [dataConsegna, setDataConsegna] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzoStimato, setPrezzoStimato] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({
    cliente: "",
    titolo: "",
    tipoLavoro: "",
    dataConsegna: "",
    prezzoStimato: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = todayISO();

  function validateForm(): boolean {
    const next: Errors = {
      cliente: "",
      titolo: "",
      tipoLavoro: "",
      dataConsegna: "",
      prezzoStimato: "",
    };
    let valid = true;

    if (!cliente) {
      next.cliente = "Seleziona un cliente";
      valid = false;
    }
    if (!titolo.trim()) {
      next.titolo = "Inserisci un titolo per il lavoro";
      valid = false;
    }
    if (!tipoLavoro) {
      next.tipoLavoro = "Seleziona il tipo di lavoro";
      valid = false;
    }
    if (!dataConsegna) {
      next.dataConsegna = "Inserisci una data di consegna";
      valid = false;
    } else if (dataConsegna < today) {
      next.dataConsegna = "La data non può essere nel passato";
      valid = false;
    }
    if (prezzoStimato !== "" && Number(prezzoStimato) < 0) {
      next.prezzoStimato = "Il prezzo deve essere positivo";
      valid = false;
    }

    setErrors(next);
    return valid;
  }

  function handleSubmit() {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/lavori?success=created");
    }, 500);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + intestazione */}
      <div>
        <p className="text-sm text-slate-500">Lavori / Nuovo lavoro</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          Nuovo lavoro
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compila i campi per aggiungere un nuovo lavoro al laboratorio.
        </p>
      </div>

      {/* Card form */}
      <div className="max-w-2xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Cliente */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Seleziona un cliente</option>
              {CLIENTI.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.cliente && (
              <p className="mt-1 text-sm text-red-500">{errors.cliente}</p>
            )}
          </div>

          {/* Titolo lavoro */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Titolo lavoro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Orlo pantalone elegante"
              className={INPUT_CLASS}
            />
            {errors.titolo && (
              <p className="mt-1 text-sm text-red-500">{errors.titolo}</p>
            )}
          </div>

          {/* Tipo lavoro */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo lavoro <span className="text-red-500">*</span>
            </label>
            <select
              value={tipoLavoro}
              onChange={(e) => setTipoLavoro(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Seleziona tipo lavoro</option>
              {TIPI_LAVORO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.tipoLavoro && (
              <p className="mt-1 text-sm text-red-500">{errors.tipoLavoro}</p>
            )}
          </div>

          {/* Data consegna */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Data consegna <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dataConsegna}
              min={today}
              onChange={(e) => setDataConsegna(e.target.value)}
              className={INPUT_CLASS}
            />
            {errors.dataConsegna && (
              <p className="mt-1 text-sm text-red-500">{errors.dataConsegna}</p>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descrizione
            </label>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder="Descrivi il lavoro da svolgere..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* Prezzo stimato */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Prezzo stimato (€)
            </label>
            <input
              type="number"
              value={prezzoStimato}
              onChange={(e) => setPrezzoStimato(e.target.value)}
              placeholder="0"
              min={0}
              className={INPUT_CLASS}
            />
            {errors.prezzoStimato && (
              <p className="mt-1 text-sm text-red-500">
                {errors.prezzoStimato}
              </p>
            )}
          </div>

          {/* Note interne */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Note interne
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note riservate al laboratorio..."
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* Footer pulsanti */}
          <div className="flex justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={() => router.push("/lavori")}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-600 hover:bg-stone-50"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {isSubmitting ? "Salvataggio..." : "Salva lavoro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
