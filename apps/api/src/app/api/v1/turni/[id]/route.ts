import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import type { Turno } from "@rider/core"
import { contratti, turni, type TurnoRow } from "@rider/db"
import { db } from "@/lib/db"
import { badRequest, getUserId, notFound, unauthorized } from "@/lib/session"
import { turnoPatchSchema } from "@/lib/validation"
import { calcolaRisultato } from "@/lib/turni-calc"

type Params = { params: Promise<{ id: string }> }

async function own(userId: string, id: string): Promise<TurnoRow | undefined> {
  const [row] = await db
    .select()
    .from(turni)
    .where(and(eq(turni.id, id), eq(turni.userId, userId)))
  return row
}

export async function GET(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  const row = await own(userId, id)
  if (!row) return notFound()
  return NextResponse.json({ turno: row })
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  const esistente = await own(userId, id)
  if (!esistente) return notFound()

  const parsed = turnoPatchSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest("Dati non validi", parsed.error.issues)
  const p = parsed.data

  // Stato risultante dopo la patch (per ricalcolare il risultato).
  const contrattoId = p.contrattoId ?? esistente.contrattoId
  const [contratto] = await db
    .select()
    .from(contratti)
    .where(and(eq(contratti.id, contrattoId), eq(contratti.userId, userId)))
  if (!contratto) return notFound()

  const turno: Turno = {
    data: p.data ?? esistente.data,
    ore: p.ore ?? esistente.ore ?? undefined,
    consegne: p.consegne ?? esistente.consegne ?? undefined,
    km: p.km ?? esistente.km ?? undefined,
    mance: p.mance ?? esistente.mance ?? undefined,
    festivo: p.festivo ?? esistente.festivo,
  }
  const risultato = await calcolaRisultato(userId, contratto, turno, id)

  const [row] = await db
    .update(turni)
    .set({
      contrattoId: contratto.id,
      contrattoNome: contratto.nome,
      data: turno.data,
      ore: turno.ore,
      consegne: turno.consegne,
      km: turno.km,
      mance: turno.mance,
      festivo: turno.festivo ?? false,
      ...(p.note !== undefined && { note: p.note }),
      risultato,
    })
    .where(and(eq(turni.id, id), eq(turni.userId, userId)))
    .returning()

  return NextResponse.json({ turno: row })
}

export async function DELETE(req: Request, { params }: Params) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params
  if (!(await own(userId, id))) return notFound()

  await db.delete(turni).where(and(eq(turni.id, id), eq(turni.userId, userId)))
  return NextResponse.json({ ok: true })
}
