import { defineConfig } from "drizzle-kit"

// La connection string arriva da env; nessun valore cablato.
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
