import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "success" | "info" | "warning" | "muted" | "destructive" | "teal"> = {
  "Pronto": "success",
  "Consegnato": "teal",
  "In lavorazione": "info",
  "In attesa cliente": "warning",
  "Da iniziare": "muted",
  "Annullato": "destructive"
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusVariant[status] ?? "muted";
  return <Badge variant={variant}>{status}</Badge>;
}
