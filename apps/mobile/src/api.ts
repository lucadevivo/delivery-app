import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"
import type {
  Contratto,
  RisultatoCalcolo,
  SchemaFiscale,
  SchemaPaga,
  TipoContratto,
} from "@rider/core"

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  "http://localhost:4000"

const TOKEN_KEY = "rider_token"

// ---- Token (bearer) salvato in modo sicuro sul dispositivo ----
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}
async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (options.auth !== false) {
    const token = await getToken()
    if (token) headers["authorization"] = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    let msg = `Errore ${res.status}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {}
    throw new ApiError(res.status, msg)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// Traduce in italiano i codici d'errore di Better Auth, così l'utente vede il
// motivo reale invece di un generico "fallito".
async function authError(res: Response, fallback: string): Promise<ApiError> {
  let code = ""
  let message = ""
  try {
    const j = await res.json()
    code = String(j?.code ?? "")
    message = String(j?.message ?? "")
  } catch {}
  const map: Record<string, string> = {
    PASSWORD_TOO_SHORT: "La password deve avere almeno 8 caratteri.",
    PASSWORD_TOO_LONG: "Password troppo lunga.",
    USER_ALREADY_EXISTS: "Esiste già un account con questa email.",
    INVALID_EMAIL: "Email non valida.",
    INVALID_EMAIL_OR_PASSWORD: "Email o password non corretti.",
    VALIDATION_ERROR:
      "Controlla i dati: email valida e password di almeno 8 caratteri.",
  }
  return new ApiError(res.status, map[code] || message || fallback)
}

// ---- Auth ----
export async function signUp(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) throw await authError(res, "Registrazione fallita")
  const token = res.headers.get("set-auth-token")
  if (token) await setToken(token)
  return res.json()
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw await authError(res, "Credenziali non valide")
  const token = res.headers.get("set-auth-token")
  if (token) await setToken(token)
  return res.json()
}

export async function signOut() {
  await clearToken()
}

// ---- Tipi di risposta ----
export interface Me {
  user: { id: string; name: string; email: string; emailVerified: boolean }
  entitlements: { tier: string; [k: string]: unknown }
}
export interface Dashboard {
  mese: string
  turni: number
  consegne: number
  lordo: number
  trattenute: number
  netto: number
  mance: number
  totale: number
}
export interface TurnoRow {
  id: string
  contrattoId: string
  contrattoNome: string
  data: string
  ore: number | null
  consegne: number | null
  km: number | null
  mance: number | null
  festivo: boolean
  note: string | null
  risultato: RisultatoCalcolo
}

// ---- Endpoint applicativi ----
export const api = {
  me: () => request<Me>("/api/v1/me"),
  dashboard: (mese: string) =>
    request<Dashboard>(`/api/v1/dashboard?mese=${mese}`),
  listContratti: () =>
    request<{ contratti: Contratto[] }>("/api/v1/contratti"),
  createContratto: (input: {
    nome: string
    tipo: TipoContratto
    paga: SchemaPaga
    fiscale: SchemaFiscale
    colore?: string
  }) => request<{ contratto: Contratto }>("/api/v1/contratti", {
    method: "POST",
    body: input,
  }),
  getContratto: (id: string) =>
    request<{ contratto: Contratto }>(`/api/v1/contratti/${id}`),
  updateContratto: (
    id: string,
    patch: Partial<{
      nome: string
      colore: string
      tipo: TipoContratto
      paga: SchemaPaga
      fiscale: SchemaFiscale
    }>,
  ) =>
    request<{ contratto: Contratto }>(`/api/v1/contratti/${id}`, {
      method: "PATCH",
      body: patch,
    }),
  deleteContratto: (id: string) =>
    request<{ ok: true }>(`/api/v1/contratti/${id}`, { method: "DELETE" }),
  deleteTurno: (id: string) =>
    request<{ ok: true }>(`/api/v1/turni/${id}`, { method: "DELETE" }),
  listTurni: (mese?: string) =>
    request<{ turni: TurnoRow[] }>(
      `/api/v1/turni${mese ? `?mese=${mese}` : ""}`,
    ),
  createTurno: (input: {
    contrattoId: string
    data: string
    ore?: number
    consegne?: number
    km?: number
    mance?: number
    festivo?: boolean
    note?: string
  }) => request<{ turno: TurnoRow }>("/api/v1/turni", {
    method: "POST",
    body: input,
  }),
  exportUrl: () => `${API_URL}/api/v1/account/export`,
  deleteAccount: () => request<{ ok: true }>("/api/v1/account", { method: "DELETE" }),
}
