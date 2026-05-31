# Gestionale Sartoria

Gestionale Sartoria è un'applicazione desktop per la gestione di un laboratorio sartoriale artigianale. Permette di gestire clienti, lavori, modifiche, riparazioni, pagamenti e consegne in modo semplice e ordinato.

---

## Contesto generale

Il progetto è pensato per un laboratorio artigianale che realizza, modifica e ripara capi sartoriali — con focus iniziale sui pantaloni — e gestisce lavori per clienti privati.

L'obiettivo è sostituire appunti manuali, fogli sparsi, messaggi WhatsApp e informazioni difficili da recuperare con un'app desktop semplice, moderna e facile da usare anche per chi non è tecnico.

Flusso di lavoro:

```
Cliente → Lavoro → Modifica richiesta → Stato lavorazione → Prezzo → Pagamento → Consegna
```

---

## Nome progetto

- Nome: **Gestionale Sartoria**
- Repository GitHub: `pants-manager` (nome provvisorio, può essere rinominata in futuro)

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| Next.js 15 (App Router) | Framework frontend |
| TypeScript | Linguaggio |
| Tailwind CSS | Stile |
| shadcn/ui | Componenti UI |
| Tauri 2.0 | Framework app desktop |
| SQLite | Database locale (via plugin Tauri SQL) |

> **Nota architetturale:** il progetto è stato convertito da web app Next.js a **app desktop nativa con Tauri**. Next.js viene compilato in modalità `static export` (`output: "export"`) e servito da Tauri. Il database MySQL/Docker è stato abbandonato in favore di **SQLite locale** tramite il plugin ufficiale Tauri SQL — nessun server necessario, i dati vivono sul PC dell'utente come un singolo file `.db`.

---

## Architettura

```
Utente
↓
App desktop Tauri (finestra nativa macOS/Windows/Linux)
↓
Frontend Next.js (static export → cartella /out)
↓
Comandi Tauri (invoke)
↓
Plugin SQL Tauri
↓
Database SQLite (file locale)
```

---

## Stato attuale del progetto

- ✅ Pagina Clienti — UI completata con mock data
- ✅ Pagina Lavori — UI completata con mock data
- ✅ Foto Prima/Dopo nel modal dettaglio lavoro (file picker reale, base64 in memoria)
- ✅ App desktop nativa funzionante su macOS
- ✅ Installer `.dmg` generabile con `npx tauri build`
- ✅ Next.js configurato in modalità static export
- ✅ Tauri 2.0 integrato e configurato
- 🔄 Dashboard — da ridisegnare
- ⏳ Pagina Pagamenti — da progettare e implementare
- ⏳ Pagina Statistiche — da progettare e implementare
- ⏳ Pagina Impostazioni — da progettare e implementare
- ⏳ Pagina Magazzino — da progettare e implementare (fase futura)
- ⏳ Database SQLite — da collegare
- ⏳ CRUD reali — da implementare

---

## Avvio in sviluppo

```bash
# Avvia il dev server Next.js + finestra Tauri
npx tauri dev

# Avvia solo Next.js nel browser (senza Tauri)
npm run dev
```

## Build per distribuzione

```bash
# Genera l'app .app e l'installer .dmg (macOS)
npx tauri build
```

L'installer viene generato in:
```
src-tauri/target/release/bundle/macos/Gestionale Sartoria.app
src-tauri/target/release/bundle/dmg/Gestionale Sartoria_x.x.x_aarch64.dmg
```

---

## Flusso Git consigliato

```bash
# Prima di ogni modifica
git branch
git status

# Dopo le modifiche
npm run build       # verifica Next.js
npx tauri build     # verifica app desktop (solo se necessario)

# Commit
git add .
git commit -m "descrizione modifica"
git push

# Se qualcosa si rompe prima del commit
git restore .
```

### Branch attivi

