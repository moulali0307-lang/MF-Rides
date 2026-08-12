import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_BASE_URL = "http://192.168.1.8:4000";

type RideStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

interface Ride {
  id: string;
  status: RideStatus;
  passengerId: string;
  pickupAddress: string;
  destinationAddress: string;
  requestedAt: string;
  passenger?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      fullName: string;
      phoneNumber: string;
      role: string;
    };
    token: string;
  };
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [message, setMessage] = useState("");

  async function login() {
    if (!phoneNumber.trim() || !password.trim()) {
      setMessage("Please enter phone number and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber.trim(),
            password,
          }),
        },
      );

      const payload: LoginResponse = await response.json();

      console.log("LOGIN RESPONSE:", payload);

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message || "Login failed.",
        );
      }

      const user = payload.data.user;
      const receivedToken = payload.data.token;

      if (user.role !== "PARTNER") {
        throw new Error(
          "This account is not a PARTNER account.",
        );
      }

      setToken(receivedToken);
      setPartnerName(user.fullName);
      setLoggedIn(true);
      setMessage("✅ Partner login successful!");

      await loadAvailableRides(receivedToken);
    } catch (error) {
      console.error("PARTNER LOGIN ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to login.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableRides(authToken = token) {
    if (!authToken) {
      setMessage("Please login as a Partner first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rides/available`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const payload = await response.json();

      console.log("AVAILABLE RIDES RESPONSE:", payload);

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Unable to load rides.",
        );
      }

      const availableRides = payload.data?.rides ?? [];

      setRides(availableRides);

      if (availableRides.length === 0) {
        setMessage("No available ride requests.");
      } else {
        setMessage(
          `${availableRides.length} ride request(s) found.`,
        );
      }
    } catch (error) {
      console.error("AVAILABLE RIDES ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load available rides.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function acceptRide(rideId: string) {
    if (!token) {
      setMessage("Please login as a Partner first.");
      return;
    }

    setLoading(true);
    setMessage("Accepting ride...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rides/${rideId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = await response.json();

      console.log("ACCEPT RIDE RESPONSE:", payload);

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Unable to accept ride.",
        );
      }

      setMessage("✅ Ride accepted successfully!");

      setRides((current) =>
        current.filter((ride) => ride.id !== rideId),
      );

      if (payload.data?.ride) {
        setActiveRide(payload.data.ride);
      }
    } catch (error) {
      console.error("ACCEPT RIDE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function startRide(rideId: string) {
    if (!token) {
      setMessage("Please login as a Partner first.");
      return;
    }

    setLoading(true);
    setMessage("Starting ride...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rides/${rideId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = await response.json();

      console.log("START RIDE RESPONSE:", payload);

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Unable to start ride.",
        );
      }

      setMessage("🚗 Ride started!");

      if (payload.data?.ride) {
        setActiveRide(payload.data.ride);
      }
    } catch (error) {
      console.error("START RIDE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function completeRide(rideId: string) {
    if (!token) {
      setMessage("Please login as a Partner first.");
      return;
    }

    setLoading(true);
    setMessage("Completing ride...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rides/${rideId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = await response.json();

      console.log("COMPLETE RIDE RESPONSE:", payload);

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "Unable to complete ride.",
        );
      }

      setMessage("🏁 Ride completed!");

      if (payload.data?.ride) {
        setActiveRide(payload.data.ride);
      }
    } catch (error) {
      console.error("COMPLETE RIDE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  function finishActiveRide() {
    setActiveRide(null);
    loadAvailableRides();
  }

  function logout() {
    setToken("");
    setPartnerName("");
    setRides([]);
    setActiveRide(null);
    setLoggedIn(false);
    setMessage("");
    setPhoneNumber("");
    setPassword("");
  }

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logo}>MF Rides</Text>

          <Text style={styles.title}>MF Partner</Text>

          <Text style={styles.subtitle}>
            Partner Login
          </Text>

          <View style={styles.loginBox}>
            <Text style={styles.loginTitle}>
              Welcome Partner 👋
            </Text>

            <Text style={styles.loginSubtitle}>
              Login to receive nearby ride requests.
            </Text>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={styles.loginButton}
              onPress={login}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Logging in..." : "Partner Login"}
              </Text>
            </Pressable>
          </View>

          {message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {message}
              </Text>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator
              size="large"
              style={styles.loader}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.logo}>MF Rides</Text>

            <Text style={styles.title}>
              MF Partner
            </Text>

            <Text style={styles.subtitle}>
              Welcome, {partnerName}
            </Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        ) : null}

        {activeRide ? (
          <View style={styles.rideCard}>
            <View style={styles.statusRow}>
              <Text style={styles.status}>
                {activeRide.status}
              </Text>

              <Text style={styles.time}>
                {new Date(
                  activeRide.requestedAt,
                ).toLocaleTimeString()}
              </Text>
            </View>

            <Text style={styles.passenger}>
              Passenger:{" "}
              {activeRide.passenger?.fullName ?? "Passenger"}
            </Text>

            <Text style={styles.locationLabel}>
              PICKUP
            </Text>

            <Text style={styles.location}>
              {activeRide.pickupAddress}
            </Text>

            <Text style={styles.locationLabel}>
              DESTINATION
            </Text>

            <Text style={styles.location}>
              {activeRide.destinationAddress}
            </Text>

            {activeRide.status === "ACCEPTED" ? (
              <Pressable
                style={styles.acceptButton}
                onPress={() => startRide(activeRide.id)}
                disabled={loading}
              >
                <Text style={styles.acceptText}>
                  {loading
                    ? "Please wait..."
                    : "Start Ride"}
                </Text>
              </Pressable>
            ) : null}

            {activeRide.status === "STARTED" ? (
              <Pressable
                style={styles.acceptButton}
                onPress={() => completeRide(activeRide.id)}
                disabled={loading}
              >
                <Text style={styles.acceptText}>
                  {loading
                    ? "Please wait..."
                    : "Complete Ride"}
                </Text>
              </Pressable>
            ) : null}

            {activeRide.status === "COMPLETED" ? (
              <>
                <Text style={styles.emptyTitle}>
                  🏁 Ride Completed
                </Text>

                <Pressable
                  style={styles.refreshButton}
                  onPress={finishActiveRide}
                >
                  <Text style={styles.refreshText}>
                    Back to Available Rides
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : (
          <>
            <Pressable
              style={styles.refreshButton}
              onPress={() => loadAvailableRides()}
              disabled={loading}
            >
              <Text style={styles.refreshText}>
                {loading
                  ? "Loading..."
                  : "Refresh Ride Requests"}
              </Text>
            </Pressable>

            {loading ? (
              <ActivityIndicator
                size="large"
                style={styles.loader}
              />
            ) : null}

            {!loading && rides.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  No ride requests
                </Text>

                <Text style={styles.emptyText}>
                  New rider requests will appear here.
                </Text>
              </View>
            ) : null}

            {rides.map((ride) => (
              <View
                key={ride.id}
                style={styles.rideCard}
              >
                <View style={styles.statusRow}>
                  <Text style={styles.status}>
                    {ride.status}
                  </Text>

                  <Text style={styles.time}>
                    {new Date(
                      ride.requestedAt,
                    ).toLocaleTimeString()}
                  </Text>
                </View>

                <Text style={styles.passenger}>
                  Passenger:{" "}
                  {ride.passenger?.fullName ?? "Passenger"}
                </Text>

                <Text style={styles.locationLabel}>
                  PICKUP
                </Text>

                <Text style={styles.location}>
                  {ride.pickupAddress}
                </Text>

                <Text style={styles.locationLabel}>
                  DESTINATION
                </Text>

                <Text style={styles.location}>
                  {ride.destinationAddress}
                </Text>

                <Pressable
                  style={styles.acceptButton}
                  onPress={() => acceptRide(ride.id)}
                  disabled={loading}
                >
                  <Text style={styles.acceptText}>
                    {loading
                      ? "Please wait..."
                      : "Accept Ride"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  content: {
    padding: 24,
    paddingTop: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  logo: {
    fontSize: 18,
    fontWeight: "800",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
    marginBottom: 20,
  },

  loginBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  loginTitle: {
    fontSize: 22,
    fontWeight: "800",
  },

  loginSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
  },

  loginButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 22,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  messageBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#eeeeee",
    marginTop: 16,
    marginBottom: 16,
  },

  messageText: {
    fontSize: 14,
    fontWeight: "600",
  },

  refreshButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    marginBottom: 20,
  },

  refreshText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  logoutText: {
    fontWeight: "700",
  },

  loader: {
    marginVertical: 30,
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 8,
    color: "#777",
    textAlign: "center",
  },

  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  status: {
    fontSize: 13,
    fontWeight: "800",
  },

  time: {
    fontSize: 12,
    color: "#777",
  },

  passenger: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 18,
  },

  locationLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#777",
    marginTop: 8,
  },

  location: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  acceptButton: {
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});