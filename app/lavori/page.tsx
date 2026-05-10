"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ClipboardList,
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Trash2,
  RefreshCw,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type Job = {
  id: number;
  code: string;
  clientName: string;
  title: string;
  type: string;
  status: string;
  receivedDate: string;
  dueDate: string;
  estimatedPrice: number;
  finalPrice: number | null;
  description: string;
  notes: string | null;
};

const allJobs: Job[] = [
  {
    id: 1,
    code: "GS-001",
    clientName: "Mario Rossi",
    title: "Orlo pantalone elegante",
    type: "Orlo pantalone",
    status: "In lavorazione",
    receivedDate: "2025-05-08",
    dueDate: "2025-05-10",
    estimatedPrice: 15,
    finalPrice: null,
    description: "Orlo pantalone in lana nera",
    notes: "Cliente preferisce orlo a mano",
  },
  {
    id: 2,
    code: "GS-002",
    clientName: "Luca Bianchi",
    title: "Stringere vita jeans",
    type: "Stringere vita",
    status: "Pronto",
    receivedDate: "2025-05-07",
    dueDate: "2025-05-10",
    estimatedPrice: 20,
    finalPrice: 20,
    description: "Stringere vita jeans blu",
    notes: null,
  },
  {
    id: 3,
    code: "GS-003",
    clientName: "Anna Verdi",
    title: "Sostituzione zip",
    type: "Sostituzione zip",
    status: "In attesa cliente",
    receivedDate: "2025-05-06",
    dueDate: "2025-05-12",
    estimatedPrice: 18,
    finalPrice: null,
    description: "Sostituire zip pantaloni casual",
    notes: "Manca zip, cliente la porta dopo",
  },
  {
    id: 4,
    code: "GS-004",
    clientName: "Giuseppe Neri",
    title: "Accorciare pantalone",
    type: "Accorciare gamba",
    status: "Da iniziare",
    receivedDate: "2025-05-09",
    dueDate: "2025-05-15",
    estimatedPrice: 12,
    finalPrice: null,
    description: "Accorciare pantalone di 4 cm",
    notes: null,
  },
  {
    id: 5,
    code: "GS-005",
    clientName: "Francesca Conti",
    title: "Riparazione strappo interno",
    type: "Riparazione strappo",
    status: "Consegnato",
    receivedDate: "2025-04-28",
    dueDate: "2025-05-05",
    estimatedPrice: 22,
    finalPrice: 22,
    description: "Riparare strappo coscia interna",
    notes: "Consegnato il 05/05",
  },
  {
    id: 6,
    code: "GS-006",
    clientName: "Roberto Ferrara",
    title: "Pantalone su misura",
    type: "Pantalone su misura",
    status: "In lavorazione",
    receivedDate: "2025-04-20",
    dueDate: "2025-05-25",
    estimatedPrice: 85,
    finalPrice: null,
    description: "Pantalone completo su misura in lana grigia",
    notes: "3 prove previste",
  },
  {
    id: 7,
    code: "GS-007",
    clientName: "Mario Rossi",
    title: "Allargare fianchi",
    type: "Allargare pantalone",
    status: "Da iniziare",
    receivedDate: "2025-05-09",
    dueDate: "2025-05-20",
    estimatedPrice: 25,
    finalPrice: null,
    description: "Allargare fianchi di 3 cm",
    notes: null,
  },
  {
    id: 8,
    code: "GS-008",
    clientName: "Luca Bianchi",
    title: "Orlo pantalone da cerimonia",
    type: "Orlo pantalone",
    status: "Annullato",
    receivedDate: "2025-04-15",
    dueDate: "2025-05-05",
    estimatedPrice: 30,
    finalPrice: null,
    description: "Orlo pantalone da cerimonia in seta",
    notes: "Annullato: cliente ha trovato sartoria diversa",
  },
  {
    id: 9,
    code: "GS-009",
    clientName: "Anna Verdi",
    title: "Modificare vita e accorciare",
    type: "Stringere vita",
    status: "Pronto",
    receivedDate: "2025-05-04",
    dueDate: "2025-05-09",
    estimatedPrice: 28,
    finalPrice: 28,
    description: "Stringere vita e accorciare gamba",
    notes: "Cliente è regolare",
  },
  {
    id: 10,
    code: "GS-010",
    clientName: "Giuseppe Neri",
    title: "Riparazione tasca",
    type: "Riparazione strappo",
    status: "Pronto",
    receivedDate: "2025-05-08",
    dueDate: "2025-05-11",
    estimatedPrice: 16,
    finalPrice: 16,
    description: "Riparare tasca posteriore strappata",
    notes: null,
  },
  {
    id: 11,
    code: "GS-011",
    clientName: "Francesca Conti",
    title: "Accorciare gamba destra",
    type: "Accorciare gamba",
    status: "Da iniziare",
    receivedDate: "2025-05-09",
    dueDate: "2025-05-18",
    estimatedPrice: 14,
    finalPrice: null,
    description: "Accorciare solo gamba destra di 3 cm",
    notes: "Asimmetria segnalata dal cliente",
  },
  {
    id: 12,
    code: "GS-012",
    clientName: "Roberto Ferrara",
    title: "Orlo jeans doppio",
    type: "Orlo pantalone",
    status: "In lavorazione",
    receivedDate: "2025-05-08",
    dueDate: "2025-05-13",
    estimatedPrice: 18,
    finalPrice: null,
    description: "Orlo doppio jeans scuro",
    notes: null,
  },
  {
    id: 13,
    code: "GS-013",
    clientName: "Mario Rossi",
    title: "Sostituzione zip laterale",
    type: "Sostituzione zip",
    status: "In attesa cliente",
    receivedDate: "2025-05-07",
    dueDate: "2025-05-14",
    estimatedPrice: 20,
    finalPrice: null,
    description: "Zip laterale rotta su pantalone elegante",
    notes: "Cliente deve scegliere colore zip",
  },
  {
    id: 14,
    code: "GS-014",
    clientName: "Anna Verdi",
    title: "Riparazione fodera interna",
    type: "Riparazione strappo",
    status: "Pronto",
    receivedDate: "2025-05-05",
    dueDate: "2025-05-10",
    estimatedPrice: 24,
    finalPrice: 24,
    description: "Fodera interna scucita su pantalone invernale",
    notes: null,
  },
  {
    id: 15,
    code: "GS-015",
    clientName: "Giuseppe Neri",
    title: "Stringere fondo gamba",
    type: "Altro",
    status: "Da iniziare",
    receivedDate: "2025-05-10",
    dueDate: "2025-05-22",
    estimatedPrice: 16,
    finalPrice: null,
    description: "Stringere il fondo di entrambe le gambe",
    notes: "Stile slim richiesto dal cliente",
  },
];

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

