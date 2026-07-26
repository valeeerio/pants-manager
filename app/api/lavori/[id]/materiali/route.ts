import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { toNumber } from "@/lib/decimal";
import { MATERIAL_CATEGORY_MAP, MATERIAL_UNIT_MAP } from "@/lib/enum-labels";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const utilizzi = await prisma.projectMaterial.findMany({
      where: { projectId: id },
      include: {
        material: { select: { name: true, category: true, unit: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      utilizzi.map((u) => ({
        id: u.id,
        materialId: u.materialId,
        nomeMateriale: u.material.name,
        categoria: MATERIAL_CATEGORY_MAP[u.material.category] ?? u.material.category,
        unita: MATERIAL_UNIT_MAP[u.material.unit] ?? u.material.unit,
        quantita: toNumber(u.quantity) ?? 0,
      }))
    );
  } catch (error) {
    console.error("Errore GET /api/lavori/[id]/materiali:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei materiali del lavoro" },
      { status: 500 }
    );
  }
}

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
    const body = await req.json();
    const { materialId, quantity } = body;

    if (!materialId) {
      return NextResponse.json({ error: "Materiale obbligatorio" }, { status: 400 });
    }

    const qty = Number(quantity);
    if (quantity === undefined || quantity === null || quantity === "" || isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "La quantità deve essere un numero maggiore di 0" },
        { status: 400 }
      );
    }

    try {
      const usage = await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({ where: { id } });
        if (!project) throw new Error("PROJECT_NOT_FOUND");

        const updated = await tx.material.updateMany({
          where: { id: materialId, quantity: { gte: qty } },
          data: { quantity: { decrement: qty } },
        });
        if (updated.count === 0) throw new Error("INSUFFICIENT_STOCK");

        return tx.projectMaterial.create({
          data: { projectId: id, materialId, quantity: qty },
          include: { material: true },
        });
      });

      const materialeAggiornato = await prisma.material.findUnique({ where: { id: materialId } });

      return NextResponse.json(
        {
          id: usage.id,
          materialId: usage.materialId,
          nomeMateriale: usage.material.name,
          categoria: MATERIAL_CATEGORY_MAP[usage.material.category] ?? usage.material.category,
          unita: MATERIAL_UNIT_MAP[usage.material.unit] ?? usage.material.unit,
          quantita: toNumber(usage.quantity) ?? 0,
          stockResiduo: materialeAggiornato ? toNumber(materialeAggiornato.quantity) ?? 0 : null,
        },
        { status: 201 }
      );
    } catch (err) {
      if (err instanceof Error && err.message === "PROJECT_NOT_FOUND") {
        return NextResponse.json({ error: "Lavoro non trovato" }, { status: 404 });
      }
      if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
        const materiale = await prisma.material.findUnique({ where: { id: materialId } });
        const disponibile = materiale ? toNumber(materiale.quantity) ?? 0 : 0;
        const unitaLabel = materiale ? MATERIAL_UNIT_MAP[materiale.unit] ?? materiale.unit : "";
        return NextResponse.json(
          { error: `Quantità non disponibile: in magazzino ci sono solo ${disponibile} ${unitaLabel}` },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Errore POST /api/lavori/[id]/materiali:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiunta del materiale al lavoro" },
      { status: 500 }
    );
  }
}
