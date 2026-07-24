import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/lavori/stage-counts
// Conteggio lavori per stato, su tutti i record
// (non risente del `take` di sicurezza applicato alla lista in GET /api/lavori)
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const [daIniziare, inLavorazione, inAttesaCliente, pronti] = await prisma.$transaction([
      prisma.project.count({ where: { status: "TODO" } }),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.project.count({ where: { status: "WAITING_CUSTOMER" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
    ])

    return NextResponse.json({ daIniziare, inLavorazione, inAttesaCliente, pronti })
  } catch (error) {
    console.error("Errore GET /api/lavori/stage-counts:", error)
    return NextResponse.json(
      { error: "Errore nel recupero dei conteggi" },
      { status: 500 }
    )
  }
}
