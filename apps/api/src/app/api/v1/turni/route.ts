import { NextResponse } from "next/server"
import { and, desc, eq, like } from "drizzle-orm"
import type { Turno } from "@rider/core"
import { contratti, turni } from "@rider/db"
import { db } from "@/lib/db"
import { badRequest, getUserId, notFound, unauthorized } from "@/lib/session"
import { turnoInputSchema } from "@/lib/validation"
import { calcolaRisultato } from "@/lib/turni-calc"

// GET /api/v1/turni?mese=YYYY-MM&contrattoId=... — lista turni (filtri opzionali).
export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const url = new URL(req.url)
  const mese = url.searchParams.get("mese")
  const contrattoId = url.searchParams.get("contrattoId")

  const conds = [eq(turni.userId, userId)]
  if (mese) conds.push(like(turni.data, `${mese}-%`))
  if (contrattoId) conds.push(eq(turni.contrattoId, contrattoId))

  const rows = await db
    .select()
    .from(turni)
    .where(and(...conds))
    .orderBy(desc(turni.data), desc(turni.createdAt))

  return NextResponse.json({ turni: rows })
}

// POST /api/v1/turni — crea un turno calcolando lordo/tasse/netto via @rider/core.
export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const parsed = turnoInputSchema.safeParse(await req.json())
  if (!parsed.success) return badRequest("Dati non validi", parsed.error.issues)
  const input = parsed.data

  const [contratto] = await db
    .select()
    .from(contratti)
    .where(and(eq(contratti.id, input.contrattoId), eq(contratti.userId, userId)))
  if (!contratto) return notFound()

  const turno: Turno = {
    data: input.data,
    ore: input.ore,
    consegne: input.consegne,
    km: input.km,
    mance: input.mance,
    festivo: input.festivo ?? false,
  }
  const risultato = await calcolaRisultato(userId, contratto, turno)

  const [row] = await db
    .insert(turni)
    .values({
      id: crypto.randomUUID(),
      userId,
      contrattoId: contratto.id,
      contrattoNome: contratto.nome,
      data: input.data,
      ore: input.ore,
      consegne: input.consegne,
      km: input.km,
      mance: input.mance,
      festivo: input.festivo ?? false,
      note: input.note,
      risultato,
    })
    .returning()

  return NextResponse.json({ turno: row }, { status: 201 })
}
