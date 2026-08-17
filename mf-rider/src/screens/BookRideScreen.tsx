import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import type MapView from "react-native-maps";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RideMap } from "../components/RideMap";

import {
  cancelRide,
  createRide,
  getRide,
  listMyRides,
} from "../api/ride";

import type { Ride } from "../api/ride";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme/colors";

interface BookRideScreenProps {
  onBack: () => void;
}

const ACTIVE_STATUSES: Ride["status"][] = [
  "REQUESTED",
  "ACCEPTED",
  "STARTED",
];

const POLL_INTERVAL_MS = 6000;

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface PlaceSuggestion {
  placeId: string;
  title: string;
  subtitle: string;
}

interface SelectedPlace {
  address: string;
  latitude: number;
  longitude: number;
}

export function BookRideScreen({
  onBack,
}: BookRideScreenProps) {
  const mapRef = useRef<MapView | null>(null);
  const { token } = useAuth();

  // ============================================================
  // LOCATION SEARCH STATE
  // ============================================================

  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] =
    useState("");

  const [pickupLatitude, setPickupLatitude] =
    useState<number | null>(null);

  const [pickupLongitude, setPickupLongitude] =
    useState<number | null>(null);

  const [destinationLatitude, setDestinationLatitude] =
    useState<number | null>(null);

  const [destinationLongitude, setDestinationLongitude] =
    useState<number | null>(null);

  const [pickupSuggestions, setPickupSuggestions] =
    useState<PlaceSuggestion[]>([]);

  const [destinationSuggestions, setDestinationSuggestions] =
    useState<PlaceSuggestion[]>([]);

  const [searchingPickup, setSearchingPickup] =
    useState(false);

  const [searchingDestination, setSearchingDestination] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  

  const pickupSearchTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const destinationSearchTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // RIDE STATE
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [restoringRide, setRestoringRide] =
    useState(true);

  const [ride, setRide] = useState<Ride | null>(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  const pollTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // STOP POLLING
  // ============================================================

  function stopPolling() {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // ============================================================
  // GOOGLE PLACES AUTOCOMPLETE
  // ============================================================

  async function searchGooglePlaces(
    input: string,
  ): Promise<PlaceSuggestion[]> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error(
        "Google Maps API key is missing. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env.",
      );
    }

    const trimmed = input.trim();

    if (trimmed.length < 2) {
      return [];
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input: trimmed,
          includedRegionCodes: ["in"],
          languageCode: "en",
        }),
      },
    );

    const data = await response.json();

    console.log(
      "📍 GOOGLE PLACES STATUS:",
      response.status,
    );

    if (!response.ok) {
      console.error(
        "❌ GOOGLE PLACES ERROR:",
        data,
      );

      throw new Error(
        data?.error?.message ||
          "Google Places search failed.",
      );
    }

    const suggestions =
      Array.isArray(data?.suggestions)
        ? data.suggestions
        : [];

    return suggestions
      .map((item: any) => {
        const prediction =
          item?.placePrediction;

        if (!prediction?.placeId) {
          return null;
        }

        return {
          placeId: prediction.placeId,
          title:
            prediction?.structuredFormat
              ?.mainText?.text ||
            prediction?.text?.text ||
            "",
          subtitle:
            prediction?.structuredFormat
              ?.secondaryText?.text ||
            "",
        };
      })
      .filter(Boolean);
  }

  // ============================================================
  // GOOGLE PLACE DETAILS
  // ============================================================

  async function getGooglePlaceDetails(
    placeId: string,
  ): Promise<SelectedPlace> {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error(
        "Google Maps API key is missing.",
      );
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(
        placeId,
      )}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "location,formattedAddress,displayName",
        },
      },
    );

    const data = await response.json();

    console.log(
      "📍 PLACE DETAILS STATUS:",
      response.status,
    );

    if (!response.ok) {
      console.error(
        "❌ PLACE DETAILS ERROR:",
        data,
      );

      throw new Error(
        data?.error?.message ||
          "Unable to get selected location.",
      );
    }

    const latitude = data?.location?.latitude;
    const longitude = data?.location?.longitude;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      throw new Error(
        "Selected location does not have valid coordinates.",
      );
    }

    return {
      address:
        data?.formattedAddress ||
        data?.displayName?.text ||
        "Selected location",
      latitude,
      longitude,
    };
  }

  // ============================================================
  // GOOGLE GEOCODING
  // ============================================================

  async function geocodeAddress(
  input: string,
): Promise<SelectedPlace> {

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error(
      "Google Maps API key is missing.",
    );
  }

  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error(
      "Please enter a destination.",
    );
  }

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      trimmed,
    )}&key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&region=in&language=en`;

  const response =
    await fetch(url);

  const data =
    await response.json();

  console.log(
    "📍 GEOCODING STATUS:",
    response.status,
    data?.status,
  );

  if (
    !response.ok ||
    data?.status !== "OK"
  ) {

    console.error(
      "❌ GEOCODING ERROR:",
      data,
    );

    if (
      data?.status === "REQUEST_DENIED"
    ) {
      throw new Error(
        data?.error_message ||
          "Google Geocoding API request was denied.",
      );
    }

    if (
      data?.status === "ZERO_RESULTS"
    ) {
      throw new Error(
        `Location "${trimmed}" could not be found. Please enter a more specific place.`,
      );
    }

    throw new Error(
      data?.error_message ||
        "Unable to find this location.",
    );
  }

  const result =
    data?.results?.[0];

  const latitude =
    result?.geometry?.location?.lat;

  const longitude =
    result?.geometry?.location?.lng;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    throw new Error(
      "Google could not return valid coordinates for this location.",
    );
  }

  return {
    address:
      result?.formatted_address ||
      trimmed,

    latitude,

    longitude,
  };
}

  // ============================================================
  // SEARCH PICKUP
  // ============================================================

  function handlePickupChange(value: string) {
    setPickupAddress(value);

    // Manual edit means previous coordinates are no longer trusted.
    setPickupLatitude(null);
    setPickupLongitude(null);

    setLocationError("");

    if (pickupSearchTimerRef.current !== null) {
      clearTimeout(pickupSearchTimerRef.current);
    }

    if (value.trim().length < 2) {
      setPickupSuggestions([]);
      return;
    }

    pickupSearchTimerRef.current =
      setTimeout(async () => {
        try {
          setSearchingPickup(true);

          const results =
            await searchGooglePlaces(value);

          setPickupSuggestions(results);
        } catch (error) {
          console.error(
            "❌ PICKUP SEARCH ERROR:",
            error,
          );

          setPickupSuggestions([]);
        } finally {
          setSearchingPickup(false);
        }
      }, 350);
  }

  // ============================================================
  // SEARCH DESTINATION
  // ============================================================

  function handleDestinationChange(
    value: string,
  ) {
    setDestinationAddress(value);

    // Manual edit means previous coordinates are no longer trusted.
    setDestinationLatitude(null);
    setDestinationLongitude(null);

    setErrorMessage("");

    if (
      destinationSearchTimerRef.current !== null
    ) {
      clearTimeout(
        destinationSearchTimerRef.current,
      );
    }

    if (value.trim().length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    destinationSearchTimerRef.current =
      setTimeout(async () => {
        try {
          setSearchingDestination(true);

          const results =
            await searchGooglePlaces(value);

          setDestinationSuggestions(results);
        } catch (error) {
          console.error(
            "❌ DESTINATION SEARCH ERROR:",
            error,
          );

          setDestinationSuggestions([]);
        } finally {
          setSearchingDestination(false);
        }
      }, 350);
  }

  // ============================================================
  // SELECT PICKUP
  // ============================================================

  async function selectPickupPlace(
    suggestion: PlaceSuggestion,
  ) {
    try {
      setSearchingPickup(true);
      setPickupSuggestions([]);

      const place =
        await getGooglePlaceDetails(
          suggestion.placeId,
        );

      setPickupAddress(place.address);
      setPickupLatitude(place.latitude);
      setPickupLongitude(place.longitude);

      console.log(
        "📍 PICKUP SELECTED:",
        place,
      );
    } catch (error) {
      console.error(
        "❌ PICKUP SELECTION ERROR:",
        error,
      );

      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to select pickup location.",
      );
    } finally {
      setSearchingPickup(false);
    }
  }

  // ============================================================
  // SELECT DESTINATION
  // ============================================================

  async function selectDestinationPlace(
    suggestion: PlaceSuggestion,
  ) {
    try {
      setSearchingDestination(true);
      setDestinationSuggestions([]);

      const place =
        await getGooglePlaceDetails(
          suggestion.placeId,
        );

      setDestinationAddress(place.address);
      setDestinationLatitude(place.latitude);
      setDestinationLongitude(place.longitude);

      console.log(
        "📍 DESTINATION SELECTED:",
        place,
      );
    } catch (error) {
      console.error(
        "❌ DESTINATION SELECTION ERROR:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to select destination.",
      );
    } finally {
      setSearchingDestination(false);
    }
  }

  // ============================================================
// CURRENT DEVICE LOCATION
// ============================================================

async function detectCurrentLocation() {
  try {
    setLocationLoading(true);
    setLocationError("");
    setPickupSuggestions([]);

    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (
      permission.status !==
      Location.PermissionStatus.GRANTED
    ) {
      setLocationError(
        "Location permission is required.",
      );
      return;
    }

    const current =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const latitude = current.coords.latitude;
    const longitude = current.coords.longitude;

    setPickupLatitude(latitude);
    setPickupLongitude(longitude);

    // Reverse geocoding via Expo's native/OS geocoder.
    // (Legacy Google Geocoding API removed — the key is
    // restricted to "Places API (New)" only, so calls to
    // maps.googleapis.com/maps/api/geocode always fail.)
    try {
      const addresses =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (addresses.length > 0) {
        const address = addresses[0];

        const parts = [
          address.name,
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean);

        setPickupAddress(
          parts.length > 0
            ? parts.join(", ")
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        );
      } else {
        setPickupAddress(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        );
      }
    } catch {
      setPickupAddress(
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      );
    }

    console.log("📍 CURRENT PICKUP:", latitude, longitude);
  } catch (error) {
    console.error("❌ LOCATION ERROR:", error);

    setLocationError(
      error instanceof Error
        ? error.message
        : "Unable to detect your current location.",
    );
  } finally {
    setLocationLoading(false);
  }
}
  // ============================================================
  // FIT MAP TO PICKUP + DESTINATION
  // ============================================================
  useEffect(() => {
    const coordinates: Array<{
      latitude: number;
      longitude: number;
    }> = [];

    if (pickupLatitude !== null && pickupLongitude !== null) {
      coordinates.push({
        latitude: pickupLatitude,
        longitude: pickupLongitude,
      });
    }

    if (
      destinationLatitude !== null &&
      destinationLongitude !== null
    ) {
      coordinates.push({
        latitude: destinationLatitude,
        longitude: destinationLongitude,
      });
    }

    if (coordinates.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 60,
          right: 40,
          bottom: 60,
          left: 40,
        },
        animated: true,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [
    pickupLatitude,
    pickupLongitude,
    destinationLatitude,
    destinationLongitude,

  ]);
  // ============================================================
  // INITIAL LOCATION
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        pickupSearchTimerRef.current !== null
      ) {
        clearTimeout(
          pickupSearchTimerRef.current,
        );
      }

      if (
        destinationSearchTimerRef.current !==
        null
      ) {
        clearTimeout(
          destinationSearchTimerRef.current,
        );
      }

      stopPolling();
    };
  }, []);

  // ============================================================
  // RESTORE ACTIVE RIDE
  // ============================================================

  useEffect(() => {
    if (!token) {
      setRestoringRide(false);
      return;
    }

   let cancelled = false;

async function restoreActiveRide() {
  if (!token) {
    return;
  }

  try {
    setRestoringRide(true);
    setErrorMessage("");

    console.log(
      "🔍 CHECKING RIDER ACTIVE RIDE...",
    );

    const result =
      await listMyRides(token);

    if (cancelled) {
      return;
    }

        const activeRide =
          result.rides.find((item) =>
            ACTIVE_STATUSES.includes(
              item.status,
            ),
          ) ?? null;

        if (activeRide) {
          console.log(
            "✅ ACTIVE RIDE RESTORED:",
            activeRide.id,
            activeRide.status,
          );

          setRide(activeRide);
        } else {
          setRide(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "❌ ACTIVE RIDE RESTORE ERROR:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setRestoringRide(false);
        }
      }
    }

    restoreActiveRide();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ============================================================
  // RIDE STATUS POLLING
  // ============================================================

  useEffect(() => {
    stopPolling();

    if (
      !ride ||
      !token ||
      !ACTIVE_STATUSES.includes(
        ride.status,
      )
    ) {
      return;
    }

    pollTimerRef.current =
      setInterval(async () => {
        try {
          const result =
            await getRide(
              ride.id,
              token,
            );

          setRide(result.ride);
        } catch (error) {
          console.error(
            "❌ RIDE STATUS POLL ERROR:",
            error,
          );
        }
      }, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [
    ride?.id,
    ride?.status,
    token,
  ]);

  // ============================================================
  // BOOK NEW RIDE
  // ============================================================

  async function handleBookRide() {
    if (loading || restoringRide) {
      return;
    }

    setErrorMessage("");

    if (!pickupAddress.trim()) {
      setErrorMessage(
        "Please select a pickup location.",
      );
      return;
    }

    if (!destinationAddress.trim()) {
      setErrorMessage(
        "Please enter a destination.",
      );
      return;
    }

    if (!token) {
      setErrorMessage(
        "Your login session has expired. Please login again.",
      );
      return;
    }

    if (
      ride &&
      ACTIVE_STATUSES.includes(
        ride.status,
      )
    ) {
      setErrorMessage(
        "You already have an active ride. Please finish or cancel it first.",
      );
      return;
    }

    setLoading(true);

    try {
  // 👇 NEW PICKUP CODE
      let finalPickupAddress = pickupAddress.trim();
      let finalPickupLatitude = pickupLatitude;
      let finalPickupLongitude = pickupLongitude;

      if (
        finalPickupLatitude === null ||
        finalPickupLongitude === null
      ) {
        const pickupPlace = await geocodeAddress(
          finalPickupAddress,
        );

        finalPickupAddress = pickupPlace.address;
        finalPickupLatitude = pickupPlace.latitude;
        finalPickupLongitude = pickupPlace.longitude;

        setPickupAddress(pickupPlace.address);
        setPickupLatitude(pickupPlace.latitude);
        setPickupLongitude(pickupPlace.longitude);
      }

  // 👇 EXISTING DESTINATION CODE
      let finalDestinationAddress =
        destinationAddress.trim();

      let finalDestinationLatitude =
        destinationLatitude;

      let finalDestinationLongitude =
        destinationLongitude;

  
      if (
        finalDestinationLatitude === null ||
        finalDestinationLongitude === null
      ) {
        const place =
          await geocodeAddress(
            finalDestinationAddress,
          );

        finalDestinationAddress =
          place.address;

        finalDestinationLatitude =
          place.latitude;

        finalDestinationLongitude =
          place.longitude;

        setDestinationAddress(
          place.address,
        );

        setDestinationLatitude(
          place.latitude,
        );

        setDestinationLongitude(
          place.longitude,
        );
      }
      
      console.log("🚕 CREATING RIDE");

      if (
        finalPickupLatitude === null ||
        finalPickupLongitude === null
      ) {
        throw new Error(
          "Unable to get pickup location coordinates.",
        );
      }

      if (
        finalDestinationLatitude === null ||
        finalDestinationLongitude === null
      ) {
        throw new Error(
          "Unable to get destination coordinates.",
        );
      }

        const result =
  await createRide(
    {
      pickupAddress:
        finalPickupAddress,

      pickupLatitude:
        finalPickupLatitude,

      pickupLongitude:
        finalPickupLongitude,

      destinationAddress:
        finalDestinationAddress,

      destinationLatitude:
        finalDestinationLatitude,

      destinationLongitude:
        finalDestinationLongitude,
    },
    token,
  );

      console.log(
        "✅ CREATE RIDE RESULT:",
        result,
      );

      if (!result?.ride?.id) {
        throw new Error(
          "Ride was created, but the server returned an unexpected response.",
        );
      }

      setRide(result.ride);
      setErrorMessage("");
    } catch (error) {
      console.error(
        "❌ BOOK RIDE ERROR:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create ride.";

      if (
        message
          .toLowerCase()
          .includes("active ride")
      ) {
        try {
          const result =
            await listMyRides(token);

          const activeRide =
            result.rides.find((item) =>
              ACTIVE_STATUSES.includes(
                item.status,
              ),
            ) ?? null;

          if (activeRide) {
            setRide(activeRide);
            setErrorMessage("");
            return;
          }
        } catch (restoreError) {
          console.error(
            "❌ ACTIVE RIDE RECOVERY ERROR:",
            restoreError,
          );
        }
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // CANCEL RIDE CONFIRMATION
  // ============================================================

  function confirmCancelRide() {
    if (!ride || loading) {
      return;
    }

    if (
      ride.status !== "REQUESTED" &&
      ride.status !== "ACCEPTED"
    ) {
      Alert.alert(
        "Cannot Cancel",
        "This ride cannot be cancelled at the current stage.",
      );

      return;
    }

    Alert.alert(
      "Cancel Ride?",
      "Are you sure you want to cancel this ride?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: handleCancelRide,
        },
      ],
    );
  }

  // ============================================================
  // CANCEL RIDE
  // ============================================================

  async function handleCancelRide() {
    if (
      !ride ||
      !token ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result =
        await cancelRide(
          ride.id,
          token,
          "Cancelled by passenger",
        );

      if (!result?.ride) {
        throw new Error(
          "Ride cancellation response was invalid.",
        );
      }

      setRide(result.ride);

      stopPolling();
      setErrorMessage("");
    } catch (error) {
      console.error(
        "❌ CANCEL RIDE ERROR:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to cancel ride.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // BACK FROM RIDE
  // ============================================================

  function handleBackFromRide() {
    if (
      ride &&
      ACTIVE_STATUSES.includes(
        ride.status,
      )
    ) {
      return;
    }

    stopPolling();

    setRide(null);
    setErrorMessage("");

    onBack();
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (restoringRide) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          My Rides
        </Text>

        <View style={styles.restoreBox}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />

          <Text style={styles.restoreTitle}>
            Checking your active ride...
          </Text>

          <Text style={styles.restoreText}>
            Please wait while we restore
            your current ride.
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <View style={styles.container}>
      <Pressable
        onPress={
          ride &&
          ACTIVE_STATUSES.includes(
            ride.status,
          )
            ? undefined
            : onBack
        }
        disabled={
          loading ||
          Boolean(
            ride &&
              ACTIVE_STATUSES.includes(
                ride.status,
              ),
          )
        }
      >
        <Text
          style={[
            styles.backText,
            ride &&
            ACTIVE_STATUSES.includes(
              ride.status,
            )
              ? styles.backTextDisabled
              : null,
          ]}
        >
          ← Back
        </Text>
      </Pressable>

      <Text style={styles.title}>
        {ride
          ? "Your Ride"
          : "Book a Ride"}
      </Text>

      <Text style={styles.subtitle}>
        {ride
          ? "Your current ride details"
          : "Choose pickup and destination"}
      </Text>

      {/* LOCATION ERROR */}

      {locationError ? (
        <View style={styles.locationErrorBox}>
          <Text style={styles.locationErrorTitle}>
            📍 Location Problem
          </Text>

          <Text style={styles.locationErrorText}>
            {locationError}
          </Text>
        </View>
      ) : null}

      {/* ACTIVE RIDE */}

      {ride ? (
        <RideStatusCard
          ride={ride}
          onBack={handleBackFromRide}
          onCancel={confirmCancelRide}
          loading={loading}
        />
      ) : null}

      {/* ERROR */}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>
            Something went wrong
          </Text>

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* MAP */}

      {!ride && pickupLatitude !== null && pickupLongitude !== null ? (
  <View style={styles.mapContainer}>
    <RideMap
      ref={mapRef}
      pickupLatitude={pickupLatitude}
      pickupLongitude={pickupLongitude}
      pickupAddress={pickupAddress}
      destinationLatitude={destinationLatitude}
      destinationLongitude={destinationLongitude}
      destinationAddress={destinationAddress}
    />
  </View>
) : null}

      {/* NEW BOOKING */}

      {!ride ? (
        <>
          {/* PICKUP */}

          <Text style={styles.label}>
            Pickup location
          </Text>

          <View style={styles.locationInputBox}>
            <TextInput
              style={styles.locationInput}
              placeholder="Search pickup location"
              placeholderTextColor={
                colors.textMuted
              }
              value={pickupAddress}
              onChangeText={
                handlePickupChange
              }
              editable={!loading}
            />

            {searchingPickup ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
              />
            ) : null}

            <Pressable
              onPress={
                detectCurrentLocation
              }
              disabled={
                locationLoading ||
                loading
              }
              style={styles.locationButton}
            >
              {locationLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.accent}
                />
              ) : (
                <Text
                  style={
                    styles.locationIcon
                  }
                >
                  📍
                </Text>
              )}
            </Pressable>
          </View>

          {pickupSuggestions.length >
          0 ? (
            <PlaceSuggestions
              suggestions={
                pickupSuggestions
              }
              onSelect={
                selectPickupPlace
              }
            />
          ) : null}

          {pickupLatitude !== null &&
          pickupLongitude !== null ? (
            <Text style={styles.selectedText}>
              ✓ Pickup selected
            </Text>
          ) : (
            <Text style={styles.helperText}>
              Search a place or use your
              current location
            </Text>
          )}

          {/* DESTINATION */}

          <Text style={styles.label}>
            Destination
          </Text>

          <View style={styles.locationInputBox}>
            <TextInput
              style={styles.locationInput}
              placeholder="Where do you want to go?"
              placeholderTextColor={
                colors.textMuted
              }
              value={
                destinationAddress
              }
              onChangeText={
                handleDestinationChange
              }
              editable={!loading}
            />

            {searchingDestination ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
              />
            ) : null}
          </View>

          {destinationSuggestions.length >
          0 ? (
            <PlaceSuggestions
              suggestions={
                destinationSuggestions
              }
              onSelect={
                selectDestinationPlace
              }
            />
          ) : null}

          {destinationLatitude !==
            null &&
          destinationLongitude !==
            null ? (
            <Text style={styles.selectedText}>
              ✓ Destination selected
            </Text>
          ) : (
            <Text style={styles.helperText}>
              Type a place name and tap Confirm Ride.
              You can also select a Google suggestion.
            </Text>
          )}

          {/* CONFIRM */}

          <Pressable
            style={[
            styles.button,
            (loading ||
              !pickupAddress.trim() ||
              !destinationAddress.trim()) &&
              styles.buttonDisabled,
           ]}
             onPress={handleBookRide}
             disabled={
               loading ||
               !pickupAddress.trim() ||
               !destinationAddress.trim()
             }
>
           <Text style={styles.buttonText}>
             {loading
             ? "Requesting Ride..."
             : "Confirm Ride"}
           </Text>
         </Pressable>
        </>
      ) : null}
    </View>
  );
}

// ============================================================
// PLACE SUGGESTIONS
// ============================================================

interface PlaceSuggestionsProps {
  suggestions: PlaceSuggestion[];
  onSelect: (
    suggestion: PlaceSuggestion,
  ) => void;
}

function PlaceSuggestions({
  suggestions,
  onSelect,
}: PlaceSuggestionsProps) {
  return (
    <View style={styles.suggestionsBox}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) =>
          item.placeId
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.suggestionRow}
            onPress={() =>
              onSelect(item)
            }
          >
            <Text
              style={styles.suggestionIcon}
            >
              📍
            </Text>

            <View
              style={
                styles.suggestionTextBox
              }
            >
              <Text
                style={
                  styles.suggestionTitle
                }
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {item.subtitle ? (
                <Text
                  style={
                    styles.suggestionSubtitle
                  }
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

// ============================================================
// RIDE STATUS CARD
// ============================================================

interface RideStatusCardProps {
  ride: Ride;
  onBack: () => void;
  onCancel: () => void;
  loading: boolean;
}

function RideStatusCard({
  ride,
  onBack,
  onCancel,
  loading,
}: RideStatusCardProps) {
  const content =
    getRideStatusContent(ride);

  const showOtp =
    (ride.status === "REQUESTED" ||
      ride.status === "ACCEPTED") &&
    !!ride.otpCode;

  const canCancel =
    ride.status === "REQUESTED" ||
    ride.status === "ACCEPTED";

  return (
    <View style={styles.successBox}>
      <Text style={styles.successTitle}>
        {content.emoji}{" "}
        {content.heading}
      </Text>

      <Text style={styles.successText}>
        {content.body}
      </Text>

      <View style={styles.detailsBox}>
        <Text style={styles.detailLabel}>
          PICKUP
        </Text>

        <Text style={styles.detailValue}>
          📍 {ride.pickupAddress}
        </Text>

        <Text
          style={[
            styles.detailLabel,
            styles.destinationLabel,
          ]}
        >
          DESTINATION
        </Text>

        <Text style={styles.detailValue}>
          📍 {ride.destinationAddress}
        </Text>
      </View>

      {ride.rider ? (
        <View style={styles.partnerBox}>
          <Text style={styles.partnerTitle}>
            👤 Partner Details
          </Text>

          <Text style={styles.partnerName}>
            {ride.rider.fullName}
          </Text>

          <Text style={styles.partnerPhone}>
            📞 {ride.rider.phoneNumber}
          </Text>
        </View>
      ) : null}

      {showOtp ? (
        <View style={styles.otpBox}>
          <Text style={styles.otpLabel}>
            🔐 YOUR RIDE OTP
          </Text>

          <Text style={styles.otpCode}>
            {ride.otpCode}
          </Text>

          <Text style={styles.otpHint}>
            Share this 4-digit OTP with
            your partner when you are ready
            to start the ride.
          </Text>
        </View>
      ) : null}

      {ride.status === "REQUESTED" ? (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingTitle}>
            🔎 Looking for a partner
          </Text>

          <Text style={styles.waitingText}>
            Please wait while we find a
            nearby partner for you.
          </Text>
        </View>
      ) : null}

      {ride.status === "ACCEPTED" ? (
        <View style={styles.acceptedBox}>
          <Text style={styles.acceptedTitle}>
            ✅ Partner Accepted
          </Text>

          <Text style={styles.acceptedText}>
            Your ride is confirmed. Your
            partner will ask for the OTP
            before starting the ride.
          </Text>
        </View>
      ) : null}

      {ride.status === "STARTED" ? (
        <View style={styles.startedBox}>
          <Text style={styles.startedTitle}>
            🚗 Ride Started
          </Text>

          <Text style={styles.startedText}>
            Your OTP has been verified.
            Have a safe journey!
          </Text>
        </View>
      ) : null}

      {canCancel ? (
        <Pressable
          style={[
            styles.cancelButton,
            loading &&
              styles.buttonDisabled,
          ]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text
            style={
              styles.cancelButtonText
            }
          >
            {loading
              ? "Cancelling..."
              : "Cancel Ride"}
          </Text>
        </Pressable>
      ) : null}

      {ride.status === "COMPLETED" ? (
        <Pressable
          style={styles.homeButton}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>
            Back to Home
          </Text>
        </Pressable>
      ) : null}

      {ride.status === "CANCELLED" ? (
        <View>
          <Text style={styles.cancelledText}>
            This ride has been cancelled.
          </Text>

          <Pressable
            style={styles.homeButton}
            onPress={onBack}
          >
            <Text style={styles.buttonText}>
              Book New Ride
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ============================================================
// STATUS CONTENT
// ============================================================

function getRideStatusContent(
  ride: Ride,
): {
  emoji: string;
  heading: string;
  body: string;
} {
  switch (ride.status) {
    case "REQUESTED":
      return {
        emoji: "🔎",
        heading: "Ride Requested",
        body:
          "Your ride request has been sent. We are looking for a nearby partner.",
      };

    case "ACCEPTED":
      return {
        emoji: "✅",
        heading: "Partner Assigned",
        body: ride.rider
          ? `${ride.rider.fullName} has accepted your ride.`
          : "A partner has accepted your ride.",
      };

    case "STARTED":
      return {
        emoji: "🚗",
        heading: "Ride In Progress",
        body: ride.rider
          ? `Your ride with ${ride.rider.fullName} has started.`
          : "Your ride has started.",
      };

    case "COMPLETED":
      return {
        emoji: "🏁",
        heading: "Ride Completed",
        body:
          "Thanks for riding with MF Rides!",
      };

    case "CANCELLED":
      return {
        emoji: "❌",
        heading: "Ride Cancelled",
        body: ride.cancellationReason
          ? `Reason: ${ride.cancellationReason}`
          : "This ride was cancelled.",
      };

    default:
      return {
        emoji: "🚕",
        heading: "Ride",
        body: `Ride ID: ${ride.id}`,
      };
  }
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },

  mapContainer: {
    height: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  map: {
    flex: 1,
  },

  backText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },

  backTextDisabled: {
    opacity: 0.35,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },

  locationInputBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
  },

  locationInput: {
  flex: 1,
  paddingVertical: spacing.md,
  fontSize: 16,
  color: colors.text,
  outlineStyle: "solid",
  outlineWidth: 0,
  },

  locationButton: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },

  locationIcon: {
    fontSize: 21,
  },

  suggestionsBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: 4,
    maxHeight: 210,
    overflow: "hidden",
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  suggestionIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  suggestionTextBox: {
    flex: 1,
  },

  suggestionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  suggestionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },

  selectedText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },

  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },

  locationErrorBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  locationErrorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#d9534f",
  },

  locationErrorText: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
  },

  errorBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  errorTitle: {
    color: "#d9534f",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  errorText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },

  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  homeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },

  successBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  successTitle: {
    color: colors.accent,
    fontSize: 21,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },

  successText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },

  detailsBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
  },

  destinationLabel: {
    marginTop: spacing.md,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
  },

  partnerBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  partnerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  partnerName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginTop: 6,
  },

  partnerPhone: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  otpBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#e0b000",
    alignItems: "center",
  },

  otpLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },

  otpCode: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 10,
    color: colors.accent,
    marginVertical: spacing.sm,
  },

  otpHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
  },

  waitingBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  waitingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  waitingText: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },

  acceptedBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  acceptedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.accent,
  },

  acceptedText: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  startedBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
  },

  startedTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.accent,
  },

  startedText: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  cancelButton: {
    backgroundColor: "#d9534f",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelledText: {
    marginTop: spacing.lg,
    textAlign: "center",
    fontSize: 14,
    color: colors.textMuted,
  },

  restoreBox: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  restoreTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  restoreText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});