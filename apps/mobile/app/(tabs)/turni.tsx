import { useCallback, useState } from "react"
import { FlatList, Text, View } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { api, type TurnoRow } from "@/api"
import { euro, formatData, meseCorrente } from "@/format"
import { Button, Card, Muted, Screen, colors } from "@/ui"

export default function TurniScreen() {
  const router = useRouter()
  const [turni, setTurni] = useState<TurnoRow[]>([])

  const load = useCallback(async () => {
    try {
      const r = await api.listTurni(meseCorrente())
      setTurni(r.turni)
    } catch {
      setTurni([])
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <Screen>
      <Button title="+ Nuovo turno" onPress={() => router.push("/turno-nuovo")} />
      <FlatList
        data={turni}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 10, paddingTop: 12 }}
        ListEmptyComponent={<Muted>Nessun turno questo mese.</Muted>}
        renderItem={({ item }) => (
          <Card>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                {formatData(item.data)}
              </Text>
              <Text style={{ color: colors.good, fontWeight: "800", fontSize: 16 }}>
                {euro(item.risultato.totale)}
              </Text>
            </View>
            <Muted>
              {item.contrattoNome}
              {item.consegne != null ? ` · ${item.consegne} consegne` : ""}
              {item.mance ? ` · mance ${euro(item.mance)}` : ""}
            </Muted>
          </Card>
        )}
      />
    </Screen>
  )
}
