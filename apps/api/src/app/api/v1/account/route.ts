import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { contratti, turni, user } from "@rider/db"
import { db } from "@/lib/db"
import { getUserId, unauthorized } from "@/lib/session"

// DELETE /api/v1/account — cancellazione account (GDPR, diritto all'oblio).
// In transazione: prima i turni (FK restrict verso contratti), poi i contratti,
// infine l'utente (sessioni/account Better Auth spariscono per cascade).
export async function DELETE(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  await db.transaction(async (tx) => {
    await tx.delete(turni).where(eq(turni.userId, userId))
    await tx.delete(contratti).where(eq(contratti.userId, userId))
    await tx.delete(user).where(eq(user.id, userId))
  })

  return NextResponse.json({ ok: true })
}
