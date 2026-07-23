---
name: notion-chiudi
description: Scrive su Notion un riepilogo di cosa è cambiato in questa sessione, per mantenere Notion come source of truth del progetto. Invocare manualmente con /notion-chiudi prima di chiudere la sessione.
disable-model-invocation: true
allowed-tools: Read, Bash(git status:*), Bash(git diff:*), Bash(git log:*), mcp__claude_ai_Notion__notion-fetch, mcp__claude_ai_Notion__notion-update-page, mcp__claude_ai_Notion__notion-create-comment
---

# Notion Chiudi

## Target Notion

Stesso target di `notion-avvia`, letto da `.claude/notion-config.json`
(usare `pageOrDatabaseId`, non l'URL).

## Ambito: cosa va su Notion e cosa no

Notion è il libro dello **sviluppo del progetto** (l'app Gestionale Sartoria):
feature, decisioni di prodotto, stato di pagine/API/DB, roadmap.

**Non ci va**: configurazione o tooling di Claude Code stesso (nuove skill,
subagent, hook, modifiche a `.claude/`, cambi di workflow su come si usa
Claude Code). Sono modifiche interne allo strumento, non sviluppo del
progetto — restano solo nel repo/git, mai su Notion.

Se in una sessione sono cambiati SOLO file sotto `.claude/` (o solo tooling
di supporto tipo script npm di lint/typecheck), non c'è nulla da scrivere:
salta direttamente al passo finale e dillo esplicitamente in chat, senza
proporre un riepilogo.

## Processo

1. Ricostruisci cosa è cambiato nella SESSIONE CORRENTE, solo da git (sola
   lettura): `git status`, `git diff --stat`, `git log` limitato ai commit di
   questa sessione (quelli creati o mergiati oggi durante la conversazione).
   Non tentare di dedurre cosa sia "già sincronizzato" da sessioni passate:
   in caso di dubbio elenca i commit e chiedi all'utente quali includere.
2. Filtra: tieni solo modifiche a `app/`, `components/`, `lib/`, `prisma/` e
   decisioni di prodotto — scarta modifiche a `.claude/` o tooling (vedi sopra).
3. Se resta qualcosa di pertinente, prepara un riepilogo breve: feature
   toccate, file principali, decisioni prese durante una eventuale sessione
   `/pianifica`, esito build se noto.
4. Mostra il riepilogo in chat e **chiedi conferma esplicita** prima di
   scrivere su Notion — è una modifica a uno stato esterno persistente,
   va trattata come le altre azioni che richiedono conferma esplicita.
5. Solo dopo conferma: `notion-update-page` (append, non sovrascrivere sezioni
   esistenti) oppure `notion-create-comment` sulla pagina/riga pertinente.

## Vincoli

- Nessun Edit/Write su file di codice: questa skill scrive solo su Notion, e solo dopo conferma.
- Bash limitato a `git status`/`git diff`/`git log` (sola lettura, nessuna modifica al repo).
- Mai proporre di documentare su Notion modifiche a `.claude/` o al workflow di Claude Code.
