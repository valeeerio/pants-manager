# Gestionale Sartoria

App desktop per la gestione di un laboratorio sartoriale artigianale. Permette di gestire clienti, lavori, pagamenti, materiali e statistiche in modo semplice e ordinato.

Flusso operativo:
```
Cliente → Lavoro → Lavorazione → Stato → Prezzo → Pagamento → Consegna
```

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| Next.js 15 (App Router, `static export`) | Framework frontend |
| TypeScript | Linguaggio |
| Tailwind CSS | Stile |
| shadcn/ui | Componenti UI |
| Tauri 2.0 | App desktop nativa |
| SQLite (plugin Tauri SQL) | Database locale — da collegare |

> Next.js è compilato in modalità `static export` e servito da Tauri. Nessun server necessario — i dati vivono sul PC dell'utente come file `.db` locale.

---

## Architettura

```
Utente
↓
App desktop Tauri (finestra nativa macOS/Windows/Linux)
↓
Frontend Next.js (static export → /out)
↓
invoke() Tauri
↓
Plugin SQL Tauri
↓
Database SQLite (file locale)
```

---

## Stato attuale

| Pagina | Stato |
|---|---|
| Pagina Clienti | ✅ Completata con mock data |
| Pagina Lavori | ✅ Completata con mock data |
| Dashboard | 🔄 In programma — da ridisegnare |
| Pagina Pagamenti | ⏳ Da fare |
| Pagina Statistiche | ⏳ Da fare |
| Pagina Impostazioni | ⏳ Da fare |
| Pagina Magazzino | ⏳ Da fare |

**Tutto il progetto usa mock data statici — nessun database collegato.**

---

## Comandi

```bash
npm run dev        # Dev server Next.js nel browser
npx tauri dev      # Dev con finestra desktop Tauri
npm run build      # Verifica build (obbligatorio dopo ogni modifica)
npx tauri build    # Genera installer .dmg (distribuzione)
```

Output build:
```
src-tauri/target/release/bundle/macos/Gestionale Sartoria.app
src-tauri/target/release/bundle/dmg/Gestionale Sartoria_x.x.x_aarch64.dmg
```

---

## Flusso Git

```bash
git branch && git status   # verifica branch e stato
npm run build              # verifica prima del commit
git add .
git commit -m "tipo(scope): descrizione"
git push
git restore .              # rollback pre-commit
```

### Branch attivi

| Branch | Scopo |
|---|---|
| `main` | Versione stabile — solo merge da feature branch |
| `feature/dashboard` | Ridisegno dashboard |
| `feature/clienti` | Pagina clienti |
| `feature/lavori` | Pagina lavori |
| `feature/pagamenti` | Pagina pagamenti |
| `feature/statistiche` | Pagina statistiche |
| `feature/impostazioni` | Pagina impostazioni |
| `feature/magazzino` | Pagina magazzino |
| `feature/database` | Schema e setup database SQLite |
| `feature/crud` | CRUD reali con SQLite |
| `feature/auth` | Autenticazione e ruoli |
| `Total-CSS` | Modifiche CSS globali |
| `docs/setup-progetto` | Documentazione |

---

## Regole di lavoro con Claude Code

1. Prompt piccoli e mirati — un obiettivo per volta
2. Struttura prompt: obiettivo → file da toccare → file da NON toccare → mock data → `npm run build`
3. Commit solo con build pulita
4. Sempre su branch feature — mai su `main`
5. Nessuna modifica a database/backend durante la fase UI
6. Tutti i testi UI in italiano
7. Ad ogni commit: aggiornare anche `README.md` e `CLAUDE.md`

---

## Pagine — specifiche

### Dashboard
Riepilogo operativo: lavori in corso, consegne imminenti, incassi, attività recente.
**Stato:** da ridisegnare — sessione Q&A dedicata prima di qualsiasi implementazione.

### Pagina Clienti ✅
Anagrafica clienti con lista, ricerca, dettaglio e storico lavori collegati.
Form creazione e modifica via modal (createPortal).

**Campi:** `id · firstName · lastName · phone · email · notes · createdAt · updatedAt`

### Pagina Lavori ✅
Gestione completa del ciclo di vita dei lavori. Codici univoci `GS-xxx`.

**Campi:** `id · codice (GS-xxx) · clientId · type · status · receivedAt · dueDate · estimatedPrice · finalPrice · notes`

**Tipi di lavoro:**
Orlo pantalone · Stringere vita · Accorciare gamba · Allargare pantalone · Sostituzione zip · Riparazione strappo · Pantalone su misura · Altro

**Stati:**
| UI | Valore tecnico |
|---|---|
| Da iniziare | `TODO` |
| In lavorazione | `IN_PROGRESS` |
| In attesa cliente | `WAITING_CUSTOMER` |
| Pronto | `COMPLETED` |
| Consegnato | `DELIVERED` |
| Annullato | `CANCELLED` |

**Da aggiungere:** galleria foto prima/dopo nel dettaglio lavoro.

### Pagina Pagamenti ⏳
Gestione economica dei lavori. Da progettare.

**Stati previsti:** Non pagato · Acconto ricevuto · Pagato
**Metodi previsti:** Contanti · Carta · Bonifico · Altro

### Pagina Statistiche ⏳
Metriche operative: lavori per tipo/mese, incassi, clienti frequenti. Da progettare.

### Pagina Impostazioni ⏳
Configurazione app: dati laboratorio, preferenze, tipi lavoro personalizzati, backup. Da progettare.

### Pagina Magazzino ⏳
Gestione materiali: stoffe, zip, fili, accessori. Lista, aggiunta, modifica, soglie minime. Da progettare.

---

## Modello dati (SQLite)

### Client
```
id, firstName, lastName, phone, email, notes, createdAt, updatedAt
```

### Project
```
id, clientId, codice (GS-xxx), type, status,
receivedAt, dueDate, estimatedPrice, finalPrice, notes, createdAt, updatedAt
```

### ProjectPhoto *(da aggiungere — Pagina Lavori)*
```
id, projectId, phase (before | after), filePath, createdAt
```

### Payment
```
id, projectId, amount, status, method, paidAt, notes, createdAt, updatedAt
```

### InventoryItem *(Magazzino)*
```
id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt
```

### User *(Autenticazione)*
```
id, name, email, passwordHash, role, createdAt, updatedAt
```

---

## Roadmap

| Ordine | Fase | Stato | Branch |
|---|---|---|---|
| 1 | Dashboard | 🔄 In programma | feature/dashboard |
| 2 | Pagina Clienti | ✅ Completata | feature/clienti |
| 3 | Pagina Lavori | ✅ Completata | feature/lavori |
| 4 | Pagina Pagamenti | ⏳ Da fare | feature/pagamenti |
| 5 | Pagina Statistiche | ⏳ Da fare | feature/statistiche |
| 6 | Pagina Impostazioni | ⏳ Da fare | feature/impostazioni |
| 7 | Pagina Magazzino | ⏳ Da fare | feature/magazzino |
| 8 | Database SQLite | ⏳ Da fare | feature/database |
| 9 | CRUD reali | ⏳ Da fare | feature/crud |
| 10 | Dashboard dinamica | ⏳ Da fare | feature/dashboard |
| 11 | Autenticazione | ⏳ Da fare | feature/auth |

---

## Funzionalità future

- Foto prima/dopo per ogni lavoro *(prossima — Pagina Lavori)*
- Ricevuta PDF
- Notifiche promemoria consegne
- Gestione misure cliente
- Backup e ripristino database
- Multiutente con ruoli
- Tema chiaro/scuro
