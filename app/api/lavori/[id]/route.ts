import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const STATUS_MAP: Record<string, string> = {
  TODO: "Da iniziare",
  IN_PROGRESS: "In lavorazione",
  WAITING_CUSTOMER: "In attesa cliente",
  COMPLETED: "Pronto",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
};

const TYPE_MAP: Record<string, string> = {
  HEM: "Orlo pantalone",
  WAIST_TIGHTENING: "Stringere vita",
  LEG_SHORTENING: "Accorciare gamba",
  LEG_WIDENING: "Allargare pantalone",
  ZIP_REPLACEMENT: "Sostituzione zip",
  REPAIR: "Riparazione",
  CUSTOM: "Su misura",
  OTHER: "Altro",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;
    const lavoro = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true },
        },
        payments: true,
      },
    });

    if (!lavoro) {
      return NextResponse.json(
        { error: "Lavoro non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: lavoro.id,
      code: lavoro.code,
      clientName: `${lavoro.client.firstName} ${lavoro.client.lastName}`,
      clientId: lavoro.clientId,
      type: TYPE_MAP[lavoro.type] ?? lavoro.type,
      typeRaw: lavoro.type,
      status: STATUS_MAP[lavoro.status] ?? lavoro.status,
      statusRaw: lavoro.status,
      receivedAt: lavoro.receivedAt.toISOString().split("T")[0],
      dueDate: lavoro.dueDate?.toISOString().split("T")[0] ?? null,
      estimatedPrice: lavoro.estimatedPrice ?? null,
      finalPrice: lavoro.finalPrice ?? null,
      notes: lavoro.notes ?? null,
      description: lavoro.description ?? null,
    });
  } catch (error) {
    console.error("Errore GET /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del lavoro" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      clientId,
      type,
      status,
      dueDate,
      description,
      estimatedPrice,
      finalPrice,
      notes,
    } = body;

    if (!clientId || !type || !status) {
      return NextResponse.json(
        { error: "Cliente, tipo e stato sono obbligatori" },
        { status: 400 }
      );
    }

    const titoloAuto = TYPE_MAP[type] ?? "Lavoro";

    const lavoro = await prisma.project.update({
      where: { id },
      data: {
        clientId,
        title: titoloAuto,
        description: description?.trim() || null,
        type,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        finalPrice: finalPrice ? parseFloat(finalPrice) : null,
        notes: notes?.trim() || null,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      id: lavoro.id,
      code: lavoro.code,
      clientName: `${lavoro.client.firstName} ${lavoro.client.lastName}`,
      clientId: lavoro.clientId,
      type: TYPE_MAP[lavoro.type] ?? lavoro.type,
      typeRaw: lavoro.type,
      status: STATUS_MAP[lavoro.status] ?? lavoro.status,
      statusRaw: lavoro.status,
      receivedAt: lavoro.receivedAt.toISOString().split("T")[0],
      dueDate: lavoro.dueDate?.toISOString().split("T")[0] ?? null,
      estimatedPrice: lavoro.estimatedPrice ?? null,
      finalPrice: lavoro.finalPrice ?? null,
      notes: lavoro.notes ?? null,
      description: lavoro.description ?? null,
    });
  } catch (error) {
    console.error("Errore PUT /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nella modifica del lavoro" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;

    await prisma.payment.deleteMany({ where: { projectId: id } });
    await prisma.projectImage.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore DELETE /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del lavoro" },
      { status: 500 }
    );
  }
}
