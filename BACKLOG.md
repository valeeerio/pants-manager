# Backlog — Gestionale Sartoria

Item aperti dalle revisioni. Gestito con la skill `/backlog`; aggiornare a fine sessione.
Formato: `- [ ] [priorità] descrizione — file di riferimento (origine)`

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

- [ ] [media] Indici mancanti: `Project(status, dueDate, clientId, type)`, `Payment(projectId, status+paidAt)` — `prisma/schema.prisma` (revisione 2026-07-24)
- [ ] [media] `price Float?` → `Decimal @db.Decimal(10,2)` per evitare arrotondamenti sugli importi — `prisma/schema.prisma` (revisione 2026-07-24)

## Feature

- [ ] [alta] Rework pagina Statistiche: da dati mock (`lib/mock-data.ts`) a dati reali via API — impostare con `/pianifica` — `app/(main)/statistiche/page.tsx` (audit 2026-07-24)
- [ ] [media] Persistenza foto Prima/Dopo: modello `ProjectImage` esiste ma nessuna route lo usa, le foto si perdono alla chiusura del modal — `components/lavori/lavoro-detail-modal.tsx` (revisione 2026-07-24)

## Revisioni da completare

- [x] [media] Revisione approfondita cartelle rimanenti: `components/`, `lib/`, `app/login` — usare `/revisiona-cartella` (sessione 2026-07-24 · fatto 2026-07-24, 10 bug + 6 migliorie individuati, vedi sezioni sopra)