const FIELD_CLASS =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
const FIELD_ERROR_CLASS =
  "w-full rounded-lg border border-red-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";

const stages = [
  { label: "Da iniziare", count: 6 },
  { label: "In lavorazione", count: 11 },
  { label: "In attesa cliente", count: 4 },
  { label: "Pronti", count: 9 },
];

const STATUS_COLORS: Record<string, string> = {
  "Da iniziare": "bg-slate-200 text-slate-800 border-transparent",
  "In lavorazione": "bg-blue-200 text-blue-800 border-transparent",
  "In attesa cliente": "bg-orange-200 text-orange-800 border-transparent",
  Pronto: "bg-green-200 text-green-800 border-transparent",
  Consegnato: "bg-emerald-700 text-white border-transparent",
  Annullato: "bg-red-200 text-red-800 border-transparent",
};

const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer";

type SortKey =
  | "code"
  | "clientName"
  | "title"
  | "type"
  | "status"
  | "dueDate"
  | "estimatedPrice";
type SortOrder = "asc" | "desc";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800">
        {value != null && value !== "" ? (
          value
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </p>
    </div>
  );
}

function SortIndicator({
  active,
  order,
}: {
  active: boolean;
  order: SortOrder;
}) {
  if (!active)
    return (
      <ChevronUp className="ml-1 inline-block h-3 w-3 opacity-30" />
    );
  return order === "asc" ? (
    <ChevronUp className="ml-1 inline-block h-3 w-3 text-amber-600" />
  ) : (
    <ChevronDown className="ml-1 inline-block h-3 w-3 text-amber-600" />
  );
}

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function JobsPage() {
  // List state (mutable for delete / status change)
  const [jobs, setJobs] = useState<Job[]>(allJobs);

  // Filter + sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showMore, setShowMore] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal dettaglio
  const [selectedLavoro, setSelectedLavoro] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quickStatusValue, setQuickStatusValue] = useState("");
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Banner successo
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal nuovo lavoro
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCliente, setNewCliente] = useState("");
  const [newTitolo, setNewTitolo] = useState("");
  const [newTipoLavoro, setNewTipoLavoro] = useState("");
  const [newDataConsegna, setNewDataConsegna] = useState("");
  const [newDescrizione, setNewDescrizione] = useState("");
  const [newPrezzoStimato, setNewPrezzoStimato] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newErrors, setNewErrors] = useState({
    cliente: "",
    titolo: "",
    tipoLavoro: "",
    dataConsegna: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal modifica lavoro
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState("");
  const [editTitolo, setEditTitolo] = useState("");
  const [editTipoLavoro, setEditTipoLavoro] = useState("");
  const [editDataConsegna, setEditDataConsegna] = useState("");
  const [editDescrizione, setEditDescrizione] = useState("");
  const [editPrezzoStimato, setEditPrezzoStimato] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editErrors, setEditErrors] = useState({
    cliente: "",
    titolo: "",
    tipoLavoro: "",
    dataConsegna: "",
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = localDateStr(now);

    let result = [...jobs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.clientName.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.code.toLowerCase().includes(q)
      );
    }

    if (filterStatus) {
      result = result.filter((j) => j.status === filterStatus);
    }

    if (filterType) {
      result = result.filter((j) => j.type === filterType);
    }

    if (filterDueDate) {
      if (filterDueDate === "today") {
        result = result.filter((j) => j.dueDate === todayStr);
      } else if (filterDueDate === "week") {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekEndStr = localDateStr(weekEnd);
        result = result.filter(
          (j) => j.dueDate >= todayStr && j.dueDate <= weekEndStr
        );
      } else if (filterDueDate === "month") {
        const monthStart = localDateStr(
          new Date(now.getFullYear(), now.getMonth(), 1)
        );
        const monthEnd = localDateStr(
          new Date(now.getFullYear(), now.getMonth() + 1, 0)
        );
        result = result.filter(
          (j) => j.dueDate >= monthStart && j.dueDate <= monthEnd
        );
      } else if (filterDueDate === "overdue") {
        result = result.filter((j) => j.dueDate < todayStr);
      } else if (filterDueDate === "custom") {
        if (dateFrom) result = result.filter((j) => j.dueDate >= dateFrom);
        if (dateTo) result = result.filter((j) => j.dueDate <= dateTo);
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
  }, [jobs, searchQuery, filterStatus, filterType, filterDueDate, dateFrom, dateTo, sortBy, sortOrder]);

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  function resetFilters() {
    setSearchQuery("");
    setFilterStatus("");
    setFilterDueDate("");
    setFilterType("");
    setDateFrom("");
    setDateTo("");
  }

  function resetNewForm() {
    setNewCliente("");
    setNewTitolo("");
    setNewTipoLavoro("");
    setNewDataConsegna("");
    setNewDescrizione("");
    setNewPrezzoStimato("");
    setNewNote("");
    setNewErrors({ cliente: "", titolo: "", tipoLavoro: "", dataConsegna: "" });
    setIsSubmitting(false);
  }

  function validateNewForm(): boolean {
    const today = localDateStr(new Date());
    const next = { cliente: "", titolo: "", tipoLavoro: "", dataConsegna: "" };
    let valid = true;

    if (!newCliente) { next.cliente = "Seleziona un cliente"; valid = false; }
    if (!newTitolo.trim()) { next.titolo = "Inserisci un titolo per il lavoro"; valid = false; }
    if (!newTipoLavoro) { next.tipoLavoro = "Seleziona il tipo di lavoro"; valid = false; }
    if (!newDataConsegna) {
      next.dataConsegna = "Inserisci una data di consegna";
      valid = false;
    } else if (newDataConsegna < today) {
      next.dataConsegna = "La data non può essere nel passato";
      valid = false;
    }

    setNewErrors(next);
    return valid;
  }

  function handleNewSubmit() {
    if (!validateNewForm()) return;
    setIsSubmitting(true);
    const newId = jobs.length + 1;
    const nuovoLavoro: Job = {
      id: newId,
      code: `GS-${String(newId).padStart(3, "0")}`,
      clientName: newCliente,
      title: newTitolo,
      type: newTipoLavoro,
      status: "Da iniziare",
      receivedDate: localDateStr(new Date()),
      dueDate: newDataConsegna,
      estimatedPrice: parseFloat(newPrezzoStimato) || 0,
      finalPrice: null,
      description: newDescrizione || "",
      notes: newNote || null,
    };
    setTimeout(() => {
      setJobs((prev) => [...prev, nuovoLavoro]);
      setIsSubmitting(false);
      setIsNewModalOpen(false);
      resetNewForm();
      setSuccessMessage("Lavoro creato con successo!");
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 3000);
    }, 500);
  }

  function openEditModal(lavoro: Job) {
    setEditCliente(lavoro.clientName);
    setEditTitolo(lavoro.title);
    setEditTipoLavoro(lavoro.type);
    setEditDataConsegna(lavoro.dueDate);
    setEditDescrizione(lavoro.description || "");
    setEditPrezzoStimato(lavoro.estimatedPrice?.toString() || "");
    setEditNote(lavoro.notes || "");
    setEditErrors({ cliente: "", titolo: "", tipoLavoro: "", dataConsegna: "" });
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  }

  function resetEditForm() {
    setEditCliente("");
    setEditTitolo("");
    setEditTipoLavoro("");
    setEditDataConsegna("");
    setEditDescrizione("");
    setEditPrezzoStimato("");
    setEditNote("");
    setEditErrors({ cliente: "", titolo: "", tipoLavoro: "", dataConsegna: "" });
    setIsEditSubmitting(false);
  }

  function validateEditForm(): boolean {
    const next = { cliente: "", titolo: "", tipoLavoro: "", dataConsegna: "" };
    let valid = true;

    if (!editCliente) { next.cliente = "Seleziona un cliente"; valid = false; }
    if (!editTitolo.trim()) { next.titolo = "Inserisci un titolo per il lavoro"; valid = false; }
    if (!editTipoLavoro) { next.tipoLavoro = "Seleziona il tipo di lavoro"; valid = false; }
    if (!editDataConsegna) { next.dataConsegna = "Inserisci una data di consegna"; valid = false; }

    setEditErrors(next);
    return valid;
  }

  function handleEditSubmit() {
    if (!validateEditForm()) return;
    setIsEditSubmitting(true);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedLavoro!.id
            ? {
                ...j,
                clientName: editCliente,
                title: editTitolo,
                type: editTipoLavoro,
                dueDate: editDataConsegna,
                description: editDescrizione || "",
                estimatedPrice: parseFloat(editPrezzoStimato) || 0,
                notes: editNote || null,
              }
            : j
        )
      );
      setIsEditSubmitting(false);
      setIsEditModalOpen(false);
      resetEditForm();
      setSuccessMessage("Lavoro modificato con successo!");
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 3000);
    }, 500);
  }

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isNewModalOpen || isEditModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isNewModalOpen, isEditModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isEditModalOpen) {
          setIsEditModalOpen(false);
          resetEditForm();
          return;
        }
        if (isNewModalOpen) {
          setIsNewModalOpen(false);
          resetNewForm();
          return;
        }
        setShowDeleteConfirm(false);
        setIsModalOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isNewModalOpen, isEditModalOpen]);

  function openModal(job: Job) {
    setSelectedLavoro(job);
    setQuickStatusValue(job.status);
    setShowStatusChange(false);
    setShowDeleteConfirm(false);
    setIsModalOpen(true);
  }

  function applyStatusChange() {
    if (!selectedLavoro) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedLavoro.id ? { ...j, status: quickStatusValue } : j
      )
    );
    setSelectedLavoro((prev) =>
      prev ? { ...prev, status: quickStatusValue } : null
    );
    setShowStatusChange(false);
  }

  function deleteLavoro() {
    if (!selectedLavoro) return;
    setJobs((prev) => prev.filter((j) => j.id !== selectedLavoro.id));
    setShowDeleteConfirm(false);
    setIsModalOpen(false);
    setSelectedLavoro(null);
  }

  const visibleJobs = filteredAndSorted.slice(0, showMore);
  const remaining = filteredAndSorted.length - showMore;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lavori"
        description="Pianifica modifiche, riparazioni, confezioni su misura e urgenze di consegna."
        actions={
          <Button
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => setIsNewModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuovo lavoro
          </Button>
        }
      />

      {showSuccessBanner && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-700">{successMessage}</p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stage.label}</p>
                <p className="text-2xl font-semibold">{stage.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Lavori recenti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Barra filtri */}
          <div className="flex flex-wrap items-end gap-3 border-b bg-stone-50 px-4 py-3">
            <div className="flex flex-col gap-1 min-w-[260px] flex-1">
              <label className="text-xs font-medium text-slate-500">
                Cerca
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca cliente, titolo o codice..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Stato
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti gli stati</option>
                <option value="Da iniziare">Da iniziare</option>
                <option value="In lavorazione">In lavorazione</option>
                <option value="In attesa cliente">In attesa cliente</option>
                <option value="Pronto">Pronto</option>
                <option value="Consegnato">Consegnato</option>
                <option value="Annullato">Annullato</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Data consegna
              </label>
              <select
                value={filterDueDate}
                onChange={(e) => {
                  setFilterDueDate(e.target.value);
                  if (e.target.value !== "custom") {
                    setDateFrom("");
                    setDateTo("");
                  }
                }}
                className={SELECT_CLASS}
              >
                <option value="">Tutte le date</option>
                <option value="today">Oggi</option>
                <option value="week">Questa settimana</option>
                <option value="month">Questo mese</option>
                <option value="overdue">Overdue (scaduti)</option>
                <option value="custom">Personalizzato</option>
              </select>
            </div>

            {filterDueDate === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Da
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-36 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    A
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-36 text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Tipo lavoro
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti i tipi</option>
                <option value="Orlo pantalone">Orlo pantalone</option>
                <option value="Stringere vita">Stringere vita</option>
                <option value="Accorciare gamba">Accorciare gamba</option>
                <option value="Allargare pantalone">Allargare pantalone</option>
                <option value="Sostituzione zip">Sostituzione zip</option>
                <option value="Riparazione strappo">Riparazione strappo</option>
                <option value="Pantalone su misura">Pantalone su misura</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 border-amber-600 text-amber-700 hover:bg-amber-50"
              onClick={resetFilters}
            >
              Cancella filtri
            </Button>
          </div>

          {/* Tabella */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("code")}
                >
                  Codice
                  <SortIndicator active={sortBy === "code"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("clientName")}
                >
                  Cliente
                  <SortIndicator
                    active={sortBy === "clientName"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("title")}
                >
                  Titolo lavoro
                  <SortIndicator
                    active={sortBy === "title"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="hidden cursor-pointer select-none whitespace-nowrap md:table-cell"
                  onClick={() => handleSort("type")}
                >
                  Tipo
                  <SortIndicator active={sortBy === "type"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  Stato
                  <SortIndicator
                    active={sortBy === "status"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("dueDate")}
                >
                  Data consegna
                  <SortIndicator
                    active={sortBy === "dueDate"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap text-right"
                  onClick={() => handleSort("estimatedPrice")}
                >
                  Prezzo
                  <SortIndicator
                    active={sortBy === "estimatedPrice"}
                    order={sortOrder}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleJobs.map((job) => (
                <TableRow
                  key={job.code}
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => openModal(job)}
                >
                  <TableCell className="font-medium text-slate-700">
                    {job.code}
                  </TableCell>
                  <TableCell>{job.clientName}</TableCell>
                  <TableCell className="min-w-[12rem]">{job.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {job.type}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_COLORS[job.status] ??
                        "border-transparent bg-slate-200 text-slate-800"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{job.dueDate}</TableCell>
                  <TableCell className="text-right font-medium">
                    € {job.estimatedPrice}
                  </TableCell>
                </TableRow>
              ))}
              {visibleJobs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-slate-400"
                  >
                    Nessun lavoro trovato con i filtri selezionati.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Carica altri */}
          <div className="border-t border-stone-200 py-4 text-center">
            {remaining > 0 ? (
              <p className="text-sm text-slate-500">
                Stai visualizzando {visibleJobs.length} di{" "}
                {filteredAndSorted.length} lavori
                {"  "}
                <button
                  className="font-medium text-amber-600 hover:underline"
                  onClick={() => setShowMore((n) => n + 5)}
                >
                  Mostra altri 5
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Tutti i lavori sono visualizzati
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal dettaglio lavoro */}
      {isMounted && isModalOpen && selectedLavoro && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-stone-200 p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedLavoro.code}
                </h2>
                <Badge
                  className={
                    STATUS_COLORS[selectedLavoro.status] ??
                    "border-transparent bg-slate-200 text-slate-800"
                  }
                >
                  {selectedLavoro.status}
                </Badge>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cliente" value={selectedLavoro.clientName} />
                <Field label="Tipo lavoro" value={selectedLavoro.type} />
                <Field
                  label="Data ricezione"
                  value={selectedLavoro.receivedDate}
                />
                <Field
                  label="Data consegna"
                  value={selectedLavoro.dueDate}
                />
                <Field
                  label="Prezzo stimato"
                  value={`€ ${selectedLavoro.estimatedPrice}`}
                />
                <Field
                  label="Prezzo finale"
                  value={
                    selectedLavoro.finalPrice != null
                      ? `€ ${selectedLavoro.finalPrice}`
                      : null
                  }
                />
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Titolo lavoro" value={selectedLavoro.title} />
                <Field
                  label="Descrizione"
                  value={selectedLavoro.description}
                />
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                    Note interne
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedLavoro.notes ?? (
                      <span className="text-slate-400">Nessuna nota</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Sezione cambia stato (inline) */}
            {showStatusChange && (
              <div className="shrink-0 border-t border-stone-100 px-6 pb-4 pt-4">
                <p className="mb-2 text-sm text-slate-600">
                  Seleziona nuovo stato:
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={quickStatusValue}
                    onChange={(e) => setQuickStatusValue(e.target.value)}
                    className={`${SELECT_CLASS} flex-1`}
                  >
                    <option value="Da iniziare">Da iniziare</option>
                    <option value="In lavorazione">In lavorazione</option>
                    <option value="In attesa cliente">
                      In attesa cliente
                    </option>
                    <option value="Pronto">Pronto</option>
                    <option value="Consegnato">Consegnato</option>
                    <option value="Annullato">Annullato</option>
                  </select>
                  <Button
                    className="bg-amber-600 text-white hover:bg-amber-700"
                    onClick={applyStatusChange}
                  >
                    Conferma
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusChange(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-stone-200 p-6">
              <Button
                className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-stone-300 hover:bg-stone-50"
                  onClick={() => setShowStatusChange((v) => !v)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cambia stato
                </Button>
                <Button
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={() => openEditModal(selectedLavoro)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifica
                </Button>
                <Button
                  variant="outline"
                  className="border-stone-300 hover:bg-stone-50"
                  onClick={() => setIsModalOpen(false)}
                >
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal conferma eliminazione */}
      {isMounted && showDeleteConfirm && selectedLavoro && createPortal(
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              Eliminare questo lavoro?
            </h3>
            <p className="mb-5 text-sm text-slate-600">
              Stai per eliminare il lavoro {selectedLavoro.code}. Questa
              azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annulla
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={deleteLavoro}
              >
                Elimina
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal nuovo lavoro */}
      {isMounted && isNewModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-stone-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Nuovo lavoro</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Compila i campi per aggiungere un nuovo lavoro al laboratorio.
                </p>
              </div>
              <button
                className="ml-4 text-slate-400 hover:text-slate-600"
                onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-5 p-6">
              {/* Cliente */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCliente}
                  onChange={(e) => setNewCliente(e.target.value)}
                  className={newErrors.cliente ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona un cliente</option>
                  {CLIENTI.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {newErrors.cliente && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.cliente}</p>
                )}
              </div>

              {/* Titolo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Titolo lavoro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitolo}
                  onChange={(e) => setNewTitolo(e.target.value)}
                  placeholder="Es. Orlo pantalone elegante"
                  className={newErrors.titolo ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.titolo && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.titolo}</p>
                )}
              </div>

              {/* Tipo lavoro */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo lavoro <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTipoLavoro}
                  onChange={(e) => setNewTipoLavoro(e.target.value)}
                  className={newErrors.tipoLavoro ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona tipo lavoro</option>
                  {TIPI_LAVORO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {newErrors.tipoLavoro && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.tipoLavoro}</p>
                )}
              </div>

              {/* Data consegna */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data consegna <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDataConsegna}
                  min={localDateStr(new Date())}
                  onChange={(e) => setNewDataConsegna(e.target.value)}
                  className={newErrors.dataConsegna ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {newErrors.dataConsegna && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.dataConsegna}</p>
                )}
              </div>

              {/* Descrizione */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Descrizione
                </label>
                <textarea
                  value={newDescrizione}
                  onChange={(e) => setNewDescrizione(e.target.value)}
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
                  value={newPrezzoStimato}
                  onChange={(e) => setNewPrezzoStimato(e.target.value)}
                  placeholder="0"
                  min={0}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Note interne */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Note interne
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Note riservate al laboratorio..."
                  rows={3}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-stone-200 p-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-600 hover:bg-stone-50 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNewSubmit}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? "Salvataggio..." : "Salva lavoro"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal modifica lavoro */}
      {isMounted && isEditModalOpen && selectedLavoro && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-stone-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Modifica {selectedLavoro.code}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Modifica i dati del lavoro selezionato.
                </p>
              </div>
              <button
                className="ml-4 text-slate-400 hover:text-slate-600"
                onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-5 p-6">
              {/* Cliente */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={editCliente}
                  onChange={(e) => setEditCliente(e.target.value)}
                  className={editErrors.cliente ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona un cliente</option>
                  {CLIENTI.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {editErrors.cliente && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.cliente}</p>
                )}
              </div>

              {/* Titolo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Titolo lavoro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitolo}
                  onChange={(e) => setEditTitolo(e.target.value)}
                  placeholder="Es. Orlo pantalone elegante"
                  className={editErrors.titolo ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.titolo && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.titolo}</p>
                )}
              </div>

              {/* Tipo lavoro */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo lavoro <span className="text-red-500">*</span>
                </label>
                <select
                  value={editTipoLavoro}
                  onChange={(e) => setEditTipoLavoro(e.target.value)}
                  className={editErrors.tipoLavoro ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona tipo lavoro</option>
                  {TIPI_LAVORO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {editErrors.tipoLavoro && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.tipoLavoro}</p>
                )}
              </div>

              {/* Data consegna */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data consegna <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDataConsegna}
                  onChange={(e) => setEditDataConsegna(e.target.value)}
                  className={editErrors.dataConsegna ? FIELD_ERROR_CLASS : FIELD_CLASS}
                />
                {editErrors.dataConsegna && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.dataConsegna}</p>
                )}
              </div>

              {/* Descrizione */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Descrizione
                </label>
                <textarea
                  value={editDescrizione}
                  onChange={(e) => setEditDescrizione(e.target.value)}
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
                  value={editPrezzoStimato}
                  onChange={(e) => setEditPrezzoStimato(e.target.value)}
                  placeholder="0"
                  min={0}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Note interne */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Note interne
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Note riservate al laboratorio..."
                  rows={3}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-stone-200 p-6">
              <button
                type="button"
                disabled={isEditSubmitting}
                onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-600 hover:bg-stone-50 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isEditSubmitting}
                onClick={handleEditSubmit}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isEditSubmitting ? "Salvataggio..." : "Salva modifiche"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
