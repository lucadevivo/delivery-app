# rider-app

App per **rider** (tutti, non solo io): registro dei guadagni multi-contratto e
multi-piattaforma, con calcolo fiscale italiano. Evoluzione generalizzata della
webapp personale dei turni (`turn-creation-screen`), pensata per essere pubblicata
sugli store come app **React Native**.

> ⚠️ Questo è un repo **nuovo e separato**. Non sostituisce la webapp attuale.

## Inquadramento

È un **registro contabile personale**: il rider annota quello che guadagna,
comunque venga pagato (incluso il contante / non tassato). Non è uno strumento
per evadere: traccia i guadagni reali e stima quanto accantonare per le tasse.

## Monorepo (pnpm workspace)

```
packages/
  core/        @rider/core — modello di dominio + motore di calcolo fiscale
               (condiviso tra backend e app mobile)
apps/          (in arrivo) backend API + app React Native
```

## @rider/core — cosa c'è già (Fase 1)

Separa tre concetti che nella prima app erano cablati insieme:

1. **Tipo di contratto** — contanti, prestazione occasionale, co.co.co, P.IVA
   forfettario, P.IVA ordinario, subordinato.
2. **Schema di paga** componibile — a ora / a turno / a consegna / a km +
   moltiplicatori weekend/festivo + bonus quest + minimo garantito.
3. **Schema fiscale** — ritenuta d'acconto configurabile, forfettario
   (coefficiente + imposta sostitutiva + INPS), ordinario, contanti (zero tasse).

Il motore (`calcolaTurno`) produce una **stima/accantonamento per turno**
(l'IRPEF reale è annuale e progressiva).

```bash
pnpm install
pnpm -r test        # 13 test sui regimi italiani
pnpm -r typecheck
pnpm -r build
```

## Roadmap

Vedi [`docs/PIANO.md`](docs/PIANO.md) per il piano completo per fasi.
Decisioni di prodotto prese: app **React Native (Expo)**, gratis al lancio con
paywall predisposto per dopo, mercato **solo Italia** (modello dati per-nazione).
