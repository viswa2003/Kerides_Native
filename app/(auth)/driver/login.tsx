import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import LoginForm from "../../../src/components/auth/LoginForm";

export default function DriverLogin() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-6">
        <Link href="/" className="flex-row items-center space-x-2">
          <Feather name="arrow-left" size={18} color="#374151" />
          <Text className="text-sm text-gray-700">Back to Home</Text>
        </Link>
      </View>

      <View className="items-center mt-6 px-6">
        <View className="bg-primary-600 w-16 h-16 rounded-xl items-center justify-center shadow mb-4" />
        <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="text-sm text-gray-500 mt-1">Sign in as a driver</Text>
      </View>

      <View className="mt-8 px-4">
        <LoginForm role="DRIVER" />

        <View className="mt-4 items-center">
          <Text className="text-sm text-gray-600">
            {"Don't have an account? "}
            <Link
              href="/driver/register"
              className="text-primary-600 font-medium"
            >
              Create one
            </Link>
          </Text>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-xs text-gray-400">
            Signing in as <Text className="font-medium">DRIVER</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
