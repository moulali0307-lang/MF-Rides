import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ApiError, useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import { FormField } from "./FormField";

interface Props {
  onGoToRegister: () => void;
}

export function LoginScreen({ onGoToRegister }: Props) {
  const { login, isSubmitting } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setErrorMessage(null);

    if (!phoneNumber.trim() || !password) {
      setErrorMessage("Please enter your phone number and password.");
      return;
    }

    try {
      await login({ phoneNumber: phoneNumber.trim(), password });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue with MF Rides.</Text>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <FormField
          label="Phone number"
          placeholder="+919876543210"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <FormField
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Log in</Text>
          )}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={onGoToRegister} disabled={isSubmitting}>
          <Text style={styles.linkText}>
            New to MF Rides? <Text style={styles.linkTextEmphasis}>Create an account</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  linkText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkTextEmphasis: {
    color: colors.accent,
    fontWeight: "700",
  },
});
