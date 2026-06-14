import { useEffect, useMemo, useState } from "react"
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { calcolaTurno, type Contratto } from "@rider/core"
import { api } from "@/api"
import { euro, oggi } from "@/format"
import { Button, Card, Field, Muted, Screen, colors } from "@/ui"

function num(s: string): number | undefined {
  const n = Number(s.replace(",", "."))
  return Number.isFinite(n) && s.trim() !== "" ? n : undefined
}

export default function TurnoNuovo() {
  const router = useRouter()
  const [contratti, setContratti] = useState<Contratto[]>([])
  const [sel, setSel] = useState<Contratto | null>(null)
  const [data, setData] = useState(oggi())
  const [ore, setOre] = useState("")
  const [consegne, setConsegne] = useState("")
  const [km, setKm] = useState("")
  const [mance, setMance] = useState("")
  const [festivo, setFestivo] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .listContratti()
      .then((r) => {
        setContratti(r.contratti)
        if (r.contratti[0]) setSel(r.contratti[0])
      })
      .catch(() => {})
  }, [])

  const turnoInput = {
    data,
    ore: num(ore),
    consegne: num(consegne),
    km: num(km),
    mance: num(mance),
    festivo,
  }

  // Anteprima live con lo stesso motore del backend (senza contesto annuale).
  const anteprima = useMemo(() => {
    if (!sel) return null
    return calcolaTurno(sel, turnoInput)
  }, [sel, data, ore, consegne, km, mance, festivo])

  async function salva() {
    if (!sel) {
      Alert.alert("Manca il contratto", "Crea prima un contratto.")
      return
    }
    setSaving(true)
    try {
      await api.createTurno({ contrattoId: sel.id, ...turnoInput })
      router.back()
    } catch (e) {
      Alert.alert("Ops", e instanceof Error ? e.message : "Errore")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <Muted>Contratto</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {contratti.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSel(c)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: sel?.id === c.id ? colors.accent : colors.border,
                backgroundColor: sel?.id === c.id ? colors.accent : "transparent",
              }}
            >
              <Text style={{ color: sel?.id === c.id ? "#fff" : colors.text }}>
                {c.nome}
              </Text>
            </Pressable>
          ))}
          {contratti.length === 0 && <Muted>Nessun contratto.</Muted>}
        </View>

        <Field label="Data (YYYY-MM-DD)" value={data} onChangeText={setData} />
        <Field
          label="Consegne"
          value={consegne}
          onChangeText={setConsegne}
          keyboardType="number-pad"
        />
        <Field label="Ore" value={ore} onChangeText={setOre} keyboardType="decimal-pad" />
        <Field label="Km" value={km} onChangeText={setKm} keyboardType="decimal-pad" />
        <Field
          label="Mance (€)"
          value={mance}
          onChangeText={setMance}
          keyboardType="decimal-pad"
        />
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <Text style={{ color: colors.text }}>Giorno festivo</Text>
          <Switch value={festivo} onValueChange={setFestivo} />
        </View>

        {anteprima && (
          <Card>
            <Muted>Anteprima</Muted>
            <Riga label="Lordo" value={euro(anteprima.lordo)} />
            <Riga label="Tasse/contributi" value={euro(anteprima.totaleTrattenute)} />
            <Riga label="Netto" value={euro(anteprima.netto)} />
            <Riga label="Totale in tasca" value={euro(anteprima.totale)} strong />
          </Card>
        )}

        <Button title="Salva turno" onPress={salva} loading={saving} />
      </ScrollView>
    </Screen>
  )
}

function Riga({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text
        style={{
          color: strong ? colors.good : colors.text,
          fontWeight: strong ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  )
}
