import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer } from "better-auth/plugins"
import { account, session, user, verification } from "@rider/db"
import { db } from "./db"
import { sendEmail } from "./mailer"

// La verifica email è obbligatoria in produzione (env), facoltativa in dev
// (così i test non richiedono un provider SMTP).
const requireEmailVerification =
  process.env.REQUIRE_EMAIL_VERIFICATION === "true"

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
    requireEmailVerification,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reimposta la password",
        text: `Ciao ${user.name}, reimposta la tua password qui:\n${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Conferma il tuo indirizzo email",
        text: `Ciao ${user.name}, conferma la tua email qui:\n${url}`,
      })
    },
  },
  // Cancellazione account (GDPR): abilitata, gestita dall'endpoint dedicato che
  // ripulisce anche i dati applicativi in transazione.
  user: { deleteUser: { enabled: true } },
  plugins: [bearer()],
})

export type Auth = typeof auth
