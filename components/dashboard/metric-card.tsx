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
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-normal">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
