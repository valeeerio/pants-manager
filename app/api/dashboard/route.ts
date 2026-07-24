import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { inizioGiornoUTC, inizioMeseUTC } from "@/lib/date";

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

const SCADUTI_LIMIT = 3;
const IN_ARRIVO_LIMIT = 5;
// Limite per le liste di dettaglio; i totali restano calcolati senza limite
const LISTA_LIMIT = 100;

const LAVORO_SELECT = {
  id: true,
  code: true,
  type: true,
  status: true,
  dueDate: true,
  price: true,
  client: { select: { firstName: true, lastName: true } },
} as const;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const inizioOggi = inizioGiornoUTC();
    const inizioDomani = inizioGiornoUTC(1);
    const traSetteGiorni = inizioGiornoUTC(7);
    const inizioMese = inizioMeseUTC();

    const lavoriAttiviQuery = prisma.project.count({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });
    const consegneOggiQuery = prisma.project.count({
      where: { dueDate: { gte: inizioOggi, lt: inizioDomani } },
    });
    const progettiPerIncassoQuery = prisma.project.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        price: true,
        payments: { select: { status: true } },
      },
    });
    const clientiTotaliQuery = prisma.client.count();
    const lavoriInLavorazioneQuery = prisma.project.count({
      where: { status: "IN_PROGRESS" },
    });
    const consegneSettimanaQuery = prisma.project.count({
      where: { dueDate: { gte: inizioOggi, lt: traSetteGiorni } },
    });
    const clientiNuoviMeseQuery = prisma.client.count({
      where: { createdAt: { gte: inizioMese } },
    });
    const scadutiQuery = prisma.project.findMany({
      where: {
        dueDate: { lt: inizioOggi },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { dueDate: "asc" },
      take: SCADUTI_LIMIT,
      select: LAVORO_SELECT,
    });
    const inArrivoQuery = prisma.project.findMany({
      where: {
        dueDate: { gte: inizioOggi },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { dueDate: "asc" },
      take: IN_ARRIVO_LIMIT,
      select: LAVORO_SELECT,
    });
    const prontiQuery = prisma.project.findMany({
      where: { status: "COMPLETED", payments: { none: { status: "PAID" } } },
      orderBy: { updatedAt: "asc" },
      take: LISTA_LIMIT,
      select: {
        id: true,
        code: true,
        type: true,
        price: true,
        updatedAt: true,
        client: { select: { firstName: true, lastName: true } },
        payments: { select: { status: true } },
      },
    });
    const attiviListaQuery = prisma.project.findMany({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      orderBy: { dueDate: "asc" },
      take: LISTA_LIMIT,
      select: LAVORO_SELECT,
    });
    const daIniziareQuery = prisma.project.count({ where: { status: "TODO" } });
    const inAttesaQuery = prisma.project.count({
      where: { status: "WAITING_CUSTOMER" },
    });
    const consegneOggiListaQuery = prisma.project.findMany({
      where: {
        dueDate: { gte: inizioOggi, lt: inizioDomani },
        status: { not: "CANCELLED" },
      },
      orderBy: { dueDate: "asc" },
      take: LISTA_LIMIT,
      select: LAVORO_SELECT,
    });
    const consegneSettimanaListaQuery = prisma.project.findMany({
      where: {
        dueDate: { gte: inizioDomani, lt: traSetteGiorni },
        status: { not: "CANCELLED" },
      },
      orderBy: { dueDate: "asc" },
      take: LISTA_LIMIT,
      select: LAVORO_SELECT,
    });
    const daIncassareListaQuery = prisma.project.findMany({
      where: {
        price: { gt: 0 },
        status: { not: "CANCELLED" },
        payments: { none: { status: "PAID" } },
      },
      orderBy: { dueDate: "asc" },
      take: LISTA_LIMIT,
      select: {
        ...LAVORO_SELECT,
        payments: { select: { status: true } },
      },
    });
    const incassatoMeseQuery = prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: inizioMese } },
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        projectId: true,
        method: true,
        paidAt: true,
        project: {
          select: {
            code: true,
            type: true,
            price: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
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
      lavoriInLavorazioneCount,
      consegneSettimanaCount,
      clientiNuoviMeseCount,
      scadutiRaw,
      inArrivoRaw,
      prontiRaw,
      distribuzioneRaw,
      attiviListaRaw,
      daIniziareCount,
      inAttesaCount,
      consegneOggiListaRaw,
      consegneSettimanaListaRaw,
      daIncassareListaRaw,
      incassatoMeseRaw,
    ] = await prisma.$transaction([
      lavoriAttiviQuery,
      consegneOggiQuery,
      progettiPerIncassoQuery,
      clientiTotaliQuery,
      lavoriInLavorazioneQuery,
      consegneSettimanaQuery,
      clientiNuoviMeseQuery,
      scadutiQuery,
      inArrivoQuery,
      prontiQuery,
      distribuzioneQuery,
      attiviListaQuery,
      daIniziareQuery,
      inAttesaQuery,
      consegneOggiListaQuery,
      consegneSettimanaListaQuery,
      daIncassareListaQuery,
      incassatoMeseQuery,
    ]);

    const daIncassare = progettiPerIncasso.reduce((sum, p) => {
      const pagato = p.payments.some((pay) => pay.status === "PAID");
      return pagato ? sum : sum + (p.price ?? 0);
    }, 0);

    const lavoriDaSaldare = progettiPerIncasso.filter(
      (p) =>
        !p.payments.some((pay) => pay.status === "PAID") && (p.price ?? 0) > 0
    ).length;

    const mapLavoro = (l: (typeof scadutiRaw)[number]) => ({
      id: l.id,
      code: l.code,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      type: TYPE_MAP[l.type] ?? l.type,
      status: STATUS_MAP[l.status] ?? l.status,
      statusRaw: l.status,
      dueDate: l.dueDate?.toISOString().split("T")[0] ?? null,
      price: l.price ?? null,
    });

    const scaduti = scadutiRaw.map(mapLavoro);
    const inArrivo = inArrivoRaw.map(mapLavoro);

    const dettaglioAttivi = {
      daIniziare: daIniziareCount,
      inLavorazione: lavoriInLavorazioneCount,
      inAttesa: inAttesaCount,
      lavori: attiviListaRaw.map(mapLavoro),
    };

    const consegne = {
      oggi: consegneOggiListaRaw.map(mapLavoro),
      settimana: consegneSettimanaListaRaw.map(mapLavoro),
    };

    const daIncassareLista = daIncassareListaRaw.map((l) => ({
      ...mapLavoro(l),
      pagamento: l.payments.some((p) => p.status === "DEPOSIT_PAID")
        ? "DEPOSIT_PAID"
        : "UNPAID",
    }));

    const incassatoMeseLista = incassatoMeseRaw.map((p) => ({
      id: p.id,
      projectId: p.projectId,
      clientName: `${p.project.client.firstName} ${p.project.client.lastName}`,
      code: p.project.code,
      type: TYPE_MAP[p.project.type] ?? p.project.type,
      price: p.project.price ?? null,
      method: p.method,
      paidAt: p.paidAt?.toISOString().split("T")[0] ?? null,
    }));

    const incassatoMese = incassatoMeseRaw.reduce(
      (sum, p) => sum + (p.project.price ?? 0),
      0
    );

    const prontiDaRitirare = prontiRaw.map((l) => ({
      id: l.id,
      code: l.code,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      type: TYPE_MAP[l.type] ?? l.type,
      price: l.price ?? null,
      prontoDa: l.updatedAt.toISOString().split("T")[0],
      pagamento: l.payments.some((p) => p.status === "DEPOSIT_PAID")
        ? "DEPOSIT_PAID"
        : "UNPAID",
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
        lavoriInLavorazione: lavoriInLavorazioneCount,
        consegneSettimana: consegneSettimanaCount,
        clientiNuoviMese: clientiNuoviMeseCount,
        lavoriDaSaldare,
        incassatoMese,
      },
      scaduti,
      inArrivo,
      prontiDaRitirare,
      distribuzioneTipi,
      dettaglioAttivi,
      consegne,
      daIncassareLista,
      incassatoMeseLista,
    });
  } catch (error) {
    console.error("Errore GET /api/dashboard:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della dashboard" },
      { status: 500 }
    );
  }
}
