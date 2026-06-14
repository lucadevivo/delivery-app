import { useState } from "react"
import { Alert, ScrollView, Text } from "react-native"
import { useAuth } from "@/auth"
import { Button, Field, H1, Muted, Screen, colors } from "@/ui"

export default function SignIn() {
  const { doSignIn, doSignUp } = useAuth()
  const [mode, setMode] = useState<"in" | "up">("in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    try {
      if (mode === "in") await doSignIn(email.trim(), password)
      else await doSignUp(email.trim(), password, name.trim() || "Rider")
    } catch (e) {
      Alert.alert("Ops", e instanceof Error ? e.message : "Errore")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 60 }}>
        <H1>Rider</H1>
        <Muted>
          {mode === "in"
            ? "Accedi per registrare i tuoi turni."
            : "Crea un account per iniziare."}
        </Muted>
        {mode === "up" && (
          <Field
            label="Nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          inputMode="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={mode === "in" ? "Accedi" : "Registrati"}
          onPress={submit}
          loading={loading}
        />
        <Text
          onPress={() => setMode(mode === "in" ? "up" : "in")}
          style={{ color: colors.accent, textAlign: "center", marginTop: 8 }}
        >
          {mode === "in"
            ? "Non hai un account? Registrati"
            : "Hai già un account? Accedi"}
        </Text>
      </ScrollView>
    </Screen>
  )
}
