import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getDriverBookings,
  type Booking,
  type BookingStatus,
} from "../../src/api/bookings";

const STATUS_CONFIG: Record<
  BookingStatus,
  { bg: string; text: string; dot: string; icon: string }
> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", icon: "clock-outline" },
  ACCEPTED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", icon: "check-circle-outline" },
  DRIVER_ARRIVED: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400", icon: "map-marker-check-outline" },
  IN_PROGRESS: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: "car" },
  COMPLETED: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", icon: "check-all" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", icon: "cancel" },
};

const FILTER_LABELS: Record<string, string> = {
  ALL: "All",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type FilterOption = "ALL" | BookingStatus;

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const filters: FilterOption[] = [
    "ALL",
    "ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-3" style={{ elevation: 2 }}>
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">My Bookings</Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {bookings.length} total · {filteredBookings.length} shown
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setRefreshing(true);
              fetchBookings();
            }}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Feather
              name="refresh-cw"
              size={18}
              color={refreshing ? "#16A34A" : "#6B7280"}
            />
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((item) => {
            const active = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={`px-4 py-2 rounded-full ${
                  active ? "bg-green-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {FILTER_LABELS[item] ?? item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : filteredBookings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-5">
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={36}
              color="#9CA3AF"
            />
          </View>
          <Text className="text-lg font-semibold text-gray-500">
            No bookings
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center leading-5">
            {filter === "ALL"
              ? "Your assigned trips will appear here\nonce riders book a ride."
              : `No ${FILTER_LABELS[filter]?.toLowerCase() ?? filter.toLowerCase()} bookings yet.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              colors={["#16A34A"]}
            />
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
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

/* ── Booking Card ─────────────────────────────────────────── */

function DriverBookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
}) {
  const date = new Date(booking.createdAt);
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.COMPLETED;
  const isActive = ["ACCEPTED", "DRIVER_ARRIVED", "IN_PROGRESS"].includes(
    booking.status,
  );

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4"
      style={{ elevation: 1 }}
    >
      {/* Status row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className={`flex-row items-center ${cfg.bg} px-3 py-1.5 rounded-full`}>
          <View className={`w-2 h-2 rounded-full ${cfg.dot} mr-2`} />
          <Text className={`text-xs font-semibold ${cfg.text}`}>
            {booking.status.replace(/_/g, " ")}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">
          {date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}{" "}
          · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      {/* Route */}
      <View className="flex-row items-start mb-3">
        <View className="items-center pt-1 mr-3">
          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <View className="w-0.5 h-6 bg-gray-200 my-1" />
          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
        </View>
        <View className="flex-1 gap-2">
          <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
            {booking.origin?.address ?? "—"}
          </Text>
          <View className="h-2" />
          <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
            {booking.destination?.address ?? "—"}
          </Text>
        </View>
      </View>

      {/* Bottom row: stats + fare */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Feather name="navigation" size={13} color="#9CA3AF" />
            <Text className="text-xs text-gray-500">
              {booking.distance?.text ?? "—"}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={13} color="#9CA3AF" />
            <Text className="text-xs text-gray-500">
              {booking.duration?.text ?? "—"}
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold text-gray-900">
          ₹{booking.fare?.toFixed(0) ?? "—"}
        </Text>
      </View>

      {/* Active ride indicator */}
      {isActive && (
        <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-green-100">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <Text className="text-xs font-semibold text-green-600">
            Tap to view active ride
          </Text>
          <Feather name="chevron-right" size={14} color="#16A34A" style={{ marginLeft: 4 }} />
        </View>
      )}
    </Pressable>
  );
}
