import { NextResponse } from "next/server"
import { auth } from "./auth"

// Estrae lo userId autenticato dalla richiesta (cookie di sessione o bearer token).
// Ritorna null se non autenticato.
export async function getUserId(req: Request): Promise<string | null> {
  const s = await auth.api.getSession({ headers: req.headers })
  return s?.user.id ?? null
}

// Helper: risponde 401 in modo uniforme.
export function unauthorized() {
  return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 })
}

export function notFound() {
  return NextResponse.json({ error: "Non trovato" }, { status: 404 })
}
