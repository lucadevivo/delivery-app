import { useCallback, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import type { Contratto } from "@rider/core"
import { api } from "@/api"
import { Button, Card, Muted, Screen, colors } from "@/ui"

const LABEL: Record<string, string> = {
  contanti: "Contanti",
  prestazione_occasionale: "Prestazione occasionale",
  co_co_co: "Co.co.co",
  partita_iva_forfettario: "P.IVA forfettario",
  partita_iva_ordinario: "P.IVA ordinario",
  subordinato: "Subordinato",
}

export default function ContrattiScreen() {
  const router = useRouter()
  const [contratti, setContratti] = useState<Contratto[]>([])

  const load = useCallback(async () => {
    try {
      const r = await api.listContratti()
      setContratti(r.contratti)
    } catch {
      setContratti([])
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <Screen>
      <Button
        title="+ Nuovo contratto"
        onPress={() => router.push("/contratto-nuovo")}
      />
      <FlatList
        data={contratti}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 10, paddingTop: 12 }}
        ListEmptyComponent={
          <Muted>Aggiungi il tuo primo contratto per iniziare.</Muted>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.colore ?? colors.accent,
                }}
              />
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                {item.nome}
              </Text>
            </View>
            <Muted>{LABEL[item.tipo] ?? item.tipo}</Muted>
          </Card>
        )}
      />
    </Screen>
  )
}
