---
name: notion-avvia
description: Legge lo stato di progetto da Notion a inizio sessione (pagina/database di riferimento) e lo riassume in chat. Sola lettura, nessuna modifica a codice o a Notion. Invocare manualmente con /notion-avvia all'inizio di una sessione di lavoro.
disable-model-invocation: true
allowed-tools: Read, mcp__claude_ai_Notion__notion-search, mcp__claude_ai_Notion__notion-fetch, mcp__claude_ai_Notion__notion-query-data-sources, mcp__claude_ai_Notion__notion-get-comments
---

# Notion Avvia

## Target Notion

Leggi il target dal file di configurazione condiviso `.claude/notion-config.json`:
usa SEMPRE `pageOrDatabaseId` (UUID, formato sempre accettato da notion-fetch);
`pageOrDatabaseUrl` è solo una nota per l'utente, non passarlo ai tool.
Se i campi sono vuoti, chiedi UNA volta URL o nome della pagina/database
all'utente e suggerisci di salvarlo lì per le sessioni future (questa skill non
scrive quel file da sola: la modifica la fa l'utente o il turno normale, non
questa skill di sola lettura).

## Processo

1. Carica il target da `.claude/notion-config.json` (campo `pageOrDatabaseId`).
2. `notion-fetch` su quell'ID. Se hai solo un nome (nessun ID salvato):
   `notion-search` per trovarla, poi `notion-fetch`.
   Se fetch/search falliscono (pagina cancellata, spostata, senza permessi):
   riferiscilo in chat e suggerisci di aggiornare il config — niente retry ciechi.
3. Per il database inline "Fasi del progetto" (data-source `collection://…` salvato
   nelle notes del config): `notion-query-data-sources` in modalità SQL filtrando
   `Stato IN ('In corso','Da fare')`, ordinato per `Ordine`.
4. Se rilevanti, leggi anche i commenti recenti con `notion-get-comments`.
5. Riassumi in chat, max ~10 righe: cosa era in sospeso, ultime decisioni, prossimi passi.

## Vincoli

- Sola lettura: non modificare nulla su Notion (nessun update-page/create-comment in questa skill).
- Non toccare file di codice: nessun Edit/Write tra i tool ammessi.
