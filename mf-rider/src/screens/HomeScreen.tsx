import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";

interface HomeScreenProps {
  onBookRide: () => void;
}

export function HomeScreen({ onBookRide }: HomeScreenProps) {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const handleOnlineToggle = () => {
    setIsOnline((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>
          Hello, {user?.fullName ?? "Rider"} 👋
        </Text>

        <Text style={styles.subtitle}>
          You're signed in to MF Rides.
        </Text>

        {/* ONLINE / OFFLINE */}
        <View style={styles.onlineCard}>
          <View>
            <Text style={styles.onlineTitle}>
              Rider Status
            </Text>

            <Text
              style={[
                styles.onlineStatus,
                isOnline ? styles.online : styles.offline,
              ]}
            >
              {isOnline ? "🟢 ONLINE" : "⚫ OFFLINE"}
            </Text>
          </View>

          <Pressable
            style={[
              styles.onlineButton,
              isOnline
                ? styles.goOfflineButton
                : styles.goOnlineButton,
            ]}
            onPress={handleOnlineToggle}
          >
            <Text style={styles.onlineButtonText}>
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Phone number</Text>
          <Text style={styles.cardValue}>
            {user?.phoneNumber}
          </Text>

          {user?.email && (
            <>
              <Text
                style={[
                  styles.cardLabel,
                  styles.cardLabelSpaced,
                ]}
              >
                Email
              </Text>

              <Text style={styles.cardValue}>
                {user.email}
              </Text>
            </>
          )}

          <Text
            style={[
              styles.cardLabel,
              styles.cardLabelSpaced,
            ]}
          >
            Role
          </Text>

          <Text style={styles.cardValue}>
            {user?.role}
          </Text>
        </View>

        <Pressable
          style={styles.bookButton}
          onPress={onBookRide}
        >
          <Text style={styles.bookButtonText}>
            Book a Ride 🚕
          </Text>
        </Pressable>

        {isOnline && (
          <View style={styles.requestCard}>
            <Text style={styles.requestTitle}>
              🚕 Looking for ride requests...
            </Text>

            <Text style={styles.requestSubtitle}>
              New passenger requests will appear here.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>
          Log out
        </Text>
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

  onlineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  onlineTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  onlineStatus: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.xs,
  },

  online: {
    color: "#16a34a",
  },

  offline: {
    color: colors.textMuted,
  },

  onlineButton: {
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  goOnlineButton: {
    backgroundColor: "#16a34a",
  },

  goOfflineButton: {
    backgroundColor: "#555",
  },

  onlineButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
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

  bookButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },

  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#16a34a",
    padding: spacing.lg,
    marginTop: spacing.lg,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  requestSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
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