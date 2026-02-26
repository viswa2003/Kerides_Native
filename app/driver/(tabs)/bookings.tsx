import React from "react";
import { Text, View } from "react-native";

export default function BookingsTab() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-900">Bookings</Text>
      <Text className="mt-2 text-sm text-gray-500 text-center">
        Your assigned and completed trips will appear here.
      </Text>
    </View>
  );
}
