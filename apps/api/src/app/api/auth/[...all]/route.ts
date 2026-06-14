import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

// Espone tutti gli endpoint Better Auth sotto /api/auth/* (signup, signin, ...).
export const { GET, POST } = toNextJsHandler(auth)
