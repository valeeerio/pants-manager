'use client'

import { useEffect, useState } from "react"
import { Banknote, Download, TrendingDown, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiltCard } from "@/components/ui/tilt-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Pagamento = {
  id: string
  projectId: string
  projectCode: string
  projectTitle: string
  clientName: string
  amount: number
  status: "UNPAID" | "DEPOSIT_PAID" | "PAID"
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER" | null
  paidAt: string | null
  notes: string | null
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  UNPAID: "Non pagato",
  DEPOSIT_PAID: "Acconto pagato",
  PAID: "Pagato",
}

const METHOD_LABEL: Record<string, string> = {
  CASH: "Contanti",
  CARD: "Carta",
  BANK_TRANSFER: "Bonifico",
  OTHER: "Altro",
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  PAID: "bg-green-50 text-green-800 border-green-200",
  DEPOSIT_PAID: "bg-amber-50 text-amber-700 border-amber-200",
  UNPAID: "bg-stone-50 text-stone-600 border-stone-200",
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year}`
}

export default function PaymentsPage() {
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStato, setFilterStato] = useState("TUTTI")
  const [filterMetodo, setFilterMetodo] = useState("TUTTI")

  useEffect(() => {
    async function fetchPagamenti() {
      try {
        const res = await fetch("/api/pagamenti")
        if (!res.ok) throw new Error("Risposta non valida")
        const data: Pagamento[] = await res.json()
        setPagamenti(data)
      } catch {
        setError("Non è stato possibile caricare i pagamenti. Riprova tra un attimo.")
      } finally {
        setLoading(false)
      }
    }
    fetchPagamenti()
  }, [])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const incassatoMese = pagamenti
    .filter((p) => p.status === "PAID" && p.paidAt !== null)
    .filter((p) => {
      const [year, month] = (p.paidAt as string).split("-").map(Number)
      return year === currentYear && month === currentMonth
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const inAttesa = pagamenti
    .filter((p) => p.status === "UNPAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const accontiSospesi = pagamenti
    .filter((p) => p.status === "DEPOSIT_PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const filtrati = pagamenti.filter((p) => {
    if (filterStato !== "TUTTI" && p.status !== filterStato) return false
    if (filterMetodo !== "TUTTI" && p.method !== filterMetodo) return false
    return true
  })

  const kpiCards = [
    { label: "Incassato questo mese", value: formatEuro(incassatoMese), icon: Banknote, positive: true as boolean | null },
    { label: "In attesa", value: formatEuro(inAttesa), icon: TrendingDown, positive: false as boolean | null },
    { label: "Acconti in sospeso", value: formatEuro(accontiSospesi), icon: Wallet, positive: null as boolean | null },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagamenti"
        description="Incassi, acconti e saldi collegati alle commesse del laboratorio."
        actions={
          <Button variant="outline">
            <Download className="h-3.5 w-3.5" />
            Esporta
          </Button>
        }
      />

      <section className="grid gap-3.5 md:grid-cols-3">
        {kpiCards.map((stat) => {
          const Icon = stat.icon
          return (
            <TiltCard key={stat.label}>
              <Card className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                <div className="relative p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400/80">
                      {stat.label}
                    </p>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-700 ring-1 ring-amber-200/50">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
                  ) : (
                    <p className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">{stat.value}</p>
                  )}
                </div>
              </Card>
            </TiltCard>
          )
        })}
      </section>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Movimenti</CardTitle>
            <div className="flex gap-2">
              <Select value={filterStato} onValueChange={setFilterStato}>
                <SelectTrigger className="h-8 w-44 text-sm">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TUTTI">Tutti gli stati</SelectItem>
                  <SelectItem value="UNPAID">Non pagato</SelectItem>
                  <SelectItem value="DEPOSIT_PAID">Acconto pagato</SelectItem>
                  <SelectItem value="PAID">Pagato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterMetodo} onValueChange={setFilterMetodo}>
                <SelectTrigger className="h-8 w-40 text-sm">
                  <SelectValue placeholder="Metodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TUTTI">Tutti i metodi</SelectItem>
                  <SelectItem value="CASH">Contanti</SelectItem>
                  <SelectItem value="CARD">Carta</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bonifico</SelectItem>
                  <SelectItem value="OTHER">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              Caricamento in corso…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-600">
              {error}
            </div>
          ) : filtrati.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              {pagamenti.length === 0
                ? "Nessun pagamento registrato."
                : "Nessun risultato per i filtri selezionati."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5">Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Lavoro</TableHead>
                    <TableHead>Metodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="pr-5 text-right">Importo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrati.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="px-5 text-sm text-slate-500">
                        {formatDate(p.paidAt ?? p.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">{p.clientName}</TableCell>
                      <TableCell className="text-slate-500">
                        <span className="mr-1.5 font-mono text-[12px] font-semibold text-slate-600">
                          {p.projectCode}
                        </span>
                        {p.projectTitle}
                      </TableCell>
                      <TableCell>
                        {p.method ? (
                          <span className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {METHOD_LABEL[p.method] ?? p.method}
                          </span>
                        ) : (
                          <span className="text-[12px] text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_CLASS[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right text-[13px] font-bold tracking-tight text-slate-900">
                        {formatEuro(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="px-5 py-3 text-[12px] text-slate-400">
                Stai visualizzando {filtrati.length} di {pagamenti.length} risultati
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
