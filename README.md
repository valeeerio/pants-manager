# Gestionale Sartoria

App web per la gestione di un laboratorio sartoriale artigianale. Clienti, lavori, pagamenti, statistiche e consegne in un'unica interfaccia semplice, pensata per chi non è tecnico.

🌐 **Deploy:** [pants-manager.vercel.app](https://pants-manager.vercel.app)

```
Cliente → Lavoro → Lavorazione → Prezzo → Pagamento → Consegna
```

---

## Caratteristiche

- 👤 **Clienti** — anagrafica con ricerca, dettaglio e storico lavori
- 🧵 **Lavori** — ciclo di vita completo con codici univoci `GS-xxx`, stati di avanzamento, filtri e galleria foto Prima/Dopo
- 💰 **Pagamenti** — incassi, acconti, importi da ricevere, export CSV
- 📊 **Dashboard** — riepilogo operativo del laboratorio (scaduti, in arrivo, pronti da ritirare, distribuzione tipi)
- 📈 **Statistiche** — ricavi per giorno, mix lavorazioni e KPI operative su dati reali
- ⚙️ **Impostazioni** — dati del laboratorio (nome, contatti, valuta, IVA, tempo di consegna standard)
- 🔔 **Notifiche** — scadenze e consegne in evidenza, con gestione dismissione per utente
- 🔐 **Autenticazione** — accesso protetto con Auth.js v5
- 📦 **Magazzino** — materiali (stoffe, zip, fili, accessori) con soglie minime di scorta, collegato al consumo nei Lavori
- 📅 **Prenotazioni**, 🤖 **Assistente Laboratorio** — pianificate, vedi `BACKLOG.md`

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | Framework frontend e backend |
| [TypeScript](https://www.typescriptlang.org) | Linguaggio |
| [Tailwind CSS](https://tailwindcss.com) | Stile |
| [shadcn/ui](https://ui.shadcn.com) | Componenti UI |
| [Recharts](https://recharts.org) | Grafici (pagina Statistiche) |
| [Prisma ORM](https://www.prisma.io) | Accesso al database |
| [PostgreSQL](https://www.postgresql.org) su [Supabase](https://supabase.com) | Database cloud |
| [Supabase Storage](https://supabase.com/storage) | Upload foto Prima/Dopo dei lavori |
| [Auth.js v5](https://authjs.dev) | Autenticazione |
| [Vercel](https://vercel.com) | Hosting e deploy continuo |

### Architettura

```
Browser
└── Next.js 15 (App Router)
    ├── app/(main)/     → pagine protette con sidebar
    ├── app/login/      → pagina pubblica
    └── app/api/        → API Routes (backend)
        ├── Prisma ORM → PostgreSQL su Supabase
        └── Supabase Storage → foto Prima/Dopo
```

Il deploy è automatico su Vercel ad ogni push su `main`.

---

## Avvio in sviluppo

**Prerequisiti:** Node.js 18+, account Supabase, variabili d'ambiente configurate.

```bash
# Installazione dipendenze
npm install

# Avvia il dev server
npm run dev
```

### Variabili d'ambiente

Copiare `.env.example` in `.env` e compilare:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
AUTH_URL=
NEXT_PUBLIC_DATABASE_SUPABASE_URL=
DATABASE_SUPABASE_SERVICE_ROLE_KEY=
```

I valori si trovano nel dashboard Supabase (Database → Connection string; Storage → chiave service role) e vanno replicati anche nel dashboard Vercel per il deploy.

---

## Comandi utili

```bash
npm run dev                               # dev server locale
npm run build                             # verifica build produzione
npx prisma studio                         # esplora il database via UI
npx prisma migrate dev --name <nome>      # nuova migrazione
npx prisma db seed                        # ri-esegui seed dati
```

---

## Stato del progetto

| Area | Stato |
|---|---|
| Pagina Clienti | ✅ Completata — DB reale |
| Pagina Lavori | ✅ Completata — DB reale, foto Prima/Dopo su Supabase Storage |
| Pagina Pagamenti | ✅ Completata — DB reale, export CSV |
| Dashboard | ✅ Completata — redesign su DB reale |
| Pagina Statistiche | ✅ Completata — dati reali, grafici Recharts |
| Pagina Impostazioni | ✅ Completata — DB reale |
| Autenticazione | ✅ Completata — Auth.js v5 |
| Notifiche | ✅ Completata |
| API Routes | ✅ CRUD completo su Clienti/Lavori/Pagamenti/Statistiche/Impostazioni |
| Database PostgreSQL | ✅ Attivo su Supabase |
| Pagina Magazzino | ✅ Completata — DB reale, collegata al consumo materiali nei Lavori |
| Pagina/API Prenotazioni | ⏳ Pianificata |
| Assistente Laboratorio (chatbot) | ⏳ Pianificato |

Roadmap e item aperti dettagliati in `BACKLOG.md` — fonte di verità per lo stato/pianificazione del lavoro.

---

## Licenza

Progetto privato — tutti i diritti riservati.
