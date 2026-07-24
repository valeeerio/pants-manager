---
name: revisiona-cartella
description: Revisione approfondita e ripetibile di una o più cartelle del progetto (es. `/revisiona-cartella components lib`) — audit strutturale + qualità del codice, report BUG/MIGLIORIA con path:riga, esito nel backlog. Sola lettura, i fix si decidono e applicano dopo, fuori dalla skill. Invocare manualmente.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Agent, AskUserQuestion, Bash(git log:*), Bash(git ls-files:*)
---

# Revisiona cartella

Metodologia usata per le revisioni del 2026-07-24 (prisma/api/(main)),
formalizzata perché sia ripetibile. SOLA LETTURA: questa skill produce un
report, mai modifiche al codice.

## Input

L'argomento indica le cartelle da revisionare (es. `components lib`). Senza
argomento: proponi le cartelle non ancora coperte guardando la sezione
"Revisioni da completare" di `BACKLOG.md`, e chiedi conferma.

## Processo

1. **Audit strutturale** della cartella: elenco file, orfani (componenti/moduli
   mai importati — verificare con Grep sugli import, non a occhio), file
   temporanei/duplicati/fuori posto, file tracciati da git che non dovrebbero
   esserlo (`git ls-files`).
2. **Revisione di qualità** per ogni file rilevante, cercando in particolare:
   - bug logici concreti (confronti che non matchano mai, off-by-one, stati
     fuori sync, race condition, errori non gestiti)
   - violazioni dei pattern di CLAUDE.md (prisma singleton, alert(), PM-,
     italiano UI, mapping enum, palette, pattern modal/filter-bar)
   - robustezza: validazione input, error handling, casi vuoti/limite
   Per cartelle grandi, lancia agenti Explore in parallelo (max 3), uno per
   area, con istruzioni specifiche su cosa cercare.
3. **Report** in chat, per area, ordinato per gravità. Ogni finding:
   `path:riga` · problema · impatto · fix suggerito in una riga. Distingui
   esplicitamente **BUG** (comportamento errato) da **MIGLIORIA** (robustezza/
   qualità). Se un'area è pulita, dirlo esplicitamente — non inventare
   findings.
4. **Chiusura**: proponi di aggiornare `BACKLOG.md` con i findings (via
   `/backlog aggiorna` o direttamente su richiesta) e chiedi all'utente quali
   fix affrontare. L'implementazione avviene dopo, nel turno normale, su un
   branch dedicato.

## Vincoli

- Nessun Edit/Write: report soltanto.
- Non ripetere findings già noti in `BACKLOG.md`: citali come "già a backlog".
- Non decidere quali fix applicare: la scelta è dell'utente.
