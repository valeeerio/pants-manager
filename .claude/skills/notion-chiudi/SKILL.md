---
name: notion-chiudi
description: Scrive su Notion un riepilogo di cosa è cambiato in questa sessione, per mantenere Notion come source of truth del progetto. Invocare manualmente con /notion-chiudi prima di chiudere la sessione.
disable-model-invocation: true
allowed-tools: Read, Bash(git status:*), Bash(git diff:*), Bash(git log:*), notion-fetch, notion-update-page, notion-create-comment
---

# Notion Chiudi

<!--
VERIFICA PRIMA DELL'USO: come per notion-avvia, controlla con `/mcp` il prefisso
reale dei tool MCP Notion nel tuo ambiente e allinea "allowed-tools" se necessario.
-->

## Target Notion

Stesso target di `notion-avvia`, letto da `.claude/notion-config.json`.

## Processo

1. Ricostruisci cosa è cambiato in questa sessione, solo da git (sola lettura):
   `git status`, `git diff --stat`, `git log` per i commit recenti non ancora
   sincronizzati su Notion.
2. Prepara un riepilogo breve: feature toccate, file principali, decisioni
   prese durante una eventuale sessione `/pianifica`, esito build se noto.
3. Mostra il riepilogo in chat e **chiedi conferma esplicita** prima di
   scrivere su Notion — è una modifica a uno stato esterno persistente,
   va trattata come le altre azioni che richiedono conferma esplicita.
4. Solo dopo conferma: `notion-update-page` (append, non sovrascrivere sezioni
   esistenti) oppure `notion-create-comment` sulla pagina/riga pertinente.

## Vincoli

- Nessun Edit/Write su file di codice: questa skill scrive solo su Notion, e solo dopo conferma.
- Bash limitato a `git status`/`git diff`/`git log` (sola lettura, nessuna modifica al repo).
