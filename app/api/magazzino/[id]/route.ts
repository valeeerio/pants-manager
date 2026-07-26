import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { toNumber } from "@/lib/decimal";
import { MATERIAL_CATEGORY_MAP, MATERIAL_UNIT_MAP } from "@/lib/enum-labels";
import { mapMateriale } from "@/lib/magazzino";

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
    const materiale = await prisma.material.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            project: { select: { code: true, title: true } },
          },
        },
      },
    });

    if (!materiale) {
      return NextResponse.json({ error: "Materiale non trovato" }, { status: 404 });
    }

    return NextResponse.json({
      ...mapMateriale(materiale),
      utilizzi: materiale.usages.map((u) => ({
        id: u.id,
        codiceLavoro: u.project.code,
        titoloLavoro: u.project.title,
        quantita: toNumber(u.quantity),
        data: u.createdAt.toISOString().split("T")[0],
      })),
    });
  } catch (error) {
    console.error("Errore GET /api/magazzino/[id]:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del materiale" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, category, unit, quantity, minStock, unitCost, notes } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Il nome del materiale è obbligatorio" },
        { status: 400 }
      );
    }

    if (!category || !(category in MATERIAL_CATEGORY_MAP)) {
      return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
    }

    if (!unit || !(unit in MATERIAL_UNIT_MAP)) {
      return NextResponse.json({ error: "Unità non valida" }, { status: 400 });
    }

    const qty = Number(quantity);
    if (quantity === undefined || quantity === null || quantity === "" || isNaN(qty) || qty < 0) {
      return NextResponse.json(
        { error: "La quantità deve essere un numero maggiore o uguale a 0" },
        { status: 400 }
      );
    }

    const minStockNum = Number(minStock);
    if (minStock === undefined || minStock === null || minStock === "" || isNaN(minStockNum) || minStockNum < 0) {
      return NextResponse.json(
        { error: "La soglia minima deve essere un numero maggiore o uguale a 0" },
        { status: 400 }
      );
    }

    let unitCostNum: number | null = null;
    if (unitCost !== undefined && unitCost !== null && unitCost !== "") {
      unitCostNum = Number(unitCost);
      if (isNaN(unitCostNum) || unitCostNum < 0) {
        return NextResponse.json(
          { error: "Il costo unitario deve essere un numero maggiore o uguale a 0" },
          { status: 400 }
        );
      }
    }

    const esistente = await prisma.material.findUnique({ where: { id } });
    if (!esistente) {
      return NextResponse.json({ error: "Materiale non trovato" }, { status: 404 });
    }

    if (unit !== esistente.unit) {
      const utilizziCount = await prisma.projectMaterial.count({ where: { materialId: id } });
      if (utilizziCount > 0) {
        return NextResponse.json(
          { error: "Non è possibile cambiare l'unità di misura di un materiale già utilizzato in un lavoro" },
          { status: 400 }
        );
      }
    }

    const materiale = await prisma.material.update({
      where: { id },
      data: {
        name: String(name).trim(),
        category,
        unit,
        quantity: qty,
        minStock: minStockNum,
        unitCost: unitCostNum,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(mapMateriale(materiale));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Materiale non trovato" }, { status: 404 });
    }
    console.error("Errore PUT /api/magazzino/[id]:", error);
    return NextResponse.json(
      { error: "Errore nella modifica del materiale" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const utilizziCount = await prisma.projectMaterial.count({ where: { materialId: id } });
    if (utilizziCount > 0) {
      return NextResponse.json(
        { error: `Impossibile eliminare: il materiale è collegato a ${utilizziCount} lavoro/i.` },
        { status: 409 }
      );
    }

    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Materiale non trovato" }, { status: 404 });
    }
    console.error("Errore DELETE /api/magazzino/[id]:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del materiale" },
      { status: 500 }
    );
  }
}
