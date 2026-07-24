import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { inizioMeseUTC } from "@/lib/date"

// GET /api/pagamenti/stats
// Totali per i KPI della pagina Pagamenti, calcolati su tutti i record
// (non risente del `take` di sicurezza applicato alla lista in GET /api/pagamenti)
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const inizioMese = inizioMeseUTC()

    const pagamenti = await prisma.payment.findMany({
      select: {
        status: true,
        paidAt: true,
        project: { select: { price: true } },
      },
    })

    const stats = pagamenti.reduce(
      (acc, p) => {
        const importo = p.project.price ?? 0
        if (p.status === "PAID" && p.paidAt && p.paidAt >= inizioMese) {
          acc.incassatoMese += importo
        } else if (p.status === "UNPAID") {
          acc.inAttesa += importo
        } else if (p.status === "DEPOSIT_PAID") {
          acc.accontiSospesi += importo
        }
        return acc
      },
      { incassatoMese: 0, inAttesa: 0, accontiSospesi: 0 }
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Errore GET /api/pagamenti/stats:", error)
    return NextResponse.json(
      { error: "Errore nel recupero delle statistiche" },
      { status: 500 }
    )
  }
}
