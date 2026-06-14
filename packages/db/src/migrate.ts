import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

// Applica le migrazioni SQL versionate (cartella ./drizzle) al database.
// Da usare in produzione/CI al posto di `db:push` (che è solo per lo sviluppo).
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL non impostata")

  const migrationsFolder = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "drizzle",
  )

  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool)
  console.log("Applico le migrazioni da", migrationsFolder)
  await migrate(db, { migrationsFolder })
  await pool.end()
  console.log("Migrazioni applicate.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
