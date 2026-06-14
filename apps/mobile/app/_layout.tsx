import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider, useAuth } from "@/auth"
import { ThemeProvider, useTheme } from "@/theme"

function Gate() {
  const { loading, signedIn } = useAuth()
  const { c, scheme } = useTheme()
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
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={c.accent} size="large" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="profilo" options={{ title: "Profilo" }} />
        <Stack.Screen
          name="turno-nuovo"
          options={{ presentation: "modal", title: "Nuovo turno" }}
        />
        <Stack.Screen
          name="contratto-nuovo"
          options={{ presentation: "modal", title: "Nuovo contratto" }}
        />
        <Stack.Screen
          name="contratto-modifica"
          options={{ presentation: "modal", title: "Modifica contratto" }}
        />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  )
}
