import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider, useAuth } from "@/auth"
import { colors } from "@/ui"

function Gate() {
  const { loading, signedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === "sign-in"
    if (!signedIn && !inAuth) router.replace("/sign-in")
    else if (signedIn && inAuth) router.replace("/")
  }, [loading, signedIn, segments])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="turno-nuovo"
        options={{ presentation: "modal", title: "Nuovo turno" }}
      />
      <Stack.Screen
        name="contratto-nuovo"
        options={{ presentation: "modal", title: "Nuovo contratto" }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Gate />
    </AuthProvider>
  )
}
