import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { api, getToken, signIn, signOut, signUp } from "./api"

interface AuthState {
  loading: boolean
  signedIn: boolean
  name: string | null
  refresh: () => Promise<void>
  doSignIn: (email: string, password: string) => Promise<void>
  doSignUp: (email: string, password: string, name: string) => Promise<void>
  doSignOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [name, setName] = useState<string | null>(null)

  async function refresh() {
    const token = await getToken()
    if (!token) {
      setSignedIn(false)
      setName(null)
      setLoading(false)
      return
    }
    try {
      const me = await api.me()
      setSignedIn(true)
      setName(me.user.name)
    } catch {
      setSignedIn(false)
      setName(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const value: AuthState = {
    loading,
    signedIn,
    name,
    refresh,
    doSignIn: async (email, password) => {
      await signIn(email, password)
      await refresh()
    },
    doSignUp: async (email, password, name) => {
      await signUp(email, password, name)
      await refresh()
    },
    doSignOut: async () => {
      await signOut()
      setSignedIn(false)
      setName(null)
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth fuori da AuthProvider")
  return ctx
}
