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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
