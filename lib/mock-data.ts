export const metrics = [
  { label: "Lavori attivi", value: "24", change: "+6 questa settimana" },
  { label: "Consegne oggi", value: "7", change: "3 urgenti" },
  { label: "Incassi mese", value: "€ 8.430", change: "+12% vs marzo" },
  { label: "Clienti ricorrenti", value: "68", change: "14 sartorie partner" }
];

export const customers = [
  { name: "Atelier Rossi", phone: "+39 02 4478 1120", email: "ordini@atelierrossi.it", jobs: 8, lastVisit: "Oggi" },
  { name: "Marco Bellini", phone: "+39 347 221 9081", email: "marco.bellini@email.it", jobs: 2, lastVisit: "Ieri" },
  { name: "Boutique Via Roma", phone: "+39 06 8821 4401", email: "produzione@viaroma.it", jobs: 12, lastVisit: "22 Apr" },
  { name: "Elena Ferri", phone: "+39 333 714 0029", email: "elena.ferri@email.it", jobs: 1, lastVisit: "19 Apr" }
];

export const jobs = [
  { code: "PM-1048", customer: "Atelier Rossi", work: "Orlo invisibile pantaloni lana", status: "In lavorazione", due: "Oggi, 16:00", amount: "€ 96" },
  { code: "PM-1047", customer: "Marco Bellini", work: "Stringere vita e fondo jeans", status: "Pronto", due: "Oggi, 18:30", amount: "€ 38" },
  { code: "PM-1046", customer: "Boutique Via Roma", work: "Campione pantalone palazzo", status: "In attesa", due: "Domani", amount: "€ 180" },
  { code: "PM-1045", customer: "Elena Ferri", work: "Sostituzione zip e ripresa cucitura", status: "Consegnato", due: "23 Apr", amount: "€ 42" }
];

export const payments = [
  { id: "PAY-3021", customer: "Atelier Rossi", job: "PM-1048", method: "Bonifico", amount: "€ 96", status: "Acconto" },
  { id: "PAY-3020", customer: "Marco Bellini", job: "PM-1047", method: "Carta", amount: "€ 38", status: "Pagato" },
  { id: "PAY-3019", customer: "Boutique Via Roma", job: "PM-1046", method: "Contanti", amount: "€ 90", status: "Acconto" },
  { id: "PAY-3018", customer: "Elena Ferri", job: "PM-1045", method: "Carta", amount: "€ 42", status: "Pagato" }
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
