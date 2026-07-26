# Backlog — Gestionale Sartoria

Item aperti dalle revisioni. Gestito con la skill `/backlog`; aggiornare a fine sessione.
Formato: `- [ ] [priorità] descrizione — file di riferimento (origine)`

**Unica fonte di verità per lo stato/pianificazione del lavoro (dal 2026-07-25).** Notion è stato letto una tantum per travasare qui tutta la roadmap prodotto residua (sezione "Feature" sotto) ed è ora congelato: non viene più letto/scritto a inizio/fine sessione, resta solo come archivio storico consultabile a mano.

## Sicurezza (richiede conferma utente)

- [ ] [media] RLS disabilitata su tutte le tabelle Supabase (`Client`, `Project`, `Payment`, `ProjectImage`, `User`, `NotificaDismissa`) — rischio basso in pratica (app usa Prisma con connessione diretta, non anon key) ma esposizione strutturale se la anon key venisse mai usata lato client — richiede policy RLS dedicate, NON applicare senza conferma esplicita (rischio di bloccare l'accesso) (verifica `supabase` 2026-07-25)
  - **Nota multi-tenant (2026-07-25):** se in futuro l'app dovesse servire più laboratori (clienti multipli), lo standard è UN solo DB condiviso con colonna `tenantId`/`laboratorioId` + RLS basata su quella colonna — non un DB separato per cliente (overkill per questa scala, giustificato solo per isolamento enterprise/compliance). Non implementare ora in via speculativa: oggi l'app serve un solo laboratorio, il concetto di tenant non esiste nello schema — da pianificare sul serio solo quando ci sarà davvero un secondo cliente da onboardare.

## Feature

- [ ] [media] Pagina Magazzino: gestione materiali del laboratorio (stoffe, zip, fili, accessori) — lista, aggiunta, modifica, soglie minime di scorta. Non ancora iniziata, richiede nuovo modello Prisma — impostare con `/pianifica` (da Notion, fase "Pagina Magazzino", stato "Da fare", ordine 11)
- [ ] [media] Pagina `/prenota` + `app/api/prenota`: non ancora implementata — impostare con `/pianifica` (da Notion, fase "Gestione API"/tabella stato, sotto-voce ancora da fare, branch previsto `feature/api-prenota`)
- [ ] [bassa] Assistente Laboratorio: chatbot in linguaggio naturale per interrogare i dati del laboratorio (intent detection TS, query via API Routes, risposte in italiano a template, zero dipendenze esterne) — impostare con `/pianifica` (da Notion, fase "Assistente Laboratorio", stato "Da fare", ordine 13)
