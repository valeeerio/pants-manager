---
name: notion
description: Sincronizza lo stato di progetto con Notion (source of truth dello sviluppo). `/notion` o `/notion avvia` legge lo stato a inizio sessione; `/notion chiudi` propone e — dopo conferma — scrive il riepilogo di fine sessione. Invocare manualmente; sostituisce le vecchie notion-avvia e notion-chiudi.
disable-model-invocation: true
allowed-tools: Agent, Read, AskUserQuestion, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# Notion — stato progetto

Skill unica per il flusso Notion. La modalità dipende dall'argomento:
- **nessun argomento** o `avvia` → modalità LETTURA (inizio sessione)
- `chiudi` → modalità SCRITTURA (fine sessione, con conferma)

## Target Notion

Leggi il target da `.claude/notion-config.json`: usa SEMPRE `pageOrDatabaseId`
(UUID); `pageOrDatabaseUrl` è solo una nota per l'utente. Se i campi sono vuoti,
chiedi UNA volta URL o nome della pagina e suggerisci di salvarlo lì.
Se fetch/search falliscono (pagina cancellata/spostata/senza permessi):
riferiscilo in chat e suggerisci di aggiornare il config — niente retry ciechi.

## Modalità LETTURA (`/notion` · `/notion avvia`)

Sola lettura, nessuna modifica a Notion o al codice. Il lavoro lo fa il
subagent `notion-sync` (`.claude/agents/notion-sync.md`): lancialo in
modalità LETTURA e riporta in chat il suo riassunto (max ~10 righe: cosa era
in sospeso, ultime decisioni, prossimi passi). Se esiste `BACKLOG.md` nel
repo, confronta il riassunto con il backlog e segnala eventuali
disallineamenti (senza correggerli da solo).

## Modalità SCRITTURA (`/notion chiudi`)

Notion è il libro dello **sviluppo del progetto** (feature, decisioni di
prodotto, stato di pagine/API/DB, roadmap). **Non ci va** la configurazione o
il tooling di Claude Code (`.claude/`, hook, skill, workflow): quelle modifiche
restano solo nel repo. Se nella sessione sono cambiati SOLO file `.claude/` o
tooling, dillo esplicitamente e fermati: non c'è nulla da scrivere.

1. Lancia il subagent `notion-sync` SENZA conferma nel prompt: ricostruisce
   i cambi della sessione da git, filtra (solo `app/`, `components/`, `lib/`,
   `prisma/` e decisioni di prodotto) e restituisce una BOZZA di riepilogo
   senza scrivere nulla. In caso di dubbio su quali commit includere,
   chiedi all'utente.
2. Mostra la bozza in chat e **chiedi conferma esplicita** all'utente.
3. Solo dopo conferma: rilancia `notion-sync` in modalità SCRITTURA passando
   nel prompt il testo esatto del riepilogo confermato e la dichiarazione che
   l'utente lo ha approvato — l'agente scrive con `notion-update-page`
   (append, mai sovrascrivere) o `notion-create-comment`.

## Vincoli

- Nessun Edit/Write su file: questa skill tocca solo Notion, e solo in
  modalità scrittura dopo conferma.
- Bash limitato a `git status`/`git diff`/`git log` (sola lettura).
- Mai documentare su Notion modifiche a `.claude/` o al workflow di Claude Code.
