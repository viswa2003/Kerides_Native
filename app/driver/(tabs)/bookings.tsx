import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  getDriverBookings,
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

type FilterOption = "ALL" | BookingStatus;

export default function BookingsTab() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("ALL");

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getDriverBookings();
      setBookings(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filter);

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
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
        <Text className="mt-1 text-sm text-gray-500">
          {bookings.length} total · {filteredBookings.length} shown
        </Text>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={["ALL", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as FilterOption[]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-6 pb-3"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item)}
            className={`mr-2 px-3 py-1.5 rounded-full border ${
              filter === item
                ? "bg-green-600 border-green-600"
                : "border-gray-300"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                filter === item ? "text-white" : "text-gray-700"
              }`}
            >
              {item === "ALL" ? "All" : item.replace("_", " ")}
            </Text>
          </Pressable>
        )}
      />

      {filteredBookings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="clipboard" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No bookings
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            {filter === "ALL"
              ? "Your assigned trips will appear here."
              : `No ${filter.replace("_", " ").toLowerCase()} bookings.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
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
          renderItem={({ item }) => (
            <DriverBookingCard
              booking={item}
              onPress={() => {
                const active: BookingStatus[] = [
                  "ACCEPTED",
                  "DRIVER_ARRIVED",
                  "IN_PROGRESS",
                ];
                if (active.includes(item.status)) {
                  router.push({
                    pathname: "/driver/active-ride",
                    params: { bookingId: item._id },
                  });
                }
              }}
            />
          )}
        />
      )}
    </View>
  );
}

function DriverBookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
}) {
  const date = new Date(booking.createdAt);
  const statusClass = STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600";
  const [bgClass, textClass] = statusClass.split(" ");

  return (
    <Pressable
      onPress={onPress}
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
          {date.toLocaleDateString()} ·{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

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

      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-sm text-gray-500">
          {booking.distance?.text ?? "—"} · {booking.duration?.text ?? "—"}
        </Text>
        <Text className="text-base font-bold text-gray-900">
          ₹{booking.fare?.toFixed(0) ?? "—"}
        </Text>
      </View>
    </Pressable>
  );
}