| Branch | Scopo |
|---|---|
| `main` | Versione stabile |
| `feature/dashboard` | Ridisegno dashboard |
| `feature/clienti` | Pagina clienti |
| `feature/lavori` | Pagina lavori + foto prima/dopo |
| `feature/pagamenti` | Pagina pagamenti |
| `feature/statistiche` | Pagina statistiche |
| `feature/impostazioni` | Pagina impostazioni |
| `feature/magazzino` | Pagina magazzino materiale (futuro) |
| `feature/crud` | CRUD reali con SQLite |
| `feature/database` | Schema e setup database SQLite |
| `feature/auth` | Autenticazione e ruoli |
| `Total-CSS` | Lavori sullo stile globale |
| `docs/setup-progetto` | Documentazione e configurazione |

---

## Regole di lavoro con Claude Code

- Prompt piccoli, chiari e mirati — no modifiche massive
- Per ogni intervento: descrivere cosa modificare, cosa NON modificare, quali file toccare
- Dopo ogni modifica: `npm run build` per verificare
- Commit solo se la build è pulita e la UI è corretta
- Nessuna modifica al backend/database durante la fase UI

Struttura di ogni prompt per Claude Code:
1. Obiettivo
2. File/sezioni da modificare
3. File/sezioni da NON modificare
4. Dati mock (se necessari)
5. Comando di verifica finale

---

## Pagine principali

| Pagina | Stato |
|---|---|
| Dashboard | 🔄 Da ridisegnare |
| Clienti | ✅ UI completata con mock data |
| Lavori | ✅ UI completata con sezione foto Prima/Dopo |
| Pagamenti | ⏳ Da progettare e implementare |
| Statistiche | ⏳ Da progettare e implementare |
| Impostazioni | ⏳ Da progettare e implementare |
| Magazzino | ⏳ Da progettare e implementare (fase futura) |

Navigazione tramite **sidebar laterale**.

---

## Stile UI

- Moderna, pulita, professionale
- Adatta a uso quotidiano in laboratorio artigianale
- Tono artigianale — no linguaggio aziendale/B2B
- Palette: toni caldi (ambra, marrone caldo)
- Componenti: sidebar, header, card KPI, tabelle, badge stati, form semplici

---

## Pagine — specifiche

### Dashboard

Riepilogo operativo del laboratorio. **Attualmente da ridisegnare** — il design sarà definito nella sessione dedicata.

---

### Clienti

Gestione anagrafica clienti del laboratorio.

Campi: `id`, `nome`, `cognome`, `telefono`, `email` (opz.), `note` (opz.), `createdAt`, `updatedAt`

Funzionalità: lista, ricerca, nuovo cliente, modifica, dettaglio, storico lavori collegati.

---

### Lavori

Cuore dell'applicazione — gestione di ogni lavoro su un capo sartoriale.

Campi principali: `id`, `codice` (es. GS-001), `clienteId`, `descrizione`, `tipo`, `stato`, `dataRicezione`, `dataConsegna`, `prezzoStimato`, `prezzoFinale`, `note`

**Da aggiungere:** sezione foto prima/dopo all'interno del dettaglio lavoro — galleria con due stati (prima della lavorazione, dopo la lavorazione).

**Tipi di lavoro:**
- Orlo pantalone, Stringere vita, Accorciare gamba, Allargare pantalone, Sostituzione zip, Riparazione strappo, Pantalone su misura, Altro

**Stati UI → tecnici:**
| UI | Database |
|---|---|
| Da iniziare | TODO |
| In lavorazione | IN_PROGRESS |
| In attesa cliente | WAITING_CUSTOMER |
| Pronto | COMPLETED |
| Consegnato | DELIVERED |
| Annullato | CANCELLED |

---

### Pagamenti

Gestione stato economico dei lavori. **Da progettare.**

**Stati previsti:** Non pagato (`UNPAID`), Acconto ricevuto (`DEPOSIT_PAID`), Pagato (`PAID`)

