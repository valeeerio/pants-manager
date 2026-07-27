"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Pencil, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Field,
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  TEXTAREA_CLASS,
  SELECT_CLASS,
  REVERSE_STATUS_MAP,
  type Job,
  type JobPhotos,
  type Cliente,
  type PaymentData,
  type MaterialUsage,
  type MaterialOption,
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
  const [loadError, setLoadError] = useState("");
  const [clientiDisponibili, setClientiDisponibili] = useState<Cliente[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [jobPhotos, setJobPhotos] = useState<Record<string, JobPhotos>>({});
  const [uploadingSlot, setUploadingSlot] = useState<"prima" | "dopo" | null>(null);
  const [photoError, setPhotoError] = useState("");
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
  const [editSubmitError, setEditSubmitError] = useState("");

  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);
  const [materialiDisponibili, setMaterialiDisponibili] = useState<MaterialOption[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialError, setMaterialError] = useState("");
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

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

  const isModalOpen = projectId != null && (job != null || loadError !== "");

  useEffect(() => {
    if (!projectId) {
      setJob(null);
      setLoadError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    Promise.all([
      fetch(`/api/lavori/${projectId}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/clienti").then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/lavori/${projectId}/materiali`).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/magazzino").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([lavoro, clienti, utilizzi, materiali]) => {
        if (cancelled) return;
        if (lavoro) {
          setJob(lavoro);
          setJobPhotos((prev) => ({
            ...prev,
            [lavoro.id]: {
              prima: lavoro.photos?.prima ?? null,
              dopo: lavoro.photos?.dopo ?? null,
            },
          }));
        } else {
          setJob(null);
          setLoadError("Impossibile caricare i dettagli del lavoro. Riprova più tardi.");
        }
        setClientiDisponibili(clienti ?? []);
        setMaterialUsages(utilizzi ?? []);
        setMaterialiDisponibili(materiali ?? []);
        setSelectedMaterialId("");
        setMaterialQuantity("");
        setMaterialError("");
        setShowDeleteConfirm(false);
        setPhotoError("");
      })
      .catch(() => {
        if (cancelled) return;
        setJob(null);
        setLoadError("Impossibile caricare i dettagli del lavoro. Riprova più tardi.");
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
      .then((r) => {
        if (!r.ok) throw new Error("Impossibile verificare lo stato del pagamento.");
        return r.json();
      })
      .then((data: PaymentData[]) => {
        setExistingPayment(data.length > 0 ? data[0] : null);
      })
      .catch(() => setPaymentError("Impossibile verificare lo stato del pagamento. Riprova più tardi."))
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
    const t = setTimeout(() => setPaymentSavedMsg(false), 3000);
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

  async function applyStatusChange(newStatus: string) {
    if (!job) return;

    const res = await fetch(`/api/lavori/${job.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: job.clientId ?? "",
        type: job.typeRaw ?? "",
        status: REVERSE_STATUS_MAP[newStatus] ?? newStatus,
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
  }

  async function deleteLavoro() {
    if (!job) return;
    setDeleteError("");
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
      setDeleteError(error instanceof Error ? error.message : "Errore nell'eliminazione del lavoro.");
    }
  }

  const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8MB

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, jobId: string, slot: "prima" | "dopo") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Il file deve essere un'immagine di massimo 8MB");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Il file deve essere un'immagine di massimo 8MB");
      return;
    }

    setUploadingSlot(slot);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", slot === "prima" ? "BEFORE" : "AFTER");

      const res = await fetch(`/api/lavori/${jobId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nel caricamento della foto");
      }

      const uploaded: { id: string; url: string } = await res.json();

      setJobPhotos((prev) => ({
        ...prev,
        [jobId]: {
          prima: prev[jobId]?.prima ?? null,
          dopo: prev[jobId]?.dopo ?? null,
          [slot]: { id: uploaded.id, url: uploaded.url },
        },
      }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Errore nel caricamento della foto.");
    } finally {
      setUploadingSlot(null);
    }
  }

  function handleOpenFilePicker(slot: "prima" | "dopo") {
    if (slot === "prima") inputPrimaRef.current?.click();
    else inputDopoRef.current?.click();
  }

  async function handleRemovePhoto(jobId: string, slot: "prima" | "dopo") {
    const photo = jobPhotos[jobId]?.[slot];
    if (!photo) return;

    setPhotoError("");
    try {
      const res = await fetch(`/api/lavori/${jobId}/images/${photo.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'eliminazione della foto");
      }

      setJobPhotos((prev) => ({
        ...prev,
        [jobId]: {
          prima: prev[jobId]?.prima ?? null,
          dopo: prev[jobId]?.dopo ?? null,
          [slot]: null,
        },
      }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Errore nell'eliminazione della foto.");
    }
  }

  async function handleAddMaterialUsage() {
    if (!job) return;
    setMaterialError("");

    if (!selectedMaterialId) {
      setMaterialError("Seleziona un materiale");
      return;
    }
    const qty = parseFloat(materialQuantity);
    if (!materialQuantity || isNaN(qty) || qty <= 0) {
      setMaterialError("Inserisci una quantità valida");
      return;
    }

    setIsAddingMaterial(true);
    try {
      const res = await fetch(`/api/lavori/${job.id}/materiali`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: selectedMaterialId, quantity: qty }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'aggiunta del materiale");
      }

      const usage: MaterialUsage & { stockResiduo: number | null } = await res.json();

      setMaterialUsages((prev) => [
        ...prev,
        {
          id: usage.id,
          materialId: usage.materialId,
          nomeMateriale: usage.nomeMateriale,
          categoria: usage.categoria,
          unita: usage.unita,
          quantita: usage.quantita,
        },
      ]);

      if (usage.stockResiduo != null) {
        setMaterialiDisponibili((prev) =>
          prev.map((m) => (m.id === usage.materialId ? { ...m, quantita: usage.stockResiduo as number } : m))
        );
      }

      setSelectedMaterialId("");
      setMaterialQuantity("");
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Errore nell'aggiunta del materiale.");
    } finally {
      setIsAddingMaterial(false);
    }
  }

  async function handleRemoveMaterialUsage(usageId: string) {
    if (!job) return;
    setMaterialError("");
    const usage = materialUsages.find((u) => u.id === usageId);
    try {
      const res = await fetch(`/api/lavori/${job.id}/materiali/${usageId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nella rimozione del materiale");
      }

      setMaterialUsages((prev) => prev.filter((u) => u.id !== usageId));
      if (usage) {
        setMaterialiDisponibili((prev) =>
          prev.map((m) => (m.id === usage.materialId ? { ...m, quantita: m.quantita + usage.quantita } : m))
        );
      }
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Errore nella rimozione del materiale.");
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
    setEditSubmitError("");
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
    setEditSubmitError("");
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
    setEditSubmitError("");
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
      setEditSubmitError(err instanceof Error ? err.message : "Errore nel salvataggio delle modifiche.");
    } finally {
      setIsEditSubmitting(false);
    }
  }

  if (!isMounted || loading) return null;

  return (
    <>
      {isModalOpen && !job && loadError && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <div
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">Errore</h3>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 text-[13px] text-red-600">{loadError}</p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isModalOpen && job && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <div
            className="relative mx-4 flex max-h-[92vh] w-full max-w-[1600px] flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-[20px] font-bold tracking-[-0.02em] text-slate-900">
                  {job.code}
                </h2>
                <StatusBadge status={job.status} onChange={applyStatusChange} />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  title="Modifica lavoro"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => openEditModal(job)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  title="Elimina lavoro"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                  onClick={() => { setShowDeleteConfirm(true); setDeleteError(""); }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  title="Chiudi"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
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

            {/* Corpo — tre colonne: dettagli+pagamento a sinistra, materiali al centro, foto a destra */}
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">

              {/* Colonna sinistra: pagamento in evidenza + dettagli lavoro */}
              <div className="flex flex-col gap-5">
                {/* Pagamento — sezione più importante, unico punto in cui compare il prezzo */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Pagamento</p>
                    {existingPayment && (
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                        existingPayment.status === "PAID"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : existingPayment.status === "DEPOSIT_PAID"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}>
                        {existingPayment.status === "PAID"
                          ? "Pagato"
                          : existingPayment.status === "DEPOSIT_PAID"
                          ? "Acconto pagato"
                          : "Non pagato"}
                      </span>
                    )}
                  </div>
                  <p className="text-[30px] font-bold tracking-[-0.03em] text-slate-900">
                    {job.price != null
                      ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(job.price)
                      : <span className="text-slate-400">—</span>}
                  </p>

                  {isPaymentLoading ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <Skeleton className="mb-1 h-3 w-10" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                      <div>
                        <Skeleton className="mb-1 h-3 w-14" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 grid grid-cols-2 gap-3">
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

                {/* Dettagli lavoro */}
                <div>
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
              </div>

              {/* Colonna centrale: materiali utilizzati */}
              <div className="flex flex-col gap-4 lg:border-l lg:border-stone-200 lg:pl-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Materiali utilizzati</p>

                {materialUsages.length === 0 ? (
                  <p className="text-[13px] text-slate-400">Nessun materiale utilizzato per questo lavoro.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {materialUsages.map((usage) => (
                      <li
                        key={usage.id}
                        className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
                      >
                        <span className="text-[13px] text-slate-700">
                          {usage.nomeMateriale} — {usage.quantita} {usage.unita.toLowerCase()}
                        </span>
                        <button
                          onClick={() => handleRemoveMaterialUsage(usage.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-red-500 hover:bg-red-50"
                          title="Rimuovi materiale"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Materiale</label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className={`${SELECT_CLASS} w-full`}
                    >
                      <option value="">Seleziona materiale</option>
                      {materialiDisponibili.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.categoria})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quantità</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={materialQuantity}
                      onChange={(e) => setMaterialQuantity(e.target.value)}
                      className={FIELD_CLASS}
                    />
                  </div>
                  <Button
                    className="bg-amber-600 text-white hover:bg-amber-700"
                    onClick={handleAddMaterialUsage}
                    disabled={isAddingMaterial}
                  >
                    {isAddingMaterial ? "Aggiunta..." : "Aggiungi"}
                  </Button>
                </div>
                {materialError && <p className="text-sm text-red-600">{materialError}</p>}
              </div>

              {/* Colonna destra: foto Prima / Dopo, impilate */}
              <div className="flex flex-col gap-4 lg:border-l lg:border-stone-200 lg:pl-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Foto lavoro</p>
                {(["prima", "dopo"] as const).map((slot) => {
                  const currentPhotos = jobPhotos[job.id];
                  const foto = slot === "prima" ? (currentPhotos?.prima ?? null) : (currentPhotos?.dopo ?? null);
                  const labelTitolo = slot === "prima" ? "Prima" : "Dopo";
                  const labelSub = slot === "prima" ? "Stato all'arrivo" : "Risultato finale";
                  const isUploading = uploadingSlot === slot;
                  return (
                    <div key={slot} className="flex flex-col">
                      <div className="mb-2 flex items-baseline gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{labelTitolo}</p>
                        <p className="text-xs text-slate-400">{labelSub}</p>
                      </div>
                      {isUploading ? (
                        <div
                          className="w-full overflow-hidden rounded-lg border-2 border-dashed border-amber-300 bg-amber-50"
                          style={{ aspectRatio: "16/9" }}
                        >
                          <Skeleton className="h-full w-full rounded-none bg-amber-200/40" />
                        </div>
                      ) : foto === null ? (
                        <div
                          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-stone-400 hover:bg-stone-100"
                          style={{ aspectRatio: "16/9" }}
                          onClick={() => handleOpenFilePicker(slot)}
                        >
                          <Camera size={24} className="text-stone-400" />
                          <span className="text-sm text-slate-400">Nessuna foto</span>
                          <span className="mt-1 text-xs font-medium text-amber-600">+ Aggiungi foto</span>
                        </div>
                      ) : (
                        <div
                          className="group relative w-full cursor-pointer overflow-hidden rounded-lg"
                          style={{ aspectRatio: "16/9" }}
                          onClick={() => handleOpenFilePicker(slot)}
                        >
                          <img src={foto.url} alt={labelTitolo} className="h-full w-full object-cover" />
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
                {photoError && <p className="text-sm text-red-600">{photoError}</p>}
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
            {deleteError && <p className="mb-4 text-sm text-red-600">{deleteError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}>
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
            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 px-6 py-4">
              {editSubmitError && <p className="text-sm text-red-600">{editSubmitError}</p>}
              <div className="flex justify-end gap-3">
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
