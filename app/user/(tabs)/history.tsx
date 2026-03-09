import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import {
  getMyBookings,
  type Booking,
  type BookingStatus,
} from "../../../src/api/bookings";

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DRIVER_ARRIVED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function HistoryTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-14 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Ride History</Text>
        <Text className="mt-1 text-sm text-gray-500">
          {bookings.length} {bookings.length === 1 ? "ride" : "rides"}
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="clock" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No rides yet
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Your completed rides will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerClassName="px-6 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
            />
          }
          renderItem={({ item }) => <BookingCard booking={item} />}
        />
      )}
    </View>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(booking.createdAt);
  const statusClass = STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600";
  const [bgClass, textClass] = statusClass.split(" ");

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className={`px-2.5 py-0.5 rounded-full ${bgClass}`}>
          <Text className={`text-xs font-medium ${textClass}`}>
            {booking.status.replace("_", " ")}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      {/* Origin → Destination */}
      <View className="flex-row items-start mb-2">
        <View className="items-center pt-0.5 mr-3">
          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <View className="w-0.5 h-5 bg-gray-300 my-0.5" />
          <Feather name="map-pin" size={12} color="#DC2626" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
            {booking.origin?.address ?? "—"}
          </Text>
          <View className="h-3" />
          <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
            {booking.destination?.address ?? "—"}
          </Text>
        </View>
      </View>

      {/* Price row */}
      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-sm text-gray-500">
          {booking.distance?.text ?? "—"} · {booking.duration?.text ?? "—"}
        </Text>
        <Text className="text-base font-bold text-gray-900">
          ₹{booking.fare?.toFixed(0) ?? "—"}
        </Text>
      </View>

      {expanded && booking.fareBreakdown && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <FareRow label="Base fare" value={booking.fareBreakdown.baseFare} />
          <FareRow label="Distance" value={booking.fareBreakdown.distanceFare} />
          <FareRow label="Time" value={booking.fareBreakdown.timeFare} />
          {booking.fareBreakdown.surgeFare > 0 && (
            <FareRow label="Surge" value={booking.fareBreakdown.surgeFare} />
          )}
          {booking.rating != null && (
            <View className="flex-row items-center mt-2">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-sm text-gray-700">
                You rated {booking.rating}/5
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-xs text-gray-700">₹{value.toFixed(0)}</Text>
    </View>
  );
}
