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
4. **Multi-tenancy** ✅ FATTO — signup pubblico, verifica email + reset password
   (mailer console in dev / SMTP in prod via env), export GDPR
   (`/api/v1/account/export`) e cancellazione account (`DELETE /api/v1/account`,
   in transazione), `/api/v1/me` con entitlements (predisposti per il paywall),
   `tier`/`trialEndsAt` su user. Isolamento per `userId` su tutte le route.
   Verificato end-to-end.
5. **Hosting produzione** ✅ FATTO (artefatti) — migrazioni versionate
   (`drizzle/0000_init.sql` + runner `db:migrate`), Dockerfile multi-stage
   (Next standalone), `docker-compose.prod.yml` (api+db+migrate), `/api/health`,
   `scripts/backup.sh`, CI GitHub Actions, `docs/DEPLOY.md`. Resta da eseguire il
   deploy reale sul server quando si vuole andare online.
6. **App React Native (Expo)** ✅ FATTO (MVP) — `apps/mobile` (Expo SDK 53, RN
   0.79, React 19, Expo Router). Auth (bearer token in SecureStore), dashboard
   del mese, lista turni, nuovo turno con **anteprima live** (motore `@rider/core`
   condiviso), contratti, nuovo contratto da **template piattaforma**
   (Glovo/Deliveroo/occasionale/oraria/contanti), profilo con export+cancellazione
   GDPR. Bundla con Metro (944 moduli, verificato con `expo export`). Monorepo
   pnpm+Metro risolto con `nodeLinker: hoisted` + `shamefullyHoist`. Manca:
   offline/sync e push (estensioni successive).
7. **i18n** — solo IT ora, ma stringhe estratte e struttura multi-valuta pronta.
8. **Pubblicazione store** — account dev Apple/Google, privacy policy/ToS, asset,
   beta TestFlight + Play Internal.
9. **Crescita** — analytics, supporto; attivare il paywall già predisposto.

## Stato attuale del codice

- `packages/core` completo e testato (12 test verdi).
- `packages/db` schema Drizzle sul modello generalizzato (typecheck ok).
- `apps/api` backend Next.js headless: auth bearer, CRUD contratti/turni,
  dashboard, `/me`+entitlements, export/cancellazione GDPR, `/api/health`.
  Isolamento multi-tenant. Verificato end-to-end sulla build di produzione.
- Produzione: migrazioni versionate, Dockerfile, compose prod, CI, backup, deploy
  doc (`docs/DEPLOY.md`).
- `apps/mobile` app Expo (SDK 53) completa come MVP, bundla con Metro. README
  con istruzioni per provarla su telefono via Expo Go.
- Repo GitHub: `git@github.com:lucadevivo/delivery-app.git` (branch `main`).
- **Prossimo: Fase 7 (i18n) / Fase 8 (store)**, oppure rifiniture all'app
  (modifica/cancellazione turni, analitica, offline, push). Per il deploy reale
  del backend vedi `docs/DEPLOY.md`.
