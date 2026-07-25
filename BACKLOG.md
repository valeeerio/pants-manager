# Backlog — Gestionale Sartoria

Item aperti dalle revisioni. Gestito con la skill `/backlog`; aggiornare a fine sessione.
Formato: `- [ ] [priorità] descrizione — file di riferimento (origine)`

**Unica fonte di verità per lo stato/pianificazione del lavoro (dal 2026-07-25).** Notion è stato letto una tantum per travasare qui tutta la roadmap prodotto residua (sezione "Feature" sotto) ed è ora congelato: non viene più letto/scritto a inizio/fine sessione, resta solo come archivio storico consultabile a mano.

## Bug da test browser `qa` (2026-07-25)

- [ ] [alta] Lavori con foto (`ProjectImage` con path non risolvibile nel bucket Supabase Storage) non aprono il modal di dettaglio, senza alcun errore visibile: `getSignedImageUrl()` lancia eccezione su path mancante → `GET /api/lavori/[id]` risponde 500 → il modal resta silenziosamente chiuso perché il fetch fallito lascia `job` a `null` senza mostrare errore. Fix: `getSignedImageUrl` deve restituire `null` invece di lanciare su path inesistente, e il modal deve mostrare un errore inline se il fetch di dettaglio fallisce — `lib/supabase-storage.ts:61-74`, `app/api/lavori/[id]/route.ts:57-63`, `components/lavori/lavoro-detail-modal.tsx:71-104` (test `qa` 2026-07-25)
- [ ] [bassa] Seed: titoli dei lavori `COMPLETED` mostrano il valore raw dell'enum `ProjectType` invece del testo italiano (es. "ZIP_REPLACEMENT completato #21" in tabella Pagamenti/CSV export) — solo qualità dati di test, la colonna "Tipo" altrove mappa correttamente con `TYPE_MAP` — `prisma/seed.ts:114` (test `qa` 2026-07-25)

## Bug/igiene da revisione `revisore` estesa sul diff completo (2026-07-25)

- [x] [bassa] `app/api/lavori/route.ts` e `app/api/lavori/[id]/route.ts` ridefinivano localmente `STATUS_MAP`/`TYPE_MAP` invece di importarli da `lib/enum-labels.ts`, in contrasto con la regola appena centralizzata in CLAUDE.md — fatto 2026-07-25, ora importano da `lib/enum-labels.ts`
- [x] [bassa] `.gitignore` non copriva `.claude/settings.local.json` e `.claude/worktrees/` (ignorati solo da config Git locali dell'utente, non riproducibile su un'altra macchina/collaboratore) — fatto 2026-07-25
- [x] [bassa] `README.md` disallineato dallo stato reale (Dashboard/Statistiche/Pagamenti/Impostazioni segnate come "da fare"/"in lavorazione" mentre erano già completate) — fatto 2026-07-25, README riscritto con stato e stack aggiornati (Recharts, Supabase Storage)

## Migliorie di robustezza

