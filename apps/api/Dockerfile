# Immagine di produzione per @rider/api (Next.js standalone, monorepo pnpm).
# Build dal ROOT del repo:  docker build -f apps/api/Dockerfile -t rider-api .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

# --- deps: installa con la lockfile dell'intero workspace ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

# --- build: compila core e l'app Next ---
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @rider/core build
RUN pnpm --filter @rider/api build

# --- runner: solo l'output standalone ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /repo/apps/api/.next/standalone ./
COPY --from=build /repo/apps/api/.next/static ./apps/api/.next/static
USER app
EXPOSE 4000
CMD ["node", "apps/api/server.js"]
