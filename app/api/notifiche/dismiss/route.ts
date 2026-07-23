import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const notificaIds: unknown = body?.notificaIds;

    if (!Array.isArray(notificaIds) || notificaIds.length === 0 || !notificaIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "notificaIds mancante o non valido" }, { status: 400 });
    }

    await prisma.notificaDismissa.createMany({
      data: notificaIds.map((notificaId) => ({ userId: session.user.id, notificaId })),
      skipDuplicates: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore POST /api/notifiche/dismiss:", error);
    return NextResponse.json({ error: "Errore nella cancellazione delle notifiche" }, { status: 500 });
  }
}
