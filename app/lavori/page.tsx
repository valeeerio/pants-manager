"use client";

import { useState, useMemo } from "react";
import { ClipboardList, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Job = {
  id: number;
  code: string;
  clientName: string;
  title: string;
  type: string;
  status: string;
  receivedDate: string;
  dueDate: string;
  estimatedPrice: number;
  finalPrice: number | null;
  description: string;
  notes: string | null;
};

const allJobs: Job[] = [
  {
    id: 1,
    code: "GS-001",
    clientName: "Mario Rossi",
    title: "Orlo pantalone elegante",
    type: "Orlo pantalone",
    status: "In lavorazione",
    receivedDate: "2025-05-08",
    dueDate: "2025-05-10",
    estimatedPrice: 15,
    finalPrice: null,
    description: "Orlo pantalone in lana nera",
    notes: "Cliente preferisce orlo a mano",
  },
  {
    id: 2,
    code: "GS-002",
    clientName: "Luca Bianchi",
    title: "Stringere vita jeans",
    type: "Stringere vita",
    status: "Pronto",
    receivedDate: "2025-05-07",
    dueDate: "2025-05-10",
    estimatedPrice: 20,
    finalPrice: 20,
    description: "Stringere vita jeans blu",
    notes: null,
  },
  {
    id: 3,
    code: "GS-003",
    clientName: "Anna Verdi",
    title: "Sostituzione zip",
    type: "Sostituzione zip",
    status: "In attesa cliente",
    receivedDate: "2025-05-06",
    dueDate: "2025-05-12",
    estimatedPrice: 18,
    finalPrice: null,
    description: "Sostituire zip pantaloni casual",
    notes: "Manca zip, cliente la porta dopo",
  },
  {
    id: 4,
    code: "GS-004",
    clientName: "Giuseppe Neri",
    title: "Accorciare pantalone",
    type: "Accorciare gamba",
    status: "Da iniziare",
    receivedDate: "2025-05-09",
    dueDate: "2025-05-15",
    estimatedPrice: 12,
    finalPrice: null,
    description: "Accorciare pantalone di 4 cm",
    notes: null,
  },
  {
    id: 5,
    code: "GS-005",
    clientName: "Francesca Conti",
    title: "Riparazione strappo interno",
    type: "Riparazione strappo",
    status: "Consegnato",
    receivedDate: "2025-04-28",
    dueDate: "2025-05-05",
    estimatedPrice: 22,
    finalPrice: 22,
    description: "Riparare strappo coscia interna",
    notes: "Consegnato il 05/05",
  },
  {
    id: 6,
    code: "GS-006",
    clientName: "Roberto Ferrara",
    title: "Pantalone su misura",
    type: "Pantalone su misura",
    status: "In lavorazione",
    receivedDate: "2025-04-20",
    dueDate: "2025-05-25",
    estimatedPrice: 85,
    finalPrice: null,
    description: "Pantalone completo su misura in lana grigia",
    notes: "3 prove previste",
  },
  {
    id: 7,
    code: "GS-007",
    clientName: "Mario Rossi",
    title: "Allargare fianchi",
    type: "Allargare pantalone",
    status: "Da iniziare",
    receivedDate: "2025-05-09",
    dueDate: "2025-05-20",
    estimatedPrice: 25,
    finalPrice: null,
    description: "Allargare fianchi di 3 cm",
    notes: null,
  },
  {
    id: 8,
    code: "GS-008",
    clientName: "Luca Bianchi",
    title: "Orlo pantalone da cerimonia",
    type: "Orlo pantalone",
    status: "Annullato",
    receivedDate: "2025-04-15",
    dueDate: "2025-05-05",
    estimatedPrice: 30,
    finalPrice: null,
    description: "Orlo pantalone da cerimonia in seta",
    notes: "Annullato: cliente ha trovato sartoria diversa",
  },
  {
    id: 9,
    code: "GS-009",
    clientName: "Anna Verdi",
    title: "Modificare vita e accorciare",
    type: "Stringere vita",
    status: "Pronto",
    receivedDate: "2025-05-04",
    dueDate: "2025-05-09",
    estimatedPrice: 28,
    finalPrice: 28,
    description: "Stringere vita e accorciare gamba",
    notes: "Cliente è regolare",
  },
  {
    id: 10,
    code: "GS-010",
    clientName: "Giuseppe Neri",
    title: "Riparazione tasca",
    type: "Riparazione strappo",
    status: "Pronto",
    receivedDate: "2025-05-08",
    dueDate: "2025-05-11",
    estimatedPrice: 16,
    finalPrice: 16,
    description: "Riparare tasca posteriore strappata",
    notes: null,
  },
];

const stages = [
  { label: "Da iniziare", count: 6 },
  { label: "In lavorazione", count: 11 },
  { label: "In attesa cliente", count: 4 },
  { label: "Pronti", count: 9 },
];

const STATUS_COLORS: Record<string, string> = {
  "Da iniziare": "bg-slate-200 text-slate-800 border-transparent",
  "In lavorazione": "bg-blue-200 text-blue-800 border-transparent",
  "In attesa cliente": "bg-orange-200 text-orange-800 border-transparent",
  Pronto: "bg-green-200 text-green-800 border-transparent",
  Consegnato: "bg-emerald-700 text-white border-transparent",
  Annullato: "bg-red-200 text-red-800 border-transparent",
};

const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer";

type SortKey =
  | "code"
  | "clientName"
  | "title"
  | "type"
  | "status"
  | "dueDate"
  | "estimatedPrice";
type SortOrder = "asc" | "desc";

function SortIndicator({
  active,
  order,
}: {
  active: boolean;
  order: SortOrder;
}) {
  if (!active)
    return (
      <ChevronUp className="ml-1 inline-block h-3 w-3 opacity-30" />
    );
  return order === "asc" ? (
    <ChevronUp className="ml-1 inline-block h-3 w-3 text-amber-600" />
  ) : (
    <ChevronDown className="ml-1 inline-block h-3 w-3 text-amber-600" />
  );
}

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function JobsPage() {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showMore, setShowMore] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredAndSorted = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = localDateStr(now);

    let result = [...allJobs];

    if (filterStatus) {
      result = result.filter((j) => j.status === filterStatus);
    }

    if (filterType) {
      result = result.filter((j) => j.type === filterType);
    }

    if (filterDueDate) {
      if (filterDueDate === "today") {
        result = result.filter((j) => j.dueDate === todayStr);
      } else if (filterDueDate === "week") {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekEndStr = localDateStr(weekEnd);
        result = result.filter(
          (j) => j.dueDate >= todayStr && j.dueDate <= weekEndStr
        );
      } else if (filterDueDate === "month") {
        const monthStart = localDateStr(
          new Date(now.getFullYear(), now.getMonth(), 1)
        );
        const monthEnd = localDateStr(
          new Date(now.getFullYear(), now.getMonth() + 1, 0)
        );
        result = result.filter(
          (j) => j.dueDate >= monthStart && j.dueDate <= monthEnd
        );
      } else if (filterDueDate === "overdue") {
        result = result.filter((j) => j.dueDate < todayStr);
      } else if (filterDueDate === "custom") {
        if (dateFrom) result = result.filter((j) => j.dueDate >= dateFrom);
        if (dateTo) result = result.filter((j) => j.dueDate <= dateTo);
      }
    }

    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      let cmp: number;
      if (typeof valA === "number" && typeof valB === "number") {
        cmp = valA - valB;
      } else {
        cmp = String(valA).localeCompare(String(valB), "it");
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [filterStatus, filterType, filterDueDate, dateFrom, dateTo, sortBy, sortOrder]);

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  function resetFilters() {
    setFilterStatus("");
    setFilterDueDate("");
    setFilterType("");
    setDateFrom("");
    setDateTo("");
  }

  const visibleJobs = filteredAndSorted.slice(0, showMore);
  const remaining = filteredAndSorted.length - showMore;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lavori"
        description="Pianifica modifiche, riparazioni, confezioni su misura e urgenze di consegna."
        actions={
          <Button className="bg-amber-600 text-white hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            Nuovo lavoro
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <Card key={stage.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stage.label}</p>
                <p className="text-2xl font-semibold">{stage.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Lavori recenti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Barra filtri */}
          <div className="flex flex-wrap items-end gap-3 border-b bg-stone-50 px-4 py-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Stato
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti gli stati</option>
                <option value="Da iniziare">Da iniziare</option>
                <option value="In lavorazione">In lavorazione</option>
                <option value="In attesa cliente">In attesa cliente</option>
                <option value="Pronto">Pronto</option>
                <option value="Consegnato">Consegnato</option>
                <option value="Annullato">Annullato</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Data consegna
              </label>
              <select
                value={filterDueDate}
                onChange={(e) => {
                  setFilterDueDate(e.target.value);
                  if (e.target.value !== "custom") {
                    setDateFrom("");
                    setDateTo("");
                  }
                }}
                className={SELECT_CLASS}
              >
                <option value="">Tutte le date</option>
                <option value="today">Oggi</option>
                <option value="week">Questa settimana</option>
                <option value="month">Questo mese</option>
                <option value="overdue">Overdue (scaduti)</option>
                <option value="custom">Personalizzato</option>
              </select>
            </div>

            {filterDueDate === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    Da
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-36 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">
                    A
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-36 text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Tipo lavoro
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti i tipi</option>
                <option value="Orlo pantalone">Orlo pantalone</option>
                <option value="Stringere vita">Stringere vita</option>
                <option value="Accorciare gamba">Accorciare gamba</option>
                <option value="Allargare pantalone">Allargare pantalone</option>
                <option value="Sostituzione zip">Sostituzione zip</option>
                <option value="Riparazione strappo">Riparazione strappo</option>
                <option value="Pantalone su misura">Pantalone su misura</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 border-amber-600 text-amber-700 hover:bg-amber-50"
              onClick={resetFilters}
            >
              Cancella filtri
            </Button>
          </div>

          {/* Tabella */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("code")}
                >
                  Codice
                  <SortIndicator active={sortBy === "code"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("clientName")}
                >
                  Cliente
                  <SortIndicator
                    active={sortBy === "clientName"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("title")}
                >
                  Titolo lavoro
                  <SortIndicator
                    active={sortBy === "title"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="hidden cursor-pointer select-none whitespace-nowrap md:table-cell"
                  onClick={() => handleSort("type")}
                >
                  Tipo
                  <SortIndicator active={sortBy === "type"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  Stato
                  <SortIndicator
                    active={sortBy === "status"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("dueDate")}
                >
                  Data consegna
                  <SortIndicator
                    active={sortBy === "dueDate"}
                    order={sortOrder}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap text-right"
                  onClick={() => handleSort("estimatedPrice")}
                >
                  Prezzo
                  <SortIndicator
                    active={sortBy === "estimatedPrice"}
                    order={sortOrder}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleJobs.map((job) => (
                <TableRow key={job.code}>
                  <TableCell className="font-medium text-slate-700">
                    {job.code}
                  </TableCell>
                  <TableCell>{job.clientName}</TableCell>
                  <TableCell className="min-w-[12rem]">{job.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {job.type}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_COLORS[job.status] ??
                        "border-transparent bg-slate-200 text-slate-800"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{job.dueDate}</TableCell>
                  <TableCell className="text-right font-medium">
                    € {job.estimatedPrice}
                  </TableCell>
                </TableRow>
              ))}
              {visibleJobs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-slate-400"
                  >
                    Nessun lavoro trovato con i filtri selezionati.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Carica altri */}
          {remaining > 0 && (
            <div className="border-t py-4 text-center">
              <span className="text-sm text-slate-500">
                Mostra altri{" "}
                <button
                  className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
                  onClick={() => setShowMore((n) => n + 5)}
                >
                  {Math.min(remaining, 5)} lavori
                </button>
                {remaining > 5 && (
                  <span className="text-slate-400">
                    {" "}
                    ({remaining} in totale)
                  </span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
