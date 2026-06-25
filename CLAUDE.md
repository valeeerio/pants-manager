# CLAUDE.md — Istruzioni operative per Claude Code

File letto automaticamente da Claude Code ad ogni sessione.
Contiene SOLO regole operative: come scrivere codice in questo progetto.

> Lo stato delle fasi e la roadmap NON vivono qui — sono tracciati su Notion.
> La descrizione del progetto è nel README.md.

---

## Vincoli tecnici — LEGGERE PRIMA DI SCRIVERE CODICE

**Progetto:** Gestionale Sartoria · Repository: `pants-manager`
**Tipo:** Web app · Next.js 15 (App Router, modalità standard) · TypeScript · Tailwind CSS · shadcn/ui · Prisma ORM · PostgreSQL su Supabase · Auth.js v5 · Vercel

### Next.js — modalità standard
- ✅ API Routes attive in `app/api/`
- ✅ Server Components e Client Components entrambi disponibili
- ✅ Middleware attivo (`middleware.ts` nella root)
- ❌ NON usare `output: "export"` — rimosso definitivamente

### Route groups — struttura obbligatoria
```
app/
├── (main)/          → pagine protette, hanno la sidebar
│   ├── layout.tsx   → layout con sidebar
│   ├── page.tsx     → dashboard
│   ├── clienti/
│   ├── lavori/
│   └── ...
└── login/           → pagina pubblica, senza sidebar
    └── page.tsx
```

### Prisma — singleton obbligatorio
```ts
// SEMPRE importare da @/lib/prisma
import { prisma } from "@/lib/prisma"

// MAI istanziare direttamente — causa connection pool exhaustion
// ❌ const prisma = new PrismaClient()
```

### Pattern API Routes — struttura standard
```ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const data = await prisma.model.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Errore nel recupero dati" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const record = await prisma.model.create({ data: body })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Errore nella creazione" },
      { status: 500 }
    )
  }
}
```

### Mapping enum → italiano (pattern consolidato)
```ts
// Usare sempre dizionari di mapping — mai hardcodare stringhe italiane nel DB
const STATUS_MAP: Record<string, string> = {
  TODO: "Da iniziare",
  IN_PROGRESS: "In lavorazione",
  WAITING_CUSTOMER: "In attesa cliente",
  COMPLETED: "Pronto",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
}

const TYPE_MAP: Record<string, string> = {
  HEM: "Orlo pantalone",
  WAIST_TIGHTENING: "Stringere vita",
  LEG_SHORTENING: "Accorciare gamba",
  LEG_WIDENING: "Allargare pantalone",
  ZIP_REPLACEMENT: "Sostituzione zip",
  REPAIR: "Riparazione",
  CUSTOM: "Su misura",
  OTHER: "Altro",
}
```

### Auth.js v5 — split Edge-safe (obbligatorio)
- `auth.config.ts` — solo logica Edge-safe, zero import Node.js (no bcrypt, no prisma)
- `auth.ts` — logica completa con bcryptjs e adapter Prisma
- `middleware.ts` — importa SOLO da `auth.config.ts`, mai da `auth.ts`
- API Routes protette → rispondere `401 JSON` se non autenticato, mai redirect

### Variabili d'ambiente
```
DATABASE_URL    → connection string Supabase (pooled)
DIRECT_URL      → connection string Supabase (direct, per migrazioni)
AUTH_SECRET     → secret Auth.js
AUTH_URL        → URL base app (solo in produzione Vercel)
```
- Configurare sia in `.env` locale che nel dashboard Vercel
- `postinstall: prisma generate` in `package.json` — obbligatorio, non rimuovere

### Deploy Vercel
- Ogni push su `main` trigera deploy automatico in produzione
- Build fallita su Vercel non impatta la produzione esistente
- Verificare sempre `npm run build` in locale prima di pushare su `main`

---

## Regole fondamentali

1. **Un obiettivo per volta** — nessuna modifica fuori dallo scope del prompt
2. **`npm run build` obbligatorio** dopo ogni modifica, prima del commit
3. **Commit solo con build pulita**
4. **Sempre su branch feature** — mai committare direttamente su `main`
5. **Tutti i testi UI in italiano** — zero stringhe in inglese visibili
6. **Tono artigianale e caldo** — no linguaggio aziendale/B2B
7. **Codici lavoro `GS-xxx`** — mai `PM-`
8. **Non reinventare i pattern** — usare quelli consolidati in questo file
9. **MAI eseguire `git add`, `commit` o `push` senza che il prompt lo richieda**

---

## Struttura dei prompt ricevuti

Ogni prompt operativo arriva con questa struttura in 8 sezioni.
Se un prompt è ambiguo o manca una sezione critica, **chiedere chiarimenti PRIMA di scrivere codice**.

```
1. CONTESTO              — fase di riferimento e branch su cui lavorare
2. OBIETTIVO             — risultato atteso (UNO solo, verificabile)
3. FILE DA TOCCARE       — lista esplicita con path completi
4. FILE DA NON TOCCARE   — lista esplicita
5. IMPLEMENTAZIONE       — dettagli tecnici: struttura, snippet, pattern da seguire
6. CRITERI DI ACCETTAZIONE — condizioni verificabili che definiscono "fatto"
7. VERIFICA              — comando esatto da eseguire
8. COMMIT                — presente solo se va committato, messaggio già fornito
```

