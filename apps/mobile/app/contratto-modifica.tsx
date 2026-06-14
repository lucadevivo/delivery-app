import { useEffect, useState } from "react"
import { Alert, Pressable, ScrollView, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import type { SchemaPaga } from "@rider/core"
import { api } from "@/api"
import { Button, Card, Field, Muted, Screen, useTheme } from "@/ui"

const COLORI = [
  "#993a31",
  "#b47548",
  "#547e4b",
  "#3f6ea5",
  "#7d5ba6",
  "#a8453f",
  "#6b7280",
]

// "1,5" -> 1.5 ; vuoto -> undefined
function num(s: string): number | undefined {
  const n = Number(s.replace(",", "."))
  return Number.isFinite(n) && s.trim() !== "" ? n : undefined
}
const fmt = (n?: number) => (n != null ? String(n) : "")

export default function ContrattoModifica() {
  const { c } = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [nome, setNome] = useState("")
  const [colore, setColore] = useState(COLORI[0]!)
  const [pagaBase, setPagaBase] = useState<SchemaPaga>({})
  // campi paga (stringhe per gli input)
  const [fisso, setFisso] = useState("")
  const [oraria, setOraria] = useState("")
  const [aConsegna, setAConsegna] = useState("")
  const [aKm, setAKm] = useState("")
  const [minimo, setMinimo] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .getContratto(id)
      .then(({ contratto }) => {
        setNome(contratto.nome)
        if (contratto.colore) setColore(contratto.colore)
        const p = contratto.paga ?? {}
        setPagaBase(p)
        setFisso(fmt(p.aTurno))
        setOraria(fmt(p.oraria))
        setAConsegna(fmt(p.aConsegna))
        setAKm(fmt(p.aKm))
        setMinimo(fmt(p.minimoGarantito))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function salva() {
    if (!id) return
    // Preserva i campi avanzati (quest, moltiplicatori) e sovrascrive quelli editati.
    const paga: SchemaPaga = {
      ...pagaBase,
      aTurno: num(fisso),
      oraria: num(oraria),
      aConsegna: num(aConsegna),
      aKm: num(aKm),
      minimoGarantito: num(minimo),
    }
    setSaving(true)
    try {
      await api.updateContratto(id, { nome: nome.trim(), colore, paga })
      router.back()
    } catch (e) {
      Alert.alert("Ops", e instanceof Error ? e.message : "Errore")
    } finally {
      setSaving(false)
    }
  }

  function elimina() {
    if (!id) return
    Alert.alert(
      "Eliminare il contratto?",
      "Verrà archiviato; i turni passati restano visibili.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteContratto(id)
              router.back()
            } catch (e) {
              Alert.alert("Ops", e instanceof Error ? e.message : "Errore")
            }
          },
        },
      ],
    )
  }

  if (loading) return <Screen><Muted>Caricamento…</Muted></Screen>

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 8, paddingBottom: 28 }}>
        <Card contentStyle={{ padding: 16, gap: 14 }}>
          <Field label="Nome del contratto" value={nome} onChangeText={setNome} />
          <View style={{ gap: 8 }}>
            <Muted>Colore</Muted>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {COLORI.map((col) => (
                <Pressable key={col} onPress={() => setColore(col)}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: col,
                      borderWidth: colore === col ? 3 : 0,
                      borderColor: c.text,
                    }}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <Card contentStyle={{ padding: 16, gap: 14 }}>
          <Muted>Come vieni pagato — compila solo le voci che ti riguardano</Muted>
          <Field
            label="Fisso a turno (€)"
            value={fisso}
            onChangeText={setFisso}
            keyboardType="decimal-pad"
            placeholder="es. 20"
          />
          <Field
            label="Paga oraria (€/h)"
            value={oraria}
            onChangeText={setOraria}
            keyboardType="decimal-pad"
            placeholder="es. 8"
          />
          <Field
            label="A consegna (€)"
            value={aConsegna}
            onChangeText={setAConsegna}
            keyboardType="decimal-pad"
            placeholder="es. 2"
          />
          <Field
            label="Al km (€)"
            value={aKm}
            onChangeText={setAKm}
            keyboardType="decimal-pad"
            placeholder="es. 0,30"
          />
          <Field
            label="Minimo garantito a turno (€)"
            value={minimo}
            onChangeText={setMinimo}
            keyboardType="decimal-pad"
            placeholder="opzionale"
          />
        </Card>

        <Button title="Salva modifiche" onPress={salva} loading={saving} />
        <Button title="Elimina contratto" variant="danger" onPress={elimina} />
      </ScrollView>
    </Screen>
  )
}
