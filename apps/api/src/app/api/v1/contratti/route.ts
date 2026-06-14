import { NextResponse } from "next/server"
import { and, desc, eq } from "drizzle-orm"
import type { SchemaFiscale, SchemaPaga } from "@rider/core"
import { contratti } from "@rider/db"
import { db } from "@/lib/db"
import { badRequest, getUserId, unauthorized } from "@/lib/session"
import { contrattoInputSchema } from "@/lib/validation"

// GET /api/v1/contratti — lista dei contratti dell'utente (non archiviati).
export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const rows = await db
    .select()
    .from(contratti)
    .where(and(eq(contratti.userId, userId), eq(contratti.archiviato, false)))
    .orderBy(desc(contratti.createdAt))

  return NextResponse.json({ contratti: rows })
}

// POST /api/v1/contratti — crea un contratto.
export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const parsed = contrattoInputSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest("Dati non validi", parsed.error.issues)
  const input = parsed.data

  const [row] = await db
    .insert(contratti)
    .values({
      id: crypto.randomUUID(),
      userId,
      nome: input.nome,
      tipo: input.tipo,
      paese: input.paese,
      paga: input.paga as SchemaPaga,
      fiscale: input.fiscale as SchemaFiscale,
      colore: input.colore,
    })
    .returning()

  return NextResponse.json({ contratto: row }, { status: 201 })
}
