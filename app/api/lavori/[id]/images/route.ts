import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  uploadJobImage,
  deleteJobImage,
  getSignedImageUrl,
} from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (type !== "BEFORE" && type !== "AFTER") {
      return NextResponse.json(
        { error: "Tipo immagine non valido" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Il file deve essere un'immagine di massimo 8MB" },
        { status: 400 }
      );
    }

    const existing = await prisma.projectImage.findFirst({
      where: { projectId: id, type },
    });

    if (existing) {
      await deleteJobImage(existing.path);
      await prisma.projectImage.delete({ where: { id: existing.id } });
    }

    const path = await uploadJobImage(id, type, file);

    const image = await prisma.projectImage.create({
      data: { projectId: id, type, path },
    });

    const url = await getSignedImageUrl(image.path);

    return NextResponse.json({ id: image.id, type: image.type, url });
  } catch (error) {
    console.error("Errore POST /api/lavori/[id]/images:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'immagine" },
      { status: 500 }
    );
  }
}
