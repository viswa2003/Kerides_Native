import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Button from "../../ui/Button";
import PlacesAutocompleteInput from "../../home/user/PlacesAutocompleteInput";
import VehicleTypeSelector, {
  type VehicleType,
} from "./VehicleTypeSelector";
import NearbyVehicleCard, { type NearbyVehicle } from "./NearbyVehicleCard";
import {
  createBooking,
  findNearbyDrivers,
  type CreateBookingRequest,
  type NearbyDriver,
} from "../../../api/bookings";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLLAPSED_HEIGHT = 380;
const ROUTE_SELECTED_HEIGHT = SCREEN_HEIGHT * 0.85;
const MAX_HEIGHT = SCREEN_HEIGHT - 140;

/** Internal step: ride form → nearby drivers list */
type CardStep = "ride-form" | "nearby-drivers";

export type NearbyDriversParams = {
  vehicleType: string;
  originAddress: string;
  destinationAddress: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceText: string;
  durationText: string;
};

function driverToVehicle(driver: NearbyDriver): NearbyVehicle {
  const v = driver.vehicle;
  return {
    id: driver.accountId,
    vehicleName: v ? `${v.make} ${v.vehicleModel}` : "Unknown",
    driverName: driver.fullName,
    price: 0,
    photo: "",
    rating: driver.rating,
    eta: driver.estimatedArrival
      ? `${Math.ceil(driver.estimatedArrival)} min`
      : undefined,
  };
}

type Props = {
  origin: string;
  destination: string;
  onSetCurrentLocation: () => void;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  onDestinationSelected: () => void;
  loading?: boolean;
  placesApiKey?: string;
  routeSelected?: boolean;
  onProceed?: (vehicle: VehicleType) => NearbyDriversParams | null;
  onBookingCreated?: (bookingId: string) => void;
  cardHeightShared?: SharedValue<number>;
};

