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
import { useTheme } from "./theme"

// Ri-export per comodità: le schermate importano tutto da "@/ui".
export { useTheme, colors } from "./theme"

// Sfondo a gradiente caldo (due "glow" dall'alto), come la .app-bg della webapp.
function GradientBg() {
  const { c } = useTheme()
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[c.grad1, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={[styles.glow, { height: 440 }]}
      />
      <LinearGradient
        colors={[c.grad2, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.55, y: 0.9 }}
        style={[styles.glow, { height: 380 }]}
      />
    </View>
  )
}

export function Screen({ children }: { children: ReactNode }) {
  const { c } = useTheme()
  return (
    <View style={[styles.screen, { backgroundColor: c.bg }]}>
      <GradientBg />
      <View style={styles.screenInner}>{children}</View>
    </View>
  )
}

export function Card({
  children,
  style,
  contentStyle,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
}) {
  const { c } = useTheme()
  return (
    <View
      style={[
        styles.cardShadow,
        { backgroundColor: c.cardOverlay, shadowColor: c.shadow },
        style,
      ]}
    >
      <BlurView
        intensity={30}
        tint={c.blurTint}
        style={[styles.cardBlur, { borderColor: c.cardBorder }]}
      >
        <View style={[styles.cardInner, { backgroundColor: c.cardOverlay }, contentStyle]}>
          {children}
        </View>
      </BlurView>
    </View>
  )
}

// Card "hero" piena terracotta (come la card "Incassato" della webapp).
export function HeroCard({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const { c } = useTheme()
  return (
    <View
      style={[
        styles.hero,
        { backgroundColor: c.accent, shadowColor: c.accent },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  fullWidth,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  fullWidth?: boolean
}) {
  const { c } = useTheme()
  return (
    <View
      style={[
        styles.segment,
        { backgroundColor: c.segBg, borderColor: c.border },
        fullWidth && { width: "100%" },
      ]}
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.segmentItem,
              fullWidth && { flex: 1, alignItems: "center", paddingVertical: 9 },
              active && { backgroundColor: c.accent },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                fullWidth && { fontSize: 14 },
                { color: active ? c.primaryFg : c.muted },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function H1({ children }: { children: ReactNode }) {
  const { c } = useTheme()
  return <Text style={[styles.h1, { color: c.text }]}>{children}</Text>
}
export function Muted({ children }: { children: ReactNode }) {
  const { c } = useTheme()
  return <Text style={[styles.muted, { color: c.muted }]}>{children}</Text>
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
  const { c } = useTheme()
  const isGhost = variant === "ghost"
  const bg =
    variant === "primary" ? c.accent : variant === "danger" ? c.danger : c.segBg
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.btn,
        !isGhost && { ...styles.btnShadow, shadowColor: c.accent },
        { backgroundColor: bg, opacity: pressed || loading ? 0.75 : 1 },
        isGhost && { borderWidth: 1, borderColor: c.border },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? c.accent : c.primaryFg} />
      ) : (
        <Text style={[styles.btnText, { color: isGhost ? c.text : c.primaryFg }]}>
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
  const { c } = useTheme()
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.muted}
        style={[
          styles.input,
          { backgroundColor: c.inputBg, borderColor: c.border, color: c.text },
        ]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenInner: { flex: 1, padding: 16, gap: 14 },
  glow: { position: "absolute", top: 0, left: 0, right: 0 },
  cardShadow: {
    borderRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 4,
  },
  cardBlur: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardInner: { padding: 16, gap: 8 },
  hero: {
    borderRadius: 20,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 5,
  },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
  },
  segmentItem: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  segmentText: { fontSize: 13, fontWeight: "700" },
  h1: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  muted: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 3,
  },
  btnText: { fontSize: 16, fontWeight: "700" },
})
