import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const variant: "success" | "info" | "warning" =
    status === "Pronto" || status === "Consegnato"
      ? "success"
      : status === "In lavorazione"
        ? "info"
        : "warning";

  return <Badge variant={variant}>{status}</Badge>;
}
