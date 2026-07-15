---
name: pianifica
description: Sessione di design/planning strutturata per una nuova feature o modifica non banale in pants-manager — raccoglie requisiti con domande mirate, verifica i pattern esistenti nel codebase, produce un "prompt compatto" pronto per l'implementazione. Invocare esplicitamente con /pianifica; non per bugfix ovvi o micro-modifiche (CLAUDE.md: "Q&A prima del codice solo se la richiesta è ambigua").
disable-model-invocation: true
allowed-tools: AskUserQuestion, Read, Grep, Glob
---

# Pianifica

Sostituisce la fase di design Q&A che avveniva su Claude.ai — ora dentro Claude Code, prima di scrivere codice. Questa skill NON scrive né modifica file: produce solo un brief.

## Quando usarla

- Feature nuove o modifiche con scope ambiguo.
- Non per fix ovvi, non per micro-modifiche di naming/struttura interna (quelle restano autonomia del main agent per regola CLAUDE.md).

## Processo

1. Leggi la richiesta (l'argomento passato a `/pianifica`, altrimenti chiedi "Cosa vuoi costruire?").
2. Esplora il codebase per pattern pertinenti già esistenti (Grep/Read su `app/`, `components/`, `prisma/schema.prisma`) — mai assumere prima di aver verificato. Cita nel brief i componenti/route riutilizzabili trovati invece di riproporre da zero (es. `NotificationBanner`, mapping enum `*_MAP`, pattern modal con `createPortal`).
3. Usa `AskUserQuestion` a batch (poche domande per volta, non tutte insieme), per chiarire:
   - Scope esatto (dentro/fuori).
   - Decisioni UI: pagina nuova vs modal vs sezione esistente; quali campi; quali enum/stati coinvolti.
   - Edge case: stati vuoti, permessi, validazioni, dati mancanti.
   - Impatto DB: nuovo campo/tabella Prisma? Se sì, segnalalo esplicitamente nel brief finale (richiede conferma utente per regola CLAUDE.md, sezione Workflow — "modifiche schema DB").
4. Verifica coerenza con le convenzioni di progetto: italiano UI, `GS-xxx`, palette, pattern modal/filter-bar, mapping enum→italiano.
5. Produci il brief finale nell'esatto formato "prompt compatto" di CLAUDE.md:
   - Obiettivo breve (1 riga).
   - File da toccare (elenco path).
   - Punti implementativi chiave (bullet, niente snippet lunghi).
   - 1-3 criteri di accettazione.
6. Fine skill: consegna il brief in chat. L'implementazione vera e propria avviene dopo, nel turno normale (non da questa skill).

## Vincoli

- Nessuna scrittura di codice in questa fase (garantito anche strutturalmente: nessun Edit/Write tra i tool ammessi).
- Se la richiesta tocca schema DB/RLS, il brief deve dirlo esplicitamente.
- Se esistono componenti/route riutilizzabili, citali nel brief invece di riproporre da zero.
