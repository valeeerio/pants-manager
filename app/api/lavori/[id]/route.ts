import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { toNumber } from "@/lib/decimal";
import { deleteJobImage, getSignedImageUrl } from "@/lib/supabase-storage";

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
    const lavoro = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { firstName: true, lastName: true, phone: true },
        },
        images: {
          select: { id: true, path: true, type: true },
        },
      },
    });

    if (!lavoro) {
      return NextResponse.json(
        { error: "Lavoro non trovato" },
        { status: 404 }
      );
    }

    const imgPrima = lavoro.images.find((img) => img.type === "BEFORE") ?? null;
    const imgDopo = lavoro.images.find((img) => img.type === "AFTER") ?? null;

    const [urlPrima, urlDopo] = await Promise.all([
      imgPrima ? getSignedImageUrl(imgPrima.path) : Promise.resolve(null),
      imgDopo ? getSignedImageUrl(imgDopo.path) : Promise.resolve(null),
    ]);

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
      price: toNumber(lavoro.price),
      notes: lavoro.notes ?? null,
      description: lavoro.description ?? null,
      photos: {
        prima: imgPrima && urlPrima ? { id: imgPrima.id, url: urlPrima } : null,
        dopo: imgDopo && urlDopo ? { id: imgDopo.id, url: urlDopo } : null,
      },
    });
  } catch (error) {
    console.error("Errore GET /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del lavoro" },
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
    const {
      clientId,
      type,
      status,
      dueDate,
      description,
      price,
      notes,
    } = body;

    if (!clientId || !type || !status) {
      return NextResponse.json(
        { error: "Cliente, tipo e stato sono obbligatori" },
        { status: 400 }
      );
    }

    if (!(type in TYPE_MAP)) {
      return NextResponse.json(
        { error: "Tipo lavoro non valido" },
        { status: 400 }
      );
    }

    if (!(status in STATUS_MAP)) {
      return NextResponse.json(
        { error: "Stato non valido" },
        { status: 400 }
      );
    }

    const titoloAuto = TYPE_MAP[type];

    const lavoro = await prisma.project.update({
      where: { id },
      data: {
        clientId,
        title: titoloAuto,
        description: description?.trim() || null,
        type,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        price: price ? parseFloat(price) : null,
        notes: notes?.trim() || null,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

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
      price: toNumber(lavoro.price),
      notes: lavoro.notes ?? null,
      description: lavoro.description ?? null,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Lavoro non trovato" },
        { status: 404 }
      );
    }
    console.error("Errore PUT /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nella modifica del lavoro" },
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

    await prisma.payment.deleteMany({ where: { projectId: id } });

    const immagini = await prisma.projectImage.findMany({
      where: { projectId: id },
      select: { path: true },
    });
    await Promise.all(immagini.map((img) => deleteJobImage(img.path)));

    await prisma.projectImage.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Lavoro non trovato" },
        { status: 404 }
      );
    }
    console.error("Errore DELETE /api/lavori/[id]:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del lavoro" },
      { status: 500 }
    );
  }
}
