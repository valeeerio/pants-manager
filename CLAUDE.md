# CLAUDE.md

Regole operative per Claude Code nel progetto Gestionale Sartoria (`pants-manager`).

---

## Vincoli tecnici

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · Prisma · PostgreSQL/Supabase · Auth.js v5 · Vercel

- API Routes attive in `app/api/` — NO `output: "export"`
- Route groups: `app/(main)/` (sidebar) · `app/login/` (pubblica)
- `middleware.ts` importa SOLO da `auth.config.ts` — mai da `auth.ts`
- API protette → `401 JSON`, mai redirect
- Prisma: SEMPRE `import { prisma } from "@/lib/prisma"` — mai `new PrismaClient()`
- `postinstall: prisma generate` in `package.json` — non rimuovere
- Deploy automatico su Vercel ad ogni push su `main`

**Env:** `DATABASE_URL` · `DIRECT_URL` · `AUTH_SECRET` · `AUTH_URL`

---

## Regole

1. Un obiettivo per volta — mai uscire dallo scope
2. `npm run build` dopo ogni modifica
3. Zero operazioni Git senza richiesta esplicita
4. Mai committare su `main` direttamente
5. UI sempre in italiano — tono artigianale
6. Codici lavoro `GS-xxx` — mai `PM-`
7. Non reinventare i pattern — usare quelli sotto

---

## Workflow

- **Q&A prima del codice:** solo se la richiesta è ambigua — altrimenti si procede diretto
- **Prompt compatti** (no 5 sezioni fisse): obiettivo breve, file da toccare, punti implementativi chiave (no snippet lunghi), 1-3 criteri di accettazione
- **Autonomia su micro-scelte** implementative (naming, struttura interna file) senza chiedere conferma
- **Conferma utente richiesta solo per:** operazioni Git (commit/push), deploy, modifiche RLS, modifiche schema DB

**Primo comando sempre:** `git checkout <branch> && git status`
**Report finale (max 3 righe, non narrativo):** esito build · file modificati · criteri soddisfatti

---

## Palette

```
Accent:  amber-600/700 · Sidebar: stone-900 · BG: stone-50
Testo:   slate-800/500 · Border: stone-200 · Hover: amber-50
Successo: emerald-50/200/800 · Errore: red-600
```

Icone: `lucide-react` · Componenti: `shadcn/ui`

---

## Pattern UI

**Modal** — SEMPRE createPortal su `document.body`:
```tsx
import ReactDOM from 'react-dom'
{isOpen && ReactDOM.createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-white rounded-lg shadow-xl p-6">{/* contenuto */}</div>
  </div>,
  document.body
)}
```

**Scroll lock:**
```tsx
useEffect(() => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  return () => { document.body.style.overflow = '' }
}, [isOpen])
```

**ESC close · Banner 3s · Sub-modal confirm** → stesso pattern createPortal.

**Tabella ordinamento:** `ChevronUp/Down` da lucide · state `sortCol` + `sortDir`.

**Filter bar:** `[Search] [Dropdown...] ` · AND logic · counter sotto tabella.

**Form validation:** errori inline sotto campo — mai `alert()` o toast.

---

## Pattern API

```ts
export async function GET() {
  try {
    const data = await prisma.model.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
```

**Mapping enum → italiano:**
```ts
const STATUS_MAP: Record<string, string> = {
  TODO: 'Da iniziare', IN_PROGRESS: 'In lavorazione',
  WAITING_CUSTOMER: 'In attesa cliente', COMPLETED: 'Pronto',
  DELIVERED: 'Consegnato', CANCELLED: 'Annullato',
}
const TYPE_MAP: Record<string, string> = {
  HEM: 'Orlo pantalone', WAIST_TIGHTENING: 'Stringere vita',
  LEG_SHORTENING: 'Accorciare gamba', LEG_WIDENING: 'Allargare pantalone',
  ZIP_REPLACEMENT: 'Sostituzione zip', REPAIR: 'Riparazione',
  CUSTOM: 'Su misura', OTHER: 'Altro',
}
```

---

## Comandi

```bash
npm run dev                            # dev locale
npm run build                          # verifica — sempre prima del commit
npx prisma studio                      # esplora DB
npx prisma migrate dev --name <nome>   # nuova migrazione
npx prisma db seed                     # seed
```
