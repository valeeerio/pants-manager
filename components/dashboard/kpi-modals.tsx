"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

export type KpiModalTipo = "attivi" | "consegne" | "incassare" | "incassato";

export type LavoroRiga = {
  id: string;
  code: string;
  clientName: string;
  type: string;
  status: string;
  statusRaw: string;
  dueDate: string | null;
  price: number | null;
};

export type DettaglioAttivi = {
  daIniziare: number;
  inLavorazione: number;
  inAttesa: number;
  lavori: LavoroRiga[];
};

export type Consegne = {
  oggi: LavoroRiga[];
  settimana: LavoroRiga[];
};

export type DaIncassareRiga = LavoroRiga & { pagamento: "DEPOSIT_PAID" | "UNPAID" };

export type PagamentoMese = {
  id: string;
  projectId: string;
  clientName: string;
  code: string;
  type: string;
  price: number | null;
  method: string | null;
  paidAt: string | null;
};

const MESI_IT_BREVE = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

function formatDataIt(iso: string | null): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${d} ${MESI_IT_BREVE[m - 1]} ${parts[0]}`;
}

function formatEur(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

const METODO_MAP: Record<string, string> = {
  CASH: "Contanti",
  CARD: "Carta",
  BANK_TRANSFER: "Bonifico",
  OTHER: "Altro",
};

const PAGAMENTO_BADGE: Record<string, { label: string; className: string }> = {
  DEPOSIT_PAID: { label: "Acconto", className: "bg-amber-50 text-amber-700 border-amber-200" },
  UNPAID: { label: "Da pagare", className: "bg-stone-50 text-stone-600 border-stone-200" },
};

const TITOLI: Record<KpiModalTipo, string> = {
  attivi: "Lavori attivi",
  consegne: "Consegne",
  incassare: "Da incassare",
  incassato: "Incassato questo mese",
};

interface KpiModalsProps {
  tipo: KpiModalTipo | null;
  dettaglioAttivi: DettaglioAttivi | null;
  consegne: Consegne | null;
  daIncassareLista: DaIncassareRiga[] | null;
  incassatoMeseLista: PagamentoMese[] | null;
  totaleDaIncassare: number;
  totaleIncassato: number;
  onClose: () => void;
  onApriLavoro: (id: string) => void;
}

function RigaLavoro({
  lavoro,
  onClick,
  attenuata = false,
  extra,
}: {
  lavoro: LavoroRiga;
  onClick: () => void;
  attenuata?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-slate-100/80 px-3 py-2.5 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm ${
        attenuata ? "bg-slate-50/30 opacity-75" : "bg-slate-50/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-800">{lavoro.clientName}</p>
        <p className="truncate text-[11px] text-slate-400 mt-0.5">
          {lavoro.code} · {lavoro.type}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {extra ?? (
          <>
            <span className="text-[11px] font-semibold text-slate-600">{formatDataIt(lavoro.dueDate)}</span>
            <StatusBadge status={lavoro.status} />
          </>
        )}
      </div>
    </div>
  );
}

export function KpiModals({
  tipo,
  dettaglioAttivi,
  consegne,
  daIncassareLista,
  incassatoMeseLista,
  totaleDaIncassare,
  totaleIncassato,
  onClose,
  onApriLavoro,
}: KpiModalsProps) {
  useEffect(() => {
    if (!tipo) return;
    document.body.style.overflow = "hidden";
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onEscape);
    };
  }, [tipo, onClose]);

  if (!tipo) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.12)]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[15px] font-semibold text-slate-900">{TITOLI[tipo]}</p>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tipo === "attivi" && dettaglioAttivi && (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Da iniziare", count: dettaglioAttivi.daIniziare },
                  { label: "In lavorazione", count: dettaglioAttivi.inLavorazione },
                  { label: "In attesa cliente", count: dettaglioAttivi.inAttesa },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">
                    <p className="text-[20px] font-bold tracking-[-0.03em] text-slate-900">{s.count}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {dettaglioAttivi.lavori.length === 0 && (
                  <p className="px-1 py-4 text-[13px] text-slate-400">Nessun lavoro attivo.</p>
                )}
                {dettaglioAttivi.lavori.map((l) => (
                  <RigaLavoro key={l.id} lavoro={l} onClick={() => onApriLavoro(l.id)} />
                ))}
              </div>
            </>
          )}

          {tipo === "consegne" && consegne && (
            <>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Oggi</p>
              <div className="space-y-2">
                {consegne.oggi.length === 0 && (
                  <p className="px-1 py-2 text-[13px] text-slate-400">Nessuna consegna prevista oggi.</p>
                )}
                {consegne.oggi.map((l) => (
                  <RigaLavoro key={l.id} lavoro={l} onClick={() => onApriLavoro(l.id)} />
                ))}
              </div>
              <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Prossimi 7 giorni
              </p>
              <div className="space-y-2">
                {consegne.settimana.length === 0 && (
                  <p className="px-1 py-2 text-[13px] text-slate-400">Nessuna consegna in settimana.</p>
                )}
                {consegne.settimana.map((l) => (
                  <RigaLavoro key={l.id} lavoro={l} onClick={() => onApriLavoro(l.id)} attenuata />
                ))}
              </div>
            </>
          )}

          {tipo === "incassare" && daIncassareLista && (
            <>
              <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Totale da incassare</p>
                <p className="text-[22px] font-bold tracking-[-0.03em] text-slate-900">{formatEur(totaleDaIncassare)}</p>
              </div>
              <div className="space-y-2">
                {daIncassareLista.length === 0 && (
                  <p className="px-1 py-4 text-[13px] text-slate-400">Nessun lavoro da saldare.</p>
                )}
                {daIncassareLista.map((l) => {
                  const badge = PAGAMENTO_BADGE[l.pagamento];
                  return (
                    <RigaLavoro
                      key={l.id}
                      lavoro={l}
                      onClick={() => onApriLavoro(l.id)}
                      extra={
                        <>
                          <span className="text-[13px] font-semibold text-slate-800">{formatEur(l.price)}</span>
                          <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </>
                      }
                    />
                  );
                })}
              </div>
            </>
          )}

          {tipo === "incassato" && incassatoMeseLista && (
            <>
              <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Totale incassato nel mese</p>
                <p className="text-[22px] font-bold tracking-[-0.03em] text-slate-900">{formatEur(totaleIncassato)}</p>
              </div>
              <div className="space-y-2">
                {incassatoMeseLista.length === 0 && (
                  <p className="px-1 py-4 text-[13px] text-slate-400">Nessun pagamento registrato questo mese.</p>
                )}
                {incassatoMeseLista.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onApriLavoro(p.projectId)}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-slate-100/80 bg-slate-50/50 px-3 py-2.5 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-800">{p.clientName}</p>
                      <p className="truncate text-[11px] text-slate-400 mt-0.5">
                        {p.code} · {p.type}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[13px] font-semibold text-green-800">{formatEur(p.price)}</span>
                      <span className="text-[11px] text-slate-500">
                        {p.method ? `${METODO_MAP[p.method] ?? p.method} · ` : ""}
                        {formatDataIt(p.paidAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
