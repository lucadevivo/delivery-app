import { Tabs } from "expo-router"
import { Text } from "react-native"
import { colors } from "@/ui"

function icon(emoji: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 20, color }}>{emoji}</Text>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard", tabBarIcon: icon("📊") }}
      />
      <Tabs.Screen
        name="turni"
        options={{ title: "Turni", tabBarIcon: icon("🗓️") }}
      />
      <Tabs.Screen
        name="contratti"
        options={{ title: "Contratti", tabBarIcon: icon("📄") }}
      />
      <Tabs.Screen
        name="profilo"
        options={{ title: "Profilo", tabBarIcon: icon("👤") }}
      />
    </Tabs>
  )
}
