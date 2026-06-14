# @rider/api — backend API

Backend headless (Next.js, solo route `/api`) consumato dall'app React Native.
Nessuna UI: l'autenticazione usa Better Auth con **bearer token** (adatto al mobile).

## Avvio in locale

```bash
# 1. Postgres di sviluppo (porta 5434)
docker compose up -d

# 2. Variabili d'ambiente
cp .env.example .env.local   # i default puntano già al Postgres del compose

# 3. Applica lo schema al DB
pnpm --filter @rider/db db:push   # legge DATABASE_URL

# 4. Avvia l'API (porta 4000)
pnpm --filter @rider/api dev
```

## Endpoint

| Metodo | Path | Note |
|--------|------|------|
| POST | `/api/auth/sign-up/email` | `{ email, password, name }` → token in header `set-auth-token` |
| POST | `/api/auth/sign-in/email` | login |
| GET/POST | `/api/v1/contratti` | lista / crea contratto |
| GET/PATCH/DELETE | `/api/v1/contratti/:id` | DELETE = archivia (preserva lo storico) |
| GET/POST | `/api/v1/turni` | lista (`?mese=YYYY-MM`, `?contrattoId=`) / crea |
| GET/PATCH/DELETE | `/api/v1/turni/:id` | il calcolo è rifatto dal motore `@rider/core` |
| GET | `/api/v1/dashboard?mese=YYYY-MM` | aggregati del periodo |

Tutte le route `/api/v1/*` richiedono `Authorization: Bearer <token>` e sono
isolate per utente (multi-tenant). Il calcolo di lordo/tasse/netto avviene
server-side col motore condiviso e viene salvato come snapshot sul turno.
