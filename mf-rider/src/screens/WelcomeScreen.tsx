import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

interface Props {
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export function WelcomeScreen({ onGoToRegister, onGoToLogin }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>MF Rides</Text>
        <Text style={styles.title}>Your ride, your way.</Text>
        <Text style={styles.subtitle}>
          Book rides in minutes with drivers you can trust.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onGoToRegister}>
          <Text style={styles.primaryButtonText}>Create an account</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onGoToLogin}>
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: "flex-start",
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
