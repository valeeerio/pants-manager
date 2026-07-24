import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { inizioMeseUTC } from "@/lib/date"

// GET /api/clienti/stats
// Totali per i KPI della pagina Clienti, su tutti i record
// (non risente del `take` di sicurezza applicato alla lista in GET /api/clienti)
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const inizioMese = inizioMeseUTC()

    const [totale, nuoviMese, clientiConProgetti] = await prisma.$transaction([
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: inizioMese } } }),
      prisma.client.findMany({
        select: {
          projects: { select: { status: true } },
        },
      }),
    ])

    const senzaLavoriAttivi = clientiConProgetti.filter(
      (c) => !c.projects.some((p) => ["TODO", "IN_PROGRESS", "WAITING_CUSTOMER"].includes(p.status))
    ).length

    return NextResponse.json({ totale, nuoviMese, senzaLavoriAttivi })
  } catch (error) {
    console.error("Errore GET /api/clienti/stats:", error)
    return NextResponse.json(
      { error: "Errore nel recupero delle statistiche" },
      { status: 500 }
    )
  }
}