### Regole di esecuzione
- **Primo comando sempre:** `git branch && git status`
- **Branch ≠ CONTESTO** → checkout corretto prima di tutto
- **COMMIT assente** → fermarsi dopo la verifica, non committare
- **Problema fuori scope** → segnalarlo, non risolverlo
- **Report finale obbligatorio:** esito build · file modificati · criteri soddisfatti

---

## Palette

```
Accent:     amber-600 / amber-700
Sidebar:    stone-900
Background: stone-50
Testo:      slate-800 (primario) · slate-500 (secondario)
Border:     stone-200
Hover:      amber-50 / stone-100
Successo:   green-50 / green-200 / green-800
Errore:     red-600
```

- Icone: solo `lucide-react`
- Componenti: solo `shadcn/ui` — nessuna libreria UI aggiuntiva

---

## Pattern UI consolidati

### Modal — createPortal (OBBLIGATORIO)
```tsx
// SEMPRE via ReactDOM.createPortal su document.body
// MAI z-index su elementi annidati — causa stacking context bug
import ReactDOM from 'react-dom'

{isOpen && ReactDOM.createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-white rounded-lg shadow-xl p-6">
      {/* contenuto */}
    </div>
  </div>,
  document.body
)}
```

### Scroll lock
```tsx
useEffect(() => {
  const anyOpen = isDetailOpen || isNewOpen || isEditOpen
  document.body.style.overflow = anyOpen ? 'hidden' : ''
  return () => { document.body.style.overflow = '' }
}, [isDetailOpen, isNewOpen, isEditOpen])
```

### Chiusura con ESC
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [onClose])
```

### Banner di conferma (auto-dismiss 3s)
```tsx
const [showBanner, setShowBanner] = useState(false)

useEffect(() => {
  if (!showBanner) return
  const t = setTimeout(() => setShowBanner(false), 3000)
  return () => clearTimeout(t)
}, [showBanner])

{showBanner && (
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
    Salvato con successo
  </div>
)}
```

### Sub-modal di conferma (azioni distruttive)
```tsx
// OBBLIGATORIO per Elimina e azioni irreversibili
// Secondo modal sopra il primo — stesso pattern createPortal
const [showConfirm, setShowConfirm] = useState(false)
```

### Tabella con ordinamento
```tsx
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortDir = 'asc' | 'desc'
const [sortCol, setSortCol] = useState<string>('dataConsegna')
const [sortDir, setSortDir] = useState<SortDir>('asc')

const handleSort = (col: string) => {
  if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
  else { setSortCol(col); setSortDir('asc') }
}
```

### Filter bar
```
Ordine fisso: [Search] [Dropdown 1] [Dropdown 2] [Dropdown 3]
- Search real-time su nome, codice, tipo
- Tutti i filtri combinabili tra loro (AND logic)
- Sotto la tabella: "Stai visualizzando X di Y risultati"
```

### Validazione form inline
```tsx
// Errori sotto il campo, in rosso — MAI alert() o toast esterni
const [errors, setErrors] = useState<Record<string, string>>({})

{errors.campo && (
  <p className="text-sm text-red-600 mt-1">{errors.campo}</p>
)}
```

---

## Comandi

```bash
npm run dev                              # dev locale
npm run build                            # verifica build — SEMPRE prima del commit
npx prisma studio                        # esplora il database via UI
npx prisma migrate dev --name <nome>     # nuova migrazione
npx prisma db seed                       # ri-esegui seed dati
```

### Livelli di verifica
- **Modifica UI ordinaria** → `npm run build`
- **Modifica a API Routes o schema Prisma** → `npm run build` + test manuale endpoint
- **Modifica a `middleware.ts`, `auth.config.ts`, `auth.ts`** → `npm run build` + verifica flusso login in locale

---

## Flusso Git

```bash
# Inizio sessione
git branch && git status

# Fine modifica
npm run build

# Commit (solo se richiesto dal prompt)
git add <file modificati>
git commit -m "tipo(scope): descrizione"
git push
```

### Formato messaggi di commit
```
feat(pagamenti): implementazione pagina pagamenti con mock data
feat(api): aggiunta route POST /api/pagamenti
fix(modal): corretto scroll lock su modale annidato
refactor(clienti): estratto componente tabella riutilizzabile
docs: aggiornamento README e CLAUDE.md
```

### Branch
- `main` — produzione, deploy automatico Vercel ad ogni push
- `feature/<area>` — un branch per feature (es. `feature/pagamenti`)
- `docs/setup-progetto` — solo documentazione

---

## Aggiornamento documentazione al commit

- **README.md** — aggiornare se cambia stack, caratteristiche visibili pubblicamente, comandi o stato progetto
- **CLAUDE.md** — aggiornare se la modifica introduce un nuovo pattern UI, un nuovo vincolo tecnico o un nuovo pattern API
- Se aggiornati, includerli nello stesso commit della modifica
- Stato fasi e roadmap → solo su Notion, mai qui
