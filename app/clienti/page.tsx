"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronUp, ChevronDown, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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

type Cliente = {
  id: string;
  nome: string;
  cognome: string;
  telefono: string;
  email: string | null;
  note: string | null;
  dataRegistrazione: string;
  numeroLavori: number;
  lavoriAttivi: number;
};

const MESI_IT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

function formatDataIt(iso: string): string {
  const parts = iso.split("-");
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return `${d} ${MESI_IT[m - 1]} ${y}`;
}

const allClienti: Cliente[] = [
  {
    id: "CL-001",
    nome: "Mario",
    cognome: "Rossi",
    telefono: "333-1234567",
    email: "mario.rossi@email.it",
    note: null,
    dataRegistrazione: "2024-03-15",
    numeroLavori: 4,
    lavoriAttivi: 2,
  },
  {
    id: "CL-002",
    nome: "Luca",
    cognome: "Bianchi",
    telefono: "347-2345678",
    email: "luca.bianchi@email.it",
    note: "Cliente puntuale nei ritiri",
    dataRegistrazione: "2023-11-08",
    numeroLavori: 3,
    lavoriAttivi: 1,
  },
  {
    id: "CL-003",
    nome: "Anna",
    cognome: "Verdi",
    telefono: "328-3456789",
    email: "anna.verdi@email.it",
    note: null,
    dataRegistrazione: "2024-06-22",
    numeroLavori: 5,
    lavoriAttivi: 2,
  },
  {
    id: "CL-004",
    nome: "Giuseppe",
    cognome: "Neri",
    telefono: "366-4567890",
    email: null,
    note: "Preferisce essere contattato al mattino",
    dataRegistrazione: "2025-02-14",
    numeroLavori: 3,
    lavoriAttivi: 1,
  },
  {
    id: "CL-005",
    nome: "Francesca",
    cognome: "Conti",
    telefono: "391-5678901",
    email: "francesca.conti@email.it",
    note: null,
    dataRegistrazione: "2024-09-03",
    numeroLavori: 2,
    lavoriAttivi: 0,
  },
  {
    id: "CL-006",
    nome: "Roberto",
    cognome: "Ferrara",
    telefono: "349-6789012",
    email: null,
    note: "Pantalone su misura in lavorazione",
    dataRegistrazione: "2025-07-29",
    numeroLavori: 2,
    lavoriAttivi: 1,
  },
  {
    id: "CL-007",
    nome: "Valentina",
    cognome: "Marino",
    telefono: "335-7890123",
    email: "v.marino@libero.it",
    note: "Clientela fedele, sconto del 10% concordato",
    dataRegistrazione: "2024-01-18",
    numeroLavori: 6,
    lavoriAttivi: 3,
  },
  {
    id: "CL-008",
    nome: "Carlo",
    cognome: "Esposito",
    telefono: "320-8901234",
    email: null,
    note: null,
    dataRegistrazione: "2026-04-07",
    numeroLavori: 1,
    lavoriAttivi: 0,
  },
  {
    id: "CL-009",
    nome: "Paola",
    cognome: "Ricci",
    telefono: "389-9012345",
    email: "paola.ricci@gmail.com",
    note: "Porta spesso capi di sartoria di pregio",
    dataRegistrazione: "2023-05-11",
    numeroLavori: 8,
    lavoriAttivi: 4,
  },
  {
    id: "CL-010",
    nome: "Davide",
    cognome: "Lombardi",
    telefono: "340-0123456",
    email: null,
    note: null,
    dataRegistrazione: "2026-05-03",
    numeroLavori: 0,
    lavoriAttivi: 0,
  },
  {
    id: "CL-011",
    nome: "Silvia",
    cognome: "Gallo",
    telefono: "377-1234509",
    email: "silvia.gallo@email.it",
    note: "Referenziata da Anna Verdi",
    dataRegistrazione: "2025-09-15",
    numeroLavori: 7,
    lavoriAttivi: 3,
  },
  {
    id: "CL-012",
    nome: "Marco",
    cognome: "Fabbri",
    telefono: "368-2345670",
    email: null,
    note: "Richiede sempre ricevuta",
    dataRegistrazione: "2026-02-28",
    numeroLavori: 2,
    lavoriAttivi: 1,
  },
  {
    id: "CL-013",
    nome: "Elena",
    cognome: "Russo",
    telefono: "344-3456781",
    email: "elena.russo@email.it",
    note: null,
    dataRegistrazione: "2026-05-01",
    numeroLavori: 4,
    lavoriAttivi: 2,
  },
];

type SortKey =
  | "nome"
  | "cognome"
  | "telefono"
  | "numeroLavori"
  | "lavoriAttivi"
  | "dataRegistrazione";
