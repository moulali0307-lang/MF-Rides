import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  function handlePhoneChange(text: string) {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(digitsOnly);
    setErrorMessage(null);
  }

  async function handleSubmit() {
    setErrorMessage(null);

    const cleanPhone = phoneNumber.trim();

    if (!cleanPhone || !password) {
      setErrorMessage("Please enter your phone number and password.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await login({
        phoneNumber: `+91${cleanPhone}`,
        password,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  function handleOtpLogin() {
    setErrorMessage(
      "OTP login will be connected in the next step."
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative background */}
        <View style={styles.backgroundCircleOne} />
        <View style={styles.backgroundCircleTwo} />

        {/* BRAND */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>MF</Text>
          </View>

          <Text style={styles.brandText}>MF-RIDES</Text>

          <Text style={styles.brandTagline}>
            Smart rides. Simple journeys.
          </Text>
        </View>

        {/* LOGIN CARD */}
        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>
            Welcome back 👋
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Log in to continue with MF Rides.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* PHONE */}
          <Text style={styles.fieldLabel}>
            Phone number
          </Text>

          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCode}>+91</Text>
            </View>

            <View style={styles.phoneDivider} />

            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit number"
              placeholderTextColor={colors.textMuted}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType={
                Platform.OS === "web"
                  ? "numeric"
                  : "number-pad"
              }
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              editable={!isSubmitting}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.passwordHeader}>
            <Text style={styles.fieldLabel}>
              Password
            </Text>

            <Pressable
              onPress={() =>
                setErrorMessage(
                  "Password recovery will be added next."
                )
              }
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <FormField
            label=""
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {/* LOGIN */}
          <Pressable
            style={[
              styles.primaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  Log in
                </Text>

                <Text style={styles.arrow}>
                  →
                </Text>
              </View>
            )}
          </Pressable>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* OTP */}
          <Pressable
            style={styles.otpButton}
            onPress={handleOtpLogin}
            disabled={isSubmitting}
          >
            <View style={styles.otpIcon}>
              <Text style={styles.otpIconText}>✦</Text>
            </View>

            <View style={styles.otpTextBox}>
              <Text style={styles.otpTitle}>
                Continue with OTP
              </Text>

              <Text style={styles.otpSubtitle}>
                Secure login with a verification code
              </Text>
            </View>

            <Text style={styles.otpArrow}>›</Text>
          </Pressable>
        </View>

        {/* REGISTER */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>
            New to MF Rides?{" "}
          </Text>

          <Pressable
            onPress={onGoToRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.registerLink}>
              Create an account
            </Text>
          </Pressable>
        </View>

        {/* SECURITY */}
        <View style={styles.securityRow}>
          <Text style={styles.securityIcon}>🔒</Text>

          <Text style={styles.securityText}>
            Your account is protected with secure verification
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#FFFCF5",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 42,
    paddingBottom: 30,
    position: "relative",
  },

  backgroundCircleOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(227, 163, 33, 0.12)",
    top: -90,
    right: -80,
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(227, 163, 33, 0.07)",
    bottom: 120,
    left: -90,
  },

  brandSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#E3A321",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#C88A1D",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },

  logoText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },

  brandText: {
    color: "#C88A1D",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
  },

  brandTagline: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E8DFD0",

    shadowColor: "#1B2140",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },

  welcomeTitle: {
    color: "#171B2A",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 5,
  },

  welcomeSubtitle: {
    color: "#7A7C84",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },

  errorBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#171B2A",
    marginBottom: 7,
  },

  phoneInputWrapper: {
    minHeight: 54,
    backgroundColor: "#FFFEFA",
    borderWidth: 1,
    borderColor: "#E8DFD0",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    overflow: "hidden",
  },

  countryCodeBox: {
    paddingLeft: 14,
    paddingRight: 11,
    justifyContent: "center",
  },

  countryCode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#171B2A",
  },

  phoneDivider: {
    width: 1,
    height: 27,
    backgroundColor: "#E8DFD0",
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#171B2A",
    backgroundColor: "transparent",
    borderWidth: 0,
    outlineStyle: "solid",
    outlineWidth: 0,
    outlineColor: "transparent",
  },

  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  forgotText: {
    color: "#C88A1D",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  primaryButton: {
    backgroundColor: "#E3A321",
    borderRadius: 18,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#C88A1D",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonContent: {
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },

  arrow: {
    position: "absolute",
    right: 18,
    color: colors.white,
    fontSize: 21,
    fontWeight: "400",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8DFD0",
  },

  orText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    marginHorizontal: 12,
  },

  otpButton: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#E8DFD0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  otpIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF1CC",
    alignItems: "center",
    justifyContent: "center",
  },

  otpIconText: {
    color: "#C88A1D",
    fontSize: 18,
    fontWeight: "900",
  },

  otpTextBox: {
    flex: 1,
    marginLeft: 11,
  },

  otpTitle: {
    color: "#171B2A",
    fontSize: 13,
    fontWeight: "800",
  },

  otpSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  otpArrow: {
    color: "#C88A1D",
    fontSize: 25,
    fontWeight: "300",
    paddingLeft: 8,
  },

  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  registerText: {
    color: "#7A7C84",
    fontSize: 13,
  },

  registerLink: {
    color: "#C88A1D",
    fontSize: 13,
    fontWeight: "800",
  },

  securityRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 15,
  },

  securityIcon: {
    fontSize: 11,
    marginRight: 6,
  },

  securityText: {
    color: "#7A7C84",
    fontSize: 10,
    textAlign: "center",
  },
});