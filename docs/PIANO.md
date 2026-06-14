# Piano: da webapp personale a app pubblica per rider

## Decisioni di prodotto (prese)

- **Mobile**: React Native (Expo) — riscrittura del frontend. La logica di
  valore (modello dati + motore fiscale) vive nel backend / package condiviso.
- **Monetizzazione**: gratis al lancio (niente IAP). Predisporre `tier` +
  feature flag per attivare più avanti trial / una tantum / funzioni premium.
- **Mercato**: solo Italia al lancio. Schemi fiscali modellati come dati
  per-nazione (`paese: "IT"`) così aggiungere paesi non richiede rifare il motore.

## Punto legale (fatto a monte)

Prodotto = registro contabile personale del rider. Mai linguaggio di "evasione".
Servono Privacy Policy + ToS + conformità GDPR dal lancio (dati economici).

## Roadmap per fasi (ordine definitivo)

1. **Monorepo + `@rider/core`** ✅ FATTO — modello di dominio + motore di calcolo
   fiscale con test per ogni regime italiano. Riusato da backend e app RN.
2. **Modello dati generalizzato** ✅ FATTO — `@rider/core` (schema paga
   componibile + schemi fiscali) e `@rider/db` (Drizzle: contratti con
   paga/fiscale jsonb tipizzati, turni con snapshot del calcolo, user con
   tier/trialEndsAt per il paywall futuro). NB: nessuna migrazione dei dati
   reali (scelta dell'utente).
3. **Backend API** ✅ FATTO — `apps/api` (Next.js headless): Better Auth
   email+password con bearer token (per il mobile), CRUD `/api/v1/contratti` e
   `/api/v1/turni` (calcolo server-side col motore + snapshot), `/api/v1/dashboard`.
   Tutto isolato per utente. Verificato end-to-end con Postgres reale (signup,
   guardia 401, calcolo turni, dashboard, isolamento multi-tenant).
4. **Multi-tenancy** — signup pubblico (rimuovere blocco middleware), verifica
   email, reset password, export + cancellazione GDPR, audit isolamento `userId`,
   campo `tier` + feature flag.
5. **Hosting produzione** — Postgres gestito + backup + monitoring (Sentry).
6. **App React Native (Expo)** — onboarding/wizard con template piattaforme
   (Glovo, Deliveroo, Just Eat, Uber Eats, pizzerie a contanti), schermate
   turni/dashboard/analitica, offline base, push.
7. **i18n** — solo IT ora, ma stringhe estratte e struttura multi-valuta pronta.
8. **Pubblicazione store** — account dev Apple/Google, privacy policy/ToS, asset,
   beta TestFlight + Play Internal.
9. **Crescita** — analytics, supporto; attivare il paywall già predisposto.

## Stato attuale del codice

- `packages/core` completo e testato (12 test verdi).
- `packages/db` schema Drizzle sul modello generalizzato (typecheck ok).
- `apps/api` backend Next.js headless: auth bearer + CRUD contratti/turni +
  dashboard, isolamento multi-tenant. Verificato end-to-end. README con avvio
  locale (docker compose Postgres su 5434, `pnpm --filter @rider/api dev` su 4000).
- Repo GitHub: `git@github.com:lucadevivo/delivery-app.git` (branch `main`).
- **Prossimo: Fase 6 — app React Native (Expo)** che consuma queste API. È il
  primo punto in cui l'app sarà mostrabile sul telefono (vedi feedback utente:
  niente UI browser di test). Prima dell'app si può fare Fase 4 (verifica
  email/reset password/GDPR) e Fase 5 (hosting), ma per "vederla sul telefono"
  conviene andare diretti sull'app RN puntandola al backend locale.
