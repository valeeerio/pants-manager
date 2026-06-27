import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Prisma } from "@prisma/client"

// GET /api/pagamenti/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params

    const pagamento = await prisma.payment.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            code: true,
            title: true,
            status: true,
            finalPrice: true,
            estimatedPrice: true,
            client: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    })

    if (!pagamento) {
      return NextResponse.json(
        { error: "Pagamento non trovato" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: pagamento.id,
      projectId: pagamento.projectId,
      projectCode: pagamento.project.code,
      projectTitle: pagamento.project.title,
      projectStatus: pagamento.project.status,
      clientName: `${pagamento.project.client.firstName} ${pagamento.project.client.lastName}`,
      clientPhone: pagamento.project.client.phone,
      amount: pagamento.amount,
      status: pagamento.status,
      method: pagamento.method ?? null,
      paidAt: pagamento.paidAt?.toISOString().split("T")[0] ?? null,
      notes: pagamento.notes ?? null,
      createdAt: pagamento.createdAt.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Errore GET /api/pagamenti/[id]:", error)
    return NextResponse.json(
      { error: "Errore nel recupero del pagamento" },
      { status: 500 }
    )
  }
}

// PUT /api/pagamenti/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { amount, status, method, paidAt, notes } = body

    if (amount === undefined || amount === null || !status) {
      return NextResponse.json(
        { error: "amount e status sono obbligatori" },
        { status: 400 }
      )
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount deve essere un numero maggiore di zero" },
        { status: 400 }
      )
    }

    const paidAtValue =
      status === "PAID"
        ? paidAt
          ? new Date(paidAt)
          : new Date()
        : null

    const pagamento = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        status,
        method: method ?? null,
        paidAt: paidAtValue,
        notes: notes?.trim() || null,
      },
      include: {
        project: {
          select: {
            code: true,
            title: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    return NextResponse.json({
      id: pagamento.id,
      projectId: pagamento.projectId,
      projectCode: pagamento.project.code,
      projectTitle: pagamento.project.title,
      clientName: `${pagamento.project.client.firstName} ${pagamento.project.client.lastName}`,
      amount: pagamento.amount,
      status: pagamento.status,
      method: pagamento.method ?? null,
      paidAt: pagamento.paidAt?.toISOString().split("T")[0] ?? null,
      notes: pagamento.notes ?? null,
      createdAt: pagamento.createdAt.toISOString().split("T")[0],
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Pagamento non trovato" },
        { status: 404 }
      )
    }
    console.error("Errore PUT /api/pagamenti/[id]:", error)
    return NextResponse.json(
      { error: "Errore nella modifica del pagamento" },
      { status: 500 }
    )
  }
}

// DELETE /api/pagamenti/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.payment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Pagamento non trovato" },
        { status: 404 }
      )
    }
    console.error("Errore DELETE /api/pagamenti/[id]:", error)
    return NextResponse.json(
      { error: "Errore nell'eliminazione del pagamento" },
      { status: 500 }
    )
  }
}
