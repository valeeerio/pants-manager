import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type TableRowsSkeletonProps = {
  /** Numero di righe placeholder da mostrare. */
  rows?: number;
  /** Numero di colonne della tabella (una `<TableCell>` per colonna). */
  columns: number;
};

/**
 * Righe di tabella skeleton, da usare al posto di un `<TableCell colSpan>`
 * con testo "Caricamento..." mentre i dati sono in fetch dalle API.
 */
export function TableRowsSkeleton({ rows = 5, columns }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} className="py-3">
              <Skeleton className="h-4 w-full max-w-[140px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
