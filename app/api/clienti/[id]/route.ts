import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
            estimatedPrice: true,
            finalPrice: true,
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
      lavori: cliente.projects.map((p) => ({
        id: p.id,
        codice: p.code,
        titolo: p.title,
        stato: p.status,
        dataConsegna: p.dueDate?.toISOString().split("T")[0] ?? null,
        prezzo: p.finalPrice ?? p.estimatedPrice ?? null,
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
