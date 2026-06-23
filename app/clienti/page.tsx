"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
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

type SortKey =
  | "nome"
  | "cognome"
  | "telefono"
  | "citta"
  | "lavoriAttivi"
  | "numeroLavori";
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

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyErrors(): FormErrors {
  return { nome: "", cognome: "", telefono: "", citta: "", email: "", duplicato: "" };
}

// lavoriAttivi = stati NON "Consegnato" e NON "Annullato"
const LAVORI_STORICO: LavoroStorico[] = [
  // CL-001 Mario Rossi — 4 lavori, 2 attivi
  { id: "GSL-001", codiceLavoro: "GS-L001", clienteId: "CL-001", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2024-04-10", prezzo: 15 },
  { id: "GSL-002", codiceLavoro: "GS-L002", clienteId: "CL-001", tipoLavoro: "Stringere vita",    stato: "Consegnato",     dataConsegna: "2024-08-20", prezzo: 20 },
  { id: "GSL-003", codiceLavoro: "GS-L003", clienteId: "CL-001", tipoLavoro: "Allargare pantalone", stato: "In lavorazione", dataConsegna: "2026-05-20", prezzo: 25 },
  { id: "GSL-004", codiceLavoro: "GS-L004", clienteId: "CL-001", tipoLavoro: "Sostituzione zip",  stato: "Da iniziare",    dataConsegna: "2026-05-25", prezzo: 20 },
  // CL-002 Luca Bianchi — 3 lavori, 1 attivo
  { id: "GSL-005", codiceLavoro: "GS-L005", clienteId: "CL-002", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2024-01-15", prezzo: 15 },
  { id: "GSL-006", codiceLavoro: "GS-L006", clienteId: "CL-002", tipoLavoro: "Orlo pantalone",    stato: "Annullato",      dataConsegna: "2024-06-10", prezzo: 30 },
  { id: "GSL-007", codiceLavoro: "GS-L007", clienteId: "CL-002", tipoLavoro: "Accorciare gamba",  stato: "Pronto",         dataConsegna: "2026-05-10", prezzo: 12 },
  // CL-003 Anna Verdi — 5 lavori, 2 attivi
  { id: "GSL-008", codiceLavoro: "GS-L008", clienteId: "CL-003", tipoLavoro: "Sostituzione zip",  stato: "Consegnato",     dataConsegna: "2024-07-05", prezzo: 18 },
  { id: "GSL-009", codiceLavoro: "GS-L009", clienteId: "CL-003", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2024-10-12", prezzo: 22 },
  { id: "GSL-010", codiceLavoro: "GS-L010", clienteId: "CL-003", tipoLavoro: "Stringere vita",    stato: "Consegnato",     dataConsegna: "2025-03-08", prezzo: 28 },
  { id: "GSL-011", codiceLavoro: "GS-L011", clienteId: "CL-003", tipoLavoro: "Orlo pantalone",    stato: "In lavorazione", dataConsegna: "2026-05-15", prezzo: 15 },
  { id: "GSL-012", codiceLavoro: "GS-L012", clienteId: "CL-003", tipoLavoro: "Riparazione strappo", stato: "In attesa cliente", dataConsegna: "2026-05-22", prezzo: 18 },
  // CL-004 Giuseppe Neri — 3 lavori, 1 attivo
  { id: "GSL-013", codiceLavoro: "GS-L013", clienteId: "CL-004", tipoLavoro: "Accorciare gamba",  stato: "Consegnato",     dataConsegna: "2025-03-20", prezzo: 12 },
  { id: "GSL-014", codiceLavoro: "GS-L014", clienteId: "CL-004", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2025-08-14", prezzo: 16 },
  { id: "GSL-015", codiceLavoro: "GS-L015", clienteId: "CL-004", tipoLavoro: "Accorciare gamba",  stato: "Da iniziare",    dataConsegna: "2026-05-22", prezzo: 16 },
  // CL-005 Francesca Conti — 2 lavori, 0 attivi
  { id: "GSL-016", codiceLavoro: "GS-L016", clienteId: "CL-005", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2024-10-01", prezzo: 22 },
  { id: "GSL-017", codiceLavoro: "GS-L017", clienteId: "CL-005", tipoLavoro: "Accorciare gamba",  stato: "Consegnato",     dataConsegna: "2025-05-18", prezzo: 14 },
  // CL-006 Roberto Ferrara — 2 lavori, 1 attivo
  { id: "GSL-018", codiceLavoro: "GS-L018", clienteId: "CL-006", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2025-09-10", prezzo: 18 },
  { id: "GSL-019", codiceLavoro: "GS-L019", clienteId: "CL-006", tipoLavoro: "Pantalone su misura", stato: "In lavorazione", dataConsegna: "2026-05-25", prezzo: 85 },
  // CL-007 Valentina Marino — 6 lavori, 3 attivi
  { id: "GSL-020", codiceLavoro: "GS-L020", clienteId: "CL-007", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2024-02-14", prezzo: 15 },
  { id: "GSL-021", codiceLavoro: "GS-L021", clienteId: "CL-007", tipoLavoro: "Stringere vita",    stato: "Consegnato",     dataConsegna: "2024-05-20", prezzo: 20 },
  { id: "GSL-022", codiceLavoro: "GS-L022", clienteId: "CL-007", tipoLavoro: "Sostituzione zip",  stato: "Consegnato",     dataConsegna: "2024-09-08", prezzo: 18 },
  { id: "GSL-023", codiceLavoro: "GS-L023", clienteId: "CL-007", tipoLavoro: "Accorciare gamba",  stato: "In lavorazione", dataConsegna: "2026-05-14", prezzo: 12 },
  { id: "GSL-024", codiceLavoro: "GS-L024", clienteId: "CL-007", tipoLavoro: "Riparazione strappo", stato: "Pronto",       dataConsegna: "2026-05-08", prezzo: 22 },
  { id: "GSL-025", codiceLavoro: "GS-L025", clienteId: "CL-007", tipoLavoro: "Altro",             stato: "Da iniziare",    dataConsegna: "2026-05-28", prezzo: 35 },
  // CL-008 Carlo Esposito — 1 lavoro, 0 attivi
  { id: "GSL-026", codiceLavoro: "GS-L026", clienteId: "CL-008", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2026-04-15", prezzo: 15 },
  // CL-009 Paola Ricci — 8 lavori, 4 attivi
  { id: "GSL-027", codiceLavoro: "GS-L027", clienteId: "CL-009", tipoLavoro: "Pantalone su misura", stato: "Consegnato",   dataConsegna: "2023-07-10", prezzo: 120 },
  { id: "GSL-028", codiceLavoro: "GS-L028", clienteId: "CL-009", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2023-11-22", prezzo: 22  },
  { id: "GSL-029", codiceLavoro: "GS-L029", clienteId: "CL-009", tipoLavoro: "Stringere vita",    stato: "Consegnato",     dataConsegna: "2024-04-18", prezzo: 20  },
  { id: "GSL-030", codiceLavoro: "GS-L030", clienteId: "CL-009", tipoLavoro: "Sostituzione zip",  stato: "Consegnato",     dataConsegna: "2024-08-30", prezzo: 18  },
  { id: "GSL-031", codiceLavoro: "GS-L031", clienteId: "CL-009", tipoLavoro: "Pantalone su misura", stato: "In lavorazione", dataConsegna: "2026-06-15", prezzo: 130 },
  { id: "GSL-032", codiceLavoro: "GS-L032", clienteId: "CL-009", tipoLavoro: "Orlo pantalone",    stato: "Pronto",         dataConsegna: "2026-05-09", prezzo: 15  },
  { id: "GSL-033", codiceLavoro: "GS-L033", clienteId: "CL-009", tipoLavoro: "Accorciare gamba",  stato: "In attesa cliente", dataConsegna: "2026-05-20", prezzo: 12 },
  { id: "GSL-034", codiceLavoro: "GS-L034", clienteId: "CL-009", tipoLavoro: "Stringere vita",    stato: "Da iniziare",    dataConsegna: "2026-05-30", prezzo: 20  },
  // CL-010 Davide Lombardi — 0 lavori
  // CL-011 Silvia Gallo — 7 lavori, 3 attivi
  { id: "GSL-035", codiceLavoro: "GS-L035", clienteId: "CL-011", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2025-10-05", prezzo: 15 },
  { id: "GSL-036", codiceLavoro: "GS-L036", clienteId: "CL-011", tipoLavoro: "Accorciare gamba",  stato: "Consegnato",     dataConsegna: "2025-11-18", prezzo: 12 },
  { id: "GSL-037", codiceLavoro: "GS-L037", clienteId: "CL-011", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2025-12-20", prezzo: 22 },
  { id: "GSL-038", codiceLavoro: "GS-L038", clienteId: "CL-011", tipoLavoro: "Stringere vita",    stato: "Consegnato",     dataConsegna: "2026-01-15", prezzo: 20 },
  { id: "GSL-039", codiceLavoro: "GS-L039", clienteId: "CL-011", tipoLavoro: "Sostituzione zip",  stato: "In lavorazione", dataConsegna: "2026-05-18", prezzo: 18 },
  { id: "GSL-040", codiceLavoro: "GS-L040", clienteId: "CL-011", tipoLavoro: "Pantalone su misura", stato: "Da iniziare", dataConsegna: "2026-06-10", prezzo: 95 },
  { id: "GSL-041", codiceLavoro: "GS-L041", clienteId: "CL-011", tipoLavoro: "Orlo pantalone",    stato: "Pronto",         dataConsegna: "2026-05-12", prezzo: 15 },
  // CL-012 Marco Fabbri — 2 lavori, 1 attivo
  { id: "GSL-042", codiceLavoro: "GS-L042", clienteId: "CL-012", tipoLavoro: "Accorciare gamba",  stato: "Consegnato",     dataConsegna: "2026-03-20", prezzo: 12 },
  { id: "GSL-043", codiceLavoro: "GS-L043", clienteId: "CL-012", tipoLavoro: "Stringere vita",    stato: "In lavorazione", dataConsegna: "2026-05-20", prezzo: 20 },
  // CL-013 Elena Russo — 4 lavori, 2 attivi
  { id: "GSL-044", codiceLavoro: "GS-L044", clienteId: "CL-013", tipoLavoro: "Orlo pantalone",    stato: "Consegnato",     dataConsegna: "2026-05-05", prezzo: 15 },
  { id: "GSL-045", codiceLavoro: "GS-L045", clienteId: "CL-013", tipoLavoro: "Riparazione strappo", stato: "Consegnato",   dataConsegna: "2026-05-08", prezzo: 22 },
  { id: "GSL-046", codiceLavoro: "GS-L046", clienteId: "CL-013", tipoLavoro: "Sostituzione zip",  stato: "Da iniziare",    dataConsegna: "2026-05-25", prezzo: 18 },
  { id: "GSL-047", codiceLavoro: "GS-L047", clienteId: "CL-013", tipoLavoro: "Accorciare gamba",  stato: "Pronto",         dataConsegna: "2026-05-15", prezzo: 12 },
];

function getSegmenti(clienteId: string, lavori: LavoroStorico[]) {
  const jobs = lavori.filter((l) => l.clienteId === clienteId);
  const completati = jobs.filter((l) => l.stato === "Consegnato").length;
  const inCorso = jobs.filter(
    (l) => l.stato === "In lavorazione" || l.stato === "In attesa cliente" || l.stato === "Pronto"
  ).length;
  const daFare = jobs.filter((l) => l.stato === "Da iniziare").length;
  const annullati = jobs.filter((l) => l.stato === "Annullato").length;
  const totale = jobs.length;
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

const STATUS_COLORS: Record<string, string> = {
  "Da iniziare":      "bg-stone-200 text-stone-700",
  "In lavorazione":   "bg-blue-100 text-blue-700",
  "In attesa cliente":"bg-orange-100 text-orange-700",
  Pronto:             "bg-green-100 text-green-700",
  Consegnato:         "bg-emerald-200 text-emerald-800",
  Annullato:          "bg-red-100 text-red-700",
};

const PAGE_SIZE = 10;

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
  // ── Data ─────────────────────────────────────────────────────────────────────
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── List state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [filterCitta, setFilterCitta] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("numeroLavori");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ── Banner ────────────────────────────────────────────────────────────────────
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

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
  const [isLavoriOpen, setIsLavoriOpen] = useState(false);
  const [newLavori, setNewLavori] = useState<LavoroForm[]>([]);
  const lavoroCounter = useRef(0);

  // ── Edit form ─────────────────────────────────────────────────────────────────
  const [editNome, setEditNome] = useState("");
  const [editCognome, setEditCognome] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editCitta, setEditCitta] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editErrors, setEditErrors] = useState<FormErrors>(emptyErrors());

  // ── Lavori aggiuntivi (persistono tra sessioni form) ──────────────────────────
  const [lavoriAggiunti, setLavoriAggiunti] = useState<LavoroStorico[]>([]);

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function caricaClienti() {
      try {
        setLoading(true);
        const res = await fetch("/api/clienti");
        if (!res.ok) throw new Error("Errore nel caricamento clienti");
        const data = await res.json();
        setClienti(data);
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
    const anyOpen = isDetailOpen || isNewOpen || isEditOpen || isDeleteOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDetailOpen, isNewOpen, isEditOpen, isDeleteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isDeleteOpen) { setIsDeleteOpen(false); return; }
      if (isEditOpen) { setIsEditOpen(false); resetEditForm(); return; }
      if (isNewOpen) { setIsNewOpen(false); resetNewForm(); return; }
      if (isDetailOpen) { setIsDetailOpen(false); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDeleteOpen, isEditOpen, isNewOpen, isDetailOpen]);

  // ── Merged lavori ─────────────────────────────────────────────────────────────
  const tuttiLavori = useMemo(
    () => [...LAVORI_STORICO, ...lavoriAggiunti],
    [lavoriAggiunti]
  );

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
        result = result.filter((c) => getSegmenti(c.id, tuttiLavori).inCorso > 0);
      } else if (filterStato === "da_iniziare") {
        result = result.filter((c) => getSegmenti(c.id, tuttiLavori).daFare > 0);
      } else if (filterStato === "solo_completati") {
        result = result.filter((c) => {
          const { completati, totale } = getSegmenti(c.id, tuttiLavori);
          return totale > 0 && completati === totale;
        });
      } else if (filterStato === "senza") {
        result = result.filter((c) => getSegmenti(c.id, tuttiLavori).totale === 0);
      }
    }

    if (filterCitta) {
      result = result.filter((c) => c.citta === filterCitta);
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
  }, [clienti, searchQuery, filterStato, filterCitta, sortBy, sortOrder, tuttiLavori]);

  // ── Detail stats ──────────────────────────────────────────────────────────────

  const detailStats = useMemo(() => {
    if (!selectedCliente) return null;
    const jobs = tuttiLavori.filter((l) => l.clienteId === selectedCliente.id);
    const totaleSpeso = jobs
      .filter((l) => l.stato === "Consegnato")
      .reduce((s, l) => s + l.prezzo, 0);
    const daIncassare = jobs
      .filter((l) => l.stato === "Pronto")
      .reduce((s, l) => s + l.prezzo, 0);
    const sorted = [...jobs].sort((a, b) =>
      b.dataConsegna.localeCompare(a.dataConsegna)
    );
    return { totaleSpeso, daIncassare, sorted };
  }, [selectedCliente, tuttiLavori]);

  // ── Utility ───────────────────────────────────────────────────────────────────

  function showSuccess(msg: string) {
    setBannerMessage(msg);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  }

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  // ── New form handlers ─────────────────────────────────────────────────────────

  function resetNewForm() {
    setNewNome(""); setNewCognome(""); setNewTelefono("");
    setNewCitta(""); setNewEmail(""); setNewNote("");
    setNewErrors(emptyErrors());
    setIsLavoriOpen(false); setNewLavori([]);
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
        tipoLavoro: !lav.tipoLavoro,
        stato: !lav.stato,
        dataConsegna: !lav.dataConsegna,
        prezzo: !lav.prezzo || isNaN(parseFloat(lav.prezzo)),
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

  function handleNewSubmit() {
    if (!validateNew()) return;
    const maxId = clienti.reduce((max, c) => {
      const n = parseInt(c.id.split("-")[1], 10);
      return n > max ? n : max;
    }, 0);
    const nuovoId = `CL-${String(maxId + 1).padStart(3, "0")}`;
    const attivi = newLavori.filter(
      (l) => l.stato === "In lavorazione" || l.stato === "In attesa cliente" || l.stato === "Pronto"
    ).length;
    const nuovoCliente: Cliente = {
      id: nuovoId,
      nome: newNome.trim(),
      cognome: newCognome.trim(),
      telefono: newTelefono.trim(),
      citta: newCitta.trim(),
      email: newEmail.trim() || null,
      note: newNote.trim() || null,
      dataRegistrazione: todayISO(),
      numeroLavori: newLavori.length,
      lavoriAttivi: attivi,
    };
    setClienti((prev) => [...prev, nuovoCliente]);
    if (newLavori.length > 0) {
      const entries: LavoroStorico[] = newLavori.map((lav, i) => ({
        id: `GSL-NEW-${Date.now()}-${i}`,
        codiceLavoro: lav.codiceLavoro,
        clienteId: nuovoId,
        tipoLavoro: lav.tipoLavoro,
        stato: lav.stato,
        dataConsegna: lav.dataConsegna,
        prezzo: parseFloat(lav.prezzo),
      }));
      setLavoriAggiunti((prev) => [...prev, ...entries]);
    }
    setIsNewOpen(false);
    resetNewForm();
    showSuccess("Cliente aggiunto con successo");
  }

  // ── Edit form handlers ────────────────────────────────────────────────────────

  function resetEditForm() {
    setEditNome(""); setEditCognome(""); setEditTelefono("");
    setEditCitta(""); setEditEmail(""); setEditNote("");
    setEditErrors(emptyErrors());
  }

  function openEditFromDetail() {
    if (!selectedCliente) return;
    setEditNome(selectedCliente.nome);
    setEditCognome(selectedCliente.cognome);
    setEditTelefono(selectedCliente.telefono);
    setEditCitta(selectedCliente.citta ?? "");
    setEditEmail(selectedCliente.email ?? "");
    setEditNote(selectedCliente.note ?? "");
    setEditErrors(emptyErrors());
    setIsDetailOpen(false);
    setIsEditOpen(true);
  }

  function validateEdit(): boolean {
    const errs = emptyErrors();
    let ok = true;

    if (!editNome.trim()) { errs.nome = "Campo obbligatorio"; ok = false; }
    if (!editCognome.trim()) { errs.cognome = "Campo obbligatorio"; ok = false; }

    const tel = editTelefono.trim();
    if (!tel) {
      errs.telefono = "Campo obbligatorio"; ok = false;
    } else if (!/^[0-9\s\-]+$/.test(tel) || tel.replace(/\D/g, "").length < 7) {
      errs.telefono = "Inserisci un numero di telefono valido"; ok = false;
    }

    if (!editCitta.trim()) { errs.citta = "Campo obbligatorio"; ok = false; }

    const mail = editEmail.trim();
    if (!mail) {
      errs.email = "Campo obbligatorio"; ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      errs.email = "Inserisci un'email valida"; ok = false;
    }

    if (ok) {
      const n = editNome.trim().toLowerCase();
      const cog = editCognome.trim().toLowerCase();
      if (clienti.some((c) => c.id !== selectedCliente?.id && c.nome.trim().toLowerCase() === n && c.cognome.trim().toLowerCase() === cog)) {
        errs.duplicato = "Esiste già un cliente con questo nome e cognome"; ok = false;
      }
    }

    setEditErrors(errs);
    return ok;
  }

  function handleEditSubmit() {
    if (!validateEdit() || !selectedCliente) return;
    const updated: Cliente = {
      ...selectedCliente,
      nome: editNome.trim(),
      cognome: editCognome.trim(),
      telefono: editTelefono.trim(),
      citta: editCitta.trim(),
      email: editEmail.trim() || null,
      note: editNote.trim() || null,
    };
    setClienti((prev) => prev.map((c) => (c.id === selectedCliente.id ? updated : c)));
    setSelectedCliente(updated);
    setIsEditOpen(false);
    resetEditForm();
    showSuccess("Cliente modificato con successo");
  }

  // ── Lavori pregressi handlers ─────────────────────────────────────────────────

  function addLavoro() {
    lavoroCounter.current++;
    const allCodes = [
      ...LAVORI_STORICO.map((l) => l.codiceLavoro),
      ...newLavori.map((l) => l.codiceLavoro),
    ];
    let max = 0;
    for (const code of allCodes) {
      const match = code.match(/^GS-L?(\d+)$/);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    const codiceLavoro = `GS-${String(max + 1).padStart(3, "0")}`;
    setNewLavori((prev) => [
      ...prev,
      {
        localId: lavoroCounter.current,
        codiceLavoro,
        tipoLavoro: "",
        stato: "",
        dataConsegna: "",
        prezzo: "",
        descrizione: "",
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

  function openDeleteFromEdit() {
    setIsEditOpen(false);
    setIsDeleteOpen(true);
  }

  function handleDelete() {
    if (!selectedCliente) return;
    setClienti((prev) => prev.filter((c) => c.id !== selectedCliente.id));
    setIsDeleteOpen(false);
    setSelectedCliente(null);
    showSuccess("Cliente eliminato");
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const visibleClienti = filteredAndSorted.slice(0, visibleCount);
  const remaining = filteredAndSorted.length - visibleCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clienti"
        description="Gestisci l'anagrafica dei clienti del laboratorio."
      />

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-slate-800">Archivio clienti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Barra filtri */}
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
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

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Città</label>
              <select
                value={filterCitta}
                onChange={(e) => setFilterCitta(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutte</option>
                {Array.from(new Set(clienti.map((c) => c.citta).filter((c): c is string => c !== null))).sort().map((citta) => (
                  <option key={citta} value={citta}>{citta}</option>
                ))}
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
          <Table>
            <TableHeader>
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
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("citta")}>
                  Città <SortIndicator active={sortBy === "citta"} order={sortOrder} />
                </TableHead>
                <TableHead className="cursor-pointer select-none whitespace-nowrap min-w-[200px]" onClick={() => handleSort("numeroLavori")}>
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
              {!loading && !error && visibleClienti.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => { setSelectedCliente(cliente); setIsDetailOpen(true); }}
                >
                  <TableCell className="font-medium text-slate-800">{cliente.nome}</TableCell>
                  <TableCell className="text-slate-700">{cliente.cognome}</TableCell>
                  <TableCell className="font-mono text-[12px] text-slate-600">{cliente.telefono}</TableCell>
                  <TableCell className="text-slate-700">{cliente.citta}</TableCell>
                  <TableCell className="min-w-[200px]">
                    {(() => {
                      const { completati, inCorso, daFare, annullati, totale } = getSegmenti(cliente.id, tuttiLavori);
                      if (totale === 0) return <span className="text-slate-400">—</span>;
                      return (
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-sm text-slate-700">
                            {totale}
                          </span>
                          <div
                            className="flex flex-1 items-center gap-1 pr-4"
                            onMouseEnter={(e) => setTooltipData({ cliente, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setTooltipData({ cliente, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltipData(null)}
                          >
                            {completati > 0 && (
                              <div className="h-2 rounded-full bg-green-400" style={{ width: `${(completati / totale) * 100}%`, minWidth: "8px" }} />
                            )}
                            {inCorso > 0 && (
                              <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(inCorso / totale) * 100}%`, minWidth: "8px" }} />
                            )}
                            {daFare > 0 && (
                              <div className="h-2 rounded-full bg-stone-300" style={{ width: `${(daFare / totale) * 100}%`, minWidth: "8px" }} />
                            )}
                            {annullati > 0 && (
                              <div className="h-2 rounded-full bg-red-400" style={{ width: `${(annullati / totale) * 100}%`, minWidth: "8px" }} />
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && visibleClienti.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    Nessun cliente trovato. Prova a modificare i filtri.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Carica altri */}
          <div className="border-t border-slate-100 py-4 text-center">
            {remaining > 0 ? (
              <p className="text-sm text-slate-500">
                Mostrati {visibleClienti.length} di {filteredAndSorted.length} clienti{"  "}
                <button
                  className="font-medium text-amber-600 hover:underline"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Carica altri
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-400">Tutti i clienti sono visualizzati</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ══ Tooltip lavori (segue il mouse) ═════════════════════════════════════ */}
      {tooltipData && (() => {
        const { completati, inCorso, daFare, annullati } = getSegmenti(tooltipData.cliente.id, tuttiLavori);
        return (
          <div
            style={{ position: "fixed", left: tooltipData.x + 12, top: tooltipData.y + 12, pointerEvents: "none", zIndex: 50 }}
            className="whitespace-nowrap rounded-lg bg-stone-800 px-3 py-2 text-xs text-white shadow-lg"
          >
            {completati > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Consegnati: {completati}
              </div>
            )}
            {inCorso > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                In corso: {inCorso}
              </div>
            )}
            {daFare > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-stone-300" />
                Da iniziare: {daFare}
              </div>
            )}
            {annullati > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Annullati: {annullati}
              </div>
            )}
          </div>
        );
      })()}

      {/* ══ Banner successo ══════════════════════════════════════════════════════ */}
      {isMounted && showBanner && createPortal(
        <div className="fixed right-4 top-4 z-[500] flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50/40 px-4 py-3 shadow-md">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
          <p className="text-[13px] font-medium text-emerald-800">{bannerMessage}</p>
        </div>,
        document.body
      )}

      {/* ══ Modal dettaglio cliente ══════════════════════════════════════════════ */}
      {isMounted && isDetailOpen && selectedCliente && detailStats && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.03em] text-slate-800">
                  {selectedCliente.nome} {selectedCliente.cognome}
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Cliente dal {formatDataIt(selectedCliente.dataRegistrazione)}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                  onClick={openEditFromDetail}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Modifica
                </Button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setIsDetailOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="space-y-6 p-6">
              {/* Strip 4 mini-card */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Lavori totali", value: String(selectedCliente.numeroLavori), amber: false },
                  { label: "Lavori attivi", value: String(selectedCliente.lavoriAttivi), amber: selectedCliente.lavoriAttivi > 0 },
                  { label: "Totale speso",  value: `€ ${detailStats.totaleSpeso}`,       amber: false },
                  { label: "Da incassare",  value: `€ ${detailStats.daIncassare}`,        amber: false },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {s.label}
                    </p>
                    <p className={`mt-1 text-[20px] font-bold tracking-[-0.03em] ${s.amber ? "text-amber-700" : "text-slate-800"}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contatti */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Contatti
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Telefono</p>
                    <a
                      href={`tel:${selectedCliente.telefono}`}
                      className="font-mono text-[13px] font-medium text-amber-700 hover:underline"
                    >
                      {selectedCliente.telefono}
                    </a>
                  </div>
                  {selectedCliente.citta && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Città</p>
                      <p className="text-[13px] font-medium text-slate-700">{selectedCliente.citta}</p>
                    </div>
                  )}
                  {selectedCliente.email && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
                      <a
                        href={`mailto:${selectedCliente.email}`}
                        className="text-[13px] font-medium text-amber-700 hover:underline"
                      >
                        {selectedCliente.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Note — solo se presenti */}
              {selectedCliente.note && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Note</p>
                  <p className="text-[13px] text-slate-700">{selectedCliente.note}</p>
                </div>
              )}

              {/* Storico lavori */}
              <div>
                <p className="mb-3 text-[15px] font-semibold text-slate-800">Storico lavori</p>
                {detailStats.sorted.length === 0 ? (
                  <p className="text-center text-[13px] text-slate-500">
                    Nessun lavoro registrato per questo cliente.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
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
                          <tr key={lav.id} className="border-b border-stone-100 last:border-0">
                            <td className="py-2 font-mono text-slate-600">{lav.codiceLavoro}</td>
                            <td className="py-2 text-slate-700">{lav.tipoLavoro}</td>
                            <td className="py-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[lav.stato] ?? "bg-stone-100 text-stone-700"}`}>
                                {lav.stato}
                              </span>
                            </td>
                            <td className="py-2 text-slate-500">{formatDataIt(lav.dataConsegna)}</td>
                            <td className="py-2 text-right font-medium text-slate-700">€ {lav.prezzo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Link lavori */}
              <a
                href="/lavori"
                className="block text-[13px] font-medium text-amber-700 hover:underline"
              >
                Gestisci i lavori di {selectedCliente.nome} {selectedCliente.cognome} →
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal nuovo cliente ══════════════════════════════════════════════════ */}
      {isMounted && isNewOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsNewOpen(false); resetNewForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Corpo */}
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
                <input
                  type="text"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="Es. Mario"
                  className={newErrors.nome ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.nome && <p className="mt-1 text-[12px] text-red-500">{newErrors.nome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCognome}
                  onChange={(e) => setNewCognome(e.target.value)}
                  placeholder="Es. Rossi"
                  className={newErrors.cognome ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.cognome && <p className="mt-1 text-[12px] text-red-500">{newErrors.cognome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Telefono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  placeholder="Es. 333-1234567"
                  className={newErrors.telefono ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.telefono && <p className="mt-1 text-[12px] text-red-500">{newErrors.telefono}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Città <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCitta}
                  onChange={(e) => setNewCitta(e.target.value)}
                  placeholder="Es. Milano"
                  className={newErrors.citta ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.citta && <p className="mt-1 text-[12px] text-red-500">{newErrors.citta}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Es. mario.rossi@email.it"
                  className={newErrors.email ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.email && <p className="mt-1 text-[12px] text-red-500">{newErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Note interne sul cliente..."
                  rows={3}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>

            {/* Sezione lavori pregressi */}
            <div className="border-t border-stone-200 px-6">
              <div
                className="flex cursor-pointer flex-col py-3 hover:bg-stone-50 -mx-6 px-6"
                onClick={() => setIsLavoriOpen((o) => !o)}
              >
                <div className="flex items-center gap-2">
                  {isLavoriOpen
                    ? <ChevronDown className="h-4 w-4 text-slate-500" />
                    : <ChevronRight className="h-4 w-4 text-slate-500" />
                  }
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
                        <select
                          value={lav.tipoLavoro}
                          onChange={(e) => updateLavoro(lav.localId, "tipoLavoro", e.target.value)}
                          className={`flex-1 rounded border ${lav.errors.tipoLavoro ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}
                        >
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
                        <select
                          value={lav.stato}
                          onChange={(e) => updateLavoro(lav.localId, "stato", e.target.value)}
                          className={`w-36 rounded border ${lav.errors.stato ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}
                        >
                          <option value="">Stato</option>
                          <option>Da iniziare</option>
                          <option>In lavorazione</option>
                          <option>In attesa cliente</option>
                          <option>Pronto</option>
                          <option>Consegnato</option>
                          <option>Annullato</option>
                        </select>
                        <input
                          type="date"
                          value={lav.dataConsegna}
                          onChange={(e) => updateLavoro(lav.localId, "dataConsegna", e.target.value)}
                          className={`w-36 rounded border ${lav.errors.dataConsegna ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="€"
                          value={lav.prezzo}
                          onChange={(e) => updateLavoro(lav.localId, "prezzo", e.target.value)}
                          className={`w-20 rounded border ${lav.errors.prezzo ? "border-red-300 bg-red-50" : "border-stone-200"} bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleLavoroExpanded(lav.localId)}
                          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-stone-100 hover:text-slate-600"
                        >
                          {lav.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeLavoro(lav.localId); }}
                          className="flex h-7 w-7 items-center justify-center rounded text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {lav.expanded && (
                        <div className="mt-2">
                          <textarea
                            value={lav.descrizione}
                            onChange={(e) => updateLavoro(lav.localId, "descrizione", e.target.value)}
                            placeholder="Es. orlo a macchina su pantalone blu elegante"
                            rows={2}
                            className="w-full resize-none rounded border border-stone-200 bg-white px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLavoro}
                    className="w-full rounded-lg border border-amber-600 py-2 text-[13px] font-medium text-amber-700 hover:bg-amber-50"
                  >
                    + Aggiungi lavoro
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => { setIsNewOpen(false); resetNewForm(); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleNewSubmit}
                className="rounded-lg bg-amber-600 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98]"
              >
                Salva cliente
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal modifica cliente ═══════════════════════════════════════════════ */}
      {isMounted && isEditOpen && selectedCliente && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsEditOpen(false); resetEditForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.025em] text-slate-900">Modifica cliente</h2>
                <p className="mt-1 text-[13px] text-slate-400">
                  {selectedCliente.nome} {selectedCliente.cognome}
                </p>
              </div>
              <button
                className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => { setIsEditOpen(false); resetEditForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-4 p-6">
              {editErrors.duplicato && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {editErrors.duplicato}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className={editErrors.nome ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.nome && <p className="mt-1 text-[12px] text-red-500">{editErrors.nome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCognome}
                  onChange={(e) => setEditCognome(e.target.value)}
                  className={editErrors.cognome ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.cognome && <p className="mt-1 text-[12px] text-red-500">{editErrors.cognome}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Telefono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  className={editErrors.telefono ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.telefono && <p className="mt-1 text-[12px] text-red-500">{editErrors.telefono}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Città <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCitta}
                  onChange={(e) => setEditCitta(e.target.value)}
                  placeholder="Es. Milano"
                  className={editErrors.citta ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.citta && <p className="mt-1 text-[12px] text-red-500">{editErrors.citta}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={editErrors.email ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.email && <p className="mt-1 text-[12px] text-red-500">{editErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Note
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={openDeleteFromEdit}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Elimina cliente
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); resetEditForm(); }}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98]"
                >
                  Salva modifiche
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal conferma eliminazione ══════════════════════════════════════════ */}
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
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-red-700 active:scale-[0.98]"
              >
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
