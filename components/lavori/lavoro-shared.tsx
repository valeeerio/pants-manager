export type JobPhotos = {
  prima: string | null;
  dopo: string | null;
};

export type Cliente = { id: string; nome: string; cognome: string };

export type Job = {
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

export type PaymentData = {
  id: string;
  status: string;
  method: string | null;
  paidAt: string | null;
  createdAt: string;
};

export const FIELD_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";
export const FIELD_ERROR_CLASS =
  "w-full rounded-lg border border-red-300 bg-red-50/30 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/25";
export const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60";

export const STATUS_COLORS: Record<string, string> = {
  "Da iniziare": "bg-stone-100 text-stone-600 border-transparent",
  "In lavorazione": "bg-amber-100 text-amber-700 border-transparent",
  "In attesa cliente": "bg-orange-100 text-orange-700 border-transparent",
  Pronto: "bg-emerald-100 text-emerald-700 border-transparent",
  Annullato: "bg-red-100 text-red-700 border-transparent",
};

export const REVERSE_STATUS_MAP: Record<string, string> = {
  "Da iniziare": "TODO",
  "In lavorazione": "IN_PROGRESS",
  "In attesa cliente": "WAITING_CUSTOMER",
  Pronto: "COMPLETED",
  Annullato: "CANCELLED",
};

export const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60 cursor-pointer";

export function Field({
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
