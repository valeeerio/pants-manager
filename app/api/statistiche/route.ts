import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { inizioMeseUTC, ultimiGiorniUTC } from "@/lib/date";
import { toNumber } from "@/lib/decimal";
import { TYPE_MAP } from "@/lib/enum-labels";

const GIORNI_SETTIMANA_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const giorni = ultimiGiorniUTC(7);
    const primoGiorno = giorni[0];

    const ricaviPagamentiQuery = prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: primoGiorno } },
      select: { paidAt: true, project: { select: { price: true } } },
    });
    const mixLavorazioniQuery = prisma.project.groupBy({
      by: ["type"],
      where: { status: { not: "CANCELLED" } },
      _count: { _all: true },
    });
    const tempoMedioQuery = prisma.project.findMany({
      where: { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { receivedAt: true, updatedAt: true },
    });
    const consegnePuntualiQuery = prisma.project.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: { gte: inizioMeseUTC() },
        dueDate: { not: null },
      },
      select: { updatedAt: true, dueDate: true },
    });
    const lavoriCompletatiMeseQuery = prisma.project.count({
      where: { status: "COMPLETED", updatedAt: { gte: inizioMeseUTC() } },
    });

    const [
      ricaviPagamenti,
      mixLavorazioniRaw,
      tempoMedioRaw,
      consegnePuntualiRaw,
      lavoriCompletatiMese,
    ] = await prisma.$transaction([
      ricaviPagamentiQuery,
      mixLavorazioniQuery,
      tempoMedioQuery,
      consegnePuntualiQuery,
      lavoriCompletatiMeseQuery,
    ]);

    const ricaviPerGiorno = giorni.map((giorno) => {
      const inizio = giorno.getTime();
      const fine = inizio + 24 * 60 * 60 * 1000;
      const totale = ricaviPagamenti.reduce((sum, p) => {
        const paidAt = p.paidAt?.getTime();
        if (paidAt == null || paidAt < inizio || paidAt >= fine) return sum;
        return sum + (toNumber(p.project.price) ?? 0);
      }, 0);
      return {
        date: giorno.toISOString().split("T")[0],
        giorno: GIORNI_SETTIMANA_IT[giorno.getUTCDay()],
        totale,
      };
    });

    const totaleLavori = mixLavorazioniRaw.reduce(
      (sum, g) => sum + (g._count?._all ?? 0),
      0
    );
    const mixLavorazioni = mixLavorazioniRaw
      .map((g) => {
        const count = g._count?._all ?? 0;
        return {
          typeRaw: g.type,
          type: TYPE_MAP[g.type] ?? g.type,
          count,
          percentuale:
            totaleLavori > 0 ? Math.round((count / totaleLavori) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    let tempoMedioModificaGiorni: number | null = null;
    if (tempoMedioRaw.length > 0) {
      const totaleGiorni = tempoMedioRaw.reduce((sum, p) => {
        return (
          sum + (p.updatedAt.getTime() - p.receivedAt.getTime()) / 86400000
        );
      }, 0);
      tempoMedioModificaGiorni =
        Math.round((totaleGiorni / tempoMedioRaw.length) * 10) / 10;
    }

    let consegnePuntualiPercentuale: number | null = null;
    if (consegnePuntualiRaw.length > 0) {
      const puntuali = consegnePuntualiRaw.filter(
        (p) => p.dueDate != null && p.updatedAt.getTime() <= p.dueDate.getTime()
      ).length;
      consegnePuntualiPercentuale = Math.round(
        (puntuali / consegnePuntualiRaw.length) * 100
      );
    }

    return NextResponse.json({
      ricaviPerGiorno,
      mixLavorazioni,
      kpi: {
        tempoMedioModificaGiorni,
        consegnePuntualiPercentuale,
        lavoriCompletatiMese,
      },
    });
  } catch (error) {
    console.error("Errore GET /api/statistiche:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
