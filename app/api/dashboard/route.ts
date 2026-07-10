import { NextResponse } from "next/server";
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

const LAVORI_RECENTI_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const now = new Date();
    const inizioOggi = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inizioDomani = new Date(inizioOggi);
    inizioDomani.setDate(inizioDomani.getDate() + 1);
    const traSetteGiorni = new Date(inizioOggi);
    traSetteGiorni.setDate(traSetteGiorni.getDate() + 7);

    const lavoriAttiviQuery = prisma.project.count({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });
    const consegneOggiQuery = prisma.project.count({
      where: { dueDate: { gte: inizioOggi, lt: inizioDomani } },
    });
    const progettiPerIncassoQuery = prisma.project.findMany({
      select: {
        price: true,
        payments: { select: { status: true } },
      },
    });
    const clientiTotaliQuery = prisma.client.count();
    const lavoriRecentiQuery = prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: LAVORI_RECENTI_LIMIT,
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        dueDate: true,
        price: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });
    const scadenzeSettimanaQuery = prisma.project.findMany({
      where: { dueDate: { gte: inizioOggi, lte: traSetteGiorni } },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        code: true,
        status: true,
        dueDate: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });
    const distribuzioneQuery = prisma.project.groupBy({
      by: ["type"],
      _count: { _all: true },
      orderBy: { type: "asc" },
    });

    const [
      lavoriAttiviCount,
      consegneOggiCount,
      progettiPerIncasso,
      clientiTotaliCount,
      lavoriRecentiRaw,
      scadenzeSettimanaRaw,
      distribuzioneRaw,
    ] = await prisma.$transaction([
      lavoriAttiviQuery,
      consegneOggiQuery,
      progettiPerIncassoQuery,
      clientiTotaliQuery,
      lavoriRecentiQuery,
      scadenzeSettimanaQuery,
      distribuzioneQuery,
    ]);

    const daIncassare = progettiPerIncasso.reduce((sum, p) => {
      const pagato = p.payments.some((pay) => pay.status === "PAID");
      return pagato ? sum : sum + (p.price ?? 0);
    }, 0);

    const lavoriRecenti = lavoriRecentiRaw.map((l) => ({
      id: l.id,
      code: l.code,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      type: TYPE_MAP[l.type] ?? l.type,
      status: STATUS_MAP[l.status] ?? l.status,
      statusRaw: l.status,
      dueDate: l.dueDate?.toISOString().split("T")[0] ?? null,
      price: l.price ?? null,
    }));

    const scadenzeSettimana = scadenzeSettimanaRaw.map((l) => ({
      id: l.id,
      code: l.code,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      dueDate: l.dueDate?.toISOString().split("T")[0] ?? null,
      status: STATUS_MAP[l.status] ?? l.status,
      statusRaw: l.status,
    }));

    const totaleLavori = distribuzioneRaw.reduce(
      (sum, g) => sum + (g._count?._all ?? 0),
      0
    );
    const distribuzioneTipi = distribuzioneRaw.map((g) => {
      const count = g._count?._all ?? 0;
      return {
        typeRaw: g.type,
        type: TYPE_MAP[g.type] ?? g.type,
        count,
        percentuale: totaleLavori > 0 ? Math.round((count / totaleLavori) * 100) : 0,
      };
    });

    return NextResponse.json({
      kpi: {
        lavoriAttivi: lavoriAttiviCount,
        consegneOggi: consegneOggiCount,
        daIncassare,
        clientiTotali: clientiTotaliCount,
      },
      lavoriRecenti,
      scadenzeSettimana,
      distribuzioneTipi,
    });
  } catch (error) {
    console.error("Errore GET /api/dashboard:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della dashboard" },
      { status: 500 }
    );
  }
}
