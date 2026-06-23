import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clienti = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { projects: true },
        },
        projects: {
          select: { status: true },
        },
      },
    });

    const clientiFormattati = clienti.map((c) => ({
      id: c.id,
      nome: c.firstName,
      cognome: c.lastName,
      telefono: c.phone,
      email: c.email ?? null,
      citta: c.city ?? null,
      note: c.notes ?? null,
      dataRegistrazione: c.createdAt.toISOString().split("T")[0],
      numeroLavori: c._count.projects,
      lavoriAttivi: c.projects.filter((p) =>
        ["TODO", "IN_PROGRESS", "WAITING_CUSTOMER"].includes(p.status)
      ).length,
    }));

    return NextResponse.json(clientiFormattati);
  } catch (error) {
    console.error("Errore GET /api/clienti:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei clienti" },
      { status: 500 }
    );
  }
}
