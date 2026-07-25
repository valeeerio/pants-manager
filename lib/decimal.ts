import { Prisma } from "@prisma/client";

export function toNumber(value: Prisma.Decimal | number | null): number | null {
  return value == null ? null : Number(value);
}
