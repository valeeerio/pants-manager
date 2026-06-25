# Gestionale Sartoria

App web per la gestione di un laboratorio sartoriale artigianale. Clienti, lavori, pagamenti e consegne in un'unica interfaccia semplice, pensata per chi non è tecnico.

🌐 **Deploy:** [pants-manager.vercel.app](https://pants-manager.vercel.app)

```
Cliente → Lavoro → Lavorazione → Prezzo → Pagamento → Consegna
```

---

## Caratteristiche

- 👤 **Clienti** — anagrafica con ricerca, dettaglio e storico lavori
- 🧵 **Lavori** — ciclo di vita completo con codici univoci `GS-xxx`, stati di avanzamento e filtri
- 💰 **Pagamenti** — incassi, acconti e importi da ricevere
- 📊 **Dashboard** — riepilogo operativo del laboratorio
- 📦 **Magazzino** — gestione materiali e scorte *(in arrivo)*
- 📈 **Statistiche** — andamento lavori e incassi *(in arrivo)*
- 🔐 **Autenticazione** — accesso protetto con Auth.js v5

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | Framework frontend e backend |
| [TypeScript](https://www.typescriptlang.org) | Linguaggio |
| [Tailwind CSS](https://tailwindcss.com) | Stile |
| [shadcn/ui](https://ui.shadcn.com) | Componenti UI |
| [Prisma ORM](https://www.prisma.io) | Accesso al database |
| [PostgreSQL](https://www.postgresql.org) su [Supabase](https://supabase.com) | Database cloud |
| [Auth.js v5](https://authjs.dev) | Autenticazione |
| [Vercel](https://vercel.com) | Hosting e deploy continuo |

### Architettura

```
Browser
└── Next.js 15 (App Router)
    ├── app/(main)/     → pagine protette con sidebar
    ├── app/login/      → pagina pubblica
    └── app/api/        → API Routes (backend)
        └── Prisma ORM
            └── PostgreSQL su Supabase
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

Creare un file `.env` nella root con:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
AUTH_URL=
```

I valori si trovano nel dashboard Supabase (Database → Connection string) e vanno replicati anche nel dashboard Vercel per il deploy.

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
| Pagina Lavori | ✅ Completata — DB reale |
| Autenticazione | ✅ Completata — Auth.js v5 |
| API Routes Clienti | ✅ CRUD completo |
| API Routes Lavori | ✅ CRUD completo |
| Database PostgreSQL | ✅ Attivo su Supabase |
| Dashboard | 🔄 Da ridisegnare |
| Pagina Pagamenti | ⏳ In lavorazione |
| Pagina Statistiche | ⏳ Da fare |
| Pagina Impostazioni | ⏳ Da fare |
| Pagina Magazzino | ⏳ Da fare |

---

## Licenza

Progetto privato — tutti i diritti riservati.
