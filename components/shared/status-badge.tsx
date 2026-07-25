import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/components/lavori/lavoro-shared";

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_META[status]?.variant ?? "muted";
  return <Badge variant={variant}>{status}</Badge>;
}
