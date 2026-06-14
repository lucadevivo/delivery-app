import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { contratti, turni, user } from "@rider/db"
import { db } from "@/lib/db"
import { getUserId, unauthorized } from "@/lib/session"

// GET /api/v1/account/export — esporta tutti i dati dell'utente (GDPR, art. 20).
export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const [profilo] = await db.select().from(user).where(eq(user.id, userId))
  const contrattiRows = await db
    .select()
    .from(contratti)
    .where(eq(contratti.userId, userId))
  const turniRows = await db.select().from(turni).where(eq(turni.userId, userId))

  const payload = {
    esportatoIl: new Date().toISOString(),
    profilo: profilo && {
      id: profilo.id,
      name: profilo.name,
      email: profilo.email,
      createdAt: profilo.createdAt,
    },
    contratti: contrattiRows,
    turni: turniRows,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="rider-dati.json"',
    },
  })
}
