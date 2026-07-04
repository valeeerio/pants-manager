"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Camera,
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

type JobPhotos = {
  prima: string | null;
  dopo: string | null;
};

type Cliente = { id: string; nome: string; cognome: string };

type Job = {
  id: string;
  code: string;
  clientName: string;
  clientId?: string;
  title?: string;
  type: string;
  typeRaw?: string;
  status: string;
  statusRaw?: string;
  receivedAt: string;
  dueDate: string | null;
  price: number | null;
  description: string | null;
  notes: string | null;
  photos?: JobPhotos;
};


type PaymentData = {
  id: string;
  status: string;
  method: string | null;
  paidAt: string | null;
  createdAt: string;
};

const FIELD_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";
const FIELD_ERROR_CLASS =
  "w-full rounded-lg border border-red-300 bg-red-50/30 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/25";
const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";


const STATUS_COLORS: Record<string, string> = {
  "Da iniziare": "bg-slate-200 text-slate-800 border-transparent",
  "In lavorazione": "bg-blue-200 text-blue-800 border-transparent",
  "In attesa cliente": "bg-orange-200 text-orange-800 border-transparent",
  Pronto: "bg-green-200 text-green-800 border-transparent",
  Consegnato: "bg-emerald-700 text-white border-transparent",
  Annullato: "bg-red-200 text-red-800 border-transparent",
};

const REVERSE_STATUS_MAP: Record<string, string> = {
  "Da iniziare": "TODO",
  "In lavorazione": "IN_PROGRESS",
  "In attesa cliente": "WAITING_CUSTOMER",
  Pronto: "COMPLETED",
  Consegnato: "DELIVERED",
  Annullato: "CANCELLED",
};

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60 cursor-pointer";

