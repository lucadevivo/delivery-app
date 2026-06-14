import { Alert, Linking, ScrollView } from "react-native"
import { api, getToken } from "@/api"
import { useAuth } from "@/auth"
import { Button, Card, H1, Muted, Screen } from "@/ui"

export default function ProfiloScreen() {
  const { name, doSignOut } = useAuth()

  async function esporta() {
    // L'export richiede il bearer token: apriamo l'URL con il token in query non
    // è sicuro, quindi mostriamo l'endpoint. In una versione successiva si farà
    // un download autenticato con condivisione file.
    const token = await getToken()
    if (!token) return
    Alert.alert(
      "Esporta dati",
      "L'export completo dei tuoi dati è disponibile via API autenticata; il download in-app arriverà a breve.",
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
      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <H1>Ciao, {name ?? "Rider"}</H1>
        <Card>
          <Muted>Account</Muted>
          <Button title="Esci" variant="ghost" onPress={doSignOut} />
        </Card>
        <Card>
          <Muted>Privacy (GDPR)</Muted>
          <Button title="Esporta i miei dati" variant="ghost" onPress={esporta} />
          <Button
            title="Elimina account"
            variant="danger"
            onPress={eliminaAccount}
          />
        </Card>
      </ScrollView>
    </Screen>
  )
}
