import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.fullName ?? "Rider"} 👋</Text>
        <Text style={styles.subtitle}>You're signed in to MF Rides.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Phone number</Text>
          <Text style={styles.cardValue}>{user?.phoneNumber}</Text>

          {user?.email && (
            <>
              <Text style={[styles.cardLabel, styles.cardLabelSpaced]}>Email</Text>
              <Text style={styles.cardValue}>{user.email}</Text>
            </>
          )}

          <Text style={[styles.cardLabel, styles.cardLabelSpaced]}>Role</Text>
          <Text style={styles.cardValue}>{user?.role}</Text>
        </View>

        <Text style={styles.comingSoon}>
          Ride booking, live tracking, and payments are coming soon.
        </Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  greeting: {
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardLabelSpaced: {
    marginTop: spacing.md,
  },
  cardValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  comingSoon: {
    marginTop: spacing.lg,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  logoutButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
