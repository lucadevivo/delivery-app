import { NextResponse } from "next/server"
import { and, eq, like } from "drizzle-orm"
import { arrotonda } from "@rider/core"
import { turni } from "@rider/db"
import { db } from "@/lib/db"
import { getUserId, unauthorized } from "@/lib/session"

// GET /api/v1/dashboard?mese=YYYY-MM — aggregati del periodo (default: mese corrente).
export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const url = new URL(req.url)
  const mese = url.searchParams.get("mese") ?? new Date().toISOString().slice(0, 7)

  const rows = await db
    .select({ risultato: turni.risultato, consegne: turni.consegne })
    .from(turni)
    .where(and(eq(turni.userId, userId), like(turni.data, `${mese}-%`)))

  const tot = rows.reduce(
    (acc, r) => {
      const x = r.risultato
      acc.lordo += x.lordo
      acc.trattenute += x.totaleTrattenute
      acc.netto += x.netto
      acc.mance += x.mance
      acc.totale += x.totale
      acc.consegne += r.consegne ?? 0
      return acc
    },
    { lordo: 0, trattenute: 0, netto: 0, mance: 0, totale: 0, consegne: 0 },
  )

  return NextResponse.json({
    mese,
    turni: rows.length,
    consegne: tot.consegne,
    lordo: arrotonda(tot.lordo),
    trattenute: arrotonda(tot.trattenute),
    netto: arrotonda(tot.netto),
    mance: arrotonda(tot.mance),
    totale: arrotonda(tot.totale),
  })
}
