import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { inizioGiornoUTC } from "@/lib/date";

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

const GIORNI_CALENDARIO = 30;

type Severita = "alta" | "media" | "bassa";
const SEVERITA_ORDER: Record<Severita, number> = { alta: 0, media: 1, bassa: 2 };

type Notifica = {
  id: string;
  tipo: "scadenza" | "pagamento" | "pronto" | "fermo";
  titolo: string;
  sottotitolo: string;
  data: string | null;
  projectId: string;
  severita: Severita;
};

function toIso(d: Date | null): string | null {
  return d ? d.toISOString().split("T")[0] : null;
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const inizioOggi = inizioGiornoUTC();
    const traTreGiorni = inizioGiornoUTC(3);
    const traSetteGiorni = inizioGiornoUTC(7);
    const traTrentaGiorni = inizioGiornoUTC(GIORNI_CALENDARIO);
    const setteGiorniFa = inizioGiornoUTC(-7);

    const scadenzeQuery = prisma.project.findMany({
      where: {
        dueDate: { lte: traSetteGiorni },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      select: {
        id: true,
        code: true,
        type: true,
        dueDate: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    const pagamentiQuery = prisma.payment.findMany({
      where: {
        status: { in: ["UNPAID", "DEPOSIT_PAID"] },
        project: { status: { not: "CANCELLED" } },
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            code: true,
            type: true,
            dueDate: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const prontiQuery = prisma.project.findMany({
      where: {
        status: "COMPLETED",
        payments: { none: { status: "PAID" } },
      },
      select: {
        id: true,
        code: true,
        type: true,
        updatedAt: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    const fermiQuery = prisma.project.findMany({
      where: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        updatedAt: { lt: setteGiorniFa },
      },
      select: {
        id: true,
        code: true,
        type: true,
        updatedAt: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    const calendarioQuery = prisma.project.findMany({
      where: {
        dueDate: { gte: inizioOggi, lt: traTrentaGiorni },
        status: { not: "CANCELLED" },
      },
      select: {
        id: true,
        code: true,
        type: true,
        dueDate: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    const dismesseQuery = prisma.notificaDismissa.findMany({
      where: { userId: session.user.id },
      select: { notificaId: true },
    });

    const [scadenzeRaw, pagamentiRaw, prontiRaw, fermiRaw, calendarioRaw, dismesseRaw] = await Promise.all([
      scadenzeQuery,
      pagamentiQuery,
      prontiQuery,
      fermiQuery,
      calendarioQuery,
      dismesseQuery,
    ]);

    const dismesseSet = new Set(dismesseRaw.map((d) => d.notificaId));

    const notifiche: Notifica[] = [];

    for (const p of scadenzeRaw) {
      let severita: Severita = "bassa";
      if (p.dueDate && p.dueDate <= inizioOggi) severita = "alta";
      else if (p.dueDate && p.dueDate <= traTreGiorni) severita = "media";
      notifiche.push({
        id: `scadenza-${p.id}`,
        tipo: "scadenza",
        titolo: `${p.client.firstName} ${p.client.lastName}`,
        sottotitolo: `${p.code} · ${TYPE_MAP[p.type] ?? p.type}`,
        data: toIso(p.dueDate),
        projectId: p.id,
        severita,
      });
    }

    for (const pay of pagamentiRaw) {
      const dueDate = pay.project.dueDate;
      let severita: Severita = "bassa";
      if (dueDate && dueDate <= inizioOggi) severita = "alta";
      else if (dueDate && dueDate <= traSetteGiorni) severita = "media";
      notifiche.push({
        id: `pagamento-${pay.id}`,
        tipo: "pagamento",
        titolo: `${pay.project.client.firstName} ${pay.project.client.lastName}`,
        sottotitolo: `${pay.project.code} · ${TYPE_MAP[pay.project.type] ?? pay.project.type}`,
        data: toIso(dueDate),
        projectId: pay.projectId,
        severita,
      });
    }

    for (const p of prontiRaw) {
      notifiche.push({
        id: `pronto-${p.id}`,
        tipo: "pronto",
        titolo: `${p.client.firstName} ${p.client.lastName}`,
        sottotitolo: `${p.code} · ${TYPE_MAP[p.type] ?? p.type}`,
        data: toIso(p.updatedAt),
        projectId: p.id,
        severita: "media",
      });
    }

    for (const p of fermiRaw) {
      notifiche.push({
        id: `fermo-${p.id}`,
        tipo: "fermo",
        titolo: `${p.client.firstName} ${p.client.lastName}`,
        sottotitolo: `${p.code} · ${TYPE_MAP[p.type] ?? p.type}`,
        data: toIso(p.updatedAt),
        projectId: p.id,
        severita: "alta",
      });
    }

    const notificheVisibili = notifiche.filter((n) => !dismesseSet.has(n.id));

    notificheVisibili.sort((a, b) => {
      const severitaDiff = SEVERITA_ORDER[a.severita] - SEVERITA_ORDER[b.severita];
      if (severitaDiff !== 0) return severitaDiff;
      if (a.data === b.data) return 0;
      if (a.data === null) return 1;
      if (b.data === null) return -1;
      return a.data < b.data ? -1 : 1;
    });

    const progettiPerGiorno = new Map<
      string,
      { id: string; code: string; type: string; clientName: string }[]
    >();
    for (const p of calendarioRaw) {
      const iso = toIso(p.dueDate);
      if (!iso) continue;
      if (dismesseSet.has(`scadenza-${p.id}`)) continue;
      const lista = progettiPerGiorno.get(iso) ?? [];
      lista.push({
        id: p.id,
        code: p.code,
        type: TYPE_MAP[p.type] ?? p.type,
        clientName: `${p.client.firstName} ${p.client.lastName}`,
      });
      progettiPerGiorno.set(iso, lista);
    }
    const calendario = Array.from(progettiPerGiorno.entries())
      .map(([data, progetti]) => ({ data, count: progetti.length, progetti }))
      .sort((a, b) => (a.data < b.data ? -1 : 1));

    return NextResponse.json({ notifiche: notificheVisibili, calendario });
  } catch (error) {
    console.error("Errore GET /api/notifiche:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle notifiche" },
      { status: 500 }
    );
  }
}
