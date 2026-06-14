import { useCallback, useState } from "react"
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { ChevronRight, Plus } from "lucide-react-native"
import type { Contratto } from "@rider/core"
import { api, getToken } from "@/api"
import { useAuth } from "@/auth"
import { Button, Card, Muted, Screen, useTheme } from "@/ui"

const LABEL: Record<string, string> = {
  contanti: "Contanti",
  prestazione_occasionale: "Prestazione occasionale",
  co_co_co: "Co.co.co",
  partita_iva_forfettario: "P.IVA forfettario",
  partita_iva_ordinario: "P.IVA ordinario",
  subordinato: "Subordinato",
}

function Sezione({ title, children }: { title: string; children: React.ReactNode }) {
  const { c } = useTheme()
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: c.muted,
          fontSize: 12,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}

export default function Profilo() {
  const { c } = useTheme()
  const { name, doSignOut } = useAuth()
  const router = useRouter()
  const [contratti, setContratti] = useState<Contratto[]>([])

  const load = useCallback(async () => {
    try {
      setContratti((await api.listContratti()).contratti)
    } catch {
      setContratti([])
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  async function esporta() {
    const token = await getToken()
    if (!token) return
    Alert.alert(
      "Esporta dati",
      "L'export completo è disponibile via API autenticata; il download in-app arriverà a breve.",
    )
    Linking.openURL(api.exportUrl()).catch(() => {})
  }

  function eliminaAccount() {
    Alert.alert(
      "Eliminare l'account?",
      "Tutti i tuoi dati verranno cancellati definitivamente.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAccount()
            } finally {
              await doSignOut()
            }
          },
        },
      ],
    )
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 22, paddingTop: 8, paddingBottom: 28 }}>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: "800" }}>
          Ciao, {name ?? "Rider"}
        </Text>

        {/* Contratti */}
        <Sezione title="Contratti">
          {contratti.length === 0 ? (
            <Muted>Aggiungi il tuo primo contratto per iniziare.</Muted>
          ) : (
            contratti.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/contratto-modifica",
                    params: { id: item.id },
                  })
                }
              >
                <Card contentStyle={{ padding: 14 }}>
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: item.colore ?? c.accent,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: c.text, fontWeight: "700", fontSize: 16 }}
                      >
                        {item.nome}
                      </Text>
                      <Text style={{ color: c.muted, fontSize: 13 }}>
                        {LABEL[item.tipo] ?? item.tipo}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={c.muted} />
                  </View>
                </Card>
              </Pressable>
            ))
          )}
          <Pressable
            onPress={() => router.push("/contratto-nuovo")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 13,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Plus size={18} color={c.accent} />
            <Text style={{ color: c.accent, fontWeight: "700", fontSize: 15 }}>
              Nuovo contratto
            </Text>
          </Pressable>
        </Sezione>

        {/* Account */}
        <Sezione title="Account">
          <Button title="Esci" variant="ghost" onPress={doSignOut} />
        </Sezione>

        {/* Privacy */}
        <Sezione title="Privacy (GDPR)">
          <Button title="Esporta i miei dati" variant="ghost" onPress={esporta} />
          <Button title="Elimina account" variant="danger" onPress={eliminaAccount} />
        </Sezione>
      </ScrollView>
    </Screen>
  )
}
