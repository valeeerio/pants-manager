export const metrics = [
  { label: "Lavori attivi", value: "8", change: "+2 questa settimana" },
  { label: "Consegne oggi", value: "2", change: "1 urgente" },
  { label: "Da incassare", value: "€ 85", change: "3 lavori non pagati" },
  { label: "Clienti registrati", value: "24", change: "+3 questo mese" }
];

export const customers = [
  { name: "Mario Rossi", phone: "+39 347 221 9081", email: "mario.rossi@email.it", jobs: 3, lastVisit: "Oggi" },
  { name: "Luca Bianchi", phone: "+39 333 714 0029", email: "luca.bianchi@email.it", jobs: 2, lastVisit: "Ieri" },
  { name: "Anna Verdi", phone: "+39 339 882 4401", email: "anna.verdi@email.it", jobs: 1, lastVisit: "22 Apr" },
  { name: "Giuseppe Neri", phone: "+39 348 447 1120", email: "giuseppe.neri@email.it", jobs: 1, lastVisit: "19 Apr" }
];

export const jobs = [
  { code: "PM-001", customer: "Mario Rossi", work: "Orlo pantalone elegante", status: "In lavorazione", due: "Oggi, 17:00", amount: "€ 15" },
  { code: "PM-002", customer: "Luca Bianchi", work: "Stringere vita jeans", status: "Pronto", due: "Oggi, 18:30", amount: "€ 20" },
  { code: "PM-003", customer: "Anna Verdi", work: "Sostituzione zip", status: "In attesa cliente", due: "Domani", amount: "€ 18" },
  { code: "PM-004", customer: "Giuseppe Neri", work: "Accorciare pantalone", status: "Da iniziare", due: "Venerdì", amount: "€ 12" }
];

export const payments = [
  { id: "PAY-3021", customer: "Mario Rossi", job: "PM-001", method: "Bonifico", amount: "€ 15", status: "In lavorazione" },
  { id: "PAY-3020", customer: "Luca Bianchi", job: "PM-002", method: "Carta", amount: "€ 20", status: "Pronto" },
  { id: "PAY-3019", customer: "Anna Verdi", job: "PM-003", method: "Contanti", amount: "€ 18", status: "In attesa cliente" },
  { id: "PAY-3018", customer: "Giuseppe Neri", job: "PM-004", method: "Carta", amount: "€ 12", status: "Da iniziare" }
];

export const production = [
  { label: "Riparazioni", value: 44 },
  { label: "Modifiche", value: 32 },
  { label: "Su misura", value: 18 },
  { label: "Campioni", value: 6 }
];

export const weeklySchedule = [
  { day: "Lun", jobs: 9, revenue: "€ 740" },
  { day: "Mar", jobs: 11, revenue: "€ 930" },
  { day: "Mer", jobs: 8, revenue: "€ 620" },
  { day: "Gio", jobs: 13, revenue: "€ 1.120" },
  { day: "Ven", jobs: 10, revenue: "€ 860" }
];
