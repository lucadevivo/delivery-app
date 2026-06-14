import { useState } from "react"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { api } from "@/api"
import { TEMPLATES, type Template } from "@/templates"
import { Button, Card, Field, Muted, Screen, useTheme } from "@/ui"

export default function ContrattoNuovo() {
  const { c } = useTheme()
  const router = useRouter()
  const [tpl, setTpl] = useState<Template>(TEMPLATES[0]!)
  const [nome, setNome] = useState(TEMPLATES[0]!.nome)
  const [saving, setSaving] = useState(false)

  function scegli(t: Template) {
    setTpl(t)
    setNome(t.nome)
  }

  async function salva() {
    setSaving(true)
    try {
      await api.createContratto({
        nome: nome.trim() || tpl.nome,
        tipo: tpl.tipo,
        paga: tpl.paga,
        fiscale: tpl.fiscale,
        colore: tpl.colore,
      })
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
        <Muted>Parti da un modello e personalizzalo</Muted>
        {TEMPLATES.map((t) => {
          const active = tpl.id === t.id
          return (
            <Pressable key={t.id} onPress={() => scegli(t)}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: active ? c.accent : c.border,
                  backgroundColor: c.card,
                  borderRadius: 14,
                  padding: 14,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: t.colore,
                    }}
                  />
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>
                    {t.nome}
                  </Text>
                </View>
                <Muted>{t.descrizione}</Muted>
              </View>
            </Pressable>
          )
        })}

        <Card>
          <Field label="Nome del contratto" value={nome} onChangeText={setNome} />
        </Card>

        <Button title="Crea contratto" onPress={salva} loading={saving} />
      </ScrollView>
    </Screen>
  )
}
