import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer } from "better-auth/plugins"
import { account, session, user, verification } from "@rider/db"
import { db } from "./db"

// Better Auth: email+password con registrazione pubblica (multi-tenant).
// Il plugin bearer abilita l'autenticazione via token, necessaria per l'app
// React Native che non usa i cookie del browser.
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // Verifica email da attivare in Fase 4 (serve provider SMTP).
    requireEmailVerification: false,
  },
  plugins: [bearer()],
})

export type Auth = typeof auth
