import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
