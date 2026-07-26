import { PrismaClient, ProjectType, ProjectStatus, PaymentStatus, PaymentMethod, ImageType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TYPE_MAP } from "../lib/enum-labels";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const oggi = new Date();

function giorniFa(n: number): Date {
  return new Date(oggi.getTime() - n * DAY);
}

function codeOf(n: number): string {
  return `GS-${String(n).padStart(3, "0")}`;
}

const TUTTI_I_TIPI = Object.values(ProjectType);

async function main() {
  console.log("Avvio seed...");

  // Pulizia tabelle (ordine per rispettare le FK)
  await prisma.notificaDismissa.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.labSettings.deleteMany();

  // Impostazioni laboratorio
  await prisma.labSettings.create({
    data: {
      shopName: "Laboratorio Sartoriale",
      phone: "+39 02 0000 0000",
      address: "Via Sartoria 12, Milano",
      currency: "EUR",
      defaultVatRate: 22,
      leadTimeDays: 5,
    },
  });
  console.log("✓ Impostazioni laboratorio create");

  // Utenti
  const passwordHash = await bcrypt.hash("gestionalexsimone", 12);
  const admin = await prisma.user.create({
    data: { name: "Amministratore", email: "admin@gestionale.it", passwordHash, role: UserRole.ADMIN },
  });
  const operatore = await prisma.user.create({
    data: { name: "Operatore Sartoria", email: "operatore@gestionale.it", passwordHash, role: UserRole.USER },
  });
  console.log("✓ Utenti creati: admin@gestionale.it, operatore@gestionale.it (password: gestionalexsimone)");

  // Clienti (uno senza alcun lavoro, per testare "clienti senza lavori attivi")
  const clienti = await Promise.all([
    prisma.client.create({ data: { firstName: "Mario", lastName: "Rossi", phone: "+39 347 221 9081", email: "mario.rossi@email.it", city: "Milano" } }),
    prisma.client.create({ data: { firstName: "Luca", lastName: "Bianchi", phone: "+39 333 714 0029", email: "luca.bianchi@email.it", city: "Torino" } }),
    prisma.client.create({ data: { firstName: "Anna", lastName: "Verdi", phone: "+39 339 882 4401", email: "anna.verdi@email.it", city: "Milano" } }),
    prisma.client.create({ data: { firstName: "Giuseppe", lastName: "Neri", phone: "+39 348 447 1120", email: "giuseppe.neri@email.it", city: "Bergamo" } }),
    prisma.client.create({ data: { firstName: "Francesca", lastName: "Conti", phone: "+39 346 598 3312", email: "f.conti@email.it", city: "Milano" } }),
    prisma.client.create({ data: { firstName: "Roberto", lastName: "Ferrara", phone: "+39 335 109 7754", email: "r.ferrara@email.it", city: "Monza" } }),
    prisma.client.create({ data: { firstName: "Chiara", lastName: "Galli", phone: "+39 340 552 8817", email: "chiara.galli@email.it", city: "Como" } }),
    prisma.client.create({ data: { firstName: "Davide", lastName: "Marino", phone: "+39 328 774 2205", email: "davide.marino@email.it", city: "Milano" } }),
    // senza email (campo opzionale) e senza alcun lavoro
    prisma.client.create({ data: { firstName: "Elena", lastName: "Colombo", phone: "+39 331 998 1234", city: "Milano" } }),
  ]);
  console.log("✓ Clienti creati:", clienti.length, "(Elena Colombo senza lavori, per testare i filtri)");

  let n = 1;
  const projectsData: {
    code: string; clientId: string; title: string; type: ProjectType; status: ProjectStatus;
    price: number; receivedAt: Date; dueDate?: Date | null; updatedAt?: Date;
  }[] = [];

  // 1. Un lavoro TODO/IN_PROGRESS/WAITING_CUSTOMER per ognuno degli 8 tipi (24 lavori)
  //    dueDate distribuite tra scaduti, in arrivo oggi/domani, futuri lontani.
  const statiAttivi = [ProjectStatus.TODO, ProjectStatus.IN_PROGRESS, ProjectStatus.WAITING_CUSTOMER];
  TUTTI_I_TIPI.forEach((tipo, tIdx) => {
    statiAttivi.forEach((stato, sIdx) => {
      const offsetDueDate = [-3, 0, 2, 10][(tIdx + sIdx) % 4]; // scaduto / oggi / in arrivo / lontano
      projectsData.push({
        code: codeOf(n++),
        clientId: clienti[(tIdx + sIdx) % (clienti.length - 1)].id,
        title: `${TYPE_MAP[tipo]} demo ${sIdx + 1}`,
        type: tipo,
        status: stato,
        price: 15 + tIdx * 5 + sIdx * 3,
        receivedAt: giorniFa(15 + tIdx),
        dueDate: giorniFa(-offsetDueDate),
      });
    });
  });

  // 2. Lavori CANCELLED (per verificare l'esclusione dal mix lavorazioni)
  [ProjectType.HEM, ProjectType.CUSTOM, ProjectType.OTHER].forEach((tipo, i) => {
    projectsData.push({
      code: codeOf(n++),
      clientId: clienti[i].id,
      title: `${TYPE_MAP[tipo]} annullato`,
      type: tipo,
      status: ProjectStatus.CANCELLED,
      price: 20 + i * 10,
      receivedAt: giorniFa(20 + i),
      dueDate: giorniFa(10 + i),
    });
  });

  // 3. 30 lavori COMPLETED (finestra usata da /api/statistiche per "tempo medio modifica"),
  //    con receivedAt/updatedAt/dueDate pensati per dare KPI realistiche:
  //    - metà completati questo mese, metà in mesi precedenti
  //    - tempi di lavorazione variabili (1-45 giorni)
  //    - consegne puntuali ed in ritardo miste, più alcune senza dueDate
  for (let i = 0; i < 30; i++) {
    const tipo = TUTTI_I_TIPI[i % TUTTI_I_TIPI.length];
    const completatoGiorniFa = i < 15 ? Math.floor(i * 1.8) : 20 + (i - 15) * 6; // prime 15 nel mese corrente
    const tempoLavorazione = 1 + (i % 9) * 5; // 1..41 giorni
    const receivedAt = giorniFa(completatoGiorniFa + tempoLavorazione);
    const updatedAt = giorniFa(completatoGiorniFa);
    const haDueDate = i % 6 !== 5; // 5 su 30 senza dueDate
    const inRitardo = i % 4 === 0;
    const dueDate = haDueDate
      ? new Date(updatedAt.getTime() + (inRitardo ? -2 : 2) * DAY)
      : null;

    projectsData.push({
      code: codeOf(n++),
      clientId: clienti[i % (clienti.length - 1)].id,
      title: `${TYPE_MAP[tipo]} completato #${i + 1}`,
      type: tipo,
      status: ProjectStatus.COMPLETED,
      price: 15 + (i % 12) * 10,
      receivedAt,
      dueDate,
      updatedAt,
    });
  }

  const projectsCreati = await Promise.all(
    projectsData.map(({ updatedAt, ...data }) =>
      prisma.project.create({ data: updatedAt ? { ...data, updatedAt } : data })
    )
  );
  console.log("✓ Lavori creati:", projectsCreati.length);

  const completati = projectsCreati.filter((p) => p.status === ProjectStatus.COMPLETED);

  // Pagamenti
  const pagamenti: { projectId: string; status: PaymentStatus; method?: PaymentMethod; paidAt?: Date }[] = [];
  const metodi = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.OTHER];

  // PAID sui completati, con paidAt sparso negli ultimi 7 giorni per popolare "ricavi per giorno"
  completati.forEach((p, i) => {
    if (i % 5 === 4) return; // qualche completato resta senza pagamento (UNPAID di fatto: nessuna riga)
    const pagatoDaPoco = i < 10; // i primi 10 pagati negli ultimi 7 giorni
    pagamenti.push({
      projectId: p.id,
      status: PaymentStatus.PAID,
      method: metodi[i % metodi.length],
      paidAt: pagatoDaPoco ? giorniFa(i % 7) : giorniFa(30 + i),
    });
  });

  // DEPOSIT_PAID e UNPAID espliciti su alcuni lavori attivi (IN_PROGRESS/WAITING_CUSTOMER)
  const attivi = projectsCreati.filter(
    (p) => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.WAITING_CUSTOMER
  );
  attivi.forEach((p, i) => {
    if (i % 3 === 0) {
      pagamenti.push({ projectId: p.id, status: PaymentStatus.DEPOSIT_PAID, method: metodi[i % metodi.length] });
    } else if (i % 3 === 1) {
      pagamenti.push({ projectId: p.id, status: PaymentStatus.UNPAID });
    }
    // i % 3 === 2 → nessuna riga Payment (progetto senza pagamento associato)
  });

  await Promise.all(pagamenti.map((p) => prisma.payment.create({ data: p })));
  console.log("✓ Pagamenti creati:", pagamenti.length);

  // Foto Prima/Dopo/Dettaglio: righe di esempio per testare l'API immagini.
  // NOTA: i path NON corrispondono a file reali nel bucket Supabase Storage
  // "project-images" — la signed URL generata a runtime risulterà quindi non
  // risolvibile finché non si caricano davvero delle immagini tramite l'app.
  const conFoto = completati.slice(0, 5);
  const immagini: { projectId: string; path: string; type: ImageType }[] = [];
  conFoto.forEach((p, i) => {
    immagini.push({ projectId: p.id, path: `seed/${p.code}-prima.jpg`, type: ImageType.BEFORE });
    immagini.push({ projectId: p.id, path: `seed/${p.code}-dopo.jpg`, type: ImageType.AFTER });
    if (i % 2 === 0) immagini.push({ projectId: p.id, path: `seed/${p.code}-dettaglio.jpg`, type: ImageType.DETAIL });
  });
  await Promise.all(immagini.map((img) => prisma.projectImage.create({ data: img })));
  console.log("✓ Righe ProjectImage create (placeholder, nessun file reale):", immagini.length);

  // Notifiche dismesse: un paio per l'admin, per testare /api/notifiche/dismiss
  await Promise.all([
    prisma.notificaDismissa.create({ data: { userId: admin.id, notificaId: `scaduto-${projectsCreati[0].id}` } }),
    prisma.notificaDismissa.create({ data: { userId: admin.id, notificaId: `pronto-${completati[0].id}` } }),
  ]);
  console.log("✓ Notifiche dismesse create per l'admin");

  console.log(`Seed completato. Utenti: ${admin.email}, ${operatore.email} (password: gestionalexsimone).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
