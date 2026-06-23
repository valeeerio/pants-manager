import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("gestionalexsimone", 12)

  const updated = await prisma.user.update({
    where: { email: "admin@gestionale.it" },
    data: { passwordHash: hash },
  })

  console.log(`✅ Password aggiornata per: ${updated.email}`)
}

main()
  .catch((e) => {
    console.error("❌ Errore:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
