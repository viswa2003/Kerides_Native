import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import {
  createBooking,
  findNearbyDrivers,
  type CreateBookingRequest,
  type NearbyDriver,
} from "../../src/api/bookings";
import NearbyVehicleCard, {
  type NearbyVehicle,
} from "../../src/components/home/user/NearbyVehicleCard";

type RouteParams = {
  vehicleType: string;
  originAddress?: string;
  destinationAddress?: string;
  originLat?: string;
  originLng?: string;
  destLat?: string;
  destLng?: string;
  distanceText?: string;
  durationText?: string;
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

export default function NearbyVehiclesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();

  const [vehicles, setVehicles] = useState<NearbyVehicle[]>([]);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);

  const typeLabel = params.vehicleType
    ? params.vehicleType.charAt(0).toUpperCase() + params.vehicleType.slice(1)
    : "Vehicles";

  const fetchDrivers = useCallback(async () => {
    const lat = params.originLat ? Number(params.originLat) : undefined;
    const lng = params.originLng ? Number(params.originLng) : undefined;

    if (lat == null || lng == null) {
      setLoading(false);
      return;
    }

    try {
      const res = await findNearbyDrivers(
        lat,
        lng,
        undefined,
        undefined,
        params.vehicleType,
      );
      setDrivers(res.drivers);
      setVehicles(res.drivers.map(driverToVehicle));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.originLat, params.originLng, params.vehicleType]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleSelect = async (vehicle: NearbyVehicle) => {
    const driver = drivers.find((d) => d.accountId === vehicle.id);
    if (!driver) return;

    const originLat = Number(params.originLat);
    const originLng = Number(params.originLng);
    const destLat = Number(params.destLat);
    const destLng = Number(params.destLng);

    if ([originLat, originLng, destLat, destLng].some(isNaN)) {
      Alert.alert("Error", "Invalid route coordinates.");
      return;
    }

    setBooking(true);
    try {
      const payload: CreateBookingRequest = {
        origin: {
          address: params.originAddress ?? "",
          coordinates: { lat: originLat, lng: originLng },
        },
        destination: {
          address: params.destinationAddress ?? "",
          coordinates: { lat: destLat, lng: destLng },
        },
        distance: {
          text: params.distanceText ?? "",
          value: 0,
        },
        duration: {
          text: params.durationText ?? "",
          value: 0,
        },
        driverId: driver.accountId,
        vehicleId: driver.vehicle?._id,
        vehicleType: params.vehicleType,
      };

      const res = await createBooking(payload);
      router.replace({
        pathname: "/user/active-ride",
        params: { bookingId: res.bookingId },
      });
    } catch (err: any) {
      Alert.alert("Booking Failed", err.message ?? "Could not create booking.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 flex-row items-center border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 p-1"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            Nearby {typeLabel}s
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {vehicles.length}{" "}
            {vehicles.length === 1 ? "driver" : "drivers"} found
          </Text>
        </View>
      </View>

      {booking && (
        <View className="absolute inset-0 z-50 bg-black/30 items-center justify-center">
          <View className="bg-white rounded-2xl px-8 py-6 items-center">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-sm text-gray-600 mt-3">
              Creating booking…
            </Text>
          </View>
        </View>
      )}

      {/* Vehicle list */}
      {vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
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
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="search" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No nearby drivers found
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Try selecting a different vehicle type or try again later.
          </Text>
        </View>
      )}
    </View>
  );
}
