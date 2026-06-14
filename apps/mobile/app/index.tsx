import { useCallback, useMemo, useState } from "react"
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  CalendarDays,
  Coins,
  Landmark,
  Moon,
  Package,
  Plus,
  ShieldMinus,
  Sun,
  User,
  Wallet,
} from "lucide-react-native"
import { api, type Dashboard, type TurnoRow } from "@/api"
import { useAuth } from "@/auth"
import { euro, formatData, formatMese, meseCorrente } from "@/format"
import { Card, HeroCard, Muted, Screen, Segmented, useTheme } from "@/ui"

function IconBtn({
  onPress,
  children,
  bg,
}: {
  onPress: () => void
  children: React.ReactNode
  bg?: string
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {children}
    </Pressable>
  )
}

function StatCard({
  icon,
  label,
  value,
  full,
}: {
  icon: React.ReactNode
  label: string
  value: string
  full?: boolean
}) {
  const { c } = useTheme()
  return (
    <Card
      style={full ? { width: "100%" } : { flex: 1 }}
      contentStyle={{ padding: 14, gap: 8 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600" }}>
          {label}
        </Text>
      </View>
      <Text
        style={{ color: c.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 }}
      >
        {value}
      </Text>
    </Card>
  )
}

export default function Home() {
  const { c, scheme, toggle } = useTheme()
  const { name } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const mese = meseCorrente()

  const [data, setData] = useState<Dashboard | null>(null)
  const [turni, setTurni] = useState<TurnoRow[]>([])
  const [tab, setTab] = useState<"Storico" | "Bonifico" | "Analitica">("Storico")
  const [vista, setVista] = useState<"Netto" | "Lordo">("Netto")
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [d, t] = await Promise.all([api.dashboard(mese), api.listTurni(mese)])
      setData(d)
      setTurni(t.turni)
    } catch {
      setData(null)
    }
  }, [mese])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  function eliminaTurno(t: TurnoRow) {
    Alert.alert("Eliminare il turno?", formatData(t.data), [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteTurno(t.id)
            load()
          } catch (e) {
            Alert.alert("Ops", e instanceof Error ? e.message : "Errore")
          }
        },
      },
    ])
  }

  const lordoTot = (data?.lordo ?? 0) + (data?.mance ?? 0)
  const incassato = vista === "Netto" ? (data?.totale ?? 0) : lordoTot

  // Bonifico previsto: turni con ritenuta d'acconto (pagati a bonifico),
  // raggruppati per contratto. Bonifico = lordo − ritenuta trattenuta alla fonte.
  const bonifici = useMemo(() => {
    const map = new Map<
      string,
      { nome: string; lordo: number; ritenuta: number; consegne: number; n: number }
    >()
    for (const t of turni) {
      if (!t.risultato.ritenuta || t.risultato.ritenuta <= 0) continue
      const g =
        map.get(t.contrattoId) ??
        { nome: t.contrattoNome, lordo: 0, ritenuta: 0, consegne: 0, n: 0 }
      g.lordo += t.risultato.lordo
      g.ritenuta += t.risultato.ritenuta
      g.consegne += t.consegne ?? 0
      g.n += 1
      map.set(t.contrattoId, g)
    }
    return Array.from(map.values())
  }, [turni])

  return (
    <Screen>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          marginHorizontal: -16,
          paddingHorizontal: 16,
        }}
      >
        <Pressable
          onPress={() => router.push("/profilo")}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <User size={20} color={c.accent} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "800" }}>
            I miei turni
          </Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>Ciao {name ?? "Rider"}</Text>
        </View>
        <IconBtn onPress={toggle}>
          {scheme === "dark" ? (
            <Sun size={20} color={c.muted} />
          ) : (
            <Moon size={20} color={c.muted} />
          )}
        </IconBtn>
      </View>

      <ScrollView
        contentContainerStyle={{ gap: 14, paddingTop: 14, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={c.accent}
            onRefresh={async () => {
              setRefreshing(true)
              await load()
              setRefreshing(false)
            }}
          />
        }
      >
        {/* Riga periodo + nuovo turno */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text
            style={{
              color: c.text,
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: -0.5,
              textTransform: "capitalize",
            }}
          >
            {formatMese(mese)}
          </Text>
          <View style={{ flex: 1 }} />
          <Segmented
            options={["Netto", "Lordo"] as const}
            value={vista}
            onChange={setVista}
          />
          <Pressable
            onPress={() => router.push("/turno-nuovo")}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: c.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
              shadowColor: c.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 3,
            })}
          >
            <Plus size={22} color={c.primaryFg} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Hero incassato */}
        <HeroCard>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Wallet size={16} color={c.primaryFg} opacity={0.85} />
                <Text
                  style={{
                    color: c.primaryFg,
                    fontSize: 12,
                    fontWeight: "600",
                    opacity: 0.9,
                  }}
                >
                  {vista === "Netto" ? "Incassato netto" : "Incassato lordo"}
                </Text>
              </View>
              <Text
                style={{
                  color: c.primaryFg,
                  fontSize: 32,
                  fontWeight: "800",
                  letterSpacing: -1,
                }}
              >
                {euro(incassato)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <CalendarDays size={16} color={c.primaryFg} opacity={0.7} />
              <Text style={{ color: c.primaryFg, fontSize: 24, fontWeight: "800" }}>
                {data?.turni ?? 0}
              </Text>
              <Text style={{ color: c.primaryFg, fontSize: 11, opacity: 0.75 }}>
                {(data?.turni ?? 0) === 1 ? "turno" : "turni"}
              </Text>
            </View>
          </View>
        </HeroCard>

        {/* Statistiche */}
        <View style={{ flexDirection: "row", gap: 14 }}>
          <StatCard
            icon={<Package size={16} color={c.muted} />}
            label="Consegne"
            value={String(data?.consegne ?? 0)}
          />
          <StatCard
            icon={<Coins size={16} color={c.muted} />}
            label="Mance"
            value={euro(data?.mance ?? 0)}
          />
        </View>
        <StatCard
          full
          icon={<ShieldMinus size={16} color={c.muted} />}
          label="Tasse e trattenute"
          value={euro(data?.trattenute ?? 0)}
        />

        {/* Tab Storico / Bonifico / Analitica */}
        <View style={{ marginTop: 4 }}>
          <Segmented
            fullWidth
            options={["Storico", "Bonifico", "Analitica"] as const}
            value={tab}
            onChange={setTab}
          />
        </View>

        {tab === "Storico" ? (
          turni.length === 0 ? (
            <Muted>Nessun turno questo mese. Tocca + per aggiungerne uno.</Muted>
          ) : (
            turni.map((t) => (
              <Pressable key={t.id} onLongPress={() => eliminaTurno(t)}>
                <Card contentStyle={{ padding: 14, gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: c.text,
                        fontWeight: "700",
                        fontSize: 16,
                        textTransform: "capitalize",
                      }}
                    >
                      {formatData(t.data)}
                    </Text>
                    <Text style={{ color: c.good, fontWeight: "800", fontSize: 16 }}>
                      {euro(t.risultato.totale)}
                    </Text>
                  </View>
                  <Text style={{ color: c.muted, fontSize: 13 }}>
                    {t.contrattoNome}
                    {t.consegne != null ? ` · ${t.consegne} consegne` : ""}
                    {t.mance ? ` · mance ${euro(t.mance)}` : ""}
                  </Text>
                </Card>
              </Pressable>
            ))
          )
        ) : tab === "Bonifico" ? (
          bonifici.length === 0 ? (
            <Muted>
              Nessun turno con ritenuta questo mese. Qui appariranno i bonifici
              previsti (es. AppetEat), per contratto.
            </Muted>
          ) : (
            bonifici.map((b) => (
              <Card key={b.nome} contentStyle={{ padding: 16, gap: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: "800", fontSize: 16 }}>
                    {b.nome}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 12 }}>
                    {b.n} turni · {b.consegne} consegne
                  </Text>
                </View>
                <RigaAnalitica label="Lordo (fisso + consegne)" value={euro(b.lordo)} />
                <RigaAnalitica label="Ritenuta d'acconto" value={`− ${euro(b.ritenuta)}`} />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: c.accent,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    marginTop: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Landmark size={16} color={c.primaryFg} />
                    <Text style={{ color: c.primaryFg, fontWeight: "700", fontSize: 14 }}>
                      Bonifico previsto
                    </Text>
                  </View>
                  <Text style={{ color: c.primaryFg, fontWeight: "800", fontSize: 18 }}>
                    {euro(b.lordo - b.ritenuta)}
                  </Text>
                </View>
                <Text style={{ color: c.muted, fontSize: 11 }}>
                  La ritenuta di {euro(b.ritenuta)} ti verrà restituita con la
                  dichiarazione dei redditi.
                </Text>
              </Card>
            ))
          )
        ) : (
          <Card contentStyle={{ padding: 16, gap: 10 }}>
            <RigaAnalitica label="Lordo" value={euro(data?.lordo ?? 0)} />
            <RigaAnalitica label="Mance" value={euro(data?.mance ?? 0)} />
            <RigaAnalitica label="Tasse e trattenute" value={euro(data?.trattenute ?? 0)} />
            <RigaAnalitica label="Netto (no mance)" value={euro(data?.netto ?? 0)} />
            <RigaAnalitica label="Totale in tasca" value={euro(data?.totale ?? 0)} strong />
            <RigaAnalitica label="Consegne" value={String(data?.consegne ?? 0)} />
          </Card>
        )}
      </ScrollView>
    </Screen>
  )
}

function RigaAnalitica({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: c.muted, fontSize: 15 }}>{label}</Text>
      <Text
        style={{
          color: strong ? c.good : c.text,
          fontSize: strong ? 18 : 15,
          fontWeight: strong ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  )
}