type SortOrder = "asc" | "desc";

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active)
    return <ChevronUp className="ml-1 inline-block h-3 w-3 opacity-30" />;
  return order === "asc" ? (
    <ChevronUp className="ml-1 inline-block h-3 w-3 text-amber-600" />
  ) : (
    <ChevronDown className="ml-1 inline-block h-3 w-3 text-amber-600" />
  );
}

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400/60 cursor-pointer";

const PAGE_SIZE = 10;

export default function ClientiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAttivi, setFilterAttivi] = useState("");
  const [filterData, setFilterData] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lavoriAttivi");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredAndSorted = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();

    let result = [...allClienti];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.cognome.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filterAttivi) {
      if (filterAttivi === "nessuno") {
        result = result.filter((c) => c.lavoriAttivi === 0);
      } else if (filterAttivi === "alcuni") {
        result = result.filter((c) => c.lavoriAttivi > 0);
      } else if (filterAttivi === "molti") {
        result = result.filter((c) => c.lavoriAttivi >= 3);
      }
    }

    if (filterData) {
      if (filterData === "mese") {
        const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        result = result.filter((c) => c.dataRegistrazione.startsWith(monthStr));
      } else if (filterData === "tre_mesi") {
        const cutoff = new Date(today);
        cutoff.setMonth(cutoff.getMonth() - 3);
        const cutoffStr = cutoff.toISOString().split("T")[0];
        result = result.filter((c) => c.dataRegistrazione >= cutoffStr);
      } else if (filterData === "anno") {
        result = result.filter((c) =>
          c.dataRegistrazione.startsWith(String(year))
        );
      } else if (filterData === "vecchi") {
        result = result.filter(
          (c) => !c.dataRegistrazione.startsWith(String(year))
        );
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
  }, [searchQuery, filterAttivi, filterData, sortBy, sortOrder]);

  function handleSort(col: SortKey) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  const visibleClienti = filteredAndSorted.slice(0, visibleCount);
  const remaining = filteredAndSorted.length - visibleCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clienti"
        description="Gestisci l'anagrafica dei clienti del laboratorio."
      />

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-slate-800">Archivio clienti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Barra filtri */}
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <div className="flex min-w-[260px] flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Cerca</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per nome, cognome o telefono..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Lavori attivi
              </label>
              <select
                value={filterAttivi}
                onChange={(e) => setFilterAttivi(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutti</option>
                <option value="nessuno">Senza lavori attivi</option>
                <option value="alcuni">Con lavori attivi</option>
                <option value="molti">Molto attivi (3+)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">
                Data registrazione
              </label>
              <select
                value={filterData}
                onChange={(e) => setFilterData(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Tutte</option>
                <option value="mese">Questo mese</option>
                <option value="tre_mesi">Ultimi 3 mesi</option>
                <option value="anno">Quest&apos;anno</option>
                <option value="vecchi">Più vecchi</option>
              </select>
            </div>

            <div className="ml-auto flex items-end pb-0">
              <Button
                className="bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => console.log("nuovo cliente")}
              >
                <Plus className="h-4 w-4" />
                Nuovo cliente
              </Button>
            </div>
          </div>

          {/* Tabella */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("nome")}
                >
                  Nome
                  <SortIndicator active={sortBy === "nome"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("cognome")}
                >
                  Cognome
                  <SortIndicator active={sortBy === "cognome"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("telefono")}
                >
                  Telefono
                  <SortIndicator active={sortBy === "telefono"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("numeroLavori")}
                >
                  Lavori
                  <SortIndicator active={sortBy === "numeroLavori"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("lavoriAttivi")}
                >
                  Attivi
                  <SortIndicator active={sortBy === "lavoriAttivi"} order={sortOrder} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("dataRegistrazione")}
                >
                  Data registrazione
                  <SortIndicator active={sortBy === "dataRegistrazione"} order={sortOrder} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClienti.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => console.log("apri dettaglio", cliente)}
                >
                  <TableCell className="font-medium text-slate-800">
                    {cliente.nome}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {cliente.cognome}
                  </TableCell>
                  <TableCell className="font-mono text-[12px] text-slate-600">
                    {cliente.telefono}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {cliente.numeroLavori}
                  </TableCell>
                  <TableCell>
                    {cliente.lavoriAttivi > 0 ? (
                      <span className="font-semibold text-amber-700">
                        {cliente.lavoriAttivi}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[12px] text-slate-500">
                    {formatDataIt(cliente.dataRegistrazione)}
                  </TableCell>
                </TableRow>
              ))}
              {visibleClienti.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-400"
                  >
                    Nessun cliente trovato. Prova a modificare i filtri.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Carica altri */}
          <div className="border-t border-slate-100 py-4 text-center">
            {remaining > 0 ? (
              <p className="text-sm text-slate-500">
                Mostrati {visibleClienti.length} di {filteredAndSorted.length}{" "}
                clienti{"  "}
                <button
                  className="font-medium text-amber-600 hover:underline"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Carica altri
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Tutti i clienti sono visualizzati
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
