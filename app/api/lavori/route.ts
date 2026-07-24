import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const STATUS_MAP: Record<string, string> = {
  TODO: "Da iniziare",
  IN_PROGRESS: "In lavorazione",
  WAITING_CUSTOMER: "In attesa cliente",
  COMPLETED: "Pronto",
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
      price: l.price ?? null,
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
    const { clientId, type, dueDate, description, price, notes } = body;

    if (!clientId || !type || !dueDate) {
      return NextResponse.json(
        { error: "Cliente, tipo lavoro e data consegna sono obbligatori" },
        { status: 400 }
      );
    }

    if (!(type in TYPE_MAP)) {
      return NextResponse.json(
        { error: "Tipo lavoro non valido" },
        { status: 400 }
      );
    }

    const titoloAuto = TYPE_MAP[type];

    const MAX_TENTATIVI = 3;
    let lavoro = null;

    for (let tentativo = 0; tentativo < MAX_TENTATIVI; tentativo++) {
      const [{ max }] = await prisma.$queryRaw<[{ max: number | bigint }]>`
        SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 4) AS INTEGER)), 0) AS max
        FROM "Project"
      `;
      const prossimoNumero = Number(max) + 1;
      const code = `GS-${String(prossimoNumero).padStart(3, "0")}`;

      try {
        lavoro = await prisma.project.create({
          data: {
            code,
            clientId,
            title: titoloAuto,
            description: description?.trim() || null,
            type,
            status: "TODO",
            dueDate: new Date(dueDate),
            price: price ? parseFloat(price) : null,
            notes: notes?.trim() || null,
          },
          include: {
            client: {
              select: { firstName: true, lastName: true },
            },
          },
        });
        break;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Codice già preso da una richiesta concorrente: ricalcola e riprova
          continue;
        }
        throw error;
      }
    }

    if (!lavoro) {
      return NextResponse.json(
        { error: "Conflitto nella generazione del codice lavoro, riprova" },
        { status: 409 }
      );
    }

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
        price: lavoro.price ?? null,
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
