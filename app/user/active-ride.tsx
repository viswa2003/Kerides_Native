import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  getBookingById,
  updateBookingStatus,
  generateOtp,
  rateBooking,
  type Booking,
  type BookingStatus,
} from "../../src/api/bookings";
import Button from "../../src/components/ui/Button";
import RatingModal from "../../src/components/home/user/RatingModal";

const POLL_INTERVAL = 5000;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Finding a driver…",
  ACCEPTED: "Driver is on the way",
  DRIVER_ARRIVED: "Driver has arrived",
  IN_PROGRESS: "Ride in progress",
  COMPLETED: "Ride completed",
  CANCELLED: "Ride cancelled",
};

export default function ActiveRideScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
      if (data.status === "COMPLETED" && !data.rating) {
        setShowRating(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Poll for status updates while the ride is active
  useEffect(() => {
    if (!bookingId) return;
    const terminal: BookingStatus[] = ["COMPLETED", "CANCELLED"];
    if (booking && terminal.includes(booking.status)) return;

    const timer = setInterval(fetchBooking, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [bookingId, booking?.status, fetchBooking]);

  const handleCancel = async () => {
    if (!bookingId) return;
    Alert.alert("Cancel Ride", "Are you sure you want to cancel?", [
      { text: "No" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            const updated = await updateBookingStatus(bookingId, "CANCELLED");
            setBooking(updated);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleGenerateOtp = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const res = await generateOtp(bookingId);
      const match = res.message?.match(/\d{4,6}/);
      if (match) setOtp(match[0]);
      else Alert.alert("OTP", res.message);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRate = async (rating: number, review?: string) => {
    if (!bookingId) return;
    try {
      const updated = await rateBooking(bookingId, rating, review);
      setBooking(updated);
      setShowRating(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading || !booking) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const isTerminal = booking.status === "COMPLETED" || booking.status === "CANCELLED";
  const originCoords = booking.origin?.coordinates;
  const destCoords = booking.destination?.coordinates;

  return (
    <View className="flex-1 bg-white">
      {/* Map section */}
      <View className="h-[40%]">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: originCoords?.lat ?? 9.9312,
            longitude: originCoords?.lng ?? 76.2673,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {originCoords && (
            <Marker
              coordinate={{ latitude: originCoords.lat, longitude: originCoords.lng }}
              title="Pickup"
              pinColor="green"
            />
          )}
          {destCoords && (
            <Marker
              coordinate={{ latitude: destCoords.lat, longitude: destCoords.lng }}
              title="Drop-off"
              pinColor="red"
            />
          )}
        </MapView>

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 bg-white rounded-full p-2 shadow"
          style={{ elevation: 3 }}
        >
          <Feather name="arrow-left" size={22} color="#111827" />
        </Pressable>
      </View>

      {/* Ride details */}
      <View className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-6 pb-8">
        {/* Status */}
        <View className="items-center mb-5">
          <StatusIndicator status={booking.status} />
          <Text className="text-lg font-bold text-gray-900 mt-2">
            {STATUS_LABELS[booking.status] ?? booking.status}
          </Text>
        </View>

        {/* Route */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row items-start mb-3">
            <View className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-3" />
            <Text className="flex-1 text-sm text-gray-900" numberOfLines={2}>
              {booking.origin?.address ?? "—"}
            </Text>
          </View>
          <View className="flex-row items-start">
            <Feather name="map-pin" size={13} color="#DC2626" style={{ marginRight: 12, marginTop: 2 }} />
            <Text className="flex-1 text-sm text-gray-900" numberOfLines={2}>
              {booking.destination?.address ?? "—"}
            </Text>
          </View>
        </View>

        {/* Trip info */}
        <View className="flex-row justify-around bg-gray-50 rounded-xl p-4 mb-5">
          <InfoColumn label="Distance" value={booking.distance?.text ?? "—"} />
          <View className="w-px bg-gray-200" />
          <InfoColumn label="Duration" value={booking.duration?.text ?? "—"} />
          <View className="w-px bg-gray-200" />
          <InfoColumn label="Fare" value={`₹${booking.fare?.toFixed(0) ?? "—"}`} />
        </View>

        {/* OTP */}
        {otp && (
          <View className="bg-green-50 rounded-xl p-4 mb-4 items-center">
            <Text className="text-sm text-green-700 font-medium">
              Share this OTP with your driver
            </Text>
            <Text className="text-3xl font-bold text-green-800 mt-1 tracking-widest">
              {otp}
            </Text>
          </View>
        )}

        {/* Actions */}
        {!isTerminal && (
          <View className="gap-3">
            {booking.status === "DRIVER_ARRIVED" && !otp && (
              <Button
                onPress={handleGenerateOtp}
                loading={actionLoading}
                variant="success"
              >
                Generate OTP
              </Button>
            )}
            {booking.status !== "IN_PROGRESS" && (
              <Button
                variant="secondary"
                onPress={handleCancel}
                loading={actionLoading}
              >
                Cancel Ride
              </Button>
            )}
          </View>
        )}

        {isTerminal && (
          <Button onPress={() => router.replace("/user/(tabs)/home")}>
            Back to Home
          </Button>
        )}
      </View>

      <RatingModal
        visible={showRating}
        onSubmit={handleRate}
        onClose={() => setShowRating(false)}
      />
    </View>
  );
}

function StatusIndicator({ status }: { status: BookingStatus }) {
  const colors: Record<string, string> = {
    PENDING: "#EAB308",
    ACCEPTED: "#3B82F6",
    DRIVER_ARRIVED: "#3B82F6",
    IN_PROGRESS: "#16A34A",
    COMPLETED: "#6B7280",
    CANCELLED: "#EF4444",
  };

  return (
    <View
      className="w-12 h-12 rounded-full items-center justify-center"
      style={{ backgroundColor: `${colors[status] ?? "#6B7280"}20` }}
    >
      <View
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: colors[status] ?? "#6B7280" }}
      />
    </View>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-sm font-semibold text-gray-900 mt-0.5">
        {value}
      </Text>
    </View>
  );
}
