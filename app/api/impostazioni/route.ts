import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { toNumber } from "@/lib/decimal";

const DEFAULTS = {
  shopName: "Laboratorio Sartoriale",
  phone: "+39 02 0000 0000",
  address: "Via Sartoria 12, Milano",
  currency: "EUR",
  defaultVatRate: 22,
  leadTimeDays: 5,
};

function serialize(settings: {
  id: string;
  shopName: string;
  phone: string | null;
  address: string | null;
  currency: string;
  defaultVatRate: unknown;
  leadTimeDays: number;
}) {
  return {
    id: settings.id,
    shopName: settings.shopName,
    phone: settings.phone,
    address: settings.address,
    currency: settings.currency,
    defaultVatRate: toNumber(settings.defaultVatRate as Parameters<typeof toNumber>[0]),
    leadTimeDays: settings.leadTimeDays,
  };
}

// GET /api/impostazioni
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    let settings = await prisma.labSettings.findFirst();
    if (!settings) {
      settings = await prisma.labSettings.create({ data: DEFAULTS });
    }
    return NextResponse.json(serialize(settings));
  } catch (error) {
    console.error("Errore GET /api/impostazioni:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// PUT /api/impostazioni
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shopName, phone, address, currency, defaultVatRate, leadTimeDays } = body;

    if (!shopName || typeof shopName !== "string" || !shopName.trim()) {
      return NextResponse.json(
        { error: "Il nome del laboratorio è obbligatorio" },
        { status: 400 }
      );
    }

    const vat = Number(defaultVatRate);
    if (typeof defaultVatRate !== "number" && typeof defaultVatRate !== "string") {
      return NextResponse.json(
        { error: "IVA predefinita non valida" },
        { status: 400 }
      );
    }
    if (isNaN(vat) || vat < 0 || vat > 100) {
      return NextResponse.json(
        { error: "L'IVA predefinita deve essere un numero tra 0 e 100" },
        { status: 400 }
      );
    }

    const leadTime = Number(leadTimeDays);
    if (!Number.isInteger(leadTime) || leadTime <= 0) {
      return NextResponse.json(
        { error: "Il tempo di consegna deve essere un numero intero positivo" },
        { status: 400 }
      );
    }

    const data = {
      shopName: shopName.trim(),
      phone: typeof phone === "string" ? phone.trim() || null : null,
      address: typeof address === "string" ? address.trim() || null : null,
      currency: typeof currency === "string" && currency.trim() ? currency.trim() : "EUR",
      defaultVatRate: vat,
      leadTimeDays: leadTime,
    };

    const existing = await prisma.labSettings.findFirst();
    const settings = existing
      ? await prisma.labSettings.update({ where: { id: existing.id }, data })
      : await prisma.labSettings.create({ data });

    return NextResponse.json(serialize(settings));
  } catch (error) {
    console.error("Errore PUT /api/impostazioni:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
