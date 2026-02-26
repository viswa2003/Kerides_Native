import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useAuth } from "../../../src/auth/AuthProvider";
import Button from "../../../src/components/ui/Button";

export default function ProfileTab() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/driver/login");
  }

  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      <Text className="mt-2 text-sm text-gray-500">
        Manage your driver profile and settings.
      </Text>

      <View className="mt-8">
        <Button onPress={handleSignOut} accessibilityLabel="Sign out">
          Sign Out
        </Button>
      </View>
    </View>
  );
}
