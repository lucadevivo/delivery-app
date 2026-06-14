import { createDb, type Database } from "@rider/db"

// Singleton del client DB (riusa la pool tra le richieste in dev con HMR).
const globalForDb = globalThis as unknown as { __riderDb?: Database }

function getConnectionString(): string {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL non impostata")
  return url
}

export const db: Database =
  globalForDb.__riderDb ?? createDb(getConnectionString())

if (process.env.NODE_ENV !== "production") globalForDb.__riderDb = db
