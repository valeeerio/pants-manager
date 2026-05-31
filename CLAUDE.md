# CLAUDE.md — Istruzioni operative per Claude Code

Questo file viene letto automaticamente da Claude Code ad ogni sessione.
Definisce regole, pattern UI, flusso di lavoro e stato del progetto.

---

## Progetto

**Nome:** Gestionale Sartoria
**Repository:** `pants-manager`
**Tipo:** App desktop nativa (Tauri 2.0 + Next.js 15 static export)
**Database:** SQLite locale via plugin Tauri SQL — non ancora collegato

---

## Stack

| Tecnologia | Ruolo |
|---|---|
| Next.js 15 (App Router, `static export`) | Framework frontend |
| TypeScript | Linguaggio |
| Tailwind CSS | Stile |
| shadcn/ui | Componenti UI |
| Tauri 2.0 | App desktop nativa |
| SQLite (plugin Tauri SQL) | Database locale — da collegare |

---

## Stato pagine

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

## Regole fondamentali

1. **Prompt piccoli e mirati** — un obiettivo per volta, nessuna modifica massiva
2. **`npm run build` obbligatorio** dopo ogni modifica, prima del commit
3. **Commit solo con build pulita** e UI visivamente corretta
4. **Sempre su branch feature** — mai toccare `main` direttamente
5. **Nessuna modifica a database, SQLite o Tauri backend** durante la fase UI
6. **Tutti i testi UI in italiano** — zero stringhe in inglese nelle pagine visibili
7. **Tono artigianale e caldo** — no linguaggio aziendale, no B2B
8. **Non reinventare i pattern UI** — usare sempre i pattern consolidati sotto

---

## Struttura obbligatoria di ogni prompt

```
1. Obiettivo           — cosa deve fare questa modifica
2. File da toccare     — lista esplicita dei file coinvolti
3. File da NON toccare — lista esplicita di ciò che non va cambiato
4. Mock data           — dati di esempio se necessari
5. Verifica finale     — npm run build
```

---

## Aggiornamento automatico documentazione — OBBLIGATORIO

Ad ogni modifica completata e verificata, aggiornare **entrambi** i file prima del commit:

### Cosa aggiornare in CLAUDE.md
- **Tabella "Stato pagine"** — stato della pagina coinvolta
- **Tabella "Roadmap"** — stato della fase (✅ / 🔄 / ⏳)
- **Pattern UI consolidati** — aggiungere se la modifica introduce un nuovo pattern

### Cosa aggiornare in README.md
- **Tabella "Stato attuale"** — stato della pagina coinvolta
- **Sezione della pagina modificata** — aggiornare funzionalità implementate
- **Tabella "Roadmap"** — stato della fase
- **Modello dati** — se vengono aggiunti campi o tabelle

### Regola del commit
```bash
git add <file modificati> README.md CLAUDE.md
git commit -m "tipo(scope): descrizione"
git push
```

### Formato messaggi di commit
```
feat(lavori): aggiunta galleria foto prima/dopo nel dettaglio
feat(pagamenti): implementazione pagina pagamenti con mock data
feat(dashboard): ridisegno layout con nuovi widget KPI
fix(modal): corretto scroll lock su apertura modale annidato
docs: aggiornamento roadmap e stato pagine
```

---

## Palette e stile

```
Accent:     amber-600 / amber-700
Sidebar:    stone-900
Background: stone-50
Testo:      slate-800 (primario) · slate-500 (secondario)
Border:     stone-200
Hover:      amber-50 / stone-100
```

- Codici lavoro: `GS-001`, `GS-002` — **mai** `PM-`
- Icone: `lucide-react` — nessuna altra libreria di icone
- Componenti: `shadcn/ui` — nessun componente UI esterno aggiuntivo

---

## Pattern UI consolidati

### Modal — createPortal (OBBLIGATORIO)
```tsx
// Sempre via ReactDOM.createPortal su document.body
// MAI tramite z-index su elementi nested — causa stacking context bug
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
// Chiave su TUTTI gli stati modal aperti simultaneamente
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
// Obbligatorio per Elimina e qualsiasi azione irreversibile
// Stesso pattern createPortal — modal sopra modal
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
```tsx
// Ordine fisso: [Search] [Dropdown 1] [Dropdown 2] [Dropdown 3]
// Search: real-time su nome, codice, tipo — combinabile con i dropdown
// Tutti i filtri si combinano tra loro (AND logic)
// Sotto la tabella: "Stai visualizzando X di Y risultati" + bottone "Carica altri"
```

### Validazione form inline
```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

// Errori mostrati sotto il campo, in rosso, senza alert esterni
{errors.campo && (
  <p className="text-sm text-red-600 mt-1">{errors.campo}</p>
)}
```

---

## Branch attivi

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

## Comandi

```bash
npm run dev        # Dev server Next.js nel browser (uso quotidiano)
npx tauri dev      # Dev con finestra desktop Tauri (verifica finale)
npm run build      # Verifica build — OBBLIGATORIO dopo ogni modifica
npx tauri build    # Genera installer .dmg (solo per distribuzione)
```

---

## Flusso Git

```bash
# Inizio sessione
git branch && git status

# Fine sessione
npm run build
git add <file> README.md CLAUDE.md
git commit -m "tipo(scope): descrizione"
git push

# Rollback pre-commit
git restore .
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
