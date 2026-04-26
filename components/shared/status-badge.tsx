import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const variant: "success" | "info" | "warning" =
    status === "Pagato" || status === "Pronto" || status === "Consegnato"
      ? "success"
      : status === "In lavorazione" || status === "Acconto"
        ? "info"
        : "warning";

  return <Badge variant={variant}>{status}</Badge>;
}
