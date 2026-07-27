import { PrismaClient, ProjectType, ProjectStatus, PaymentStatus, PaymentMethod, ImageType, UserRole, MaterialCategory, MaterialUnit } from "@prisma/client";
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
  await prisma.project.deleteMany(); // cascata anche su ProjectMaterial (onDelete: Cascade)
  await prisma.material.deleteMany(); // ora libero da vincoli (ProjectMaterial già svuotata sopra)
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

  // Clienti (l'ultimo è senza alcun lavoro, per testare "clienti senza lavori attivi")
  const NOMI = [
    "Mario", "Luca", "Anna", "Giuseppe", "Francesca", "Roberto", "Chiara", "Davide", "Elena", "Marco",
    "Sara", "Paolo", "Giulia", "Andrea", "Valentina", "Stefano", "Martina", "Fabio", "Alessia", "Simone",
    "Elisa", "Matteo", "Silvia", "Riccardo", "Federica", "Nicola", "Laura", "Alessandro", "Ilaria", "Michele",
    "Cristina", "Antonio", "Barbara", "Enrico", "Serena",
  ];
  const COGNOMI = [
    "Rossi", "Bianchi", "Verdi", "Neri", "Conti", "Ferrara", "Galli", "Marino", "Colombo", "Ricci",
    "Marchetti", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrari", "Esposito", "Bruno", "Gatti",
    "Villa", "De Luca", "Costa", "Giordano", "Barbieri", "Pellegrini", "Leone", "Longo", "Gentile", "Martini",
    "Vitale", "Lombardi", "Serra", "Coppola", "Testa",
  ];
  const CITTA = ["Milano", "Torino", "Bergamo", "Monza", "Como", "Brescia", "Varese", "Pavia", "Lecco", "Cremona"];

  const clientiData = NOMI.map((firstName, i) => {
    const lastName = COGNOMI[i];
    const city = CITTA[i % CITTA.length];
    const phone = `+39 3${(i % 9) + 1}0 ${String(100 + i * 7).padStart(3, "0")} ${String(1000 + i * 13).padStart(4, "0")}`;
    const senzaEmail = i % 7 === 6; // ~1 su 7 senza email
    return {
      firstName,
      lastName,
      phone,
      city,
      email: senzaEmail ? undefined : `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "")}@email.it`,
    };
  });
  const clienti = await Promise.all(clientiData.map((data) => prisma.client.create({ data })));
  console.log("✓ Clienti creati:", clienti.length, `(${clienti[clienti.length - 1].firstName} ${clienti[clienti.length - 1].lastName} senza lavori, per testare i filtri)`);

  const clientiConLavori = clienti.length - 1; // esclude l'ultimo cliente dai lavori

  let n = 1;
  const projectsData: {
    code: string; clientId: string; title: string; type: ProjectType; status: ProjectStatus;
    price: number; receivedAt: Date; dueDate?: Date | null; updatedAt?: Date;
  }[] = [];

  // 1. Lavori attivi (TODO / IN_PROGRESS / WAITING_CUSTOMER), 60 totali, distribuiti su tutti gli 8 tipi
  //    con dueDate sparse tra scaduti, in arrivo a breve e lontani nel tempo.
  const statiAttivi = [ProjectStatus.TODO, ProjectStatus.IN_PROGRESS, ProjectStatus.WAITING_CUSTOMER];
  const dueOffsets = [-10, -5, -2, 0, 1, 3, 7, 14, 30, 45]; // giorni da oggi (negativo = scaduto)
  for (let i = 0; i < 60; i++) {
    const tipo = TUTTI_I_TIPI[i % TUTTI_I_TIPI.length];
    const stato = statiAttivi[i % statiAttivi.length];
    const senzaDueDate = i % 11 === 10;
    const receivedAt = giorniFa(5 + (i % 40));
    projectsData.push({
      code: codeOf(n++),
      clientId: clienti[i % clientiConLavori].id,
      title: `${TYPE_MAP[tipo]} - ${stato === ProjectStatus.TODO ? "da iniziare" : stato === ProjectStatus.IN_PROGRESS ? "in lavorazione" : "attesa cliente"} #${i + 1}`,
      type: tipo,
      status: stato,
      price: 15 + (i % 12) * 8,
      receivedAt,
      dueDate: senzaDueDate ? null : giorniFa(-dueOffsets[i % dueOffsets.length]),
    });
  }

  // 2. Lavori CANCELLED, 20 totali, distribuiti sui tipi e sparsi negli ultimi ~10 mesi
  for (let i = 0; i < 20; i++) {
    const tipo = TUTTI_I_TIPI[i % TUTTI_I_TIPI.length];
    projectsData.push({
      code: codeOf(n++),
      clientId: clienti[i % clientiConLavori].id,
      title: `${TYPE_MAP[tipo]} annullato #${i + 1}`,
      type: tipo,
      status: ProjectStatus.CANCELLED,
      price: 20 + (i % 10) * 7,
      receivedAt: giorniFa(30 + i * 15),
      dueDate: giorniFa(20 + i * 15),
    });
  }

  // 3. Lavori COMPLETED, 140 totali (finestra usata da /api/statistiche per "tempo medio modifica"),
  //    sparsi sugli ultimi ~12 mesi con tempi di lavorazione e puntualità variabili.
  for (let i = 0; i < 140; i++) {
    const tipo = TUTTI_I_TIPI[i % TUTTI_I_TIPI.length];
    const completatoGiorniFa = Math.floor(i * 2.6) + (i % 9); // sparso su ~12 mesi
    const tempoLavorazione = 1 + (i % 9) * 4; // 1..33 giorni
    const receivedAt = giorniFa(completatoGiorniFa + tempoLavorazione);
    const updatedAt = giorniFa(completatoGiorniFa);
    const haDueDate = i % 6 !== 5; // 1 su 6 senza dueDate
    const inRitardo = i % 4 === 0;
    const dueDate = haDueDate
      ? new Date(updatedAt.getTime() + (inRitardo ? -2 : 2) * DAY)
      : null;

    projectsData.push({
      code: codeOf(n++),
      clientId: clienti[i % clientiConLavori].id,
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

  // Qualche UNPAID anche su lavori annullati (rimborsi/mancati incassi da gestire)
  const annullati = projectsCreati.filter((p) => p.status === ProjectStatus.CANCELLED);
  annullati.forEach((p, i) => {
    if (i % 4 === 0) {
      pagamenti.push({ projectId: p.id, status: PaymentStatus.UNPAID });
    }
  });

  await Promise.all(pagamenti.map((p) => prisma.payment.create({ data: p })));
  console.log("✓ Pagamenti creati:", pagamenti.length);

  // Foto Prima/Dopo/Dettaglio: righe di esempio per testare l'API immagini.
  // NOTA: i path NON corrispondono a file reali nel bucket Supabase Storage
  // "project-images" — la signed URL generata a runtime risulterà quindi non
  // risolvibile finché non si caricano davvero delle immagini tramite l'app.
  const conFoto = completati.slice(0, 16);
  const immagini: { projectId: string; path: string; type: ImageType }[] = [];
  conFoto.forEach((p, i) => {
    immagini.push({ projectId: p.id, path: `seed/${p.code}-prima.jpg`, type: ImageType.BEFORE });
    immagini.push({ projectId: p.id, path: `seed/${p.code}-dopo.jpg`, type: ImageType.AFTER });
    if (i % 2 === 0) immagini.push({ projectId: p.id, path: `seed/${p.code}-dettaglio.jpg`, type: ImageType.DETAIL });
  });
  await Promise.all(immagini.map((img) => prisma.projectImage.create({ data: img })));
  console.log("✓ Righe ProjectImage create (placeholder, nessun file reale):", immagini.length);

  // Materiali di magazzino: mix di categorie/unità, con alcuni casi sotto-scorta (quantity < minStock)
  const materialiData: {
    name: string; category: MaterialCategory; unit: MaterialUnit;
    quantity: number; minStock: number; unitCost: number;
  }[] = [
    { name: "Tessuto lana grigia", category: MaterialCategory.FABRIC, unit: MaterialUnit.METER, quantity: 12, minStock: 15, unitCost: 18.5 },
    { name: "Tessuto cotone blu", category: MaterialCategory.FABRIC, unit: MaterialUnit.METER, quantity: 40, minStock: 10, unitCost: 9.9 },
    { name: "Tessuto lino naturale", category: MaterialCategory.FABRIC, unit: MaterialUnit.METER, quantity: 8, minStock: 10, unitCost: 22 },
    { name: "Tessuto velluto nero", category: MaterialCategory.FABRIC, unit: MaterialUnit.METER, quantity: 25, minStock: 8, unitCost: 27.5 },
    { name: "Tessuto denim", category: MaterialCategory.FABRIC, unit: MaterialUnit.METER, quantity: 30, minStock: 12, unitCost: 11.2 },
    { name: "Zip metallica 18cm", category: MaterialCategory.ZIP, unit: MaterialUnit.PIECE, quantity: 60, minStock: 20, unitCost: 1.8 },
    { name: "Zip invisibile 20cm", category: MaterialCategory.ZIP, unit: MaterialUnit.PIECE, quantity: 15, minStock: 20, unitCost: 1.5 },
    { name: "Zip plastica colorata", category: MaterialCategory.ZIP, unit: MaterialUnit.PIECE, quantity: 45, minStock: 15, unitCost: 1.2 },
    { name: "Filo poliestere nero", category: MaterialCategory.THREAD, unit: MaterialUnit.SPOOL, quantity: 25, minStock: 10, unitCost: 3.5 },
    { name: "Filo cotone bianco", category: MaterialCategory.THREAD, unit: MaterialUnit.SPOOL, quantity: 6, minStock: 10, unitCost: 3.2 },
    { name: "Filo elastico", category: MaterialCategory.THREAD, unit: MaterialUnit.SPOOL, quantity: 18, minStock: 6, unitCost: 4.0 },
    { name: "Bottoni metallo", category: MaterialCategory.ACCESSORY, unit: MaterialUnit.PIECE, quantity: 200, minStock: 50, unitCost: 0.3 },
    { name: "Bottoni madreperla", category: MaterialCategory.ACCESSORY, unit: MaterialUnit.PIECE, quantity: 30, minStock: 40, unitCost: 0.6 },
    { name: "Fibbie cintura", category: MaterialCategory.ACCESSORY, unit: MaterialUnit.PIECE, quantity: 25, minStock: 10, unitCost: 1.9 },
    { name: "Gancetti pantaloni", category: MaterialCategory.ACCESSORY, unit: MaterialUnit.PIECE, quantity: 80, minStock: 30, unitCost: 0.4 },
    { name: "Nastro rinforzo orlo", category: MaterialCategory.OTHER, unit: MaterialUnit.ROLL, quantity: 5, minStock: 5, unitCost: 6.5 },
    { name: "Etichette personalizzate", category: MaterialCategory.OTHER, unit: MaterialUnit.ROLL, quantity: 3, minStock: 5, unitCost: 4.2 },
    { name: "Imbottitura", category: MaterialCategory.OTHER, unit: MaterialUnit.GRAM, quantity: 500, minStock: 200, unitCost: 0.02 },
  ];
  const materiali = await Promise.all(materialiData.map((data) => prisma.material.create({ data })));
  console.log("✓ Materiali creati:", materiali.length, `(${materialiData.filter((m) => m.quantity < m.minStock).length} sotto-scorta)`);

  // Utilizzo materiali sui lavori: circa metà dei progetti (i primi 120), 1-3 materiali ciascuno
  const progettiConMateriali = projectsCreati.slice(0, 120);
  const conteggiMateriali = [2, 3, 1, 2, 3, 2, 1, 3, 2, 2];
  const projectMaterialData: { projectId: string; materialId: string; quantity: number }[] = [];
  progettiConMateriali.forEach((p, idx) => {
    const count = conteggiMateriali[idx % conteggiMateriali.length];
    for (let k = 0; k < count; k++) {
      const materiale = materiali[(idx + k * 3) % materiali.length];
      projectMaterialData.push({
        projectId: p.id,
        materialId: materiale.id,
        quantity: 0.5 + ((idx + k) % 10) * 0.5,
      });
    }
  });
  await Promise.all(projectMaterialData.map((data) => prisma.projectMaterial.create({ data })));
  console.log("✓ Utilizzi materiali (ProjectMaterial) creati:", projectMaterialData.length);

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
