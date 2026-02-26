import React from "react";
import { Text, View } from "react-native";

export default function HistoryTab() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-900">History</Text>
      <Text className="mt-2 text-sm text-gray-500">
        Your recent activity will appear here.
      </Text>
    </View>
  );
}
