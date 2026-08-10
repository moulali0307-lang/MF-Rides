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
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: Props) {
  const { register, isSubmitting } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setErrorMessage(null);

    if (!fullName.trim() || !phoneNumber.trim() || !password) {
      setErrorMessage("Please fill in your name, phone number, and password.");
      return;
    }

    try {
      await register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() ? email.trim() : undefined,
        password,
      });
      // On success, AuthContext updates user/token and App.tsx will
      // automatically navigate to the Home screen.
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join MF Rides as a rider.</Text>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <FormField
          label="Full name"
          placeholder="Jane Doe"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
        />
        <FormField
          label="Phone number"
          placeholder="+919876543210"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <FormField
          label="Email (optional)"
          placeholder="jane@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormField
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />

        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Create account</Text>
          )}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={onGoToLogin} disabled={isSubmitting}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextEmphasis}>Log in</Text>
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
