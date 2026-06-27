import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { PaymentStatus, PaymentMethod } from "@prisma/client"

// GET /api/pagamenti
// Query params opzionali: projectId, status, method, dateFrom, dateTo
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { searchParams } = request.nextUrl
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const method = searchParams.get("method")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const pagamenti = await prisma.payment.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status: status as PaymentStatus }),
        ...(method && { method: method as PaymentMethod }),
        ...((dateFrom || dateTo) && {
          paidAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }),
      },
      include: {
        project: {
          select: {
            code: true,
            title: true,
            finalPrice: true,
            estimatedPrice: true,
            client: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const pagamentiFormattati = pagamenti.map((p) => ({
      id: p.id,
      projectId: p.projectId,
      projectCode: p.project.code,
      projectTitle: p.project.title,
      clientName: `${p.project.client.firstName} ${p.project.client.lastName}`,
      amount: p.amount,
      status: p.status,
      method: p.method ?? null,
      paidAt: p.paidAt?.toISOString().split("T")[0] ?? null,
      notes: p.notes ?? null,
      createdAt: p.createdAt.toISOString().split("T")[0],
    }))

    return NextResponse.json(pagamentiFormattati)
  } catch (error) {
    console.error("Errore GET /api/pagamenti:", error)
    return NextResponse.json(
      { error: "Errore nel recupero dei pagamenti" },
      { status: 500 }
    )
  }
}

// POST /api/pagamenti
// Body obbligatori: projectId, amount, status
// Body opzionali: method, paidAt, notes
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { projectId, amount, status, method, paidAt, notes } = body

    if (!projectId || amount === undefined || amount === null || !status) {
      return NextResponse.json(
        { error: "projectId, amount e status sono obbligatori" },
        { status: 400 }
      )
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount deve essere un numero maggiore di zero" },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        code: true,
        title: true,
        finalPrice: true,
        estimatedPrice: true,
        client: { select: { firstName: true, lastName: true } },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Lavoro non trovato" },
        { status: 404 }
      )
    }

    const paidAtValue =
      status === "PAID"
        ? paidAt
          ? new Date(paidAt)
          : new Date()
        : null

    const pagamento = await prisma.payment.create({
      data: {
        projectId,
        amount,
        status,
        method: method ?? null,
        paidAt: paidAtValue,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json(
      {
        id: pagamento.id,
        projectId: pagamento.projectId,
        projectCode: project.code,
        projectTitle: project.title,
        clientName: `${project.client.firstName} ${project.client.lastName}`,
        amount: pagamento.amount,
        status: pagamento.status,
        method: pagamento.method ?? null,
        paidAt: pagamento.paidAt?.toISOString().split("T")[0] ?? null,
        notes: pagamento.notes ?? null,
        createdAt: pagamento.createdAt.toISOString().split("T")[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Errore POST /api/pagamenti:", error)
    return NextResponse.json(
      { error: "Errore nella creazione del pagamento" },
      { status: 500 }
    )
  }
}
