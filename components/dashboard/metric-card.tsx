import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  onClick?: () => void;
};

/**
 * Deduce la direzione del trend dal testo di `change`.
 * `change` è una stringa descrittiva libera (es. "+3 lavori", "invariato"),
 * non un dato strutturato: questa funzione isola l'unico punto in cui se ne
 * fa il parsing.
 */
function parseTrend(change: string): "positive" | "negative" | "neutral" {
  if (change.startsWith("+")) return "positive";
  if (change.startsWith("-") && !change.includes("invariato")) return "negative";
  return "neutral";
}

export function MetricCard({ label, value, change, icon: Icon, onClick }: MetricCardProps) {
  const trend = parseTrend(change);
  const isPositive = trend === "positive";
  const isNegative = trend === "negative";

  const card = (
    <Card className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />

        {/* Top accent shimmer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

        <div className="relative">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400/80">
              {label}
            </p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 shadow-sm ring-1 ring-amber-200/50">
              <Icon className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{value}</div>
            <div
              className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${
                isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-slate-400"
              }`}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          </CardContent>
      </div>
    </Card>
  );

  return onClick ? (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="block cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-1"
    >
      {card}
    </div>
  ) : (
    card
  );
}
