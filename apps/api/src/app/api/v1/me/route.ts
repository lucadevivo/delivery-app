import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { user } from "@rider/db"
import { db } from "@/lib/db"
import { getUserId, unauthorized } from "@/lib/session"
import { entitlementsFor } from "@/lib/entitlements"

// GET /api/v1/me — profilo dell'utente autenticato + entitlements (per il client).
export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return unauthorized()

  const [row] = await db.select().from(user).where(eq(user.id, userId))
  if (!row) return unauthorized()

  return NextResponse.json({
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
    },
    entitlements: entitlementsFor(row.tier, row.trialEndsAt),
  })
}
