import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useColorScheme } from "react-native"
import * as SecureStore from "expo-secure-store"

export type Scheme = "light" | "dark"

export interface Palette {
  scheme: Scheme
  bg: string
  card: string
  border: string
  text: string
  muted: string
  accent: string
  danger: string
  good: string
  primaryFg: string
  // glass / superfici
  blurTint: "light" | "dark"
  cardOverlay: string
  cardBorder: string
  inputBg: string
  segBg: string
  shadow: string
  // sfondo a gradiente
  grad1: string
  grad2: string
}

const light: Palette = {
  scheme: "light",
  bg: "#f9f4f0",
  card: "#fefbf9",
  border: "#dcd6d1",
  text: "#2a1f1a",
  muted: "#7e6e65",
  accent: "#993a31",
  danger: "#c53637",
  good: "#547e4b",
  primaryFg: "#fbf8f5",
  blurTint: "light",
  cardOverlay: "rgba(254,251,249,0.4)",
  cardBorder: "rgba(255,255,255,0.6)",
  inputBg: "rgba(255,255,255,0.65)",
  segBg: "rgba(255,255,255,0.55)",
  shadow: "#2a1f1a",
  grad1: "rgba(153,58,49,0.14)",
  grad2: "rgba(180,117,72,0.13)",
}

const dark: Palette = {
  scheme: "dark",
  bg: "#17130f",
  card: "#241e17",
  border: "#39312a",
  text: "#f3ebe2",
  muted: "#a79a8d",
  accent: "#cf6354",
  danger: "#e2675f",
  good: "#79ad67",
  primaryFg: "#fdf6f2",
  blurTint: "dark",
  cardOverlay: "rgba(36,30,23,0.45)",
  cardBorder: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.06)",
  segBg: "rgba(255,255,255,0.06)",
  shadow: "#000000",
  grad1: "rgba(207,99,84,0.20)",
  grad2: "rgba(180,117,72,0.13)",
}

const STORE_KEY = "rider_theme"

interface ThemeState {
  c: Palette
  scheme: Scheme
  toggle: () => void
}

const Ctx = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const [override, setOverride] = useState<Scheme | null>(null)

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then((v) => {
      if (v === "light" || v === "dark") setOverride(v)
    })
  }, [])

  const scheme: Scheme = override ?? (system === "dark" ? "dark" : "light")
  const c = scheme === "dark" ? dark : light

  const toggle = () => {
    const next: Scheme = scheme === "dark" ? "light" : "dark"
    setOverride(next)
    SecureStore.setItemAsync(STORE_KEY, next).catch(() => {})
  }

  return <Ctx.Provider value={{ c, scheme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useTheme fuori da ThemeProvider")
  return ctx
}

// Palette statica di fallback (tema chiaro) per eventuali usi fuori da React.
export const colors = light
