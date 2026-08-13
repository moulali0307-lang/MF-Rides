import { useEffect, useRef, useState } from "react";
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

const API_BASE_URL = "http://localhost:4000";

type RideStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

const ACTIVE_STATUSES: RideStatus[] = [
  "ACCEPTED",
  "STARTED",
];

interface Ride {
  id: string;
  status: RideStatus;
  passengerId: string;
  riderId: string | null;

  pickupAddress: string;
  destinationAddress: string;

  requestedAt: string;

  passenger?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };

  rider?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  } | null;
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
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] =
    useState<Ride | null>(null);

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [message, setMessage] = useState("");

  const activeRideRef =
    useRef<Ride | null>(null);

  useEffect(() => {
    activeRideRef.current = activeRide;
  }, [activeRide]);

  // ============================================================
  // LOAD PARTNER'S ACTIVE RIDE
  // ============================================================

  async function loadMyActiveRide(
    authToken = token,
  ) {
    if (!authToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/rides/mine`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const payload = await response.json();

      console.log(
        "MY RIDES RESPONSE:",
        payload,
      );

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message ||
            "Unable to load my rides.",
        );
      }

      const myRides: Ride[] =
        payload.data?.rides ?? [];

      // Partner-side active ride only.
      const currentActiveRide =
        myRides.find(
          (ride) =>
            ride.riderId === partnerId &&
            ACTIVE_STATUSES.includes(
              ride.status,
            ),
        ) ?? null;

      if (currentActiveRide) {
        setActiveRide(currentActiveRide);

        setRides((current) =>
          current.filter(
            (ride) =>
              ride.id !== currentActiveRide.id,
          ),
        );

        return currentActiveRide;
      }

      return null;
    } catch (error) {
      console.error(
        "MY ACTIVE RIDE ERROR:",
        error,
      );

      return null;
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async function login() {
    if (
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      setMessage(
        "Please enter phone number and password.",
      );
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
            phoneNumber:
              phoneNumber.trim(),
            password,
          }),
        },
      );

      const payload: LoginResponse =
        await response.json();

      console.log(
        "LOGIN RESPONSE:",
        payload,
      );

      if (
        !response.ok ||
        !payload.success ||
        !payload.data
      ) {
        throw new Error(
          payload.message ||
            "Login failed.",
        );
      }

      const user = payload.data.user;
      const receivedToken =
        payload.data.token;

      if (user.role !== "PARTNER") {
        throw new Error(
          "This account is not a PARTNER account.",
        );
      }

      setToken(receivedToken);
      setPartnerId(user.id);
      setPartnerName(user.fullName);
      setLoggedIn(true);

      setMessage(
        "✅ Partner login successful!",
      );

      // --------------------------------------------------------
      // FIRST: restore existing accepted/started ride
      // --------------------------------------------------------

      let existingRide: Ride | null =
        null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/rides/mine`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${receivedToken}`,
            },
          },
        );

        const myPayload =
          await response.json();

        console.log(
          "RESTORE ACTIVE RIDE RESPONSE:",
          myPayload,
        );

        if (
          response.ok &&
          myPayload.success
        ) {
          const myRides: Ride[] =
            myPayload.data?.rides ?? [];

          existingRide =
            myRides.find(
              (ride) =>
                ride.riderId === user.id &&
                ACTIVE_STATUSES.includes(
                  ride.status,
                ),
            ) ?? null;

          if (existingRide) {
            setActiveRide(existingRide);

            setMessage(
              existingRide.status ===
              "ACCEPTED"
                ? "🔐 Active ride restored. Enter passenger OTP to start."
                : "🚗 Active ride restored.",
            );
          }
        }
      } catch (error) {
        console.error(
          "RESTORE ACTIVE RIDE ERROR:",
          error,
        );
      }

      // --------------------------------------------------------
      // Only show available rides when no active ride exists
      // --------------------------------------------------------

      if (!existingRide) {
        await loadAvailableRides(
          receivedToken,
        );
      }
    } catch (error) {
      console.error(
        "PARTNER LOGIN ERROR:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to login.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD AVAILABLE RIDES
  // ============================================================

  async function loadAvailableRides(
    authToken = token,
  ) {
    if (!authToken) {
      setMessage(
        "Please login as a Partner first.",
      );
      return;
    }

    // Don't show available rides over an active ride.
    if (activeRideRef.current) {
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
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const payload =
        await response.json();

      console.log(
        "AVAILABLE RIDES RESPONSE:",
        payload,
      );

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.message ||
            "Unable to load rides.",
        );
      }

      const availableRides: Ride[] =
        payload.data?.rides ?? [];

      setRides(availableRides);

      if (
        availableRides.length === 0
      ) {
        setMessage(
          "No available ride requests.",
        );
      } else {
        setMessage(
          `${availableRides.length} ride request(s) found.`,
        );
      }
    } catch (error) {
      console.error(
        "AVAILABLE RIDES ERROR:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load available rides.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ACTIVE RIDE POLLING
  // ============================================================

  useEffect(() => {
    if (
      !loggedIn ||
      !token ||
      !activeRide
    ) {
      return;
    }

    const interval =
      setInterval(async () => {
        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/rides/${activeRide.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type":
                    "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );

          const payload =
            await response.json();

          console.log(
            "ACTIVE RIDE STATUS:",
            payload,
          );

          if (
            response.ok &&
            payload.success &&
            payload.data?.ride
          ) {
            const updatedRide =
              payload.data.ride as Ride;

            if (
              ACTIVE_STATUSES.includes(
                updatedRide.status,
              )
            ) {
              setActiveRide(
                updatedRide,
              );
            } else {
              setActiveRide(
                updatedRide,
              );
            }
          }
        } catch (error) {
          console.error(
            "ACTIVE RIDE POLL ERROR:",
            error,
          );
        }
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    loggedIn,
    token,
    activeRide?.id,
  ]);

  // ============================================================
  // ACCEPT RIDE
  // ============================================================

  async function acceptRide(
    rideId: string,
  ) {
    if (!token) {
      setMessage(
        "Please login as a Partner first.",
      );
      return;
    }

    setLoading(true);
    setMessage(
      "Accepting ride...",
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/rides/${rideId}/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const payload =
        await response.json();

      console.log(
        "ACCEPT RIDE RESPONSE:",
        payload,
      );

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.message ||
            "Unable to accept ride.",
        );
      }

      const acceptedRide =
        payload.data?.ride as Ride;

      setRides((current) =>
        current.filter(
          (ride) =>
            ride.id !== rideId,
        ),
      );

      if (acceptedRide) {
        setActiveRide(
          acceptedRide,
        );
      }

      setOtp("");

      setMessage(
        "✅ Ride accepted. Ask the passenger for the 4-digit OTP.",
      );
    } catch (error) {
      console.error(
        "ACCEPT RIDE ERROR:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // START RIDE WITH OTP
  // ============================================================

  async function startRide(
    rideId: string,
  ) {
    if (!token) {
      setMessage(
        "Please login as a Partner first.",
      );
      return;
    }

    const cleanOtp =
      otp.trim();

    if (
      !/^\d{4}$/.test(
        cleanOtp,
      )
    ) {
      setMessage(
        "Please enter the 4-digit passenger OTP.",
      );
      return;
    }

    setLoading(true);
    setMessage(
      "Verifying OTP...",
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/rides/${rideId}/start`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              otp: cleanOtp,
            }),
          },
        );

      const payload =
        await response.json();

      console.log(
        "START RIDE RESPONSE:",
        payload,
      );

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.message ||
            "Unable to start ride.",
        );
      }

      if (payload.data?.ride) {
        setActiveRide(
          payload.data.ride,
        );
      }

      setOtp("");

      setMessage(
        "🚗 OTP verified. Ride started!",
      );
    } catch (error) {
      console.error(
        "START RIDE ERROR:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // COMPLETE RIDE
  // ============================================================

  async function completeRide(
    rideId: string,
  ) {
    if (!token) {
      setMessage(
        "Please login as a Partner first.",
      );
      return;
    }

    setLoading(true);
    setMessage(
      "Completing ride...",
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/rides/${rideId}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const payload =
        await response.json();

      console.log(
        "COMPLETE RIDE RESPONSE:",
        payload,
      );

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.message ||
            "Unable to complete ride.",
        );
      }

      if (payload.data?.ride) {
        setActiveRide(
          payload.data.ride,
        );
      }

      setMessage(
        "🏁 Ride completed!",
      );
    } catch (error) {
      console.error(
        "COMPLETE RIDE ERROR:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FINISH COMPLETED RIDE
  // ============================================================

  async function finishActiveRide() {
    setActiveRide(null);
    setOtp("");

    await loadAvailableRides();
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  function logout() {
    setToken("");
    setPartnerId("");
    setPartnerName("");
    setRides([]);
    setActiveRide(null);
    setOtp("");
    setLoggedIn(false);
    setMessage("");
    setPhoneNumber("");
    setPassword("");
  }

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!loggedIn) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <StatusBar style="dark" />

        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <Text style={styles.logo}>
            MF Rides
          </Text>

          <Text style={styles.title}>
            MF Partner
          </Text>

          <Text style={styles.subtitle}>
            Partner Login
          </Text>

          <View style={styles.loginBox}>
            <Text
              style={styles.loginTitle}
            >
              Welcome Partner 👋
            </Text>

            <Text
              style={styles.loginSubtitle}
            >
              Login to receive nearby
              ride requests.
            </Text>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={
                setPhoneNumber
              }
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
              onChangeText={
                setPassword
              }
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={
                styles.loginButton
              }
              onPress={login}
              disabled={loading}
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                {loading
                  ? "Logging in..."
                  : "Partner Login"}
              </Text>
            </Pressable>
          </View>

          {message ? (
            <View
              style={
                styles.messageBox
              }
            >
              <Text
                style={
                  styles.messageText
                }
              >
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

  // ============================================================
  // PARTNER HOME
  // ============================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={styles.headerRow}
        >
          <View>
            <Text style={styles.logo}>
              MF Rides
            </Text>

            <Text style={styles.title}>
              MF Partner
            </Text>

            <Text
              style={styles.subtitle}
            >
              Welcome, {partnerName}
            </Text>
          </View>

          <Pressable
            style={
              styles.logoutButton
            }
            onPress={logout}
          >
            <Text
              style={styles.logoutText}
            >
              Logout
            </Text>
          </Pressable>
        </View>

        {message ? (
          <View
            style={styles.messageBox}
          >
            <Text
              style={
                styles.messageText
              }
            >
              {message}
            </Text>
          </View>
        ) : null}

        {/* ======================================================
            ACTIVE RIDE
        ======================================================= */}

        {activeRide ? (
          <View
            style={styles.rideCard}
          >
            <View
              style={styles.statusRow}
            >
              <Text
                style={styles.status}
              >
                {activeRide.status}
              </Text>

              <Text
                style={styles.time}
              >
                {new Date(
                  activeRide.requestedAt,
                ).toLocaleTimeString()}
              </Text>
            </View>

            <Text
              style={styles.passenger}
            >
              Passenger:{" "}
              {activeRide.passenger
                ?.fullName ??
                "Passenger"}
            </Text>

            <Text
              style={
                styles.locationLabel
              }
            >
              PICKUP
            </Text>

            <Text
              style={styles.location}
            >
              {activeRide.pickupAddress}
            </Text>

            <Text
              style={
                styles.locationLabel
              }
            >
              DESTINATION
            </Text>

            <Text
              style={styles.location}
            >
              {activeRide.destinationAddress}
            </Text>

            {/* ==================================================
                ACCEPTED + OTP
            =================================================== */}

            {activeRide.status ===
            "ACCEPTED" ? (
              <View
                style={styles.otpBox}
              >
                <Text
                  style={styles.otpTitle}
                >
                  🔐 Passenger OTP
                </Text>

                <Text
                  style={
                    styles.otpSubtitle
                  }
                >
                  Ask the passenger for
                  the 4-digit OTP shown in
                  their MF Rider app.
                </Text>

                <TextInput
                  style={
                    styles.otpInput
                  }
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor="#888"
                  value={otp}
                  onChangeText={(
                    value,
                  ) => {
                    const digits =
                      value
                        .replace(
                          /[^0-9]/g,
                          "",
                        )
                        .slice(0, 4);

                    setOtp(digits);
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <Pressable
                  style={[
                    styles.acceptButton,
                    otp.length !== 4 &&
                      styles.disabledButton,
                  ]}
                  onPress={() =>
                    startRide(
                      activeRide.id,
                    )
                  }
                  disabled={
                    loading ||
                    otp.length !== 4
                  }
                >
                  <Text
                    style={
                      styles.acceptText
                    }
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify OTP & Start Ride"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* ==================================================
                STARTED
            =================================================== */}

            {activeRide.status ===
            "STARTED" ? (
              <Pressable
                style={
                  styles.acceptButton
                }
                onPress={() =>
                  completeRide(
                    activeRide.id,
                  )
                }
                disabled={loading}
              >
                <Text
                  style={
                    styles.acceptText
                  }
                >
                  {loading
                    ? "Please wait..."
                    : "Complete Ride"}
                </Text>
              </Pressable>
            ) : null}

            {/* ==================================================
                COMPLETED
            =================================================== */}

            {activeRide.status ===
            "COMPLETED" ? (
              <>
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  🏁 Ride Completed
                </Text>

                <Pressable
                  style={
                    styles.refreshButton
                  }
                  onPress={
                    finishActiveRide
                  }
                >
                  <Text
                    style={
                      styles.refreshText
                    }
                  >
                    Back to Available Rides
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : (
          <>
            {/* ==================================================
                AVAILABLE RIDES
            =================================================== */}

            <Pressable
              style={
                styles.refreshButton
              }
              onPress={() =>
                loadAvailableRides()
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.refreshText
                }
              >
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

            {!loading &&
            rides.length === 0 ? (
              <View
                style={styles.emptyBox}
              >
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No ride requests
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  New rider requests will
                  appear here.
                </Text>
              </View>
            ) : null}

            {rides.map((ride) => (
              <View
                key={ride.id}
                style={styles.rideCard}
              >
                <View
                  style={
                    styles.statusRow
                  }
                >
                  <Text
                    style={styles.status}
                  >
                    {ride.status}
                  </Text>

                  <Text
                    style={styles.time}
                  >
                    {new Date(
                      ride.requestedAt,
                    ).toLocaleTimeString()}
                  </Text>
                </View>

                <Text
                  style={
                    styles.passenger
                  }
                >
                  Passenger:{" "}
                  {ride.passenger
                    ?.fullName ??
                    "Passenger"}
                </Text>

                <Text
                  style={
                    styles.locationLabel
                  }
                >
                  PICKUP
                </Text>

                <Text
                  style={styles.location}
                >
                  {ride.pickupAddress}
                </Text>

                <Text
                  style={
                    styles.locationLabel
                  }
                >
                  DESTINATION
                </Text>

                <Text
                  style={styles.location}
                >
                  {ride.destinationAddress}
                </Text>

                <Pressable
                  style={
                    styles.acceptButton
                  }
                  onPress={() =>
                    acceptRide(
                      ride.id,
                    )
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.acceptText
                    }
                  >
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

// ============================================================
// STYLES
// ============================================================

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

  // ==========================================================
  // OTP
  // ==========================================================

  otpBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  otpTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  otpSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    lineHeight: 19,
  },

  otpInput: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 8,
    textAlign: "center",
    color: "#111",
  },

  acceptButton: {
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.45,
  },

  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});