---
name: backlog
description: Gestisce BACKLOG.md, la lista degli item aperti emersi da audit e revisioni. `/backlog` mostra lo stato e propone da dove ripartire; `/backlog aggiorna` sincronizza il file con quanto fatto/emerso nella sessione corrente. Invocare manualmente a inizio o fine sessione.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Grep, Glob, AskUserQuestion, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# Backlog

Fonte di verità: `BACKLOG.md` nella root del repo. Formato delle voci:
`- [ ] [priorità] descrizione — file di riferimento (origine)` con priorità
`alta`/`media`/`bassa`, raggruppate per sezione.

## Modalità CONSULTAZIONE (`/backlog`, nessun argomento)

1. Leggi `BACKLOG.md`. Se non esiste, dillo e proponi di crearlo.
2. Riassumi in chat: item aperti per sezione, priorità alte in evidenza,
   eventuali item chiusi di recente.
3. Proponi da dove ripartire (1-2 candidati con motivazione breve). La scelta
   resta all'utente — non iniziare l'implementazione da questa skill.

## Modalità AGGIORNAMENTO (`/backlog aggiorna`)

1. Ricostruisci cosa è stato fatto nella sessione da git (`git log` dei commit
   di oggi, `git status`/`git diff` per il lavoro in corso) e dalla
   conversazione.
2. Spunta (`- [x]`) gli item completati, aggiungi i nuovi item emersi
   (revisioni, bug trovati, decisioni rimandate) con priorità e origine
   (es. "revisione 2026-07-24"). Non cancellare item spuntati: restano come
   storico finché l'utente non chiede una pulizia.
3. Mostra il diff proposto in chat prima di salvare; a dubbio su priorità o
   pertinenza di un item, chiedi con AskUserQuestion.

## Vincoli

- Questa skill modifica SOLO `BACKLOG.md` — mai codice, mai altri file.
- Niente operazioni git di scrittura: il commit del backlog avviene nel
  flusso normale, insieme al resto della sessione.
- Gli item di tooling Claude Code (`.claude/`) possono stare nel backlog,
  ma non vanno mai riportati su Notion (vedi skill `notion`).
