import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function AccountsTab() {
  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <Text className="text-2xl font-bold text-gray-900">Accounts</Text>
      <Text className="mt-2 text-sm text-gray-500">
        Manage your account and settings.
      </Text>

      <View className="mt-6">
        <Link href="/login" className="text-primary-600 font-medium">
          Sign in (user)
        </Link>
      </View>

      <View className="mt-3">
        <Link href="/driver/login" className="text-primary-600 font-medium">
          Sign in (driver)
        </Link>
      </View>
    </View>
  );
}