type SortKey =
  | "code"
  | "clientName"
  | "type"
  | "status"
  | "dueDate"
  | "price";
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
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-[13px] font-medium text-slate-800">
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Banner successo
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Foto Prima / Dopo — per sessione, lettura base64 in memoria
  const [jobPhotos, setJobPhotos] = useState<Record<string, JobPhotos>>({});
  const inputPrimaRef = useRef<HTMLInputElement>(null);
  const inputDopoRef = useRef<HTMLInputElement>(null);

  // Clienti disponibili (da API)
  const [clientiDisponibili, setClientiDisponibili] = useState<Cliente[]>([]);

  // Modal nuovo lavoro
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCliente, setNewCliente] = useState("");
  const [newTipoLavoro, setNewTipoLavoro] = useState("");
  const [newDataConsegna, setNewDataConsegna] = useState("");
  const [newDescrizione, setNewDescrizione] = useState("");
  const [newPrezzoStimato, setNewPrezzoStimato] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newErrors, setNewErrors] = useState({
    cliente: "",
    tipoLavoro: "",
    dataConsegna: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal modifica lavoro
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState("");
  const [editTipoLavoro, setEditTipoLavoro] = useState("");
  const [editDataConsegna, setEditDataConsegna] = useState("");
  const [editDescrizione, setEditDescrizione] = useState("");
  const [editPrezzoStimato, setEditPrezzoStimato] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editErrors, setEditErrors] = useState({
    cliente: "",
    tipoLavoro: "",
    dataConsegna: "",
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Pagamento collegato al lavoro nel modal dettaglio
  const [existingPayment, setExistingPayment] = useState<PaymentData | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function caricaDati() {
      try {
        setLoading(true);
        const [resLavori, resClienti] = await Promise.all([
          fetch("/api/lavori"),
          fetch("/api/clienti"),
        ]);
        if (!resLavori.ok) throw new Error("Errore nel caricamento lavori");
        if (!resClienti.ok) throw new Error("Errore nel caricamento clienti");
        const [lavori, clienti] = await Promise.all([
          resLavori.json(),
          resClienti.json(),
        ]);
        setJobs(lavori);
        setClientiDisponibili(clienti);
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare i dati. Riprova.");
      } finally {
        setLoading(false);
      }
    }
    caricaDati();
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
          j.type.toLowerCase().includes(q) ||
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
          (j) => j.dueDate != null && j.dueDate >= todayStr && j.dueDate <= weekEndStr
        );
      } else if (filterDueDate === "month") {
        const monthStart = localDateStr(
          new Date(now.getFullYear(), now.getMonth(), 1)
        );
        const monthEnd = localDateStr(
          new Date(now.getFullYear(), now.getMonth() + 1, 0)
        );
        result = result.filter(
          (j) => j.dueDate != null && j.dueDate >= monthStart && j.dueDate <= monthEnd
        );
      } else if (filterDueDate === "overdue") {
        result = result.filter((j) => j.dueDate != null && j.dueDate < todayStr);
      } else if (filterDueDate === "custom") {
        if (dateFrom) result = result.filter((j) => j.dueDate != null && j.dueDate >= dateFrom);
        if (dateTo) result = result.filter((j) => j.dueDate != null && j.dueDate <= dateTo);
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

  const stages = useMemo(() => [
    { label: "Da iniziare", count: jobs.filter((j) => j.statusRaw === "TODO").length },
    { label: "In lavorazione", count: jobs.filter((j) => j.statusRaw === "IN_PROGRESS").length },
    { label: "In attesa cliente", count: jobs.filter((j) => j.statusRaw === "WAITING_CUSTOMER").length },
    { label: "Pronti", count: jobs.filter((j) => j.statusRaw === "COMPLETED").length },
  ], [jobs]);

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
    setNewTipoLavoro("");
    setNewDataConsegna("");
    setNewDescrizione("");
    setNewPrezzoStimato("");
    setNewNote("");
    setNewErrors({ cliente: "", tipoLavoro: "", dataConsegna: "" });
    setIsSubmitting(false);
  }

  function validateNewForm(): boolean {
    const today = localDateStr(new Date());
    const next = { cliente: "", tipoLavoro: "", dataConsegna: "" };
    let valid = true;

    if (!newCliente) { next.cliente = "Seleziona un cliente"; valid = false; }
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

  async function handleNewSubmit() {
    if (!validateNewForm()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lavori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newCliente,
          type: newTipoLavoro,
          dueDate: newDataConsegna,
          description: newDescrizione || null,
          price: newPrezzoStimato || null,
          notes: newNote || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella creazione");
      }

      const lavoroCreato = await res.json();
      setJobs((prev) => [lavoroCreato, ...prev]);
      setIsNewModalOpen(false);
      resetNewForm();
      setSuccessMessage("Lavoro creato con successo!");
      setShowSuccessBanner(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal(lavoro: Job) {
    setEditCliente(lavoro.clientId ?? "");
    setEditTipoLavoro(lavoro.typeRaw ?? "");
    setEditDataConsegna(lavoro.dueDate ?? "");
    setEditDescrizione(lavoro.description || "");
    setEditPrezzoStimato(lavoro.price?.toString() || "");
    setEditNote(lavoro.notes || "");
    setEditErrors({ cliente: "", tipoLavoro: "", dataConsegna: "" });
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  }

  function resetEditForm() {
    setEditCliente("");
    setEditTipoLavoro("");
    setEditDataConsegna("");
    setEditDescrizione("");
    setEditPrezzoStimato("");
    setEditNote("");
    setEditErrors({ cliente: "", tipoLavoro: "", dataConsegna: "" });
    setIsEditSubmitting(false);
  }

  function validateEditForm(): boolean {
    const next = { cliente: "", tipoLavoro: "", dataConsegna: "" };
    let valid = true;

    if (!editCliente) { next.cliente = "Seleziona un cliente"; valid = false; }
    if (!editTipoLavoro) { next.tipoLavoro = "Seleziona il tipo di lavoro"; valid = false; }
    if (!editDataConsegna) { next.dataConsegna = "Inserisci una data di consegna"; valid = false; }

    setEditErrors(next);
    return valid;
  }

  async function handleEditSubmit() {
    if (!validateEditForm()) return;
    setIsEditSubmitting(true);
    try {
      const res = await fetch(`/api/lavori/${selectedLavoro!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: editCliente,
          type: editTipoLavoro,
          status: selectedLavoro!.statusRaw ?? "TODO",
          dueDate: editDataConsegna || null,
          description: editDescrizione || null,
          price: editPrezzoStimato || null,
          notes: editNote || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella modifica");
      }

      const lavoroAggiornato = await res.json();
      setJobs((prev) =>
        prev.map((j) => (j.id === lavoroAggiornato.id ? lavoroAggiornato : j))
      );
      setIsEditModalOpen(false);
      resetEditForm();
      setSuccessMessage("Lavoro modificato con successo!");
      setShowSuccessBanner(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditSubmitting(false);
    }
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

  useEffect(() => {
    if (!isModalOpen || !selectedLavoro) return;
    setExistingPayment(null);
    setPaymentError("");
    setPaymentSavedMsg(false);
    setIsPaymentLoading(true);
    fetch(`/api/pagamenti?projectId=${selectedLavoro.id}`)
      .then((r) => r.json())
      .then((data: PaymentData[]) => {
        setExistingPayment(data.length > 0 ? data[0] : null);
      })
      .catch(() => setPaymentError("Impossibile caricare il pagamento."))
      .finally(() => setIsPaymentLoading(false));
  }, [selectedLavoro?.id, isModalOpen]);

  useEffect(() => {
    if (existingPayment) {
      setPaymentStatus(existingPayment.status);
      setPaymentMethod(existingPayment.method ?? "");
    } else {
      setPaymentStatus("UNPAID");
      setPaymentMethod("");
    }
  }, [existingPayment]);

  useEffect(() => {
    if (!paymentSavedMsg) return;
    const t = setTimeout(() => setPaymentSavedMsg(false), 2000);
    return () => clearTimeout(t);
  }, [paymentSavedMsg]);

  async function savePayment() {
    if (!selectedLavoro) return;
    setPaymentError("");
    setIsPaymentSaving(true);
    try {
      const body = { status: paymentStatus, method: paymentMethod || null };
      const res = existingPayment
        ? await fetch(`/api/pagamenti/${existingPayment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/pagamenti", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: selectedLavoro.id, ...body }),
          });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nel salvataggio");
      }
      const saved: PaymentData = await res.json();
      setExistingPayment(saved);
      setPaymentSavedMsg(true);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setIsPaymentSaving(false);
    }
  }

  function openModal(job: Job) {
    setSelectedLavoro(job);
    setQuickStatusValue(job.status);
    setShowStatusChange(false);
    setShowDeleteConfirm(false);
    setIsModalOpen(true);
  }

  async function applyStatusChange() {
    if (!selectedLavoro) return;
    setIsStatusChanging(true);
    setStatusChangeError("");

    try {
      const res = await fetch(`/api/lavori/${selectedLavoro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedLavoro.clientId ?? "",
          type: selectedLavoro.typeRaw ?? "",
          status: REVERSE_STATUS_MAP[quickStatusValue] ?? quickStatusValue,
          dueDate: selectedLavoro.dueDate,
          description: selectedLavoro.description,
          price: selectedLavoro.price,
          notes: selectedLavoro.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'aggiornamento dello stato");
      }

      const updated = await res.json();

      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedLavoro.id
            ? { ...j, status: updated.status, statusRaw: updated.statusRaw }
            : j
        )
      );
      setSelectedLavoro((prev) =>
        prev
          ? { ...prev, status: updated.status, statusRaw: updated.statusRaw }
          : null
      );
      setShowStatusChange(false);
    } catch (error) {
      console.error("Errore cambio stato:", error);
      setStatusChangeError(
        error instanceof Error
          ? error.message
          : "Errore nell'aggiornamento dello stato"
      );
    } finally {
      setIsStatusChanging(false);
    }
  }

  async function deleteLavoro() {
    if (!selectedLavoro) return;
    try {
      const res = await fetch(`/api/lavori/${selectedLavoro.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'eliminazione");
      }

      setJobs((prev) => prev.filter((j) => j.id !== selectedLavoro.id));
      setShowDeleteConfirm(false);
      setIsModalOpen(false);
      setSelectedLavoro(null);
    } catch (error) {
      console.error(error);
    }
  }

  function handleFileSelected(
    e: React.ChangeEvent<HTMLInputElement>,
    jobId: string,
    slot: "prima" | "dopo"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setJobPhotos((prev) => ({
        ...prev,
        [jobId]: {
          prima: prev[jobId]?.prima ?? null,
          dopo: prev[jobId]?.dopo ?? null,
          [slot]: base64,
        },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleOpenFilePicker(slot: "prima" | "dopo") {
    if (slot === "prima") inputPrimaRef.current?.click();
    else inputDopoRef.current?.click();
  }

  function handleRemovePhoto(jobId: string, slot: "prima" | "dopo") {
    setJobPhotos((prev) => ({
      ...prev,
      [jobId]: {
        prima: prev[jobId]?.prima ?? null,
        dopo: prev[jobId]?.dopo ?? null,
        [slot]: null,
      },
    }));
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
        <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50/40 px-4 py-3 shadow-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
          <p className="text-[13px] font-medium text-emerald-800">{successMessage}</p>
        </div>
      )}

      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.label} className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
            <CardContent className="relative flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400/80">{stage.label}</p>
                <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{stage.count}</p>
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
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
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
                  onClick={() => handleSort("price")}
                >
                  Prezzo
                  <SortIndicator
                    active={sortBy === "price"}
                    order={sortOrder}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-slate-400">
                    <p className="text-sm">Caricamento lavori...</p>
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && visibleJobs.map((job) => (
                <TableRow
                  key={job.code}
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => openModal(job)}
                >
                  <TableCell className="font-mono text-[12px] font-semibold text-slate-600">
                    {job.code}
                  </TableCell>
                  <TableCell>{job.clientName}</TableCell>
                  <TableCell>{job.type}</TableCell>
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
                    {job.price != null ? `€ ${job.price}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && visibleJobs.length === 0 && (
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
          <div className="border-t border-slate-100 py-4 text-center">
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-[20px] font-bold tracking-[-0.02em] text-slate-900">
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
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cliente" value={selectedLavoro.clientName} />
                <Field label="Tipo lavoro" value={selectedLavoro.type} />
                <Field
                  label="Data ricezione"
                  value={selectedLavoro.receivedAt}
                />
                <Field
                  label="Data consegna"
                  value={selectedLavoro.dueDate}
                />
              </div>
              <div className="mt-4 space-y-4">
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

            {/* Input file nascosti per il picker di sistema */}
            <input
              ref={inputPrimaRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e, selectedLavoro.id, "prima")}
            />
            <input
              ref={inputDopoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e, selectedLavoro.id, "dopo")}
            />

            {/* Sezione foto Prima / Dopo */}
            <div className="border-t border-stone-200 px-6 pt-5 pb-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Foto lavoro
              </p>
              <div className="grid grid-cols-2 gap-4">
                {(["prima", "dopo"] as const).map((slot) => {
                  const currentPhotos = jobPhotos[selectedLavoro.id];
                  const fotoUrl = slot === "prima"
                    ? (currentPhotos?.prima ?? null)
                    : (currentPhotos?.dopo ?? null);
                  const labelTitolo = slot === "prima" ? "Prima" : "Dopo";
                  const labelSub = slot === "prima" ? "Stato all'arrivo" : "Risultato finale";
                  return (
                    <div key={slot} className="flex flex-col items-center">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {labelTitolo}
                      </p>
                      <p className="mb-3 text-xs text-slate-400">{labelSub}</p>
                      {fotoUrl === null ? (
                        <div
                          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-stone-400 hover:bg-stone-100"
                          style={{ aspectRatio: "4/3" }}
                          onClick={() => handleOpenFilePicker(slot)}
                        >
                          <Camera size={24} className="text-stone-400" />
                          <span className="text-sm text-slate-400">Nessuna foto</span>
                          <span className="mt-1 text-xs font-medium text-amber-600">+ Aggiungi foto</span>
                        </div>
                      ) : (
                        <div
                          className="group relative w-full cursor-pointer overflow-hidden rounded-lg"
                          style={{ aspectRatio: "4/3" }}
                          onClick={() => handleOpenFilePicker(slot)}
                        >
                          <img
                            src={fotoUrl}
                            alt={labelTitolo}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Pencil size={20} className="text-white" />
                            <span className="text-xs font-medium text-white">Cambia foto</span>
                          </div>
                          <button
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                            onClick={(e) => { e.stopPropagation(); handleRemovePhoto(selectedLavoro.id, slot); }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sezione pagamento */}
            <div className="border-t border-stone-200 px-6 pt-5 pb-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Pagamento
              </p>
              {isPaymentLoading ? (
                <p className="text-[13px] text-slate-400">Caricamento...</p>
              ) : (
                <>
                  {existingPayment && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                        existingPayment.status === "PAID"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : existingPayment.status === "DEPOSIT_PAID"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}>
                        {existingPayment.status === "PAID"
                          ? "Pagato"
                          : existingPayment.status === "DEPOSIT_PAID"
                          ? "Acconto pagato"
                          : "Non pagato"}
                      </span>
                      {selectedLavoro.price != null && (
                        <span className="text-[13px] font-bold text-slate-900">
                          {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(selectedLavoro.price)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <Field
                      label="Prezzo lavoro"
                      value={selectedLavoro.price != null ? `€ ${selectedLavoro.price}` : null}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Stato
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className={`${SELECT_CLASS} w-full`}
                      >
                        <option value="UNPAID">Non pagato</option>
                        <option value="DEPOSIT_PAID">Acconto pagato</option>
                        <option value="PAID">Pagato</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Metodo
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`${SELECT_CLASS} w-full`}
                      >
                        <option value="">Nessuno</option>
                        <option value="CASH">Contanti</option>
                        <option value="CARD">Carta</option>
                        <option value="BANK_TRANSFER">Bonifico</option>
                        <option value="OTHER">Altro</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      className="bg-amber-600 text-white hover:bg-amber-700"
                      onClick={savePayment}
                      disabled={isPaymentSaving}
                    >
                      {isPaymentSaving ? "Salvataggio..." : "Salva pagamento"}
                    </Button>
                    {paymentSavedMsg && (
                      <span className="text-[13px] font-medium text-green-700">Salvato</span>
                    )}
                  </div>
                  {paymentError && (
                    <p className="mt-2 text-sm text-red-600">{paymentError}</p>
                  )}
                </>
              )}
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
                    disabled={isStatusChanging}
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
                    disabled={isStatusChanging}
                  >
                    {isStatusChanging ? "Salvataggio..." : "Conferma"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusChange(false);
                      setStatusChangeError("");
                    }}
                    disabled={isStatusChanging}
                  >
                    Annulla
                  </Button>
                </div>
                {statusChangeError && (
                  <p className="mt-2 text-sm text-red-600">{statusChangeError}</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4">
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
                  onClick={() => {
                    setShowStatusChange((v) => !v);
                    setStatusChangeError("");
                  }}
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
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]">
            <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em] text-slate-900">
              Eliminare questo lavoro?
            </h3>
            <p className="mb-5 text-[13px] text-slate-500">
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.025em] text-slate-900">Nuovo lavoro</h2>
                <p className="mt-1 text-[13px] text-slate-400">
                  Compila i campi per aggiungere un nuovo lavoro al laboratorio.
                </p>
              </div>
              <button
                className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-5 p-6">
              {/* Cliente */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCliente}
                  onChange={(e) => setNewCliente(e.target.value)}
                  className={newErrors.cliente ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona un cliente</option>
                  {clientiDisponibili.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>
                  ))}
                </select>
                {newErrors.cliente && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.cliente}</p>
                )}
              </div>

              {/* Tipo lavoro */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Tipo lavoro <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTipoLavoro}
                  onChange={(e) => setNewTipoLavoro(e.target.value)}
                  className={newErrors.tipoLavoro ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona tipo lavoro</option>
                  <option value="HEM">Orlo pantalone</option>
                  <option value="WAIST_TIGHTENING">Stringere vita</option>
                  <option value="LEG_SHORTENING">Accorciare gamba</option>
                  <option value="LEG_WIDENING">Allargare pantalone</option>
                  <option value="ZIP_REPLACEMENT">Sostituzione zip</option>
                  <option value="REPAIR">Riparazione</option>
                  <option value="CUSTOM">Su misura</option>
                  <option value="OTHER">Altro</option>
                </select>
                {newErrors.tipoLavoro && (
                  <p className="mt-1 text-sm text-red-500">{newErrors.tipoLavoro}</p>
                )}
              </div>

              {/* Data consegna */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Prezzo (€)
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => { setIsNewModalOpen(false); resetNewForm(); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNewSubmit}
                className="rounded-lg bg-amber-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm shadow-amber-900/20 transition-all hover:bg-amber-800 active:scale-[0.98] disabled:opacity-50"
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Modifica {selectedLavoro.code}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Modifica i dati del lavoro selezionato.
                </p>
              </div>
              <button
                className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="space-y-5 p-6">
              {/* Cliente */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={editCliente}
                  onChange={(e) => setEditCliente(e.target.value)}
                  className={editErrors.cliente ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona un cliente</option>
                  {clientiDisponibili.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>
                  ))}
                </select>
                {editErrors.cliente && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.cliente}</p>
                )}
              </div>

              {/* Tipo lavoro */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Tipo lavoro <span className="text-red-500">*</span>
                </label>
                <select
                  value={editTipoLavoro}
                  onChange={(e) => setEditTipoLavoro(e.target.value)}
                  className={editErrors.tipoLavoro ? FIELD_ERROR_CLASS : FIELD_CLASS}
                >
                  <option value="">Seleziona tipo lavoro</option>
                  <option value="HEM">Orlo pantalone</option>
                  <option value="WAIST_TIGHTENING">Stringere vita</option>
                  <option value="LEG_SHORTENING">Accorciare gamba</option>
                  <option value="LEG_WIDENING">Allargare pantalone</option>
                  <option value="ZIP_REPLACEMENT">Sostituzione zip</option>
                  <option value="REPAIR">Riparazione</option>
                  <option value="CUSTOM">Su misura</option>
                  <option value="OTHER">Altro</option>
                </select>
                {editErrors.tipoLavoro && (
                  <p className="mt-1 text-sm text-red-500">{editErrors.tipoLavoro}</p>
                )}
              </div>

              {/* Data consegna */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Prezzo (€)
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
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
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                disabled={isEditSubmitting}
                onClick={() => { setIsEditModalOpen(false); resetEditForm(); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isEditSubmitting}
                onClick={handleEditSubmit}
                className="rounded-lg bg-amber-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm shadow-amber-900/20 transition-all hover:bg-amber-800 active:scale-[0.98] disabled:opacity-50"
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
