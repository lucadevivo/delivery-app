import type { ReactNode } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"

// Palette derivata dalla webapp turni (token oklch convertiti in sRGB):
// crema caldo + terracotta, stile iOS "liquid glass".
export const colors = {
  bg: "#f9f4f0", // sfondo crema
  card: "#fefbf9", // superficie piena (swatch, tab bar)
  border: "#dcd6d1",
  text: "#2a1f1a", // marrone scuro caldo
  muted: "#7e6e65",
  accent: "#993a31", // primario terracotta
  danger: "#c53637",
  good: "#547e4b", // verde per importi positivi
  primaryFg: "#fbf8f5",
}

// Sfondo a gradiente caldo: due "glow" radiali (approssimati con gradienti
// lineari) che scendono dall'alto, come la .app-bg della webapp.
function GradientBg() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["rgba(153,58,49,0.14)", "rgba(153,58,49,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={[styles.glow, { height: 440 }]}
      />
      <LinearGradient
        colors={["rgba(180,117,72,0.13)", "rgba(180,117,72,0)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.55, y: 0.9 }}
        style={[styles.glow, { height: 380 }]}
      />
    </View>
  )
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <GradientBg />
      <View style={styles.screenInner}>{children}</View>
    </View>
  )
}

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.cardShadow, style]}>
      <BlurView intensity={30} tint="light" style={styles.cardBlur}>
        <View style={styles.cardInner}>{children}</View>
      </BlurView>
    </View>
  )
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>
}
export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>
}

export function Button({
  title,
  onPress,
  loading,
  variant = "primary",
}: {
  title: string
  onPress: () => void
  loading?: boolean
  variant?: "primary" | "ghost" | "danger"
}) {
  const isGhost = variant === "ghost"
  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? colors.danger
        : "rgba(255,255,255,0.5)"
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.btn,
        !isGhost && styles.btnShadow,
        { backgroundColor: bg, opacity: pressed || loading ? 0.75 : 1 },
        isGhost && { borderWidth: 1, borderColor: colors.border },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.accent : colors.primaryFg} />
      ) : (
        <Text style={[styles.btnText, isGhost && { color: colors.text }]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenInner: { flex: 1, padding: 16, gap: 14 },
  glow: { position: "absolute", top: 0, left: 0, right: 0 },
  cardShadow: {
    borderRadius: 18,
    backgroundColor: "rgba(254,251,249,0.55)",
    shadowColor: "#2a1f1a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },
  cardBlur: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardInner: {
    padding: 16,
    gap: 8,
    backgroundColor: "rgba(254,251,249,0.4)",
  },
  h1: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 16,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnShadow: {
    shadowColor: "#993a31",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 3,
  },
  btnText: { color: colors.primaryFg, fontSize: 16, fontWeight: "700" },
})
