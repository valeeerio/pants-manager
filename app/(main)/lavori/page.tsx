"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ClipboardList,
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationBanner } from "@/components/ui/notification-banner";
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
import { LavoroDetailModal } from "@/components/lavori/lavoro-detail-modal";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  TEXTAREA_CLASS,
  STATUS_COLORS,
  SELECT_CLASS,
  type Job,
  type Cliente,
} from "@/components/lavori/lavoro-shared";

type SortKey =
  | "code"
  | "clientName"
  | "type"
  | "status"
  | "dueDate"
  | "price";
type SortOrder = "asc" | "desc";

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
  const router = useRouter();
  const apriParamHandled = useRef(false);

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

  // Modal dettaglio (gestito da LavoroDetailModal)
  const [lavoroApertoId, setLavoroApertoId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Banner notifica
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

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

  // Apertura automatica modal se URL contiene ?apri=<id>
  useEffect(() => {
    if (apriParamHandled.current) return;
    const apriId = new URLSearchParams(window.location.search).get("apri");
    if (!apriId) return;
    setLavoroApertoId(apriId);
    apriParamHandled.current = true;
  }, []);

  // Pre-applica filtro scadenza se URL contiene ?scadenza=<valore>
  useEffect(() => {
    const scadenza = new URLSearchParams(window.location.search).get("scadenza");
    if (scadenza && ["today", "week", "month", "overdue"].includes(scadenza)) {
      setFilterDueDate(scadenza);
    }
  }, []);

  // Pulizia URL quando il modal aperto via param viene chiuso
  useEffect(() => {
    if (!lavoroApertoId && apriParamHandled.current) {
      router.replace("/lavori");
      apriParamHandled.current = false;
    }
  }, [lavoroApertoId]);


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
      setNotification({ type: "success", message: "Lavoro creato con successo!" });
    } catch (err) {
      console.error(err);
      const generic = ["", "Errore", "Errore nella creazione"];
      setNotification({
        type: "error",
        message: err instanceof Error && !generic.includes(err.message)
          ? err.message
          : "Impossibile creare il lavoro. Riprova.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (isNewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNewModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isNewModalOpen) {
        setIsNewModalOpen(false);
        resetNewForm();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isNewModalOpen]);

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

      {isMounted && notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
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
                <option value="Riparazione">Riparazione</option>
                <option value="Su misura">Su misura</option>
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
                  onClick={() => setLavoroApertoId(job.id)}
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
                    colSpan={6}
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

      <LavoroDetailModal
        projectId={lavoroApertoId}
        onClose={() => setLavoroApertoId(null)}
        onUpdated={(j) => setJobs((prev) => prev.map((x) => (x.id === j.id ? j : x)))}
        onDeleted={(id) => setJobs((prev) => prev.filter((x) => x.id !== id))}
      />
    </div>
  );
}
