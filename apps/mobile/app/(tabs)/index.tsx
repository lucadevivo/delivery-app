import { useCallback, useState } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { useFocusEffect } from "expo-router"
import { api, type Dashboard } from "@/api"
import { euro, formatMese, meseCorrente } from "@/format"
import { Card, H1, Muted, Screen, colors } from "@/ui"

function Riga({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 15 }}>{label}</Text>
      <Text
        style={{
          color: strong ? colors.good : colors.text,
          fontSize: strong ? 18 : 15,
          fontWeight: strong ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export default function DashboardScreen() {
  const mese = meseCorrente()
  const [data, setData] = useState<Dashboard | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setData(await api.dashboard(mese))
    } catch {
      setData(null)
    }
  }, [mese])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={async () => {
              setRefreshing(true)
              await load()
              setRefreshing(false)
            }}
          />
        }
      >
        <H1>{formatMese(mese)}</H1>
        <Card>
          <Riga label="Totale in tasca" value={euro(data?.totale ?? 0)} strong />
          <Riga label="Netto (no mance)" value={euro(data?.netto ?? 0)} />
          <Riga label="Mance" value={euro(data?.mance ?? 0)} />
          <Riga label="Lordo" value={euro(data?.lordo ?? 0)} />
          <Riga label="Tasse/contributi" value={euro(data?.trattenute ?? 0)} />
        </Card>
        <Card>
          <Riga label="Turni" value={String(data?.turni ?? 0)} />
          <Riga label="Consegne" value={String(data?.consegne ?? 0)} />
        </Card>
        {!data && <Muted>Trascina giù per aggiornare.</Muted>}
      </ScrollView>
    </Screen>
  )
}
