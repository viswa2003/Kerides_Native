import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  getBookingById,
  updateBookingStatus,
  verifyOtp,
  type Booking,
  type BookingStatus,
} from "../../src/api/bookings";
import Button from "../../src/components/ui/Button";

const POLL_INTERVAL = 5000;

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Head to pickup",
  DRIVER_ARRIVED: "Waiting for rider",
  IN_PROGRESS: "Ride in progress",
  COMPLETED: "Ride completed",
  CANCELLED: "Ride cancelled",
};

export default function DriverActiveRideScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Poll for updates while ride is active
  useEffect(() => {
    if (!bookingId) return;
    const terminal: BookingStatus[] = ["COMPLETED", "CANCELLED"];
    if (booking && terminal.includes(booking.status)) return;

    const timer = setInterval(fetchBooking, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [bookingId, booking?.status, fetchBooking]);

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setBooking(updated);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!bookingId || !otpInput.trim()) return;
    setActionLoading(true);
    try {
      const updated = await verifyOtp(bookingId, otpInput.trim());
      setBooking(updated);
      setOtpInput("");
    } catch (err: any) {
      Alert.alert("Invalid OTP", err.message);
    } finally {
      setActionLoading(false);
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
      {/* Map */}
      <View className="h-[35%]">
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

        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 bg-white rounded-full p-2 shadow"
          style={{ elevation: 3 }}
        >
          <Feather name="arrow-left" size={22} color="#111827" />
        </Pressable>
      </View>

      {/* Ride info */}
      <View className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-6 pb-8">
        <View className="items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">
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
            <Feather
              name="map-pin"
              size={13}
              color="#DC2626"
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <Text className="flex-1 text-sm text-gray-900" numberOfLines={2}>
              {booking.destination?.address ?? "—"}
            </Text>
          </View>
        </View>

        {/* Trip info */}
        <View className="flex-row justify-around bg-gray-50 rounded-xl p-4 mb-5">
          <InfoCol label="Distance" value={booking.distance?.text ?? "—"} />
          <View className="w-px bg-gray-200" />
          <InfoCol label="Duration" value={booking.duration?.text ?? "—"} />
          <View className="w-px bg-gray-200" />
          <InfoCol label="Fare" value={`₹${booking.fare?.toFixed(0) ?? "—"}`} />
        </View>

        {/* Actions based on status */}
        {!isTerminal && (
          <View className="gap-3">
            {booking.status === "ACCEPTED" && (
              <Button
                onPress={() => handleStatusUpdate("DRIVER_ARRIVED")}
                loading={actionLoading}
                variant="success"
              >
                I've Arrived at Pickup
              </Button>
            )}

            {booking.status === "DRIVER_ARRIVED" && (
              <View className="gap-3">
                <Text className="text-sm font-medium text-gray-700 text-center">
                  Enter the OTP from rider to start the trip
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-center text-xl font-bold text-gray-900 tracking-widest"
                  value={otpInput}
                  onChangeText={setOtpInput}
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Button
                  onPress={handleVerifyOtp}
                  loading={actionLoading}
                  disabled={!otpInput.trim()}
                  variant="success"
                >
                  Verify & Start Ride
                </Button>
              </View>
            )}

            {booking.status === "IN_PROGRESS" && (
              <Button
                onPress={() => handleStatusUpdate("COMPLETED")}
                loading={actionLoading}
                variant="success"
              >
                Complete Ride
              </Button>
            )}
          </View>
        )}

        {isTerminal && (
          <Button onPress={() => router.replace("/driver/(tabs)/home")}>
            Back to Home
          </Button>
        )}
      </View>
    </View>
  );
}

function InfoCol({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-sm font-semibold text-gray-900 mt-0.5">{value}</Text>
    </View>
  );
}
