"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
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
import { TableRowsSkeleton } from "@/components/shared/table-rows-skeleton";
import { MATERIAL_CATEGORY_MAP, MATERIAL_UNIT_MAP } from "@/lib/enum-labels";

// ─── Types ────────────────────────────────────────────────────────────────────

type Materiale = {
  id: string;
  name: string;
  categoria: string;
  categoryRaw: string;
  quantita: number;
  unita: string;
  unitRaw: string;
  sogliaMinima: number;
  costoUnitario: number | null;
  note: string | null;
  sottoSoglia: boolean;
};

type FormErrors = {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  minStock: string;
  unitCost: string;
  generico: string;
};

type SortKey = "name" | "categoria" | "quantita" | "unita" | "sogliaMinima";
type SortOrder = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyErrors(): FormErrors {
  return { name: "", category: "", unit: "", quantity: "", minStock: "", unitCost: "", generico: "" };
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

export default function MagazzinoPage() {
  // ── Data ─────────────────────────────────────────────────────────────────────
  const [materiali, setMateriali] = useState<Materiale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── List state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [soloSottoSoglia, setSoloSottoSoglia] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMateriale, setEditingMateriale] = useState<Materiale | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [materialeToDelete, setMaterialeToDelete] = useState<Materiale | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // ── Banner ────────────────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formMinStock, setFormMinStock] = useState("");
  const [formUnitCost, setFormUnitCost] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>(emptyErrors());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function caricaMateriali() {
      try {
        setLoading(true);
        const res = await fetch("/api/magazzino");
        if (!res.ok) throw new Error("Errore nel caricamento del magazzino");
        const data = await res.json();
        setMateriali(data);
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare il magazzino. Riprova.");
      } finally {
        setLoading(false);
      }
    }
    caricaMateriali();
  }, []);

  useEffect(() => {
    const anyOpen = isFormOpen || isDeleteOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFormOpen, isDeleteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isDeleteOpen) { setIsDeleteOpen(false); return; }
      if (isFormOpen) { closeForm(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDeleteOpen, isFormOpen]);

  // ── Filtered + sorted list ────────────────────────────────────────────────────

  const filteredAndSorted = useMemo(() => {
    let result = [...materiali];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    if (filterCategoria) {
      result = result.filter((m) => m.categoryRaw === filterCategoria);
    }

    if (soloSottoSoglia) {
      result = result.filter((m) => m.sottoSoglia);
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
  }, [materiali, searchQuery, filterCategoria, soloSottoSoglia, sortBy, sortOrder]);

  // ── Utility ───────────────────────────────────────────────────────────────────

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  function openNewForm() {
    setEditingMateriale(null);
    setFormName(""); setFormCategory(""); setFormUnit("");
    setFormQuantity(""); setFormMinStock(""); setFormUnitCost(""); setFormNotes("");
    setFormErrors(emptyErrors());
    setIsFormOpen(true);
  }

  function openEditForm(materiale: Materiale) {
    setEditingMateriale(materiale);
    setFormName(materiale.name);
    setFormCategory(materiale.categoryRaw);
    setFormUnit(materiale.unitRaw);
    setFormQuantity(String(materiale.quantita));
    setFormMinStock(String(materiale.sogliaMinima));
    setFormUnitCost(materiale.costoUnitario != null ? String(materiale.costoUnitario) : "");
    setFormNotes(materiale.note ?? "");
    setFormErrors(emptyErrors());
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingMateriale(null);
    setFormErrors(emptyErrors());
  }

  function validateForm(): boolean {
    const errs = emptyErrors();
    let ok = true;

    if (!formName.trim()) { errs.name = "Campo obbligatorio"; ok = false; }
    if (!formCategory || !(formCategory in MATERIAL_CATEGORY_MAP)) { errs.category = "Seleziona una categoria"; ok = false; }
    if (!formUnit || !(formUnit in MATERIAL_UNIT_MAP)) { errs.unit = "Seleziona un'unità"; ok = false; }

    const qty = parseFloat(formQuantity);
    if (!formQuantity || isNaN(qty) || qty < 0) { errs.quantity = "Inserisci un numero maggiore o uguale a 0"; ok = false; }

    const minStock = parseFloat(formMinStock);
    if (!formMinStock || isNaN(minStock) || minStock < 0) { errs.minStock = "Inserisci un numero maggiore o uguale a 0"; ok = false; }

    if (formUnitCost) {
      const cost = parseFloat(formUnitCost);
      if (isNaN(cost) || cost < 0) { errs.unitCost = "Inserisci un numero maggiore o uguale a 0"; ok = false; }
    }

    setFormErrors(errs);
    return ok;
  }

  async function handleFormSubmit() {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        quantity: formQuantity,
        minStock: formMinStock,
        unitCost: formUnitCost || null,
        notes: formNotes || null,
      };

      const res = editingMateriale
        ? await fetch(`/api/magazzino/${editingMateriale.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/magazzino", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nel salvataggio del materiale");
      }

      const materialeSalvato: Materiale = await res.json();

      if (editingMateriale) {
        setMateriali((prev) => prev.map((m) => (m.id === materialeSalvato.id ? materialeSalvato : m)));
        setNotification({ type: "success", message: "Materiale modificato con successo" });
      } else {
        setMateriali((prev) => [...prev, materialeSalvato]);
        setNotification({ type: "success", message: "Materiale aggiunto con successo" });
      }

      closeForm();
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        generico: err instanceof Error ? err.message : "Errore nel salvataggio del materiale",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDeleteConfirm(materiale: Materiale) {
    setMaterialeToDelete(materiale);
    setDeleteError("");
    setIsDeleteOpen(true);
  }

  async function handleDelete() {
    if (!materialeToDelete) return;
    setDeleteError("");
    try {
      const res = await fetch(`/api/magazzino/${materialeToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore nell'eliminazione");
      }
      setMateriali((prev) => prev.filter((m) => m.id !== materialeToDelete.id));
      setIsDeleteOpen(false);
      setMaterialeToDelete(null);
      setNotification({ type: "success", message: "Materiale eliminato" });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Errore nell'eliminazione del materiale");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Magazzino"
        description="Gestisci stoffe, zip, fili e accessori del laboratorio."
      />

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-slate-800">Materiali</CardTitle>
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
                  placeholder="Cerca per nome materiale..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Categoria</label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutte</option>
                {Object.entries(MATERIAL_CATEGORY_MAP).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={soloSottoSoglia}
                onChange={(e) => setSoloSottoSoglia(e.target.checked)}
                className="h-3.5 w-3.5 accent-amber-600"
              />
              Solo sotto soglia
            </label>

            <div className="ml-auto flex items-end">
              <Button
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={openNewForm}
              >
                <Plus className="h-4 w-4" />
                Nuovo materiale
              </Button>
            </div>
          </div>

          {/* Tabella */}
            <table className="w-full caption-bottom text-[13px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("name")}>
                    Nome <SortIndicator active={sortBy === "name"} order={sortOrder} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("categoria")}>
                    Categoria <SortIndicator active={sortBy === "categoria"} order={sortOrder} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("quantita")}>
                    Quantità <SortIndicator active={sortBy === "quantita"} order={sortOrder} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("unita")}>
                    Unità <SortIndicator active={sortBy === "unita"} order={sortOrder} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("sogliaMinima")}>
                    Soglia minima <SortIndicator active={sortBy === "sogliaMinima"} order={sortOrder} />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Stato scorta</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRowsSkeleton columns={7} rows={6} />}
                {error && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <p className="text-sm text-red-500">{error}</p>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && filteredAndSorted.map((materiale) => (
                  <TableRow key={materiale.id} className="hover:bg-amber-50">
                    <TableCell className="font-medium text-slate-800">{materiale.name}</TableCell>
                    <TableCell className="text-slate-700">{materiale.categoria}</TableCell>
                    <TableCell className="text-slate-700">{materiale.quantita}</TableCell>
                    <TableCell className="text-slate-700">{materiale.unita}</TableCell>
                    <TableCell className="text-slate-700">{materiale.sogliaMinima}</TableCell>
                    <TableCell>
                      {materiale.sottoSoglia ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Sotto soglia
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                          Disponibile
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditForm(materiale)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          title="Modifica materiale"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(materiale)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          title="Elimina materiale"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !error && filteredAndSorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-slate-400">
                      Nessun materiale trovato. Prova a modificare i filtri.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </table>
          <div className="border-t border-slate-100 px-5 py-2.5 text-[12px] text-slate-500">
            {filteredAndSorted.length} materiale/i trovato/i
          </div>
        </CardContent>
      </Card>

      {/* ══ Banner notifica ═══════════════════════════════════════════════════════ */}
      {isMounted && notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* ══ Modal nuovo/modifica materiale ═══════════════════════════════════════ */}
      {isMounted && isFormOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="relative mx-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.025em] text-slate-900">
                  {editingMateriale ? "Modifica materiale" : "Nuovo materiale"}
                </h2>
                <p className="mt-1 text-[13px] text-slate-400">
                  {editingMateriale
                    ? "Aggiorna i dati del materiale in magazzino."
                    : "Aggiungi un nuovo materiale al magazzino."}
                </p>
              </div>
              <button
                className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={closeForm}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {formErrors.generico && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {formErrors.generico}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Es. Stoffa blu navy"
                  className={formErrors.name ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {formErrors.name && <p className="mt-1 text-[12px] text-red-500">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={formErrors.category ? FIELD_ERROR_CLASS : FIELD_CLASS}
                  >
                    <option value="">Seleziona categoria</option>
                    {Object.entries(MATERIAL_CATEGORY_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="mt-1 text-[12px] text-red-500">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    Unità <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className={formErrors.unit ? FIELD_ERROR_CLASS : FIELD_CLASS}
                  >
                    <option value="">Seleziona unità</option>
                    {Object.entries(MATERIAL_UNIT_MAP).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {formErrors.unit && <p className="mt-1 text-[12px] text-red-500">{formErrors.unit}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    Quantità <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} step="0.01" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)}
                    className={formErrors.quantity ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                  {formErrors.quantity && <p className="mt-1 text-[12px] text-red-500">{formErrors.quantity}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    Soglia minima <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} step="0.01" value={formMinStock} onChange={(e) => setFormMinStock(e.target.value)}
                    className={formErrors.minStock ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                  {formErrors.minStock && <p className="mt-1 text-[12px] text-red-500">{formErrors.minStock}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Costo unitario (€)</label>
                <input type="number" min={0} step="0.01" value={formUnitCost} onChange={(e) => setFormUnitCost(e.target.value)} placeholder="Opzionale"
                  className={formErrors.unitCost ? FIELD_ERROR_CLASS : FIELD_CLASS} />
                {formErrors.unitCost && <p className="mt-1 text-[12px] text-red-500">{formErrors.unitCost}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">Note</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Note interne sul materiale..." rows={3} className={TEXTAREA_CLASS} />
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={closeForm}
                className="rounded-lg border border-stone-300 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-stone-50">
                Annulla
              </button>
              <button type="button" onClick={handleFormSubmit} disabled={isSubmitting}
                className="rounded-lg bg-amber-600 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Salvataggio..." : "Salva materiale"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══ Modal conferma eliminazione ════════════════════════════════════════════ */}
      {isMounted && isDeleteOpen && materialeToDelete && createPortal(
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
              Eliminare {materialeToDelete.name}?
            </h3>
            <p className="mb-5 text-[13px] text-slate-500">
              Questa azione è definitiva e non potrà essere annullata.
            </p>
            {deleteError && (
              <p className="mb-4 text-[13px] text-red-600">{deleteError}</p>
            )}
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
