"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, RefreshCw, Pencil, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  TEXTAREA_CLASS,
  SELECT_CLASS,
  STATUS_COLORS,
  REVERSE_STATUS_MAP,
  type Job,
  type JobPhotos,
  type Cliente,
  type PaymentData,
} from "@/components/lavori/lavoro-shared";

interface LavoroDetailModalProps {
  projectId: string | null;
  onClose: () => void;
  onUpdated?: (job: Job) => void;
  onDeleted?: (id: string) => void;
}

export function LavoroDetailModal({ projectId, onClose, onUpdated, onDeleted }: LavoroDetailModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientiDisponibili, setClientiDisponibili] = useState<Cliente[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quickStatusValue, setQuickStatusValue] = useState("");
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState("");

  const [jobPhotos, setJobPhotos] = useState<Record<string, JobPhotos>>({});
  const inputPrimaRef = useRef<HTMLInputElement>(null);
  const inputDopoRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState("");
  const [editTipoLavoro, setEditTipoLavoro] = useState("");
  const [editDataConsegna, setEditDataConsegna] = useState("");
  const [editDescrizione, setEditDescrizione] = useState("");
  const [editPrezzoStimato, setEditPrezzoStimato] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editErrors, setEditErrors] = useState({ cliente: "", tipoLavoro: "", dataConsegna: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

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

  const isModalOpen = projectId != null && job != null;

  useEffect(() => {
    if (!projectId) {
      setJob(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/lavori/${projectId}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/clienti").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([lavoro, clienti]) => {
        if (cancelled) return;
        if (lavoro) {
          setJob(lavoro);
          setQuickStatusValue(lavoro.status);
        }
        setClientiDisponibili(clienti ?? []);
        setShowStatusChange(false);
        setShowDeleteConfirm(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isEditModalOpen;
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isEditModalOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        return;
      }
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
        return;
      }
      if (isModalOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModalOpen, isEditModalOpen, showDeleteConfirm, onClose]);

  useEffect(() => {
    if (!isModalOpen || !job) return;
    setExistingPayment(null);
    setPaymentError("");
    setPaymentSavedMsg(false);
    setIsPaymentLoading(true);
    fetch(`/api/pagamenti?projectId=${job.id}`)
      .then((r) => r.json())
      .then((data: PaymentData[]) => {
        setExistingPayment(data.length > 0 ? data[0] : null);
      })
      .catch(() => setPaymentError("Impossibile caricare il pagamento."))
      .finally(() => setIsPaymentLoading(false));
  }, [job?.id, isModalOpen]);

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
    if (!job) return;
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
            body: JSON.stringify({ projectId: job.id, ...body }),
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

  async function applyStatusChange() {
    if (!job) return;
    setIsStatusChanging(true);
    setStatusChangeError("");

    try {
      const res = await fetch(`/api/lavori/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: job.clientId ?? "",
          type: job.typeRaw ?? "",
          status: REVERSE_STATUS_MAP[quickStatusValue] ?? quickStatusValue,
          dueDate: job.dueDate,
          description: job.description,
          price: job.price,
          notes: job.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'aggiornamento dello stato");
      }

      const updated = await res.json();
      setJob((prev) => (prev ? { ...prev, status: updated.status, statusRaw: updated.statusRaw } : null));
      onUpdated?.(updated);
      setShowStatusChange(false);
    } catch (error) {
      console.error("Errore cambio stato:", error);
      setStatusChangeError(error instanceof Error ? error.message : "Errore nell'aggiornamento dello stato");
    } finally {
      setIsStatusChanging(false);
    }
  }

  async function deleteLavoro() {
    if (!job) return;
    try {
      const res = await fetch(`/api/lavori/${job.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'eliminazione");
      }
      const deletedId = job.id;
      setShowDeleteConfirm(false);
      onDeleted?.(deletedId);
      onClose();
    } catch (error) {
      console.error(error);
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, jobId: string, slot: "prima" | "dopo") {
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

  function openEditModal(lavoro: Job) {
    setEditCliente(lavoro.clientId ?? "");
    setEditTipoLavoro(lavoro.typeRaw ?? "");
    setEditDataConsegna(lavoro.dueDate ?? "");
    setEditDescrizione(lavoro.description || "");
    setEditPrezzoStimato(lavoro.price?.toString() || "");
    setEditNote(lavoro.notes || "");
    setEditErrors({ cliente: "", tipoLavoro: "", dataConsegna: "" });
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
    if (!job || !validateEditForm()) return;
    setIsEditSubmitting(true);
    try {
      const res = await fetch(`/api/lavori/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: editCliente,
          type: editTipoLavoro,
          status: job.statusRaw ?? "TODO",
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
      setJob(lavoroAggiornato);
      onUpdated?.(lavoroAggiornato);
      setIsEditModalOpen(false);
      resetEditForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditSubmitting(false);
    }
  }

  if (!isMounted || loading) return null;

  return (
    <>
      {isModalOpen && job && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-[20px] font-bold tracking-[-0.02em] text-slate-900">
                  {job.code}
                </h2>
                <Badge className={STATUS_COLORS[job.status] ?? "border-transparent bg-slate-200 text-slate-800"}>
                  {job.status}
                </Badge>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cliente" value={job.clientName} />
                <Field label="Tipo lavoro" value={job.type} />
                <Field label="Data ricezione" value={job.receivedAt} />
                <Field label="Data consegna" value={job.dueDate} />
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Descrizione" value={job.description} />
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Note interne</p>
                  <p className="text-sm font-medium text-slate-800">
                    {job.notes ?? <span className="text-slate-400">Nessuna nota</span>}
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
              onChange={(e) => handleFileSelected(e, job.id, "prima")}
            />
            <input
              ref={inputDopoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e, job.id, "dopo")}
            />

            {/* Sezione foto Prima / Dopo */}
            <div className="border-t border-stone-200 px-6 pt-5 pb-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Foto lavoro</p>
              <div className="grid grid-cols-2 gap-4">
                {(["prima", "dopo"] as const).map((slot) => {
                  const currentPhotos = jobPhotos[job.id];
                  const fotoUrl = slot === "prima" ? (currentPhotos?.prima ?? null) : (currentPhotos?.dopo ?? null);
                  const labelTitolo = slot === "prima" ? "Prima" : "Dopo";
                  const labelSub = slot === "prima" ? "Stato all'arrivo" : "Risultato finale";
                  return (
                    <div key={slot} className="flex flex-col items-center">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{labelTitolo}</p>
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
                          <img src={fotoUrl} alt={labelTitolo} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Pencil size={20} className="text-white" />
                            <span className="text-xs font-medium text-white">Cambia foto</span>
                          </div>
                          <button
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                            onClick={(e) => { e.stopPropagation(); handleRemovePhoto(job.id, slot); }}
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
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Pagamento</p>
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
                      {job.price != null && (
                        <span className="text-[13px] font-bold text-slate-900">
                          {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(job.price)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <Field label="Prezzo lavoro" value={job.price != null ? `€ ${job.price}` : null} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stato</label>
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
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Metodo</label>
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
                    {paymentSavedMsg && <span className="text-[13px] font-medium text-green-700">Salvato</span>}
                  </div>
                  {paymentError && <p className="mt-2 text-sm text-red-600">{paymentError}</p>}
                </>
              )}
            </div>

            {/* Sezione cambia stato (inline) */}
            {showStatusChange && (
              <div className="shrink-0 border-t border-stone-100 px-6 pb-4 pt-4">
                <p className="mb-2 text-sm text-slate-600">Seleziona nuovo stato:</p>
                <div className="flex items-center gap-2">
                  <select
                    value={quickStatusValue}
                    onChange={(e) => setQuickStatusValue(e.target.value)}
                    className={`${SELECT_CLASS} flex-1`}
                    disabled={isStatusChanging}
                  >
                    <option value="Da iniziare">Da iniziare</option>
                    <option value="In lavorazione">In lavorazione</option>
                    <option value="In attesa cliente">In attesa cliente</option>
                    <option value="Pronto">Pronto</option>
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
                    onClick={() => { setShowStatusChange(false); setStatusChangeError(""); }}
                    disabled={isStatusChanging}
                  >
                    Annulla
                  </Button>
                </div>
                {statusChangeError && <p className="mt-2 text-sm text-red-600">{statusChangeError}</p>}
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
                  onClick={() => { setShowStatusChange((v) => !v); setStatusChangeError(""); }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cambia stato
                </Button>
                <Button
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={() => openEditModal(job)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifica
                </Button>
                <Button
                  variant="outline"
                  className="border-stone-300 hover:bg-stone-50"
                  onClick={onClose}
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
      {showDeleteConfirm && job && createPortal(
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]">
            <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em] text-slate-900">
              Eliminare questo lavoro?
            </h3>
            <p className="mb-5 text-[13px] text-slate-500">
              Stai per eliminare il lavoro {job.code}. Questa azione non può essere annullata.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Annulla
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={deleteLavoro}>
                Elimina
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal modifica lavoro */}
      {isEditModalOpen && job && createPortal(
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
                <h2 className="text-xl font-bold text-slate-800">Modifica {job.code}</h2>
                <p className="mt-1 text-sm text-slate-500">Modifica i dati del lavoro selezionato.</p>
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
                {editErrors.cliente && <p className="mt-1 text-sm text-red-500">{editErrors.cliente}</p>}
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
                {editErrors.tipoLavoro && <p className="mt-1 text-sm text-red-500">{editErrors.tipoLavoro}</p>}
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
                {editErrors.dataConsegna && <p className="mt-1 text-sm text-red-500">{editErrors.dataConsegna}</p>}
              </div>

              {/* Descrizione */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Descrizione</label>
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Prezzo (€)</label>
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
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Note interne</label>
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
    </>
  );
}
