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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, cognome, telefono, email, citta, note } = body;

    if (!nome || !cognome || !telefono) {
      return NextResponse.json(
        { error: "Nome, cognome e telefono sono obbligatori" },
        { status: 400 }
      );
    }

    const cliente = await prisma.client.create({
      data: {
        firstName: nome.trim(),
        lastName: cognome.trim(),
        phone: telefono.trim(),
        email: email?.trim() || null,
        city: citta?.trim() || null,
        notes: note?.trim() || null,
      },
    });

    return NextResponse.json({
      id: cliente.id,
      nome: cliente.firstName,
      cognome: cliente.lastName,
      telefono: cliente.phone,
      email: cliente.email ?? null,
      citta: cliente.city ?? null,
      note: cliente.notes ?? null,
      dataRegistrazione: cliente.createdAt.toISOString().split("T")[0],
      numeroLavori: 0,
      lavoriAttivi: 0,
    }, { status: 201 });

  } catch (error) {
    console.error("Errore POST /api/clienti:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del cliente" },
      { status: 500 }
    );
  }
}
