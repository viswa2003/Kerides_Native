import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  createBooking,
  findNearbyDrivers,
  type CreateBookingRequest,
  type NearbyDriver,
} from "../../../api/bookings";
import NearbyVehicleCard, { type NearbyVehicle } from "./NearbyVehicleCard";

export type NearbyVehiclesPanelParams = {
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

type Props = {
  params: NearbyVehiclesPanelParams;
  onDismiss: () => void;
  onBookingCreated: (bookingId: string) => void;
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

export default function NearbyVehiclesPanel({
  params,
  onDismiss,
  onBookingCreated,
}: Props) {
  const [vehicles, setVehicles] = useState<NearbyVehicle[]>([]);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);

  // Slide-up entry animation
  const translateY = useSharedValue(600);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 350 });
  }, [translateY]);

  const typeLabel = params.vehicleType
    ? params.vehicleType.charAt(0).toUpperCase() + params.vehicleType.slice(1)
    : "Vehicles";

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await findNearbyDrivers(
        params.originLat,
        params.originLng,
        undefined,
        undefined,
        params.vehicleType,
      );
      setDrivers(res.drivers);
      setVehicles(res.drivers.map(driverToVehicle));
    } catch {
      // silent – user can pull to refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.originLat, params.originLng, params.vehicleType]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDismiss = () => {
    translateY.value = withTiming(600, { duration: 280 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  };

  const handleSelect = async (vehicle: NearbyVehicle) => {
    const driver = drivers.find((d) => d.accountId === vehicle.id);
    if (!driver) return;

    setBooking(true);
    try {
      const payload: CreateBookingRequest = {
        origin: {
          address: params.originAddress,
          coordinates: { lat: params.originLat, lng: params.originLng },
        },
        destination: {
          address: params.destinationAddress,
          coordinates: { lat: params.destLat, lng: params.destLng },
        },
        distance: { text: params.distanceText, value: 0 },
        duration: { text: params.durationText, value: 0 },
        driverId: driver.accountId,
        vehicleId: driver.vehicle?._id,
        vehicleType: params.vehicleType,
      };

      const res = await createBooking(payload);
      onBookingCreated(res.bookingId);
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message ?? "Could not create booking.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          elevation: 20,
        },
      ]}
      className="bg-white rounded-t-3xl shadow-2xl"
    >
      {/* Drag handle */}
      <View className="items-center pt-3 pb-1">
        <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </View>

      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <Pressable
          onPress={handleDismiss}
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

      {/* Content */}
      {loading ? (
        <View className="py-16 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          style={{ maxHeight: 420 }}
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
            <NearbyVehicleCard vehicle={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <View className="py-16 items-center justify-center px-6">
          <Feather name="search" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No nearby drivers found
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Try selecting a different vehicle type or try again later.
          </Text>
        </View>
      )}

      {/* Booking overlay spinner */}
      {booking && (
        <View
          className="absolute inset-0 z-10 bg-black/30 items-center justify-center rounded-t-3xl"
        >
          <View className="bg-white rounded-2xl px-8 py-6 items-center">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-sm text-gray-600 mt-3">
              Creating booking…
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
