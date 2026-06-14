import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

// GET /api/health — liveness + check connessione DB (per monitoring/uptime).
export async function GET() {
  try {
    await db.execute(sql`select 1`)
    return NextResponse.json({ status: "ok", db: "up" })
  } catch {
    return NextResponse.json({ status: "degraded", db: "down" }, { status: 503 })
  }
}
