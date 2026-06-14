import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import type {
  RisultatoCalcolo,
  SchemaFiscale,
  SchemaPaga,
  TipoContratto,
} from "@rider/core"

// ---- Better Auth (colonne camelCase come da default Better Auth) ----

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  // Piano di abbonamento: predisposto per il paywall futuro (gratis al lancio).
  tier: text("tier").notNull().default("free"), // "free" | "pro"
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---- App: tutto scoped per userId (multi-tenant) ----

// Contratto = piattaforma/datore + schema paga + schema fiscale.
// paga e fiscale sono jsonb tipizzati con i tipi di @rider/core: il modello è
// variabile (unione discriminata) e questo evita decine di colonne nullable.
export const contratti = pgTable("contratti", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  tipo: text("tipo").$type<TipoContratto>().notNull(),
  paese: text("paese").notNull().default("IT"),
  paga: jsonb("paga").$type<SchemaPaga>().notNull(),
  fiscale: jsonb("fiscale").$type<SchemaFiscale>().notNull(),
  colore: text("colore"),
  archiviato: boolean("archiviato").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Turno = input grezzi di una sessione + snapshot del calcolo al salvataggio.
// Lo snapshot (risultato + contrattoNome) preserva lo storico anche se in
// seguito il contratto cambia tariffe — come faceva la prima app con postoNome.
export const turni = pgTable("turni", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  contrattoId: text("contrattoId")
    .notNull()
    .references(() => contratti.id, { onDelete: "restrict" }),
  contrattoNome: text("contrattoNome").notNull(),
  data: text("data").notNull(), // YYYY-MM-DD
  ore: real("ore"),
  consegne: integer("consegne"),
  km: real("km"),
  mance: real("mance"),
  festivo: boolean("festivo").notNull().default(false),
  note: text("note"),
  risultato: jsonb("risultato").$type<RisultatoCalcolo>().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type ContrattoRow = typeof contratti.$inferSelect
export type TurnoRow = typeof turni.$inferSelect
export type UserRow = typeof user.$inferSelect
