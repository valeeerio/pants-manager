# CLAUDE.md — Istruzioni operative per Claude Code

Questo file definisce le regole di lavoro, i pattern UI consolidati e il flusso operativo
per il progetto **Gestionale Sartoria** (repository: `pants-manager`).
Viene letto automaticamente da Claude Code ad ogni sessione.

---

## Stack tecnico

| Tecnologia | Ruolo |
|---|---|
| Next.js 15 (App Router, `static export`) | Framework frontend |
| TypeScript | Linguaggio |
| Tailwind CSS | Stile |
| shadcn/ui | Componenti UI |
| Tauri 2.0 | App desktop nativa |
| SQLite (plugin Tauri SQL) | Database locale — non ancora collegato |

---

## Stato pagine

| Pagina | Stato |
|---|---|
| Clienti | ✅ Completata con mock data |
| Lavori | ✅ Completata con mock data — mancano foto prima/dopo |
| Dashboard | 🔄 Da ridisegnare |
| Pagamenti | ⏳ Da progettare e implementare |
| Statistiche | ⏳ Da progettare e implementare |
| Impostazioni | ⏳ Da progettare e implementare |
| Magazzino | ⏳ Da progettare e implementare (fase futura) |

**Tutto il progetto usa attualmente mock data statici — nessun database collegato.**

---

## Regole fondamentali

1. **Prompt piccoli e mirati** — un obiettivo per volta, nessuna modifica massiva
2. **`npm run build` obbligatorio** dopo ogni modifica prima del commit
3. **Commit solo con build pulita** e UI visivamente corretta
4. **Sempre su branch feature** — mai toccare `main` direttamente
5. **Nessuna modifica a database, schema SQLite o Tauri backend** durante la fase UI
6. **Tutti i testi UI in italiano** — zero stringhe in inglese nelle pagine visibili
7. **Tono artigianale e caldo** — no linguaggio aziendale, no B2B
8. **Non reinventare i pattern UI** — usare sempre quelli consolidati sotto

---

## Struttura obbligatoria di ogni prompt

```
1. Obiettivo         — cosa deve fare questa modifica
2. File da toccare   — lista esplicita dei file coinvolti
3. File da NON toccare — lista esplicita di ciò che non va cambiato
4. Mock data         — dati di esempio se la modifica ne richiede
5. Verifica finale   — npm run build
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
    <div className="relative bg-white rounded-lg shadow-xl ...">
      {/* contenuto */}
    </div>
  </div>,
  document.body
)}
```

### Scroll lock
```tsx
// Bloccare lo scroll del body su TUTTI gli stati modal aperti
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

### Banner di conferma (auto-dismiss)
```tsx
const [showBanner, setShowBanner] = useState(false)

// Dopo salvataggio:
setShowBanner(true)

useEffect(() => {
  if (!showBanner) return
  const t = setTimeout(() => setShowBanner(false), 3000)
  return () => clearTimeout(t)
}, [showBanner])

// UI:
{showBanner && (
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
    Salvato con successo
  </div>
)}
```

### Sub-modal di conferma (azioni distruttive)
```tsx
// Obbligatorio per Elimina e qualsiasi azione irreversibile
// È un secondo modal sopra il modal principale — stesso pattern createPortal
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
// Ordine fisso da sinistra: [Search] [Dropdown1] [Dropdown2] [Dropdown3]
// La search è real-time su nome, codice, tipo
// Tutti i filtri si combinano tra loro (AND logic)
// Sotto la tabella: "Stai visualizzando X di Y lavori" + "Carica altri"
```

### Validazione form inline
```tsx
// Errori mostrati sotto il campo, in rosso, senza alert esterni
const [errors, setErrors] = useState<Record<string, string>>({})

// Esempio:
{errors.cliente && (
  <p className="text-sm text-red-600 mt-1">{errors.cliente}</p>
)}
```

---

## Branch attivi

| Branch | Scopo |
|---|---|
| `main` | Versione stabile — solo merge da feature branch |
| `feature/dashboard` | Ridisegno dashboard |
| `feature/clienti` | Pagina clienti |
| `feature/lavori` | Pagina lavori + foto prima/dopo |
| `feature/pagamenti` | Pagina pagamenti |
| `feature/statistiche` | Pagina statistiche |
| `feature/impostazioni` | Pagina impostazioni |
| `feature/magazzino` | Pagina magazzino (fase futura) |
| `feature/crud` | CRUD reali con SQLite |
| `feature/database` | Schema e setup database SQLite |
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
# Inizio sessione — verificare sempre il branch
git branch
git status

# Fine sessione
npm run build
git add .
git commit -m "descrizione chiara della modifica"
git push

# Rollback pre-commit
git restore .
```

---

## Roadmap fasi

| # | Fase | Stato | Branch |
|---|---|---|---|
| 1 | UI statica | ✅ Completata | main |
| 2 | Pulizia dashboard | ✅ Completata | feature/dashboard |
| 3 | Pagina Clienti | ✅ Completata | feature/clienti |
| 4 | Pagina Lavori | ✅ Completata | feature/lavori |
| 5 | Conversione a Tauri | ✅ Completata | main |
| 6 | Foto prima/dopo (Lavori) | 🔄 In programma | feature/lavori |
| 7 | Ridisegno Dashboard | 🔄 In programma | feature/dashboard |
| 8 | Pagina Pagamenti | ⏳ Da fare | feature/pagamenti |
| 9 | Pagina Statistiche | ⏳ Da fare | feature/statistiche |
| 10 | Pagina Impostazioni | ⏳ Da fare | feature/impostazioni |
| 11 | Database SQLite | ⏳ Da fare | feature/database |
| 12 | CRUD reali | ⏳ Da fare | feature/crud |
| 13 | Dashboard dinamica | ⏳ Da fare | feature/dashboard |
| 14 | Autenticazione | ⏳ Da fare | feature/auth |
| 15 | Pagina Magazzino | ⏳ Da fare | feature/magazzino |