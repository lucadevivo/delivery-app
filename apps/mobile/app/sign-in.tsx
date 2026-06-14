import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { Bike } from "lucide-react-native"
import { useAuth } from "@/auth"
import { Button, Card, Field, Screen, useTheme } from "@/ui"

export default function SignIn() {
  const { c } = useTheme()
  const { doSignIn, doSignUp } = useAuth()
  const [mode, setMode] = useState<"in" | "up">("in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignUp = mode === "up"

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      if (isSignUp) await doSignUp(email.trim(), password, name.trim() || "Rider")
      else await doSignIn(email.trim(), password)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Qualcosa è andato storto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          gap: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + intestazione */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 20,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: c.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.32,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <Bike size={30} color={c.primaryFg} strokeWidth={2.2} />
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text
              style={{
                color: c.text,
                fontSize: 24,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              {isSignUp ? "Crea il tuo account" : "Bentornato"}
            </Text>
            <Text style={{ color: c.muted, fontSize: 14, textAlign: "center" }}>
              {isSignUp
                ? "Registrati per tenere traccia dei tuoi turni"
                : "Accedi per vedere turni e guadagni"}
            </Text>
          </View>
        </View>

        {/* Form */}
        <Card contentStyle={{ padding: 20, gap: 16 }}>
          {isSignUp && (
            <Field
              label="Nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Il tuo nome"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
            placeholder="nome@esempio.it"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={isSignUp ? "Almeno 8 caratteri" : "••••••••"}
          />

          {error && (
            <Text style={{ color: c.danger, fontSize: 13, fontWeight: "600" }}>
              {error}
            </Text>
          )}

          <Button
            title={isSignUp ? "Crea account" : "Accedi"}
            onPress={submit}
            loading={loading}
          />
        </Card>

        <Text
          onPress={() => {
            setError(null)
            setMode(isSignUp ? "in" : "up")
          }}
          style={{ color: c.accent, textAlign: "center", fontWeight: "600" }}
        >
          {isSignUp
            ? "Hai già un account? Accedi"
            : "Non hai un account? Registrati"}
        </Text>
      </ScrollView>
    </Screen>
  )
}
