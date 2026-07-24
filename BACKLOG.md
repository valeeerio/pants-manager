# Backlog — Gestionale Sartoria

Item aperti dalle revisioni. Gestito con la skill `/backlog`; aggiornare a fine sessione.
Formato: `- [ ] [priorità] descrizione — file di riferimento (origine)`

## Migliorie di robustezza

- [x] [alta] Validazione enum negli input API (`type`, `status`, `method`): valore invalido → 400, oggi 500 Prisma — `app/api/lavori/route.ts`, `app/api/lavori/[id]/route.ts`, `app/api/pagamenti/route.ts` (revisione 2026-07-24 · fatto PR #11, 2026-07-24)
- [x] [alta] Banner errore quando la creazione lavoro fallisce (oggi solo `console.error`) — `app/(main)/lavori/page.tsx` (revisione 2026-07-24 · fatto PR #10, 2026-07-24)
- [x] [media] Blocco pagamenti duplicati per lo stesso `projectId` (gonfiano `incassatoMese`; il modal legge solo `data[0]`) — `app/api/pagamenti/route.ts` (revisione 2026-07-24 · fatto PR blocco-pagamenti-duplicati, 2026-07-24)
- [ ] [media] Pulsante "Esporta" senza handler: implementare o rimuovere — `app/(main)/pagamenti/page.tsx` (revisione 2026-07-24)
- [x] [bassa] Timezone `dueDate`: salvata UTC, confronti "oggi" in locale → possibili off-by-one — `lib/date.ts` (helper Europe/Rome), `app/api/dashboard/route.ts`, `app/api/notifiche/route.ts`; lato client già coerente (revisione 2026-07-24 · fatto 2026-07-24)
- [x] [bassa] Paginazione/`take` sulle liste che caricano intere tabelle — `take` con limiti fissi (100 liste dashboard, 200 lavori/pagamenti/clienti); i totali/aggregati restano senza limite — `app/api/dashboard/route.ts`, `app/api/lavori/route.ts`, `app/api/pagamenti/route.ts`, `app/api/clienti/route.ts` (revisione 2026-07-24 · fatto 2026-07-24)

## Schema DB (richiede migrazione Prisma + conferma utente)

- [ ] [media] Indici mancanti: `Project(status, dueDate, clientId, type)`, `Payment(projectId, status+paidAt)` — `prisma/schema.prisma` (revisione 2026-07-24)
- [ ] [media] `price Float?` → `Decimal @db.Decimal(10,2)` per evitare arrotondamenti sugli importi — `prisma/schema.prisma` (revisione 2026-07-24)

## Feature

- [ ] [alta] Rework pagina Statistiche: da dati mock (`lib/mock-data.ts`) a dati reali via API — impostare con `/pianifica` — `app/(main)/statistiche/page.tsx` (audit 2026-07-24)
- [ ] [media] Persistenza foto Prima/Dopo: modello `ProjectImage` esiste ma nessuna route lo usa, le foto si perdono alla chiusura del modal — `components/lavori/lavoro-detail-modal.tsx` (revisione 2026-07-24)

## Revisioni da completare

- [ ] [media] Revisione approfondita cartelle rimanenti: `components/`, `lib/`, `app/login` — usare `/revisiona-cartella` (sessione 2026-07-24)
