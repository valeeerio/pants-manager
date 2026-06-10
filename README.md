# Gestionale Sartoria

App desktop per la gestione di un laboratorio sartoriale artigianale. Clienti, lavori, pagamenti e consegne in un'unica interfaccia semplice, pensata per chi non è tecnico.

```
Cliente → Lavoro → Lavorazione → Prezzo → Pagamento → Consegna
```

Sostituisce appunti cartacei, fogli sparsi e messaggi WhatsApp con un'app moderna che vive interamente sul computer dell'utente — nessun server, nessun abbonamento, nessuna connessione richiesta.

---

## Caratteristiche

- 👤 **Clienti** — anagrafica con ricerca, dettaglio e storico lavori
- 🧵 **Lavori** — ciclo di vita completo con codici univoci `GS-xxx`, stati di avanzamento e filtri
- 💰 **Pagamenti** — incassi, acconti e importi da ricevere
- 📊 **Dashboard** — riepilogo operativo del laboratorio
- 📦 **Magazzino** — gestione materiali e scorte *(in arrivo)*
- 📈 **Statistiche** — andamento lavori e incassi *(in arrivo)*

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router, static export) | Frontend |
| [TypeScript](https://www.typescriptlang.org) | Linguaggio |
| [Tailwind CSS](https://tailwindcss.com) | Stile |
| [shadcn/ui](https://ui.shadcn.com) | Componenti UI |
| [Tauri 2.0](https://tauri.app) | App desktop nativa |
| SQLite (plugin Tauri SQL) | Database locale |

### Architettura

```
App desktop Tauri (macOS / Windows / Linux)
└── Frontend Next.js (static export)
    └── invoke() Tauri
        └── SQLite (file .db locale)
```

Next.js è compilato in `static export` e servito direttamente da Tauri. I dati vivono in un singolo file SQLite sul computer dell'utente.

---

## Avvio in sviluppo

Prerequisiti: Node.js 18+, Rust (per Tauri).

```bash
# Installazione dipendenze
npm install

# Dev nel browser
npm run dev

# Dev con finestra desktop nativa
npx tauri dev
```

## Build

```bash
# Verifica build frontend
npm run build

# Genera l'app e l'installer (.dmg su macOS)
npx tauri build
```

Output:
```
src-tauri/target/release/bundle/
```

---

## Stato del progetto

🚧 **In sviluppo attivo.** Le pagine Clienti e Lavori sono complete a livello di interfaccia; il collegamento al database SQLite e le restanti sezioni sono in lavorazione.

La roadmap dettagliata e lo stato di avanzamento sono tracciati internamente.

---

## Licenza

Progetto privato — tutti i diritti riservati.
