import { z } from "zod"

const sogliaQuest = z.object({
  consegneMin: z.number().nonnegative(),
  bonus: z.number(),
})

export const schemaPagaSchema = z.object({
  oraria: z.number().optional(),
  aTurno: z.number().optional(),
  aConsegna: z.number().optional(),
  aKm: z.number().optional(),
  moltiplicatoreWeekend: z.number().optional(),
  moltiplicatoreFestivo: z.number().optional(),
  quest: z.array(sogliaQuest).optional(),
  minimoGarantito: z.number().optional(),
})

export const schemaFiscaleSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("contanti") }),
  z.object({
    tipo: z.literal("prestazione_occasionale"),
    aliquotaRitenuta: z.number(),
    contributiPerc: z.number().optional(),
    sogliaContributiAnnua: z.number().optional(),
  }),
  z.object({
    tipo: z.literal("co_co_co"),
    aliquotaRitenuta: z.number(),
    contributiPerc: z.number().optional(),
    sogliaContributiAnnua: z.number().optional(),
  }),
  z.object({
    tipo: z.literal("partita_iva_forfettario"),
    coefficienteRedditivita: z.number(),
    impostaSostitutiva: z.number(),
    contributiPerc: z.number(),
  }),
  z.object({
    tipo: z.literal("partita_iva_ordinario"),
    aliquotaStimata: z.number(),
    contributiPerc: z.number(),
  }),
  z.object({
    tipo: z.literal("subordinato"),
    aliquotaStimata: z.number(),
  }),
])

const tipoContratto = z.enum([
  "contanti",
  "prestazione_occasionale",
  "co_co_co",
  "partita_iva_forfettario",
  "partita_iva_ordinario",
  "subordinato",
])

export const contrattoInputSchema = z.object({
  nome: z.string().min(1),
  tipo: tipoContratto,
  paese: z.literal("IT").default("IT"),
  paga: schemaPagaSchema,
  fiscale: schemaFiscaleSchema,
  colore: z.string().optional(),
})

export const contrattoPatchSchema = contrattoInputSchema.partial().extend({
  archiviato: z.boolean().optional(),
})

export const turnoInputSchema = z.object({
  contrattoId: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve essere YYYY-MM-DD"),
  ore: z.number().nonnegative().optional(),
  consegne: z.number().int().nonnegative().optional(),
  km: z.number().nonnegative().optional(),
  mance: z.number().nonnegative().optional(),
  festivo: z.boolean().optional(),
  note: z.string().optional(),
})

export const turnoPatchSchema = turnoInputSchema.partial()
