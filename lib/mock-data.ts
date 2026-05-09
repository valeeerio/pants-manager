export const metrics = [
  { label: "Lavori attivi", value: "8", change: "+2 questa settimana" },
  { label: "Consegne oggi", value: "2", change: "1 urgente" },
  { label: "Da incassare", value: "€ 85", change: "3 lavori non pagati" },
  { label: "Clienti registrati", value: "24", change: "+3 questo mese" }
];

export const customers = [
  { name: "Mario Rossi", phone: "+39 347 221 9081", email: "mario.rossi@email.it", jobs: 6, lastVisit: "Oggi" },
  { name: "Luca Bianchi", phone: "+39 333 714 0029", email: "luca.bianchi@email.it", jobs: 4, lastVisit: "Ieri" },
  { name: "Anna Verdi", phone: "+39 339 882 4401", email: "anna.verdi@email.it", jobs: 3, lastVisit: "25 Apr" },
  { name: "Giuseppe Neri", phone: "+39 348 447 1120", email: "giuseppe.neri@email.it", jobs: 2, lastVisit: "23 Apr" },
  { name: "Francesca Conti", phone: "+39 346 598 3312", email: "f.conti@email.it", jobs: 2, lastVisit: "22 Apr" },
  { name: "Roberto Ferrara", phone: "+39 335 109 7754", email: "r.ferrara@email.it", jobs: 1, lastVisit: "20 Apr" }
];

export const jobs = [
  { code: "GS-001", customer: "Mario Rossi", work: "Orlo pantalone elegante", status: "In lavorazione", due: "Oggi, 17:00", amount: "€ 15" },
  { code: "GS-002", customer: "Luca Bianchi", work: "Stringere vita jeans", status: "Pronto", due: "Oggi, 18:30", amount: "€ 20" },
  { code: "GS-003", customer: "Anna Verdi", work: "Sostituzione zip", status: "In attesa cliente", due: "Domani", amount: "€ 18" },
  { code: "GS-004", customer: "Giuseppe Neri", work: "Accorciare pantalone", status: "Da iniziare", due: "Venerdì", amount: "€ 12" }
];

export const payments = [
  { id: "PAY-3027", customer: "Mario Rossi", job: "GS-001", method: "Bonifico", amount: "€ 15", status: "In lavorazione" },
  { id: "PAY-3026", customer: "Luca Bianchi", job: "GS-002", method: "Carta", amount: "€ 20", status: "Pronto" },
  { id: "PAY-3025", customer: "Anna Verdi", job: "GS-003", method: "Contanti", amount: "€ 18", status: "In attesa cliente" },
  { id: "PAY-3024", customer: "Giuseppe Neri", job: "GS-004", method: "Carta", amount: "€ 12", status: "Da iniziare" }
];

export const production = [
  { label: "Orli e accorciature", value: 38 },
  { label: "Modifiche vita e fianchi", value: 29 },
  { label: "Riparazioni e zip", value: 21 },
  { label: "Su misura", value: 12 }
];

export const deadlines = [
  { customer: "Mario Rossi", work: "Orlo pantalone elegante", due: "Oggi", status: "In lavorazione" },
  { customer: "Luca Bianchi", work: "Stringere vita jeans", due: "Oggi", status: "Pronto" },
  { customer: "Anna Verdi", work: "Sostituzione zip", due: "Domani", status: "In attesa cliente" },
  { customer: "Giuseppe Neri", work: "Accorciare pantalone", due: "Venerdì", status: "Da iniziare" },
  { customer: "Francesca Romano", work: "Cerniera giacca", due: "Venerdì", status: "In lavorazione" }
];

export const weeklySchedule = [
  { day: "Lun", jobs: 7, revenue: "€ 55" },
  { day: "Mar", jobs: 12, revenue: "€ 80" },
  { day: "Mer", jobs: 9, revenue: "€ 45" },
  { day: "Gio", jobs: 14, revenue: "€ 95" },
  { day: "Ven", jobs: 11, revenue: "€ 70" }
];
