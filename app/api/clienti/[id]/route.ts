import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;
    const cliente = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            dueDate: true,
            price: true,
            payments: { select: { status: true } },
          },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    const totaleSpeso = cliente.projects.reduce((sum, p) => {
      const pagato = p.payments.some((pay) => pay.status === "PAID");
      return pagato ? sum + (p.price ?? 0) : sum;
    }, 0);
    const daIncassare = cliente.projects.reduce((sum, p) => {
      if (p.status === "CANCELLED") return sum;
      const pagato = p.payments.some((pay) => pay.status === "PAID");
      return pagato ? sum : sum + (p.price ?? 0);
    }, 0);

    return NextResponse.json({
      id: cliente.id,
      nome: cliente.firstName,
      cognome: cliente.lastName,
      telefono: cliente.phone,
      email: cliente.email ?? null,
      citta: cliente.city ?? null,
      note: cliente.notes ?? null,
      dataRegistrazione: cliente.createdAt.toISOString().split("T")[0],
      numeroLavori: cliente._count.projects,
      lavoriAttivi: cliente.projects.filter((p) =>
        ["TODO", "IN_PROGRESS", "WAITING_CUSTOMER"].includes(p.status)
      ).length,
      totaleSpeso,
      daIncassare,
      lavori: cliente.projects.map((p) => ({
        id: p.id,
        codice: p.code,
        titolo: p.title,
        stato: p.status,
        dataConsegna: p.dueDate?.toISOString().split("T")[0] ?? null,
        prezzo: p.price ?? null,
      })),
    });
  } catch (error) {
    console.error("Errore GET /api/clienti/[id]:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, cognome, telefono, email, citta, note } = body;

    if (!nome || !cognome || !telefono) {
      return NextResponse.json(
        { error: "Nome, cognome e telefono sono obbligatori" },
        { status: 400 }
      );
    }

    const cliente = await prisma.client.update({
      where: { id },
      data: {
        firstName: nome.trim(),
        lastName: cognome.trim(),
        phone: telefono.trim(),
        email: email?.trim() || null,
        city: citta?.trim() || null,
        notes: note?.trim() || null,
      },
      include: {
        _count: { select: { projects: true } },
        projects: { select: { status: true } },
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
      numeroLavori: cliente._count.projects,
      lavoriAttivi: cliente.projects.filter((p) =>
        ["TODO", "IN_PROGRESS", "WAITING_CUSTOMER"].includes(p.status)
      ).length,
    });

  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }
    console.error("Errore PUT /api/clienti/[id]:", error);
    return NextResponse.json(
      { error: "Errore nella modifica del cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  try {
    const { id } = await params;

    const lavoriAttivi = await prisma.project.count({
      where: {
        clientId: id,
        status: {
          in: ["TODO", "IN_PROGRESS", "WAITING_CUSTOMER"],
        },
      },
    });

    if (lavoriAttivi > 0) {
      return NextResponse.json(
        {
          error: `Impossibile eliminare: il cliente ha ${lavoriAttivi} lavori attivi in corso.`,
        },
        { status: 409 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }
    console.error("Errore DELETE /api/clienti/[id]:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del cliente" },
      { status: 500 }
    );
  }
}