**Metodi previsti:** Contanti (`CASH`), Carta (`CARD`), Bonifico (`BANK_TRANSFER`), Altro (`OTHER`)

---

### Statistiche

Reportistica e andamento del laboratorio. **Da progettare.**

---

### Impostazioni

Configurazione dell'applicazione. **Da progettare.**

---

### Magazzino *(fase futura)*

Gestione del materiale in magazzino (stoffe, zip, fili, accessori). **Da progettare.**

---

## Modello dati (SQLite)

### Client
```
id, firstName, lastName, phone, email, notes, createdAt, updatedAt
```

### Project
```
id, clientId, description, type, status,
receivedAt, dueDate, estimatedPrice, finalPrice, notes, createdAt, updatedAt
```

### ProjectPhoto *(da aggiungere)*
```
id, projectId, phase (before|after), filePath, createdAt
```

### Payment
```
id, projectId, amount, status, method, paidAt, notes, createdAt, updatedAt
```

### InventoryItem *(futuro — Magazzino)*
```
id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt
```

### User *(futuro — Autenticazione)*
```
id, name, email, passwordHash, role, createdAt, updatedAt
```

---

## Roadmap

### ✅ Fase 1 — UI statica
Layout, sidebar, pagine principali, dati mock, componenti riutilizzabili.

### ✅ Fase 2 — Pulizia dashboard
Testi realistici, dati mock coerenti, stati uniformati, tono artigianale.

### ✅ Fase 3 — Pagina Clienti
Lista clienti, ricerca, dettaglio, form nuovo cliente e modifica.

### ✅ Fase 4 — Pagina Lavori
Lista con filtri per stato, dettaglio lavoro, form nuovo lavoro e modifica.

### ✅ Fase 5 — Conversione a Tauri
Integrazione Tauri 2.0, Next.js in static export, app desktop nativa, installer `.dmg`.

### ✅ Fase 6 — Foto prima/dopo (Pagina Lavori)
Sezione foto Prima/Dopo nel modal dettaglio lavoro — upload reale da file picker, lettura base64 in memoria (persistenza su disco in Fase 11).

### 🔄 Fase 7 — Ridisegno Dashboard
Nuovo layout dashboard: da definire in sessione Q&A dedicata prima di qualsiasi implementazione.

### ⏳ Fase 8 — Pagina Pagamenti
Lista pagamenti, stato per lavoro, cambio metodo e stato. UI con mock data.

### ⏳ Fase 9 — Pagina Statistiche
Grafici e KPI: lavori per periodo, incassi, tipi di lavoro più frequenti. UI con mock data.

### ⏳ Fase 10 — Pagina Impostazioni
Configurazione app: dati del laboratorio, preferenze, eventuali opzioni di backup. UI con mock data.

### ⏳ Fase 11 — Database SQLite
Schema SQLite, migrations, seed data realistici. Fondamenta del sistema dati.

### ⏳ Fase 12 — CRUD reali
Tutte le pagine collegate al database reale. Sostituzione completa dei mock data.

### ⏳ Fase 13 — Dashboard dinamica
KPI calcolati in tempo reale dal database.

### ⏳ Fase 14 — Autenticazione
Login, logout, utente amministratore, protezione pagine.

### ⏳ Fase 15 — Pagina Magazzino
Gestione materiale: lista, aggiunta, modifica, soglie minime. UI + CRUD.

---

## Funzionalità future

- Foto capi prima/dopo *(completata Fase 6 — upload reale in Fase 11)*
- Gestione magazzino materiale *(in roadmap — Fase 15)*
- Gestione misure cliente (vita, fianchi, lunghezza gamba, ecc.)
- Ricevuta PDF
- Notifiche promemoria consegne
- Statistiche e report mensile
- Gestione acconti multipli
- Backup dati
- Multiutente con ruoli
- Tema chiaro/scuro
- Supporto mobile (iOS/Android via Tauri 2.0)