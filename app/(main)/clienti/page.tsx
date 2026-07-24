"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Check,
  Users,
  UserPlus,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cliente = {
  id: string;
  nome: string;
  cognome: string;
  telefono: string;
  citta: string | null;
  email: string | null;
  note: string | null;
  dataRegistrazione: string;
  numeroLavori: number;
  lavoriAttivi: number;
  segmentiStato?: Record<string, number>;
  daIncassare: number;
};

type LavoroStorico = {
  id: string;
  codiceLavoro: string;
  clienteId: string;
  tipoLavoro: string;
  stato: string;
  dataConsegna: string;
  prezzo: number;
};

type FormErrors = {
  nome: string;
  cognome: string;
  telefono: string;
  citta: string;
  email: string;
  duplicato: string;
};

type LavoroForm = {
  localId: number;
  codiceLavoro: string;
  tipoLavoro: string;
  stato: string;
  dataConsegna: string;
  prezzo: string;
  descrizione: string;
  expanded: boolean;
  errors: { tipoLavoro: boolean; stato: boolean; dataConsegna: boolean; prezzo: boolean };
};

type SortKey = "nome" | "cognome" | "telefono" | "lavoriAttivi" | "numeroLavori";
type SortOrder = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESI_IT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

function formatDataIt(iso: string): string {
  const parts = iso.split("-");
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${d} ${MESI_IT[m - 1]} ${y}`;
}

function formatEur(n: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

function emptyErrors(): FormErrors {
  return { nome: "", cognome: "", telefono: "", citta: "", email: "", duplicato: "" };
}

function getSegmenti(cliente: Cliente) {
  const s = cliente.segmentiStato ?? {};
  const completati = s["COMPLETED"] ?? 0;
  const inCorso = (s["IN_PROGRESS"] ?? 0) + (s["WAITING_CUSTOMER"] ?? 0);
  const daFare = s["TODO"] ?? 0;
  const annullati = s["CANCELLED"] ?? 0;
  const totale = completati + inCorso + daFare + annullati;
  return { completati, inCorso, daFare, annullati, totale };
}

// ─── Style constants ──────────────────────────────────────────────────────────

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";
const FIELD_ERROR_CLASS =
  "w-full rounded-lg border border-red-300 bg-red-50/30 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/25";
const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";
const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60 cursor-pointer";
const INLINE_INPUT_CLASS =
  "flex-1 rounded border border-amber-400 bg-amber-50/40 px-2 py-0.5 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400/50";

const STATUS_COLORS: Record<string, string> = {
  "Da iniziare":       "bg-stone-100 text-stone-600",
  "In lavorazione":    "bg-amber-100 text-amber-700",
  "In attesa cliente": "bg-orange-100 text-orange-700",
  Pronto:              "bg-emerald-100 text-emerald-700",
  Annullato:           "bg-red-100 text-red-700",
};

const STATUS_MAP: Record<string, string> = {
  TODO:             "Da iniziare",
  IN_PROGRESS:      "In lavorazione",
  WAITING_CUSTOMER: "In attesa cliente",
  COMPLETED:        "Pronto",
  CANCELLED:        "Annullato",
};

const TIPO_LAVORO_TO_ENUM: Record<string, string> = {
  "Orlo pantalone":     "HEM",
  "Stringere vita":     "WAIST_TIGHTENING",
  "Accorciare gamba":   "LEG_SHORTENING",
  "Allargare pantalone":"LEG_WIDENING",
  "Sostituzione zip":   "ZIP_REPLACEMENT",
  "Riparazione strappo":"REPAIR",
  "Pantalone su misura":"CUSTOM",
  "Altro":              "OTHER",
};


// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active)
    return <ChevronUp className="ml-1 inline-block h-3 w-3 opacity-30" />;
  return order === "asc" ? (
    <ChevronUp className="ml-1 inline-block h-3 w-3 text-amber-600" />
  ) : (
    <ChevronDown className="ml-1 inline-block h-3 w-3 text-amber-600" />
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ClientiPage() {
  const router = useRouter();

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── List state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("numeroLavori");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ── Inline editing state ──────────────────────────────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingValue2, setEditingValue2] = useState("");
  const [isSavingField, setIsSavingField] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [nomeInputWidth, setNomeInputWidth] = useState(48);
  const [cognomeInputWidth, setCognomeInputWidth] = useState(48);
  const nomeMeasureRef = useRef<HTMLSpanElement>(null);
  const cognomeMeasureRef = useRef<HTMLSpanElement>(null);

  // ── Banner ────────────────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  // ── Tooltip mouse-follow ──────────────────────────────────────────────────────
  const [tooltipData, setTooltipData] = useState<{ cliente: Cliente; x: number; y: number } | null>(null);

  // ── New form ──────────────────────────────────────────────────────────────────
  const [newNome, setNewNome] = useState("");
  const [newCognome, setNewCognome] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCitta, setNewCitta] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newErrors, setNewErrors] = useState<FormErrors>(emptyErrors());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLavoriOpen, setIsLavoriOpen] = useState(false);
  const [newLavori, setNewLavori] = useState<LavoroForm[]>([]);
  const lavoroCounter = useRef(0);
  const [maxCodiceDB, setMaxCodiceDB] = useState<number>(0);
  const [loadingCodice, setLoadingCodice] = useState(false);

  // ── Storico lavori del cliente selezionato (da API) ───────────────────────────
  const [clienteLavori, setClienteLavori] = useState<LavoroStorico[]>([]);
  const [clienteLavoriLoading, setClienteLavoriLoading] = useState(false);
  const [clienteLavoriError, setClienteLavoriError] = useState<string | null>(null);
  const [clienteTotali, setClienteTotali] = useState<{ totaleSpeso: number; daIncassare: number } | null>(null);
  const [statsClienti, setStatsClienti] = useState({ totale: 0, nuoviMese: 0, senzaLavoriAttivi: 0 });

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function caricaClienti() {
      try {
        setLoading(true);
        const [res, resStats] = await Promise.all([
          fetch("/api/clienti"),
          fetch("/api/clienti/stats"),
        ]);
        if (!res.ok) throw new Error("Errore nel caricamento clienti");
        if (!resStats.ok) throw new Error("Errore nel caricamento statistiche");
        const data = await res.json();
        const stats = await resStats.json();
        setClienti(data);
        setStatsClienti(stats);
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare i clienti. Riprova.");
      } finally {
        setLoading(false);
      }
    }
    caricaClienti();
  }, []);

  useEffect(() => {
    const anyOpen = isDetailOpen || isNewOpen || isDeleteOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDetailOpen, isNewOpen, isDeleteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isDeleteOpen) { setIsDeleteOpen(false); return; }
      if (editingField) { cancelEditing(); return; }
      if (isNewOpen) { setIsNewOpen(false); resetNewForm(); return; }
      if (isDetailOpen) { setIsDetailOpen(false); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDeleteOpen, editingField, isNewOpen, isDetailOpen]);

  useEffect(() => {
    if (!isNewOpen) return;
    setLoadingCodice(true);
    fetch("/api/lavori")
      .then((r) => r.json())
      .then((lavori: { code: string }[]) => {
        let max = 0;
        for (const l of lavori) {
          const match = l.code.match(/^GS-(\d+)$/);
          if (match) max = Math.max(max, parseInt(match[1], 10));
        }
        setMaxCodiceDB(max);
      })
      .catch(() => {})
      .finally(() => setLoadingCodice(false));
  }, [isNewOpen]);

  // ── Misurazione larghezza input Nome/Cognome ──────────────────────────────────

  useLayoutEffect(() => {
    if (nomeMeasureRef.current && editingField === "nome_cognome") {
      const w = nomeMeasureRef.current.getBoundingClientRect().width;
      setNomeInputWidth(Math.max(w + 24, 48));
    }
  }, [editingValue, editingField]);

  useLayoutEffect(() => {
    if (cognomeMeasureRef.current && editingField === "nome_cognome") {
      const w = cognomeMeasureRef.current.getBoundingClientRect().width;
      setCognomeInputWidth(Math.max(w + 24, 48));
    }
  }, [editingValue2, editingField]);

  // ── Filtered + sorted list ────────────────────────────────────────────────────

  const filteredAndSorted = useMemo(() => {
    let result = [...clienti];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.cognome.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filterStato) {
      if (filterStato === "in_corso") {
        result = result.filter((c) => getSegmenti(c).inCorso > 0);
      } else if (filterStato === "da_iniziare") {
        result = result.filter((c) => getSegmenti(c).daFare > 0);
      } else if (filterStato === "solo_completati") {
        result = result.filter((c) => {
          const { completati, totale } = getSegmenti(c);
          return totale > 0 && completati === totale;
        });
      } else if (filterStato === "senza") {
        result = result.filter((c) => getSegmenti(c).totale === 0);
      }
    }

    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      let cmp: number;
      if (typeof valA === "number" && typeof valB === "number") {
        cmp = valA - valB;
      } else {
        cmp = String(valA).localeCompare(String(valB), "it");
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [clienti, searchQuery, filterStato, sortBy, sortOrder]);

  // ── Detail stats ──────────────────────────────────────────────────────────────

  const detailStats = useMemo(() => {
    if (!selectedCliente) return null;
    const totaleSpeso = clienteTotali?.totaleSpeso ?? 0;
    const daIncassare = clienteTotali?.daIncassare ?? 0;
    const sorted = [...clienteLavori].sort((a, b) =>
      b.dataConsegna.localeCompare(a.dataConsegna)
    );
    return { totaleSpeso, daIncassare, sorted };
  }, [selectedCliente, clienteLavori, clienteTotali]);

  // ── Utility ───────────────────────────────────────────────────────────────────

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  async function apriDettaglioCliente(cliente: Cliente) {
    setSelectedCliente(cliente);
    setIsDetailOpen(true);
    setClienteLavori([]);
    setClienteLavoriError(null);
    setClienteLavoriLoading(true);
    setClienteTotali(null);
    cancelEditing();

    try {
      const res = await fetch(`/api/clienti/${cliente.id}`);
      if (!res.ok) throw new Error("Errore nel caricamento dei lavori del cliente");
      const data = await res.json();

      setClienteTotali({ totaleSpeso: data.totaleSpeso ?? 0, daIncassare: data.daIncassare ?? 0 });

      const lavoriMappati: LavoroStorico[] = (data.lavori ?? []).map((l: {
        id: string;
        codice: string;
        titolo: string;
        stato: string;
        dataConsegna: string | null;
        prezzo: number | null;
      }) => ({
        id: l.id,
        codiceLavoro: l.codice,
        clienteId: cliente.id,
        tipoLavoro: l.titolo,
        stato: STATUS_MAP[l.stato] ?? l.stato,
        dataConsegna: l.dataConsegna ?? "",
        prezzo: l.prezzo ?? 0,
      }));

      setClienteLavori(lavoriMappati);
    } catch (err) {
      console.error("Errore fetch lavori cliente:", err);
      setClienteLavoriError("Impossibile caricare lo storico lavori");
    } finally {
      setClienteLavoriLoading(false);
    }
  }

  // ── Inline field editing ──────────────────────────────────────────────────────

  function startEditing(field: string, currentValue: string) {
    setEditingField(field);
    setEditingValue(currentValue);
    setFieldError("");
  }

  function cancelEditing() {
    setEditingField(null);
    setEditingValue("");
    setEditingValue2("");
    setFieldError("");
  }

  async function saveField(field: string) {
    if (!selectedCliente) return;
    const value = editingValue.trim();
    const value2 = editingValue2.trim();

    if (field === "nome_cognome") {
      if (!value) { setFieldError("Nome obbligatorio"); return; }
      if (!value2) { setFieldError("Cognome obbligatorio"); return; }
      const dup = clienti.some(
        (c) =>
          c.id !== selectedCliente.id &&
          c.nome.trim().toLowerCase() === value.toLowerCase() &&
          c.cognome.trim().toLowerCase() === value2.toLowerCase()
      );
      if (dup) { setFieldError("Esiste già un cliente con questo nome e cognome"); return; }
    }

    if (field === "nome" && !value) { setFieldError("Campo obbligatorio"); return; }
    if (field === "cognome" && !value) { setFieldError("Campo obbligatorio"); return; }
    if (field === "telefono") {
      if (!value) { setFieldError("Campo obbligatorio"); return; }
      if (!/^[0-9\s\-()+]+$/.test(value) || value.replace(/\D/g, "").length < 7) {
        setFieldError("Inserisci un numero di telefono valido"); return;
      }
    }
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError("Inserisci un'email valida"); return;
    }

    if (field === "nome" || field === "cognome") {
      const n = field === "nome" ? value : selectedCliente.nome;
      const cog = field === "cognome" ? value : selectedCliente.cognome;
      const dup = clienti.some(
        (c) =>
          c.id !== selectedCliente.id &&
          c.nome.trim().toLowerCase() === n.toLowerCase() &&
          c.cognome.trim().toLowerCase() === cog.toLowerCase()
      );
      if (dup) { setFieldError("Esiste già un cliente con questo nome e cognome"); return; }
    }

    setIsSavingField(true);
    try {
      const payload = {
        nome:     field === "nome_cognome" ? value  : (field === "nome"     ? value           : selectedCliente.nome),
        cognome:  field === "nome_cognome" ? value2 : (field === "cognome"  ? value           : selectedCliente.cognome),
        telefono: field === "telefono" ? value           : selectedCliente.telefono,
        email:    field === "email"    ? (value || null) : selectedCliente.email,
        citta:    field === "citta"    ? (value || null) : selectedCliente.citta,
        note:     field === "note"     ? (value || null) : selectedCliente.note,
      };

      const res = await fetch(`/api/clienti/${selectedCliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella modifica");
      }

      const aggiornato: Cliente = {
        ...selectedCliente,
        ...payload,
      };
      setClienti((prev) => prev.map((c) => (c.id === aggiornato.id ? aggiornato : c)));
      setSelectedCliente(aggiornato);
      cancelEditing();
      setNotification({ type: "success", message: "Modificato con successo" });
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Errore nella modifica");
    } finally {
      setIsSavingField(false);
    }
  }

  // ── New form handlers ─────────────────────────────────────────────────────────

  function resetNewForm() {
    setNewNome(""); setNewCognome(""); setNewTelefono("");
    setNewCitta(""); setNewEmail(""); setNewNote("");
    setNewErrors(emptyErrors());
    setIsLavoriOpen(false); setNewLavori([]);
    setMaxCodiceDB(0);
  }

  function validateNew(): boolean {
    const errs = emptyErrors();
    let ok = true;

    if (!newNome.trim()) { errs.nome = "Campo obbligatorio"; ok = false; }
    if (!newCognome.trim()) { errs.cognome = "Campo obbligatorio"; ok = false; }

    const tel = newTelefono.trim();
    if (!tel) {
      errs.telefono = "Campo obbligatorio"; ok = false;
    } else if (!/^[0-9\s\-]+$/.test(tel) || tel.replace(/\D/g, "").length < 7) {
      errs.telefono = "Inserisci un numero di telefono valido"; ok = false;
    }

    if (!newCitta.trim()) { errs.citta = "Campo obbligatorio"; ok = false; }

    const mail = newEmail.trim();
    if (!mail) {
      errs.email = "Campo obbligatorio"; ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      errs.email = "Inserisci un'email valida"; ok = false;
    }

    if (ok) {
      const n = newNome.trim().toLowerCase();
      const cog = newCognome.trim().toLowerCase();
      if (clienti.some((c) => c.nome.trim().toLowerCase() === n && c.cognome.trim().toLowerCase() === cog)) {
        errs.duplicato = "Esiste già un cliente con questo nome e cognome"; ok = false;
      }
    }

    setNewErrors(errs);

    let lavoriValidi = true;
    const updatedLavori = newLavori.map((lav) => {
      const lavErrs = {
        tipoLavoro:   !lav.tipoLavoro,
        stato:        !lav.stato,
        dataConsegna: !lav.dataConsegna,
        prezzo:       !lav.prezzo || isNaN(parseFloat(lav.prezzo)),
      };
      if (lavErrs.tipoLavoro || lavErrs.stato || lavErrs.dataConsegna || lavErrs.prezzo) lavoriValidi = false;
      return { ...lav, errors: lavErrs };
    });
    if (!lavoriValidi) {
      setNewLavori(updatedLavori);
      if (!isLavoriOpen) setIsLavoriOpen(true);
      ok = false;
    }

    return ok;
  }

  async function handleNewSubmit() {
    if (!validateNew()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/clienti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newNome, cognome: newCognome, telefono: newTelefono,
          email: newEmail || null, citta: newCitta || null, note: newNote || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella creazione");
      }

      const clienteCreato = await res.json();

      if (newLavori.length > 0) {
        const risultati = await Promise.allSettled(
          newLavori.map((lav) =>
            fetch("/api/lavori", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientId: clienteCreato.id,
                type: TIPO_LAVORO_TO_ENUM[lav.tipoLavoro] ?? "OTHER",
                dueDate: lav.dataConsegna,
                description: lav.descrizione || null,
                price: lav.prezzo || null,
              }),
            }).then(async (r) => {
              if (!r.ok) { const err = await r.json(); throw new Error(err.error ?? "Lavoro non salvato"); }
              return r.json();
            })
          )
        );
        const falliti = risultati.filter((r) => r.status === "rejected").length;
        setClienti((prev) => [{ ...clienteCreato, daIncassare: 0 }, ...prev]);
        setIsNewOpen(false); resetNewForm();
        setNotification({
          type: "success",
          message: falliti > 0
            ? `Cliente creato, ma ${falliti} lavoro/i pregressi non salvati — aggiungili dalla pagina Lavori.`
            : "Cliente e lavori pregressi aggiunti con successo",
        });
        return;
      }

      setClienti((prev) => [{ ...clienteCreato, daIncassare: 0 }, ...prev]);
      setIsNewOpen(false); resetNewForm();
      setNotification({ type: "success", message: "Cliente aggiunto con successo" });
    } catch (err) {
      console.error(err);
      setNewErrors((prev) => ({
        ...prev,
        duplicato: err instanceof Error ? err.message : "Errore nella creazione del cliente",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Lavori pregressi handlers ─────────────────────────────────────────────────

  function addLavoro() {
    lavoroCounter.current++;
    let max = maxCodiceDB;
    for (const lav of newLavori) {
      const match = lav.codiceLavoro.match(/^GS-(\d+)$/);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    const codiceLavoro = `GS-${String(max + 1).padStart(3, "0")}`;
    setNewLavori((prev) => [
      ...prev,
      {
        localId: lavoroCounter.current,
        codiceLavoro, tipoLavoro: "", stato: "", dataConsegna: "", prezzo: "", descrizione: "",
        expanded: false,
        errors: { tipoLavoro: false, stato: false, dataConsegna: false, prezzo: false },
      },
    ]);
  }

  function removeLavoro(localId: number) {
    setNewLavori((prev) => prev.filter((l) => l.localId !== localId));
  }

  function updateLavoro(localId: number, field: string, value: string) {
    setNewLavori((prev) =>
      prev.map((l) => (l.localId === localId ? { ...l, [field]: value } : l))
    );
  }

  function toggleLavoroExpanded(localId: number) {
    setNewLavori((prev) =>
      prev.map((l) => (l.localId === localId ? { ...l, expanded: !l.expanded } : l))
    );
  }

  // ── Delete handler ────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!selectedCliente) return;
    try {
      const res = await fetch(`/api/clienti/${selectedCliente.id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Errore nell'eliminazione"); }
      setClienti((prev) => prev.filter((c) => c.id !== selectedCliente.id));
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedCliente(null);
      setNotification({ type: "success", message: "Cliente eliminato" });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: (err as Error).message });
    }
  }

  // ── Inline field render helper (called as function, not JSX component) ────────

  function renderInlineField(
    fieldKey: string,
    label: string,
    displayNode: React.ReactNode,
    currentValue: string,
    inputType = "text"
  ) {
    const isEditing = editingField === fieldKey;
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        {isEditing ? (
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type={inputType}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveField(fieldKey); }}
                className={INLINE_INPUT_CLASS}
              />
              <button
                onClick={() => saveField(fieldKey)}
                disabled={isSavingField}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isSavingField
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={cancelEditing}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {fieldError && editingField === fieldKey && (
              <p className="mt-1 text-[12px] text-red-500">{fieldError}</p>
            )}
          </div>
        ) : (
          <div className="group mt-0.5 flex items-center gap-1.5">
            {displayNode}
            <button
              onClick={() => startEditing(fieldKey, currentValue)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-amber-600 group-hover:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── KPI cards ────────────────────────────────────────────────────────────────

  const kpiClienti = statsClienti;

  // ── Render ────────────────────────────────────────────────────────────────────


  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-6">
      <PageHeader
        title="Clienti"
        description="Gestisci l'anagrafica dei clienti del laboratorio."
      />

      <section className="grid shrink-0 grid-cols-3 gap-3.5">
        {[
          { label: "Clienti totali",              value: kpiClienti.totale,           Icon: Users    },
          { label: "Nuovi questo mese",            value: kpiClienti.nuoviMese,        Icon: UserPlus },
          { label: "Senza lavori attivi",          value: kpiClienti.senzaLavoriAttivi, Icon: Clock   },
        ].map(({ label, value, Icon }) => (
          <Card key={label} className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
            <CardContent className="relative flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400/80">{label}</p>
                <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="pb-0 shrink-0">
          <CardTitle className="text-slate-800">Archivio clienti</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 p-0">
          {/* Barra filtri */}
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 shrink-0">
            <div className="flex min-w-[260px] flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Cerca</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per nome, cognome o telefono..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Stato lavori</label>
              <select
                value={filterStato}
                onChange={(e) => setFilterStato(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti</option>
                <option value="in_corso">Con lavori in corso</option>
                <option value="da_iniziare">Con lavori da iniziare</option>
                <option value="solo_completati">Solo completati</option>
                <option value="senza">Senza lavori</option>
              </select>
            </div>

            <div className="ml-auto flex items-end">
              <Button
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => { resetNewForm(); setIsNewOpen(true); }}
              >
                <Plus className="h-4 w-4" />
                Nuovo cliente
              </Button>
            </div>
          </div>

          {/* Tabella */}
          <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full caption-bottom text-[13px]">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("nome")}>
                  Nome <SortIndicator active={sortBy === "nome"} order={sortOrder} />
                </TableHead>
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("cognome")}>
                  Cognome <SortIndicator active={sortBy === "cognome"} order={sortOrder} />
                </TableHead>
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("telefono")}>
                  Telefono <SortIndicator active={sortBy === "telefono"} order={sortOrder} />
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Stato pagamenti
                </TableHead>
                <TableHead className="min-w-[200px] cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("numeroLavori")}>
                  Lavori <SortIndicator active={sortBy === "numeroLavori"} order={sortOrder} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-slate-400">
                    <p className="text-sm">Caricamento clienti...</p>
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && filteredAndSorted.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => apriDettaglioCliente(cliente)}
                >
                  <TableCell className="font-medium text-slate-800">{cliente.nome}</TableCell>
                  <TableCell className="text-slate-700">{cliente.cognome}</TableCell>
                  <TableCell className="font-mono text-[12px] text-slate-600">{cliente.telefono}</TableCell>
                  <TableCell>
                    {cliente.daIncassare === 0 ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-800">
                        In regola
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                        Da incassare — {formatEur(cliente.daIncassare)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {(() => {
                      const { completati, inCorso, daFare, annullati, totale } = getSegmenti(cliente);
                      if (totale === 0) return <span className="text-slate-400">—</span>;
                      return (
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-sm text-slate-700">{totale}</span>
                          <div
                            className="flex flex-1 items-center gap-1 pr-4"
                            onMouseEnter={(e) => setTooltipData({ cliente, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setTooltipData({ cliente, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltipData(null)}
                          >
                            {completati > 0 && <div className="h-2 rounded-full bg-green-400" style={{ width: `${(completati / totale) * 100}%`, minWidth: "8px" }} />}
                            {inCorso   > 0 && <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(inCorso   / totale) * 100}%`, minWidth: "8px" }} />}
                            {daFare    > 0 && <div className="h-2 rounded-full bg-stone-300" style={{ width: `${(daFare    / totale) * 100}%`, minWidth: "8px" }} />}
                            {annullati > 0 && <div className="h-2 rounded-full bg-red-400"   style={{ width: `${(annullati / totale) * 100}%`, minWidth: "8px" }} />}
                          </div>
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && filteredAndSorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    Nessun cliente trovato. Prova a modificare i filtri.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
          </div>
        </CardContent>
      </Card>

      {/* ══ Tooltip lavori ════════════════════════════════════════════════════════ */}
      {tooltipData && (() => {
        const { completati, inCorso, daFare, annullati } = getSegmenti(tooltipData.cliente);
        return (
          <div
            style={{ position: "fixed", left: tooltipData.x + 12, top: tooltipData.y + 12, pointerEvents: "none", zIndex: 50 }}
            className="whitespace-nowrap rounded-lg bg-stone-800 px-3 py-2 text-xs text-white shadow-lg"
          >
            {completati > 0 && <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400" />Pronti: {completati}</div>}
            {inCorso    > 0 && <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" />In corso: {inCorso}</div>}
            {daFare     > 0 && <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-stone-300" />Da iniziare: {daFare}</div>}
            {annullati  > 0 && <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400"   />Annullati: {annullati}</div>}
          </div>
        );
      })()}

      {/* ══ Banner notifica ═══════════════════════════════════════════════════════ */}
      {isMounted && notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* ══ Modal dettaglio cliente ═══════════════════════════════════════════════ */}
      {isMounted && isDetailOpen && selectedCliente && detailStats && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsDetailOpen(false); cancelEditing(); }}
        >
          <div
            className="relative mx-4 flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="min-w-0 flex-1 pr-4">
                {editingField === "nome_cognome" ? (
                  <div>
                    {/* Span nascosti per misurazione reale larghezza testo */}
                    <span
                      ref={nomeMeasureRef}
                      aria-hidden="true"
                      className="invisible absolute whitespace-pre text-[20px] font-bold"
                    >
                      {editingValue || " "}
                    </span>
                    <span
                      ref={cognomeMeasureRef}
                      aria-hidden="true"
                      className="invisible absolute whitespace-pre text-[20px] font-bold"
                    >
                      {editingValue2 || " "}
                    </span>
                    <div className="flex max-w-full flex-wrap items-center gap-2 min-w-0">
                      <div className="flex min-w-0 flex-wrap gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveField("nome_cognome"); }}
                          placeholder="Nome"
                          style={{ width: `${nomeInputWidth}px` }}
                          className="min-w-0 shrink rounded border border-amber-400 bg-amber-50/40 px-2 py-0.5 text-[20px] font-bold text-slate-800 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editingValue2}
                          onChange={(e) => setEditingValue2(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveField("nome_cognome"); }}
                          placeholder="Cognome"
                          style={{ width: `${cognomeInputWidth}px` }}
                          className="min-w-0 shrink rounded border border-amber-400 bg-amber-50/40 px-2 py-0.5 text-[20px] font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                      <button onClick={() => saveField("nome_cognome")} disabled={isSavingField}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                        {isSavingField ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={cancelEditing}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-50">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {fieldError && <p className="mt-0.5 text-[12px] text-red-500">{fieldError}</p>}
                  </div>
                ) : (
                  <div className="group flex max-w-full flex-wrap items-center gap-2 min-w-0">
                    <h2 className="min-w-0 break-words text-[22px] font-bold tracking-[-0.03em] text-slate-800">
                      {selectedCliente.nome} {selectedCliente.cognome}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingField("nome_cognome");
                        setEditingValue(selectedCliente.nome);
                        setEditingValue2(selectedCliente.cognome);
                        setFieldError("");
                      }}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-amber-600 group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Cliente dal {formatDataIt(selectedCliente.dataRegistrazione)}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  title="Elimina cliente"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => { setIsDetailOpen(false); cancelEditing(); }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-hidden p-6">
              {/* Strip 4 mini-card — larghezza piena */}
              <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Lavori totali", value: String(selectedCliente.numeroLavori), amber: false },
                  { label: "Lavori attivi", value: String(selectedCliente.lavoriAttivi), amber: selectedCliente.lavoriAttivi > 0 },
                  { label: "Totale speso",  value: formatEur(detailStats.totaleSpeso),  amber: false },
                  { label: "Da incassare",  value: formatEur(detailStats.daIncassare),  amber: detailStats.daIncassare > 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className={`mt-1 text-[20px] font-bold tracking-[-0.03em] ${s.amber ? "text-amber-700" : "text-slate-800"}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Due colonne: Contatti+Note a sinistra, Storico lavori a destra */}
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-4">

                {/* Colonna sinistra: Contatti + Note */}
                <div className="flex min-h-0 flex-col gap-6 overflow-y-auto pr-1 lg:col-span-1">
                  {/* Contatti */}
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Contatti</p>
                    <div className="flex flex-col gap-4">
                      {renderInlineField(
                        "telefono", "Telefono",
                        <a href={`tel:${selectedCliente.telefono}`} className="font-mono text-[13px] font-medium text-amber-700 hover:underline">
                          {selectedCliente.telefono}
                        </a>,
                        selectedCliente.telefono, "tel"
                      )}
                      {renderInlineField(
                        "email", "Email",
                        selectedCliente.email
                          ? <a href={`mailto:${selectedCliente.email}`} className="text-[13px] font-medium text-amber-700 hover:underline">{selectedCliente.email}</a>
                          : <span className="text-[13px] text-slate-400">—</span>,
                        selectedCliente.email ?? "", "email"
                      )}
                      {renderInlineField(
                        "citta", "Città",
                        <span className={`text-[13px] font-medium ${selectedCliente.citta ? "text-slate-700" : "text-slate-400"}`}>
                          {selectedCliente.citta || "—"}
                        </span>,
                        selectedCliente.citta ?? ""
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Note</p>
                    {editingField === "note" ? (
                      <div>
                        <div className="flex items-start gap-1.5">
                          <textarea
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            rows={3}
                            className="flex-1 resize-none rounded border border-amber-400 bg-amber-50/40 px-2 py-1 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => saveField("note")} disabled={isSavingField}
                              className="flex h-6 w-6 items-center justify-center rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                              {isSavingField ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={cancelEditing}
                              className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-50">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {fieldError && editingField === "note" && (
                          <p className="mt-1 text-[12px] text-red-500">{fieldError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="group flex items-start gap-1.5">
                        <p className={`text-[13px] ${selectedCliente.note ? "text-slate-700" : "text-slate-400"}`}>
                          {selectedCliente.note || "Nessuna nota"}
                        </p>
                        <button
                          onClick={() => startEditing("note", selectedCliente.note ?? "")}
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-amber-600 group-hover:opacity-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonna destra: Storico lavori */}
                <div className="flex min-h-0 flex-col overflow-hidden lg:col-span-3">
                  <p className="mb-3 shrink-0 text-[15px] font-semibold text-slate-800">Storico lavori</p>
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                    {clienteLavoriLoading ? (
                      <p className="text-center text-[13px] text-slate-500">Caricamento...</p>
                    ) : clienteLavoriError ? (
                      <p className="text-center text-[13px] text-red-600">{clienteLavoriError}</p>
                    ) : detailStats.sorted.length === 0 ? (
                      <p className="text-center text-[13px] text-slate-500">
                        Nessun lavoro registrato per questo cliente.
                      </p>
                    ) : (
                      <table className="w-full text-[12px]">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-stone-200">
                            <th className="pb-2 text-left font-semibold text-slate-500">Codice</th>
                            <th className="pb-2 text-left font-semibold text-slate-500">Tipo</th>
                            <th className="pb-2 text-left font-semibold text-slate-500">Stato</th>
                            <th className="pb-2 text-left font-semibold text-slate-500">Consegna</th>
                            <th className="pb-2 text-right font-semibold text-slate-500">Prezzo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailStats.sorted.map((lav) => (
                            <tr
                              key={lav.id}
                              className="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-stone-50"
                              onClick={() => router.push(`/lavori?apri=${lav.id}`)}
                            >
                              <td className="py-2 font-mono text-slate-600">{lav.codiceLavoro}</td>
                              <td className="py-2 text-slate-700">{lav.tipoLavoro}</td>
                              <td className="py-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[lav.stato] ?? "bg-stone-100 text-stone-700"}`}>
                                  {lav.stato}
                                </span>
                              </td>
                              <td className="py-2 text-slate-500">{lav.dataConsegna ? formatDataIt(lav.dataConsegna) : "—"}</td>
                              <td className="py-2 text-right font-medium text-slate-700">{formatEur(lav.prezzo)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal nuovo cliente ════════════════════════════════════════════════════ */}
      {isMounted && isNewOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsNewOpen(false); resetNewForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.025em] text-slate-900">Nuovo cliente</h2>
                <p className="mt-1 text-[13px] text-slate-400">
                  Aggiungi un nuovo cliente all&apos;anagrafica del laboratorio.
                </p>
              </div>
              <button
                className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => { setIsNewOpen(false); resetNewForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {newErrors.duplicato && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {newErrors.duplicato}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input type="text" value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Es. Mario"
                  className={newErrors.nome ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {newErrors.nome && <p className="mt-1 text-[12px] text-red-500">{newErrors.nome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input type="text" value={newCognome} onChange={(e) => setNewCognome(e.target.value)} placeholder="Es. Rossi"
                  className={newErrors.cognome ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {newErrors.cognome && <p className="mt-1 text-[12px] text-red-500">{newErrors.cognome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Telefono <span className="text-red-500">*</span>
                </label>
                <input type="text" value={newTelefono} onChange={(e) => setNewTelefono(e.target.value)} placeholder="Es. 333-1234567"
                  className={newErrors.telefono ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {newErrors.telefono && <p className="mt-1 text-[12px] text-red-500">{newErrors.telefono}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Città <span className="text-red-500">*</span>
                </label>
                <input type="text" value={newCitta} onChange={(e) => setNewCitta(e.target.value)} placeholder="Es. Milano"
                  className={newErrors.citta ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {newErrors.citta && <p className="mt-1 text-[12px] text-red-500">{newErrors.citta}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Es. mario.rossi@email.it"
                  className={newErrors.email ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {newErrors.email && <p className="mt-1 text-[12px] text-red-500">{newErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Note</label>
                <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Note interne sul cliente..." rows={3} className={TEXTAREA_CLASS} />
              </div>
            </div>

            {/* Lavori pregressi */}
            <div className="border-t border-stone-200 px-6">
              <div
                className="-mx-6 flex cursor-pointer flex-col px-6 py-3 hover:bg-stone-50"
                onClick={() => setIsLavoriOpen((o) => !o)}
              >
                <div className="flex items-center gap-2">
                  {isLavoriOpen
                    ? <ChevronDown className="h-4 w-4 text-slate-500" />
                    : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <span className="text-[13px] font-medium text-slate-700">Aggiungi lavori pregressi</span>
                </div>
                <p className="ml-6 mt-0.5 text-[12px] text-slate-500">
                  Se il cliente ha già fatto lavori in passato, aggiungili qui (opzionale)
                </p>
              </div>
              {isLavoriOpen && (
                <div className="space-y-2 pb-4">
                  {newLavori.map((lav) => (
                    <div key={lav.localId} className="rounded-lg border border-stone-200 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-16 shrink-0 font-mono text-xs text-slate-500">{lav.codiceLavoro}</span>
                        <select value={lav.tipoLavoro} onChange={(e) => updateLavoro(lav.localId, "tipoLavoro", e.target.value)}
                          className={`flex-1 rounded border ${lav.errors.tipoLavoro ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}>
                          <option value="">Tipo lavoro</option>
                          <option>Orlo pantalone</option>
                          <option>Stringere vita</option>
                          <option>Accorciare gamba</option>
                          <option>Allargare pantalone</option>
                          <option>Sostituzione zip</option>
                          <option>Riparazione strappo</option>
                          <option>Pantalone su misura</option>
                          <option>Altro</option>
                        </select>
                        <select value={lav.stato} onChange={(e) => updateLavoro(lav.localId, "stato", e.target.value)}
                          className={`w-36 rounded border ${lav.errors.stato ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}>
                          <option value="">Stato</option>
                          <option>Da iniziare</option>
                          <option>In lavorazione</option>
                          <option>In attesa cliente</option>
                          <option>Pronto</option>
                          <option>Annullato</option>
                        </select>
                        <input type="date" value={lav.dataConsegna} onChange={(e) => updateLavoro(lav.localId, "dataConsegna", e.target.value)}
                          className={`w-36 rounded border ${lav.errors.dataConsegna ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`} />
                        <input type="number" step="0.01" placeholder="€" value={lav.prezzo} onChange={(e) => updateLavoro(lav.localId, "prezzo", e.target.value)}
                          className={`w-20 rounded border ${lav.errors.prezzo ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`} />
                        <button type="button" onClick={() => toggleLavoroExpanded(lav.localId)}
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-stone-100 hover:text-slate-600">
                          {lav.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeLavoro(lav.localId); }}
                          className="flex h-7 w-7 items-center justify-center rounded text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {lav.expanded && (
                        <div className="mt-2">
                          <textarea value={lav.descrizione} onChange={(e) => updateLavoro(lav.localId, "descrizione", e.target.value)}
                            placeholder="Es. orlo a macchina su pantalone blu elegante" rows={2}
                            className="w-full resize-none rounded border border-stone-200 bg-white px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50" />
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addLavoro} disabled={loadingCodice}
                    className="w-full rounded-lg border border-amber-600 py-2 text-[13px] font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {loadingCodice ? "Caricamento..." : "+ Aggiungi lavoro"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={() => { setIsNewOpen(false); resetNewForm(); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50">
                Annulla
              </button>
              <button type="button" onClick={handleNewSubmit} disabled={isSubmitting}
                className="rounded-lg bg-amber-600 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Salvataggio..." : "Salva cliente"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal conferma eliminazione ════════════════════════════════════════════ */}
      {isMounted && isDeleteOpen && selectedCliente && createPortal(
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em] text-slate-900">
              Eliminare {selectedCliente.nome} {selectedCliente.cognome}?
            </h3>
            <p className="mb-5 text-[13px] text-slate-500">
              Questa azione è definitiva. Verranno eliminati anche tutti i lavori
              associati ({selectedCliente.numeroLavori} lavori, di cui{" "}
              {selectedCliente.lavoriAttivi} ancora attivi). Non potrai annullare
              questa operazione.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50">
                Annulla
              </button>
              <button type="button" onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-red-700 active:scale-[0.98]">
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
