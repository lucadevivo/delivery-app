import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import type { SchemaFiscale, SchemaPaga } from "@rider/core"
import { contratti } from "@rider/db"
import { db } from "@/lib/db"
import {
  badRequest,
  getUserId,
  notFound,
  unauthorized,
} from "@/lib/session"
import { contrattoPatchSchema } from "@/lib/validation"

type Params = { params: Promise<{ id: string }> }

async function own(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(contratti)
    .where(and(eq(contratti.id, id), eq(contratti.userId, userId)))
  return row
}

export async function GET(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  const row = await own(userId, id)
  if (!row) return notFound()
  return NextResponse.json({ contratto: row })
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  if (!(await own(userId, id))) return notFound()

  const parsed = contrattoPatchSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest("Dati non validi", parsed.error.issues)
  const p = parsed.data

  const [row] = await db
    .update(contratti)
    .set({
      ...(p.nome !== undefined && { nome: p.nome }),
      ...(p.tipo !== undefined && { tipo: p.tipo }),
      ...(p.paga !== undefined && { paga: p.paga as SchemaPaga }),
      ...(p.fiscale !== undefined && { fiscale: p.fiscale as SchemaFiscale }),
      ...(p.colore !== undefined && { colore: p.colore }),
      ...(p.archiviato !== undefined && { archiviato: p.archiviato }),
    })
    .where(and(eq(contratti.id, id), eq(contratti.userId, userId)))
    .returning()

  return NextResponse.json({ contratto: row })
}

// DELETE: archivia invece di cancellare, per non perdere lo storico dei turni
// che lo referenziano (FK onDelete: restrict).
export async function DELETE(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  if (!(await own(userId, id))) return notFound()

  await db
    .update(contratti)
    .set({ archiviato: true })
    .where(and(eq(contratti.id, id), eq(contratti.userId, userId)))

  return NextResponse.json({ ok: true })
}
