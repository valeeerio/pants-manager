# Gestionale Sartoria — Contesto per Claude Code

## Cos'è questo progetto

Web app gestionale per un piccolo laboratorio artigianale sartoriale.
Gestisce il flusso completo: Cliente → Lavoro → Stato → Prezzo → Pagamento → Consegna.
Sostituisce appunti cartacei, WhatsApp e fogli sparsi. Utente finale non tecnico.

> Il nome della repository GitHub è `pants-manager` (provvisorio).
> Il nome del progetto nei testi e nella UI è sempre **Gestionale Sartoria**.

---

## Stack tecnico

- **Framework:** Next.js con App Router
- **Linguaggio:** TypeScript
- **Stile:** Tailwind CSS + shadcn/ui
- **ORM:** Prisma
- **Database:** MySQL in Docker
- **Infrastruttura:** Docker Compose

---

## Regole fondamentali — leggile sempre prima di toccare qualsiasi file

1. **Tutta la UI è in italiano.** Nessun testo in inglese visibile all'utente.
2. **I codici lavoro usano il prefisso `GS-`** (es. GS-001). Mai `PM-` o altri prefissi.
3. **Nessuna modifica a database, Prisma, API o autenticazione** finché non esplicitamente richiesto.
4. **Prompt piccoli e mirati.** Non fare modifiche grandi o non richieste.
5. **Dopo ogni modifica esegui `npm run build`** e segnala eventuali errori.
6. **Non eliminare componenti esistenti** se non strettamente necessario.
7. **Controlla sempre branch e stato Git** prima di iniziare:
   ```bash
   git branch
   git status
   ```
8. **Non lavorare mai su `main` direttamente.** Usa sempre il branch di lavoro attivo.

---

## Flusso Git

```bash
# Prima di ogni sessione
git branch
git status

# Dopo le modifiche
npm run build

# Se tutto funziona
git add .
git commit -m "descrizione chiara della modifica"
git push

# Se qualcosa è rotto e non hai ancora fatto commit
git restore .
```

---

## Stato attuale del progetto

**Fase corrente:** UI statica con mock data — nessun database collegato.

| Fase | Descrizione | Stato |
|------|-------------|-------|
| 1 | UI statica, layout, sidebar, dashboard, mock data | ✅ Completata |
| 2 | Pulizia dashboard: testi realistici, stati uniformati | ✅ Completata |
| 3 | Pagine Clienti e Lavori: liste, dettaglio, form | 🔄 In corso |
| 4 | Database: Docker, MySQL, Prisma schema, migration, seed | ⏳ Non iniziata |
| 5 | CRUD reali: clienti, lavori, pagamenti da DB | ⏳ Non iniziata |
| 6 | Dashboard dinamica con dati reali | ⏳ Non iniziata |
| 7 | Autenticazione: login, logout, ruoli | ⏳ Non iniziata |

---

## Pagine della web app

| Pagina | Percorso | Stato |
|--------|----------|-------|
| Dashboard | `/` | ✅ UI pronta |
| Clienti | `/clienti` | 🔄 In corso |
| Lavori | `/lavori` | 🔄 In corso |
| Pagamenti | `/pagamenti` | ⏳ Placeholder |
| Statistiche | `/statistiche` | ⏳ Placeholder |
| Impostazioni | `/impostazioni` | ⏳ Placeholder |

---

## Dati mock di riferimento

### Dashboard — card principali

| Card | Valore | Sottotesto |
|------|--------|------------|
| Lavori attivi | 8 | +2 questa settimana |
| Consegne oggi | 2 | 1 urgente |
| Da incassare | € 85 | 3 lavori non pagati |
| Clienti registrati | 24 | +3 questo mese |

### Tabella "Lavori recenti"

| Codice | Cliente | Lavoro | Stato | Consegna | Prezzo |
|--------|---------|--------|-------|----------|--------|
| GS-001 | Mario Rossi | Orlo pantalone elegante | In lavorazione | Oggi, 17:00 | € 15 |
| GS-002 | Luca Bianchi | Stringere vita jeans | Pronto | Oggi, 18:30 | € 20 |
| GS-003 | Anna Verdi | Sostituzione zip | In attesa cliente | Domani | € 18 |
| GS-004 | Giuseppe Neri | Accorciare pantalone | Da iniziare | Venerdì | € 12 |

### Clienti di esempio

Mario Rossi, Luca Bianchi, Anna Verdi, Giuseppe Neri, Francesca Romano, Antonio Greco

---

## Modello dati (riferimento per la fase UI)

### Stati lavoro

| Valore DB | Etichetta UI |
|-----------|-------------|
| `TODO` | Da iniziare |
| `IN_PROGRESS` | In lavorazione |
| `WAITING_CUSTOMER` | In attesa cliente |
| `COMPLETED` | Pronto |
| `DELIVERED` | Consegnato |
| `CANCELLED` | Annullato |

### Tipi di lavoro (UI)

Orlo pantalone · Stringere vita · Accorciare gamba · Allargare pantalone · Sostituzione zip · Riparazione strappo · Pantalone su misura · Altro

### Stati pagamento

| Valore DB | Etichetta UI |
|-----------|-------------|
| `UNPAID` | Non pagato |
| `DEPOSIT_PAID` | Acconto ricevuto |
| `PAID` | Pagato |

### Metodi pagamento

| Valore DB | Etichetta UI |
|-----------|-------------|
| `CASH` | Contanti |
| `CARD` | Carta |
| `BANK_TRANSFER` | Bonifico |
| `OTHER` | Altro |

---

## Campi principali dei modelli

**Client:** id, firstName, lastName, phone, email?, notes?, createdAt, updatedAt

**Project:** id, codice (GS-XXX), clientId, title, description, type, status, receivedAt, dueDate, estimatedPrice, finalPrice?, notes?, createdAt, updatedAt

**Payment:** id, projectId, amount, status, method, paidAt?, notes?, createdAt, updatedAt

---

## Stile UI — criteri

- Moderna, pulita, ordinata, responsive
- Tono artigianale: piccolo laboratorio, non grande azienda
- **Evitare:** "atelier", "boutique", "sartorie partner", dati economici irrealistici, toni B2B
- Sidebar laterale per la navigazione principale
- Badge colorati per gli stati
- Form semplici con campi chiari

---

## Configurazione database (fase futura)

```env
DATABASE_URL="mysql://sartoria_user:sartoria_password@localhost:3306/gestionale_sartoria"
```

File da creare a tempo debito: `docker-compose.yml`, `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`

---

## Comandi utili

```bash
npm run dev          # Avvia il server di sviluppo
npm run build        # Build di verifica — da eseguire dopo ogni modifica
npx prisma generate  # Genera il client Prisma (fase futura)
npx prisma studio    # Interfaccia visuale DB (fase futura)
```

---

*Questo file viene aggiornato manualmente dopo ogni sessione significativa.*
*Ultima modifica: fase 3 — pagine Clienti e Lavori in corso.*