- [x] [alta] Validazione enum negli input API (`type`, `status`, `method`): valore invalido → 400, oggi 500 Prisma — `app/api/lavori/route.ts`, `app/api/lavori/[id]/route.ts`, `app/api/pagamenti/route.ts` (revisione 2026-07-24 · fatto PR #11, 2026-07-24)
- [x] [alta] Banner errore quando la creazione lavoro fallisce (oggi solo `console.error`) — `app/(main)/lavori/page.tsx` (revisione 2026-07-24 · fatto PR #10, 2026-07-24)
- [x] [media] Blocco pagamenti duplicati per lo stesso `projectId` (gonfiano `incassatoMese`; il modal legge solo `data[0]`) — `app/api/pagamenti/route.ts` (revisione 2026-07-24 · fatto PR blocco-pagamenti-duplicati, 2026-07-24)
- [x] [media] Pulsante "Esporta" senza handler: implementare o rimuovere — export CSV client-side dei pagamenti filtrati — `app/(main)/pagamenti/page.tsx` (revisione 2026-07-24 · fatto 2026-07-24)
- [x] [bassa] Timezone `dueDate`: salvata UTC, confronti "oggi" in locale → possibili off-by-one — `lib/date.ts` (helper Europe/Rome), `app/api/dashboard/route.ts`, `app/api/notifiche/route.ts`; lato client già coerente (revisione 2026-07-24 · fatto 2026-07-24)
- [x] [bassa] Paginazione/`take` sulle liste che caricano intere tabelle — `take` con limiti fissi (100 liste dashboard, 200 lavori/pagamenti/clienti); i totali/aggregati restano senza limite — `app/api/dashboard/route.ts`, `app/api/lavori/route.ts`, `app/api/pagamenti/route.ts`, `app/api/clienti/route.ts` (revisione 2026-07-24 · fatto 2026-07-24)

## Bug da revisione components/lib/login (2026-07-24)

- [x] [alta] Fetch pagamento nel modal senza controllo `res.ok`: se l'API fallisce, il lavoro viene mostrato come "non pagato" invece di segnalare l'errore — `components/lavori/lavoro-detail-modal.tsx:129-135` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [alta] Errore di salvataggio modifica lavoro solo in `console.error`, nessun messaggio inline all'utente — `components/lavori/lavoro-detail-modal.tsx:334-338` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [alta] Errore di eliminazione lavoro solo in `console.error`, nessun feedback visibile — `components/lavori/lavoro-detail-modal.tsx:234-236` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [alta] Login: `signIn()` non in try/catch — se lancia eccezione (errore rete/config) lo spinner resta bloccato indefinitamente — `app/login/page.tsx:19-31` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [alta] Login: manca il tag `<form>` (input in `<div>`) — premendo Invio dopo la password il login non parte — `app/login/page.tsx:34-91` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [media] `dismissNotifiche` rimuove la notifica dalla UI prima della fetch senza controllare `res.ok` né fare rollback in errore — stato client/server disallineato — `components/layout/topbar.tsx:70-81` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [media] Badge "Pagato" usa `green-*` invece di `emerald-*` di palette — `components/lavori/lavoro-detail-modal.tsx:464-470` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [bassa] Banner "Salvato" pagamento sparisce dopo 2s invece dei 3s da convenzione — `components/lavori/lavoro-detail-modal.tsx:148-152` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [bassa] `NotificationBanner` si auto-chiude a 4s invece dei 3s da convenzione — `components/ui/notification-banner.tsx:39-42` (revisione 2026-07-24 · fatto 2026-07-25)
- [x] [bassa] Sfondo sidebar `bg-[#111214]` arbitrario invece di `bg-stone-900` — `components/layout/sidebar.tsx:34` (revisione 2026-07-24 · fatto 2026-07-25)

## Migliorie da revisione components/lib/login (2026-07-24)

- [x] [media] Doppio sistema di colori per stato lavoro (`STATUS_COLORS` in `lavoro-shared.tsx` vs `status-badge.tsx`) — rischio di drift se si aggiunge uno stato — `components/lavori/lavoro-shared.tsx`, `components/shared/status-badge.tsx` (fatto 2026-07-25)
- [x] [bassa] Righe lavoro cliccabili senza `role`/`tabIndex`/tastiera nei modal KPI dashboard — `components/dashboard/kpi-modals.tsx:107-128` (fatto 2026-07-25)
- [x] [bassa] Card dashboard con `onClick`: div senza `cursor-pointer` né semantica bottone/tastiera — `components/dashboard/metric-card.tsx:49-53` (fatto 2026-07-25)
- [x] [bassa] `caricaNotifiche` senza cleanup/AbortController (setState su componente potenzialmente smontato); errori fetch solo in console — `components/layout/topbar.tsx:25-41` (fatto 2026-07-25)
- [x] [bassa] Login: nessuna validazione client-side (campi vuoti inviati comunque); input senza `id`/`htmlFor`/`autoComplete` — `app/login/page.tsx` (fatto 2026-07-25)
- [x] [bassa] Trend positivo/negativo dedotto da `startsWith`/`includes` su stringa, accoppiamento implicito fragile — `components/dashboard/metric-card.tsx:13-14` (fatto 2026-07-25)

## Schema DB (richiede migrazione Prisma + conferma utente)

- [x] [media] Indici mancanti: `Project(status, dueDate, clientId, type)`, `Payment(projectId, status+paidAt)` — `prisma/schema.prisma` (revisione 2026-07-24 · fatto 2026-07-25, migrazione `add_indexes_and_price_decimal`)
- [x] [media] `price Float?` → `Decimal @db.Decimal(10,2)` per evitare arrotondamenti sugli importi — `prisma/schema.prisma` (revisione 2026-07-24 · fatto 2026-07-25, migrazione `add_indexes_and_price_decimal`; conversione a `number` centralizzata in `lib/decimal.ts`)
- [x] [bassa] Indice mancante su FK `ProjectImage.projectId` (segnalato da advisor performance Supabase) — `prisma/schema.prisma` (verifica `supabase` 2026-07-25 · fatto 2026-07-25, migrazione `add_project_image_index`)

## Sicurezza (richiede conferma utente)

- [ ] [media] RLS disabilitata su tutte le tabelle Supabase (`Client`, `Project`, `Payment`, `ProjectImage`, `User`, `NotificaDismissa`) — rischio basso in pratica (app usa Prisma con connessione diretta, non anon key) ma esposizione strutturale se la anon key venisse mai usata lato client — richiede policy RLS dedicate, NON applicare senza conferma esplicita (rischio di bloccare l'accesso) (verifica `supabase` 2026-07-25)
  - **Nota multi-tenant (2026-07-25):** se in futuro l'app dovesse servire più laboratori (clienti multipli), lo standard è UN solo DB condiviso con colonna `tenantId`/`laboratorioId` + RLS basata su quella colonna — non un DB separato per cliente (overkill per questa scala, giustificato solo per isolamento enterprise/compliance). Non implementare ora in via speculativa: oggi l'app serve un solo laboratorio, il concetto di tenant non esiste nello schema — da pianificare sul serio solo quando ci sarà davvero un secondo cliente da onboardare.

## Documentazione env (nessun rischio, solo drift doc)

- [x] [bassa] `.env.example`/CLAUDE.md non elencano `NEXT_PUBLIC_DATABASE_SUPABASE_URL` e `DATABASE_SUPABASE_SERVICE_ROLE_KEY` (usate da `lib/supabase-storage.ts` per upload foto Prima/Dopo, già configurate su Vercel dato che il deploy è verde) — aggiungerle a entrambi i file — `.env.example`, `CLAUDE.md` (verifica `vercel` 2026-07-25 · fatto 2026-07-25)

## Feature

- [x] [alta] Rework pagina Statistiche: da dati mock (`lib/mock-data.ts`) a dati reali via API — `app/(main)/statistiche/page.tsx` (audit 2026-07-24 · fatto 2026-07-25, nuova `app/api/statistiche/route.ts` + grafici recharts, `lib/mock-data.ts` rimosso, revisionato ok da `revisore`)
- [x] [media] Persistenza foto Prima/Dopo: modello `ProjectImage` esiste ma nessuna route lo usa, le foto si perdono alla chiusura del modal — `components/lavori/lavoro-detail-modal.tsx` (revisione 2026-07-24 · fatto 2026-07-25, upload su Supabase Storage bucket privato `project-images`, signed URL, migrazione `rename_project_image_path`)
- [x] [alta] Rework pagina Impostazioni: form interamente statico, `defaultValue` hardcoded, pulsante "Salva modifiche" senza handler, nessun modello `Settings` in Prisma né API — `app/(main)/impostazioni/page.tsx` (trovato da `revisore` esteso 2026-07-25 · confermato anche su Notion, fase "Pagina Impostazioni" · fatto 2026-07-25, modello `LabSettings` + migrazione `add_lab_settings`, API `app/api/impostazioni/route.ts` GET get-or-create + PUT validato, pagina client component con `NotificationBanner`)
- [ ] [media] Pagina Magazzino: gestione materiali del laboratorio (stoffe, zip, fili, accessori) — lista, aggiunta, modifica, soglie minime di scorta. Non ancora iniziata, richiede nuovo modello Prisma — impostare con `/pianifica` (da Notion, fase "Pagina Magazzino", stato "Da fare", ordine 11)
- [ ] [media] Pagina `/prenota` + `app/api/prenota`: non ancora implementata — impostare con `/pianifica` (da Notion, fase "Gestione API"/tabella stato, sotto-voce ancora da fare, branch previsto `feature/api-prenota`)
- [ ] [bassa] Assistente Laboratorio: chatbot in linguaggio naturale per interrogare i dati del laboratorio (intent detection TS, query via API Routes, risposte in italiano a template, zero dipendenze esterne) — impostare con `/pianifica` (da Notion, fase "Assistente Laboratorio", stato "Da fare", ordine 13)

## Revisioni da completare

- [x] [media] Revisione approfondita cartelle rimanenti: `components/`, `lib/`, `app/login` — usare `/revisiona-cartella` (sessione 2026-07-24 · fatto 2026-07-24, 10 bug + 6 migliorie individuati, vedi sezioni sopra)
