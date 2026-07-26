import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; usageId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id, usageId } = await params;

    try {
      await prisma.$transaction(async (tx) => {
        const usage = await tx.projectMaterial.findUnique({ where: { id: usageId } });
        if (!usage || usage.projectId !== id) {
          throw new Error("USAGE_NOT_FOUND");
        }

        await tx.material.update({
          where: { id: usage.materialId },
          data: { quantity: { increment: usage.quantity } },
        });

        await tx.projectMaterial.delete({ where: { id: usageId } });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "USAGE_NOT_FOUND") {
        return NextResponse.json({ error: "Utilizzo non trovato" }, { status: 404 });
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore DELETE /api/lavori/[id]/materiali/[usageId]:", error);
    return NextResponse.json(
      { error: "Errore nella rimozione del materiale dal lavoro" },
      { status: 500 }
    );
  }
}