export default function RideRequestCard({
  origin,
  destination,
  onSetCurrentLocation,
  setOrigin,
  setDestination,
  onDestinationSelected,
  loading = false,
  placesApiKey = "",
  routeSelected = false,
  onProceed,
  onBookingCreated,
  cardHeightShared,
}: Props) {
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleType | null>(null);

  // --- step state ---
  const [step, setStep] = useState<CardStep>("ride-form");
  const [driverParams, setDriverParams] =
    useState<NearbyDriversParams | null>(null);

  // --- nearby-drivers state ---
  const [vehicles, setVehicles] = useState<NearbyVehicle[]>([]);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);

  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);
  const startHeight = useSharedValue(COLLAPSED_HEIGHT);

  const springTo = (target: number) => {
    animatedHeight.value = withSpring(target, {
      damping: 15,
      stiffness: 120,
      overshootClamping: true,
    });
    if (cardHeightShared) {
      cardHeightShared.value = withSpring(target, {
        damping: 15,
        stiffness: 120,
        overshootClamping: true,
      });
    }
  };

  const expandCard = () => springTo(ROUTE_SELECTED_HEIGHT);

  const collapseCard = () => {
    if (routeSelected || step === "nearby-drivers") return;
    springTo(COLLAPSED_HEIGHT);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  /* ---- Gesture ---- */

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = animatedHeight.value;
    })
    .onUpdate((event) => {
      const clampedHeight = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(MAX_HEIGHT, startHeight.value - event.translationY),
      );
      animatedHeight.value = clampedHeight;
      if (cardHeightShared) cardHeightShared.value = clampedHeight;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const stops =
        routeSelected || step === "nearby-drivers"
          ? [COLLAPSED_HEIGHT, ROUTE_SELECTED_HEIGHT, MAX_HEIGHT]
          : [COLLAPSED_HEIGHT, ROUTE_SELECTED_HEIGHT];

      let targetHeight: number;
      if (velocity > 800) {
        targetHeight =
          stops.filter((s) => s < animatedHeight.value).pop() ??
          COLLAPSED_HEIGHT;
      } else if (velocity < -800) {
        targetHeight =
          stops.find((s) => s > animatedHeight.value) ??
          stops[stops.length - 1];
      } else {
        targetHeight = stops.reduce((prev, curr) =>
          Math.abs(curr - animatedHeight.value) <
          Math.abs(prev - animatedHeight.value)
            ? curr
            : prev,
        );
      }
      springTo(targetHeight);
    });

  /* ---- Auto expand ---- */

  useEffect(() => {
    springTo(
      routeSelected || step === "nearby-drivers"
        ? ROUTE_SELECTED_HEIGHT
        : COLLAPSED_HEIGHT,
    );
  }, [routeSelected, step]);

  /* ---- Fetch nearby drivers ---- */

  const fetchDrivers = useCallback(async () => {
    if (!driverParams) return;
    setDriversLoading(true);
    try {
      const res = await findNearbyDrivers(
        driverParams.originLat,
        driverParams.originLng,
        undefined,
        undefined,
        driverParams.vehicleType,
      );
      setDrivers(res.drivers);
      setVehicles(res.drivers.map(driverToVehicle));
    } catch {
      // silent – user can pull to refresh
    } finally {
      setDriversLoading(false);
      setRefreshing(false);
    }
  }, [driverParams]);

  useEffect(() => {
    if (step === "nearby-drivers") fetchDrivers();
  }, [step, fetchDrivers]);

  /* ---- Book a driver ---- */

  const handleSelectDriver = async (vehicle: NearbyVehicle) => {
    if (!driverParams) return;
    const driver = drivers.find((d) => d.accountId === vehicle.id);
    if (!driver) return;

    setBooking(true);
    try {
      const payload: CreateBookingRequest = {
        origin: {
          address: driverParams.originAddress,
          coordinates: {
            lat: driverParams.originLat,
            lng: driverParams.originLng,
          },
        },
        destination: {
          address: driverParams.destinationAddress,
          coordinates: {
            lat: driverParams.destLat,
            lng: driverParams.destLng,
          },
        },
        distance: { text: driverParams.distanceText, value: 0 },
        duration: { text: driverParams.durationText, value: 0 },
        driverId: driver.accountId,
        vehicleId: driver.vehicle?._id,
        vehicleType: driverParams.vehicleType,
      };

      const res = await createBooking(payload);
      onBookingCreated?.(res.bookingId);
    } catch (err: any) {
      Alert.alert(
        "Booking Failed",
        err.message ?? "Could not create booking.",
      );
    } finally {
      setBooking(false);
    }
  };

  /* ---- Back from nearby-drivers step ---- */

  const handleBack = () => {
    setStep("ride-form");
    setVehicles([]);
    setDrivers([]);
    setDriverParams(null);
  };

  const typeLabel = driverParams?.vehicleType
    ? driverParams.vehicleType.charAt(0).toUpperCase() +
      driverParams.vehicleType.slice(1)
    : "Vehicles";

  return (
    <Animated.View
      className="w-full bg-white rounded-t-3xl shadow-2xl px-6 pt-2 pb-10 elevation-5"
      style={animatedCardStyle}
    >
      {/* Drag Handle */}
      <GestureDetector gesture={panGesture}>
        <View className="items-center py-4">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </View>
      </GestureDetector>

      {step === "ride-form" ? (
        /* ===================== STEP 1: Ride form ===================== */
        <View className="flex-1" style={{ paddingBottom: 40 }}>
          <Text className="text-xl font-bold text-gray-900 mb-5">
            Where to?
          </Text>

          <View className="flex-row mb-6">
            <View className="items-center justify-center mr-4 pt-4 pb-2">
              <View className="w-2 h-2 rounded-full bg-gray-400" />
              <View className="w-0.5 h-12 bg-gray-300 my-1" />
              <View className="w-2 h-2 bg-black" />
            </View>

            <View className="flex-1">
              <View className="mb-3">
                <PlacesAutocompleteInput
                  label="Origin"
                  placeholder="Enter origin or use current location"
                  value={origin}
                  onChangeText={setOrigin}
                  apiKey={placesApiKey}
                  icon="map-pin"
                  rightIconName="navigation"
                  onRightIconPress={onSetCurrentLocation}
                  onFocus={expandCard}
                  onBlur={collapseCard}
                />
              </View>

              <PlacesAutocompleteInput
                label="Destination"
                placeholder="Enter destination"
                value={destination}
                onChangeText={setDestination}
                apiKey={placesApiKey}
                icon="map"
                onPlaceSelected={onDestinationSelected}
                onFocus={expandCard}
                onBlur={collapseCard}
              />
            </View>
          </View>

          {routeSelected && (
            <>
              <VehicleTypeSelector onSelect={setSelectedVehicle} />

              <View className="mt-4">
                <Button
                  onPress={() => {
                    if (!selectedVehicle) return;
                    const params = onProceed?.(selectedVehicle);
                    if (params) {
                      setDriverParams(params);
                      setStep("nearby-drivers");
                    }
                  }}
                  disabled={!selectedVehicle}
                  accessibilityLabel="Proceed with ride"
                >
                  Proceed
                </Button>
              </View>
            </>
          )}
        </View>
      ) : (
        /* ===================== STEP 2: Nearby drivers ===================== */
        <View className="flex-1">
          {/* Header with back button */}
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={handleBack}
              className="mr-3 p-1"
              accessibilityLabel="Go back"
            >
              <Feather name="arrow-left" size={22} color="#111827" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Nearby {typeLabel}s
              </Text>
              <Text className="text-xs text-gray-500">
                {vehicles.length}{" "}
                {vehicles.length === 1 ? "driver" : "drivers"} found
              </Text>
            </View>
          </View>

          {driversLoading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#16A34A" />
            </View>
          ) : vehicles.length > 0 ? (
            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchDrivers();
                  }}
                />
              }
              renderItem={({ item }) => (
                <NearbyVehicleCard
                  vehicle={item}
                  onSelect={handleSelectDriver}
                />
              )}
            />
          ) : (
            <View className="py-16 items-center justify-center px-6">
              <Feather name="search" size={48} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-400 mt-4">
                No nearby drivers found
              </Text>
              <Text className="text-sm text-gray-400 mt-1 text-center">
                Try a different vehicle type or try again later.
              </Text>
            </View>
          )}

          {/* Booking spinner overlay */}
          {booking && (
            <View className="absolute inset-0 z-10 bg-black/30 items-center justify-center rounded-t-3xl">
              <View className="bg-white rounded-2xl px-8 py-6 items-center">
                <ActivityIndicator size="large" color="#16A34A" />
                <Text className="text-sm text-gray-600 mt-3">
                  Creating booking…
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}