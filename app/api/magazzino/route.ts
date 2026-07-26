import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MATERIAL_CATEGORY_MAP, MATERIAL_UNIT_MAP } from "@/lib/enum-labels";
import { mapMateriale } from "@/lib/magazzino";

// Limite di sicurezza sulla lista materiali
const LISTA_LIMIT = 300;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const materiali = await prisma.material.findMany({
      orderBy: { name: "asc" },
      take: LISTA_LIMIT,
    });

    return NextResponse.json(materiali.map(mapMateriale));
  } catch (error) {
    console.error("Errore GET /api/magazzino:", error);
    return NextResponse.json(
      { error: "Errore nel recupero del magazzino" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
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

    const materiale = await prisma.material.create({
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

    return NextResponse.json(mapMateriale(materiale), { status: 201 });
  } catch (error) {
    console.error("Errore POST /api/magazzino:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del materiale" },
      { status: 500 }
    );
  }
}
