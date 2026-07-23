"use client";

import { useMemo, useState } from "react";
import { Clock, Banknote, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NotificaTipo = "scadenza" | "pagamento" | "pronto" | "fermo";
export type Severita = "alta" | "media" | "bassa";

export type Notifica = {
  id: string;
  tipo: NotificaTipo;
  titolo: string;
  sottotitolo: string;
  data: string | null;
  projectId: string;
  severita: Severita;
};

export type ProgettoGiorno = { id: string; code: string; type: string; clientName: string };
export type CalendarioGiorno = { data: string; count: number; progetti: ProgettoGiorno[] };

const MESI_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
const MESI_IT_BREVE = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];
const GIORNI_SETTIMANA = ["L", "M", "M", "G", "V", "S", "D"];

function formatDataIt(iso: string | null): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${d} ${MESI_IT_BREVE[m - 1]} ${y}`;
}

const TIPO_ICON: Record<NotificaTipo, LucideIcon> = {
  scadenza: Clock,
  pagamento: Banknote,
  pronto: CheckCircle2,
  fermo: AlertTriangle,
};

const TIPO_LABEL: Record<NotificaTipo, string> = {
  scadenza: "Scadenza",
  pagamento: "Pagamento in sospeso",
  pronto: "Pronto da ritirare",
  fermo: "Lavoro fermo",
};

const SEVERITA_BADGE: Record<Severita, string> = {
  alta: "bg-red-50 text-red-700 border border-red-200",
  media: "bg-amber-50 text-amber-700 border border-amber-200",
  bassa: "bg-stone-100 text-stone-600 border border-stone-200",
};

interface NotifichePanelProps {
  notifiche: Notifica[];
  loading: boolean;
  onApriLavoro: (id: string) => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export function NotifichePanel({ notifiche, loading, onApriLavoro, onDismiss, onDismissAll }: NotifichePanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <p className="text-[13px] font-semibold text-slate-800">Notifiche</p>
        {!loading && notifiche.length > 0 && (
          <button
            type="button"
            onClick={onDismissAll}
            className="text-[11px] font-medium text-slate-400 transition-colors hover:text-amber-700"
          >
            Cancella tutte
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <p className="px-4 py-6 text-center text-[13px] text-slate-400">Caricamento…</p>
        )}
        {!loading && notifiche.length === 0 && (
          <p className="px-4 py-6 text-center text-[13px] text-slate-400">Nessuna notifica al momento.</p>
        )}
        {!loading &&
          notifiche.map((n) => {
            const Icon = TIPO_ICON[n.tipo];
            const attenuata = n.severita === "bassa";
            return (
              <div
                key={n.id}
                className="relative flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => onApriLavoro(n.projectId)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      attenuata ? "bg-slate-50 text-slate-400" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 pr-5">
                      <p className={`truncate text-[13px] font-medium ${attenuata ? "text-slate-600" : "text-slate-800"}`}>
                        {n.titolo}
                      </p>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITA_BADGE[n.severita]}`}>
                        {TIPO_LABEL[n.tipo]}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-400 mt-0.5">{n.sottotitolo}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{formatDataIt(n.data)}</p>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label="Cancella notifica"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(n.id);
                  }}
                  className="absolute right-3 top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

interface MiniCalendarioProps {
  calendario: CalendarioGiorno[];
  onApriLavoro: (id: string) => void;
}

export function MiniCalendario({ calendario, onApriLavoro }: MiniCalendarioProps) {
  const [giornoSelezionato, setGiornoSelezionato] = useState<CalendarioGiorno | null>(null);

  const oggi = useMemo(() => new Date(), []);
  const anno = oggi.getFullYear();
  const mese = oggi.getMonth();

  const giornoPerData = useMemo(() => {
    const map = new Map<string, CalendarioGiorno>();
    for (const g of calendario) map.set(g.data, g);
    return map;
  }, [calendario]);

  const celle = useMemo(() => {
    const primoGiorno = new Date(anno, mese, 1);
    const offset = (primoGiorno.getDay() + 6) % 7;
    const giorniNelMese = new Date(anno, mese + 1, 0).getDate();
    const risultato: (string | null)[] = [];
    for (let i = 0; i < offset; i++) risultato.push(null);
    for (let d = 1; d <= giorniNelMese; d++) {
      const iso = `${anno}-${String(mese + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      risultato.push(iso);
    }
    return risultato;
  }, [anno, mese]);

  const oggiIso = useMemo(() => {
    return `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, "0")}-${String(oggi.getDate()).padStart(2, "0")}`;
  }, [oggi]);

  return (
    <div className="p-4">
      <p className="mb-3 px-1 text-[14px] font-semibold capitalize text-slate-800">
        {MESI_IT[mese]} {anno}
      </p>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {GIORNI_SETTIMANA.map((g, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase text-slate-400">
            {g}
          </span>
        ))}
        {celle.map((iso, i) => {
          if (!iso) return <span key={i} />;
          const giorno = giornoPerData.get(iso);
          const count = giorno?.count ?? 0;
          const isOggi = iso === oggiIso;
          const isSelezionato = giorno && giornoSelezionato?.data === giorno.data;
          return (
            <button
              key={i}
              type="button"
              disabled={count === 0}
              onClick={() => giorno && setGiornoSelezionato((prev) => (prev?.data === giorno.data ? null : giorno))}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition-colors ${
                isSelezionato
                  ? "bg-amber-700 text-white"
                  : isOggi
                    ? "bg-amber-50 font-semibold text-amber-700"
                    : count > 0
                      ? "text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                      : "text-slate-400"
              }`}
            >
              {parseInt(iso.split("-")[2], 10)}
              {count > 0 && !isSelezionato && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {giornoSelezionato && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <p className="text-[12px] font-medium text-slate-500">
              Scadenze del {formatDataIt(giornoSelezionato.data)}
            </p>
            <button
              type="button"
              aria-label="Chiudi"
              onClick={() => setGiornoSelezionato(null)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {giornoSelezionato.progetti.length === 0 && (
            <p className="px-1 text-[12px] text-slate-400">Nessuna scadenza.</p>
          )}
          <div className="max-h-48 overflow-y-auto">
            {giornoSelezionato.progetti.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onApriLavoro(p.id)}
                className="flex w-full flex-col items-start rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="truncate text-[13px] font-medium text-slate-800">{p.clientName}</span>
                <span className="truncate text-[11px] text-slate-400 mt-0.5">
                  {p.code} · {p.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BellBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white shadow-[0_0_5px_rgba(245,158,11,0.6)]">
      {count > 9 ? "9+" : count}
    </span>
  );
}

