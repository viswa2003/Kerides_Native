import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import RegisterForm from "../../../src/components/auth/RegisterForm";

export default function DriverRegister() {
  return (
    <View className="flex-1 bg-white">
      <View className="items-center mt-12 px-6">
        <View className="bg-primary-600 w-16 h-16 rounded-xl items-center justify-center shadow mb-4" />
        <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
        <Text className="text-sm text-gray-500 mt-1">Register as a driver</Text>
      </View>

      <View className="mt-8 px-4">
        <RegisterForm role="DRIVER" />

        <View className="mt-4 items-center">
          <Text className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/driver/login" className="text-primary-600 font-medium">
              Sign in
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
