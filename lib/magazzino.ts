import { toNumber } from "@/lib/decimal";
import { MATERIAL_CATEGORY_MAP, MATERIAL_UNIT_MAP } from "@/lib/enum-labels";
import type { Material } from "@prisma/client";

export function mapMateriale(m: Material) {
  const quantita = toNumber(m.quantity) ?? 0;
  const sogliaMinima = toNumber(m.minStock) ?? 0;
  return {
    id: m.id,
    name: m.name,
    categoria: MATERIAL_CATEGORY_MAP[m.category] ?? m.category,
    categoryRaw: m.category,
    quantita,
    unita: MATERIAL_UNIT_MAP[m.unit] ?? m.unit,
    unitRaw: m.unit,
    sogliaMinima,
    costoUnitario: toNumber(m.unitCost),
    note: m.notes,
    sottoSoglia: quantita < sogliaMinima,
  };
}
