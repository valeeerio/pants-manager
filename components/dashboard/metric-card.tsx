import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, change, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-normal text-slate-800">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{change}</p>
      </CardContent>
    </Card>
  );
}
