# CLAUDE.md — Istruzioni operative per Claude Code

File letto automaticamente da Claude Code ad ogni sessione.
Contiene SOLO regole operative: come scrivere codice in questo progetto.

> Lo stato delle fasi e la roadmap NON vivono qui — sono tracciati su Notion.
> La descrizione del progetto è nel README.md.

---

## Vincoli tecnici — LEGGERE PRIMA DI SCRIVERE CODICE

**Progetto:** Gestionale Sartoria · Repository: `pants-manager`
**Tipo:** Web app · Next.js 15 + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL

1. **Next.js è una web app standard** (App Router, no `static export`)
   - ✅ API Routes (`app/api/`) abilitate
   - ✅ Server Components con data fetching
   - ✅ `next/image` con ottimizzazione server
   - ✅ Middleware e tutte le funzionalità Next.js

2. **Il database PostgreSQL NON è ancora collegato**
   - Tutte le pagine usano mock data statici in file locali
   - ❌ NON aggiungere chiamate a database o Prisma senza richiesta esplicita

3. **Backend = API Routes Next.js + Prisma**
   - Le operazioni dati passeranno da API Routes, mai da `invoke()` Tauri
   - ❌ NON usare `invoke()` — Tauri è stato rimosso

---

## Regole fondamentali

1. **Un obiettivo per volta** — nessuna modifica fuori dallo scope del prompt
2. **`npm run build` obbligatorio** dopo ogni modifica, prima del commit
3. **Commit solo con build pulita**
4. **Sempre su branch feature** — mai committare direttamente su `main`
5. **Tutti i testi UI in italiano** — zero stringhe in inglese visibili
6. **Tono artigianale e caldo** — no linguaggio aziendale/B2B
7. **Codici lavoro `GS-xxx`** — mai `PM-`
8. **Non reinventare i pattern** — usare quelli consolidati sotto
9. **MAI eseguire `git add`, `commit` o `push` senza che il prompt lo richieda**

---

## Struttura dei prompt ricevuti

Ogni prompt operativo arriva con questa struttura in 8 sezioni.
Se un prompt è ambiguo o manca una sezione critica, **chiedere chiarimenti PRIMA di scrivere codice**.

```
1. CONTESTO      — fase di riferimento e branch su cui lavorare
2. OBIETTIVO     — risultato atteso della modifica (UNO solo)
3. FILE DA TOCCARE     — lista esplicita
4. FILE DA NON TOCCARE — lista esplicita
5. MOCK DATA     — dati di esempio, se servono
6. CRITERI DI ACCETTAZIONE — condizioni verificabili che definiscono "fatto"
7. VERIFICA      — livello di build richiesto (vedi Livelli di verifica)
8. COMMIT        — presente solo se va committato, con il messaggio già fornito
```

### Regole di esecuzione del prompt
- **Primo comando di ogni sessione:** `git branch && git status`. Se il branch attivo non corrisponde al CONTESTO → fare checkout sul branch corretto prima di tutto
- **Se la sezione COMMIT è assente → NON committare.** Fermarsi dopo la verifica e riportare l'esito
- **Mai uscire dallo scope:** se durante il lavoro emerge un problema fuori dai file elencati → segnalarlo senza risolverlo
- **Al termine, riportare sempre:** esito build · lista file modificati · criteri di accettazione soddisfatti o meno

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
// Su TUTTI gli stati modal aperti simultaneamente
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
- Sotto la tabella: "Stai visualizzando X di Y risultati" + bottone "Carica altri"
```

### Validazione form inline
```tsx
// Errori sotto il campo, in rosso — MAI alert() o toast esterni
const [errors, setErrors] = useState<Record<string, string>>({})

{errors.campo && (
  <p className="text-sm text-red-600 mt-1">{errors.campo}</p>
)}
```

### Stati lavoro — badge
```
Da iniziare        → TODO
In lavorazione     → IN_PROGRESS
In attesa cliente  → WAITING_CUSTOMER
Pronto             → COMPLETED
Consegnato         → DELIVERED
Annullato          → CANCELLED
```

---

## Comandi

```bash
npm run dev        # Dev quotidiano nel browser
npm run build      # Verifica build Next.js — OBBLIGATORIA dopo ogni modifica
```

### Livelli di verifica
- **Modifica UI ordinaria** → `npm run build`
- **Fine fase / modifica strutturale** (config, layout globale, dipendenze) → `npm run build`

---

## Flusso Git

```bash
# Inizio sessione — SEMPRE verificare dove si è
git branch && git status

# Fine modifica
npm run build              # sempre

# Commit (solo se richiesto dal prompt)
git add <file modificati>
git commit -m "tipo(scope): descrizione"
git push
```

### Formato messaggi di commit
```
feat(lavori): aggiunta galleria foto prima/dopo nel dettaglio
fix(modal): corretto scroll lock su modale annidato
docs: aggiornamento README
refactor(clienti): estratto componente tabella riutilizzabile
```

### Branch
- `main` — stabile, solo merge da feature branch
- `feature/<area>` — un branch per area di lavoro (es. `feature/lavori`, `feature/pagamenti`)
- `docs/setup-progetto` — documentazione

---

## Aggiornamento documentazione al commit

- **README.md** — aggiornare SOLO se la modifica cambia qualcosa di visibile pubblicamente: nuova caratteristica completata (lista "Caratteristiche"), comandi, stack, architettura
- **CLAUDE.md** — aggiornare SOLO se la modifica introduce un nuovo pattern UI consolidato o un nuovo vincolo tecnico
- Se uno dei due file viene aggiornato, includerlo nello stesso commit della modifica
- Lo stato fasi/roadmap NON va documentato qui — è gestito su Notion esternamente
