import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteJobImage } from "@/lib/supabase-storage";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id, imageId } = await params;

    const image = await prisma.projectImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.projectId !== id) {
      return NextResponse.json(
        { error: "Immagine non trovata" },
        { status: 404 }
      );
    }

    await deleteJobImage(image.path);
    await prisma.projectImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore DELETE /api/lavori/[id]/images/[imageId]:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'immagine" },
      { status: 500 }
    );
  }
}
