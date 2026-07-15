---
name: notion-avvia
description: Legge lo stato di progetto da Notion a inizio sessione (pagina/database di riferimento) e lo riassume in chat. Sola lettura, nessuna modifica a codice o a Notion. Invocare manualmente con /notion-avvia all'inizio di una sessione di lavoro.
disable-model-invocation: true
allowed-tools: Read, notion-search, notion-fetch, notion-query-database-view, notion-get-comments
---

# Notion Avvia

<!--
VERIFICA PRIMA DELL'USO: la lista "allowed-tools" sopra usa i nomi brevi dei tool
Notion. Nell'ambiente reale in cui gira questa skill (VS Code/CLI), il connettore
MCP Notion espone i tool con un prefisso specifico (es. `mcp__notion__notion-fetch`,
o diverso a seconda di come è stato aggiunto con `claude mcp add`/`/mcp`). Controlla
con `/mcp` il prefisso reale e allinea questa lista prima di considerare la skill
pronta — il prefisso visto in ambienti hosted/sandbox non è detto coincida.
-->

## Target Notion

Leggi URL/ID dal file di configurazione condiviso `.claude/notion-config.json`.
Se i campi sono vuoti, chiedi UNA volta URL o nome della pagina/database
all'utente e suggerisci di salvarlo lì per le sessioni future (questa skill non
scrive quel file da sola: la modifica la fa l'utente o il turno normale, non
questa skill di sola lettura).

## Processo

1. Carica il target da `.claude/notion-config.json`.
2. Se è un ID/URL di pagina: `notion-fetch` su quella pagina.
   Se hai solo un nome (nessun ID salvato): `notion-search` per trovarla, poi `notion-fetch`.
3. Se è un database: `notion-query-database-view` filtrando su stato aperto/in corso, se il database ha una proprietà di stato.
4. Se rilevanti, leggi anche i commenti recenti con `notion-get-comments`.
5. Riassumi in chat, max ~10 righe: cosa era in sospeso, ultime decisioni, prossimi passi.

## Vincoli

- Sola lettura: non modificare nulla su Notion (nessun `notion-update-page`/`notion-create-comment` in questa skill).
- Non toccare file di codice: nessun Edit/Write tra i tool ammessi.
