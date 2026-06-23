import { PrismaClient, ProjectType, ProjectStatus, PaymentStatus, PaymentMethod, UserRole } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash("sha256", password);
}

async function main() {
  console.log("Avvio seed...");

  // Pulizia tabelle
  await prisma.payment.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Utente admin
  const admin = await prisma.user.create({
    data: {
      name: "Amministratore",
      email: "admin@gestionale.it",
      passwordHash: hashPassword("admin123"),
      role: UserRole.ADMIN,
    },
  });
  console.log("✓ Utente admin creato:", admin.email);

  // Clienti
  const clienti = await Promise.all([
    prisma.client.create({ data: { firstName: "Mario", lastName: "Rossi", phone: "+39 347 221 9081", email: "mario.rossi@email.it" } }),
    prisma.client.create({ data: { firstName: "Luca", lastName: "Bianchi", phone: "+39 333 714 0029", email: "luca.bianchi@email.it" } }),
    prisma.client.create({ data: { firstName: "Anna", lastName: "Verdi", phone: "+39 339 882 4401", email: "anna.verdi@email.it" } }),
    prisma.client.create({ data: { firstName: "Giuseppe", lastName: "Neri", phone: "+39 348 447 1120", email: "giuseppe.neri@email.it" } }),
    prisma.client.create({ data: { firstName: "Francesca", lastName: "Conti", phone: "+39 346 598 3312", email: "f.conti@email.it" } }),
    prisma.client.create({ data: { firstName: "Roberto", lastName: "Ferrara", phone: "+39 335 109 7754", email: "r.ferrara@email.it" } }),
  ]);
  console.log("✓ Clienti creati:", clienti.length);

  // Lavori
  const lavori = [
    { code: "GS-001", clientId: clienti[0].id, title: "Orlo pantalone grigio", type: ProjectType.HEM, status: ProjectStatus.DELIVERED, estimatedPrice: 15, finalPrice: 15, receivedAt: new Date("2024-11-01"), dueDate: new Date("2024-11-05") },
    { code: "GS-002", clientId: clienti[1].id, title: "Stringere vita jeans", type: ProjectType.WAIST_TIGHTENING, status: ProjectStatus.DELIVERED, estimatedPrice: 25, finalPrice: 25, receivedAt: new Date("2024-11-03"), dueDate: new Date("2024-11-08") },
    { code: "GS-003", clientId: clienti[2].id, title: "Accorciare gamba pantalone blu", type: ProjectType.LEG_SHORTENING, status: ProjectStatus.COMPLETED, estimatedPrice: 20, finalPrice: 20, receivedAt: new Date("2024-11-10"), dueDate: new Date("2024-11-15") },
    { code: "GS-004", clientId: clienti[3].id, title: "Sostituzione zip giacca", type: ProjectType.ZIP_REPLACEMENT, status: ProjectStatus.IN_PROGRESS, estimatedPrice: 35, receivedAt: new Date("2024-11-20"), dueDate: new Date("2024-11-28") },
    { code: "GS-005", clientId: clienti[4].id, title: "Riparazione strappo pantalone", type: ProjectType.REPAIR, status: ProjectStatus.TODO, estimatedPrice: 18, receivedAt: new Date("2024-11-22"), dueDate: new Date("2024-11-30") },
    { code: "GS-006", clientId: clienti[5].id, title: "Pantalone su misura classico", type: ProjectType.CUSTOM, status: ProjectStatus.IN_PROGRESS, estimatedPrice: 150, receivedAt: new Date("2024-11-15"), dueDate: new Date("2024-12-15") },
    { code: "GS-007", clientId: clienti[0].id, title: "Orlo pantalone nero", type: ProjectType.HEM, status: ProjectStatus.WAITING_CUSTOMER, estimatedPrice: 15, receivedAt: new Date("2024-11-25"), dueDate: new Date("2024-11-29") },
    { code: "GS-008", clientId: clienti[1].id, title: "Allargare pantalone vita", type: ProjectType.LEG_WIDENING, status: ProjectStatus.TODO, estimatedPrice: 30, receivedAt: new Date("2024-11-26"), dueDate: new Date("2024-12-05") },
    { code: "GS-009", clientId: clienti[2].id, title: "Accorciare due paia pantaloni", type: ProjectType.LEG_SHORTENING, status: ProjectStatus.COMPLETED, estimatedPrice: 35, finalPrice: 35, receivedAt: new Date("2024-11-18"), dueDate: new Date("2024-11-23") },
    { code: "GS-010", clientId: clienti[3].id, title: "Riparazione fodera giacca", type: ProjectType.REPAIR, status: ProjectStatus.DELIVERED, estimatedPrice: 40, finalPrice: 40, receivedAt: new Date("2024-10-28"), dueDate: new Date("2024-11-05") },
    { code: "GS-011", clientId: clienti[4].id, title: "Stringere vita pantalone elegante", type: ProjectType.WAIST_TIGHTENING, status: ProjectStatus.IN_PROGRESS, estimatedPrice: 28, receivedAt: new Date("2024-11-27"), dueDate: new Date("2024-12-07") },
    { code: "GS-012", clientId: clienti[5].id, title: "Orlo tre pantaloni", type: ProjectType.HEM, status: ProjectStatus.TODO, estimatedPrice: 40, receivedAt: new Date("2024-11-28"), dueDate: new Date("2024-12-10") },
    { code: "GS-013", clientId: clienti[0].id, title: "Sostituzione zip pantalone", type: ProjectType.ZIP_REPLACEMENT, status: ProjectStatus.CANCELLED, estimatedPrice: 20, receivedAt: new Date("2024-11-10"), dueDate: new Date("2024-11-18") },
    { code: "GS-014", clientId: clienti[1].id, title: "Pantalone su misura lana", type: ProjectType.CUSTOM, status: ProjectStatus.TODO, estimatedPrice: 180, receivedAt: new Date("2024-11-29"), dueDate: new Date("2024-12-20") },
    { code: "GS-015", clientId: clienti[2].id, title: "Accorciare gamba pantalone slim", type: ProjectType.LEG_SHORTENING, status: ProjectStatus.WAITING_CUSTOMER, estimatedPrice: 22, receivedAt: new Date("2024-11-26"), dueDate: new Date("2024-12-03") },
  ];

  const projectsCreati = await Promise.all(
    lavori.map(l => prisma.project.create({ data: l }))
  );
  console.log("✓ Lavori creati:", projectsCreati.length);

  // Pagamenti per lavori completati/consegnati
  const pagamenti = [
    { projectId: projectsCreati[0].id, amount: 15, status: PaymentStatus.PAID, method: PaymentMethod.CASH, paidAt: new Date("2024-11-05") },
    { projectId: projectsCreati[1].id, amount: 25, status: PaymentStatus.PAID, method: PaymentMethod.CARD, paidAt: new Date("2024-11-08") },
    { projectId: projectsCreati[2].id, amount: 20, status: PaymentStatus.PAID, method: PaymentMethod.CASH, paidAt: new Date("2024-11-15") },
    { projectId: projectsCreati[3].id, amount: 15, status: PaymentStatus.DEPOSIT_PAID, method: PaymentMethod.CASH },
    { projectId: projectsCreati[5].id, amount: 50, status: PaymentStatus.DEPOSIT_PAID, method: PaymentMethod.BANK_TRANSFER },
    { projectId: projectsCreati[8].id, amount: 35, status: PaymentStatus.PAID, method: PaymentMethod.CASH, paidAt: new Date("2024-11-23") },
    { projectId: projectsCreati[9].id, amount: 40, status: PaymentStatus.PAID, method: PaymentMethod.CARD, paidAt: new Date("2024-11-05") },
  ];

  await Promise.all(pagamenti.map(p => prisma.payment.create({ data: p })));
  console.log("✓ Pagamenti creati:", pagamenti.length);

  console.log("Seed completato.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
