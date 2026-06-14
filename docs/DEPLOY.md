# Deploy in produzione

Pattern allineato a quello già in uso (Docker compose + Cloudflare Tunnel, senza
sudo, tutto in container).

## Prerequisiti

- Docker + Docker Compose sul server
- Un dominio per l'API (es. `api.rider.app`) esposto via Cloudflare Tunnel
- (Consigliato) Postgres gestito con backup automatici, oppure il servizio `db`
  del compose + backup via `scripts/backup.sh`

## Passi

```bash
# 1. Configura le variabili
cp apps/api/.env.prod.example apps/api/.env
# genera il secret:  openssl rand -base64 32  → BETTER_AUTH_SECRET
# imposta DATABASE_URL, BETTER_AUTH_URL, SMTP_*

# 2. Build + avvio
cd apps/api
docker compose -f docker-compose.prod.yml up -d --build

# 3. Migrazioni (a ogni deploy che cambia lo schema)
docker compose -f docker-compose.prod.yml run --rm migrate
```

L'API ascolta sulla porta 4000: puntaci il Cloudflare Tunnel.

## Migrazioni

- Sviluppo: `pnpm --filter @rider/db db:push` (sincronizza al volo).
- Produzione/CI: `pnpm --filter @rider/db db:generate` per creare il file SQL
  versionato (cartella `packages/db/drizzle/`), poi `db:migrate` per applicarlo.
  **Le migrazioni vanno committate.**

## Backup

```bash
DATABASE_URL=postgresql://... ./scripts/backup.sh /percorso/backups
```

Pianificabile via cron (dump compresso giornaliero, rotazione 14 giorni). Con un
Postgres gestito, usare i backup/PITR del provider.

## Monitoring

- `GET /api/health` → liveness + check connessione DB (per uptime checks).
- Error tracking (es. Sentry) da aggiungere quando serve: wrappare le route o
  usare l'instrumentation hook di Next; nessuna dipendenza inclusa per ora.

## CI

`.github/workflows/ci.yml`: install → build core → typecheck → test → build API
a ogni push/PR su `main`.

## Note dev (ambiente locale)

Il dev di Next usa turbopack: su macchine sotto carico può capitare un
`Cannot find module` intermittente dovuto a chunk parziali. Rimedio:
`rm -rf apps/api/.next` e riavviare, oppure verificare con la build di
produzione (`pnpm --filter @rider/api build`) che è deterministica.
