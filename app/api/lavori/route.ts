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

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const lavori = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const lavoriFormattati = lavori.map((l) => ({
      id: l.id,
      code: l.code,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      clientId: l.clientId,
      type: TYPE_MAP[l.type] ?? l.type,
      typeRaw: l.type,
      status: STATUS_MAP[l.status] ?? l.status,
      statusRaw: l.status,
      receivedAt: l.receivedAt.toISOString().split("T")[0],
      dueDate: l.dueDate?.toISOString().split("T")[0] ?? null,
      estimatedPrice: l.estimatedPrice ?? null,
      finalPrice: l.finalPrice ?? null,
      notes: l.notes ?? null,
      description: l.description ?? null,
    }));

    return NextResponse.json(lavoriFormattati);
  } catch (error) {
    console.error("Errore GET /api/lavori:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei lavori" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const body = await req.json();
    const { clientId, type, dueDate, description, estimatedPrice, notes } = body;

    if (!clientId || !type || !dueDate) {
      return NextResponse.json(
        { error: "Cliente, tipo lavoro e data consegna sono obbligatori" },
        { status: 400 }
      );
    }

    const ultimo = await prisma.project.findFirst({
      orderBy: { code: "desc" },
      select: { code: true },
    });
    const prossimoNumero = ultimo
      ? parseInt(ultimo.code.replace("GS-", "")) + 1
      : 1;
    const code = `GS-${String(prossimoNumero).padStart(3, "0")}`;
    const titoloAuto = TYPE_MAP[type] ?? "Lavoro";

    const lavoro = await prisma.project.create({
      data: {
        code,
        clientId,
        title: titoloAuto,
        description: description?.trim() || null,
        type,
        status: "TODO",
        dueDate: new Date(dueDate),
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        notes: notes?.trim() || null,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore POST /api/lavori:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del lavoro" },
      { status: 500 }
    );
  }
}
