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

- ✅ UI completata per Dashboard, Clienti, Lavori (con dati mock)
- ✅ App desktop nativa funzionante su macOS
- ✅ Installer `.dmg` generabile con `npx tauri build`
- ✅ Next.js configurato in modalità static export
- ✅ Tauri 2.0 integrato e configurato
- ⏳ Database SQLite — da collegare (Fase 4)
- ⏳ CRUD reali — da implementare (Fase 5)
- ⏳ Autenticazione — da implementare (Fase 7)

---

## Avvio in sviluppo

```bash
# Avvia il dev server Next.js + finestra Tauri
npx tauri dev
```

```bash
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
| `feature/dashboard` | Lavori sulla dashboard |
| `feature/clienti` | Lavori sulla pagina clienti |
| `feature/lavori` | Lavori sulla pagina lavori |
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
| Dashboard | ✅ UI completata con mock data |
| Clienti | ✅ UI completata con mock data |
| Lavori | ✅ UI completata con mock data |
| Pagamenti | ⏳ Placeholder |
| Statistiche | ⏳ Placeholder |
| Impostazioni | ⏳ Placeholder |

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

Riepilogo operativo del laboratorio.

Card KPI:
| Card | Valore mock | Sottotesto |
|---|---|---|
| Lavori attivi | 8 | +2 questa settimana |
| Consegne oggi | 2 | 1 urgente |
| Da incassare | € 85 | 3 lavori non pagati |
| Clienti registrati | 24 | +3 questo mese |

Tabella "Lavori recenti" (mock):
| Codice | Cliente | Lavoro | Stato | Consegna | Prezzo |
|---|---|---|---|---|---|
| GS-001 | Mario Rossi | Orlo pantalone elegante | In lavorazione | Oggi, 17:00 | € 15 |
| GS-002 | Luca Bianchi | Stringere vita jeans | Pronto | Oggi, 18:30 | € 20 |
| GS-003 | Anna Verdi | Sostituzione zip | In attesa cliente | Domani | € 18 |
| GS-004 | Giuseppe Neri | Accorciare pantalone | Da iniziare | Venerdì | € 12 |

---

### Clienti

Gestione anagrafica clienti del laboratorio.

Campi: `id`, `nome`, `cognome`, `telefono`, `email` (opz.), `note` (opz.), `createdAt`, `updatedAt`

Funzionalità: lista, ricerca, nuovo cliente, modifica, dettaglio, storico lavori collegati.

---

### Lavori

Cuore dell'applicazione — gestione di ogni lavoro su un capo sartoriale.

Campi principali: `id`, `codice` (es. GS-001), `clienteId`, `titolo`, `descrizione`, `tipo`, `stato`, `dataRicezione`, `dataConsegna`, `prezzoStimato`, `prezzoFinale`, `note`

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

Gestione stato economico dei lavori.

**Stati:** Non pagato (`UNPAID`), Acconto ricevuto (`DEPOSIT_PAID`), Pagato (`PAID`)

**Metodi:** Contanti (`CASH`), Carta (`CARD`), Bonifico (`BANK_TRANSFER`), Altro (`OTHER`)

---

## Modello dati (SQLite)

### Client
```
id, firstName, lastName, phone, email, notes, createdAt, updatedAt
```

### Project
```
id, clientId, title, description, type, status,
receivedAt, dueDate, estimatedPrice, finalPrice, notes, createdAt, updatedAt
```

### Payment
```
id, projectId, amount, status, method, paidAt, notes, createdAt, updatedAt
```

### User (futuro — per autenticazione)
```
id, name, email, passwordHash, role, createdAt, updatedAt
```

---

## Roadmap

### ✅ Fase 1 — UI statica
Layout, sidebar, dashboard, pagine principali, dati mock, componenti riutilizzabili.

### ✅ Fase 2 — Pulizia dashboard
Testi realistici, dati mock coerenti, stati uniformati, tono artigianale.

### ✅ Fase 3 — Pagine Clienti e Lavori
Lista clienti, lista lavori, pagine dettaglio, form nuovo cliente, form nuovo lavoro.

### ✅ Fase 3b — Conversione a Tauri
Integrazione Tauri 2.0, Next.js in static export, app desktop nativa, installer `.dmg`.

### ⏳ Fase 4 — Database SQLite
Plugin SQL Tauri, schema SQLite, migrations, seed data realistici.

### ⏳ Fase 5 — CRUD reali
Clienti, lavori e pagamenti collegati al database reale.

### ⏳ Fase 6 — Dashboard dinamica
Conteggio lavori per stato, consegne imminenti, importi da incassare, clienti recenti.

### ⏳ Fase 7 — Autenticazione
Login, logout, utente amministratore, protezione pagine, ruoli base.

---

## Funzionalità future

- Foto capi prima/dopo
- Gestione misure cliente (vita, fianchi, lunghezza gamba, ecc.)
- Ricevuta PDF
- Notifiche promemoria consegne
- Statistiche e report mensile
- Gestione acconti multipli
- Backup dati
- Multiutente con ruoli
- Tema chiaro/scuro
- Supporto mobile (iOS/Android via Tauri 2.0)
