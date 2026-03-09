import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export type NearbyVehicle = {
  id: string;
  vehicleName: string;
  driverName: string;
  price: number;
  photo: string;
  rating?: number;
  eta?: string;
};

type Props = {
  vehicle: NearbyVehicle;
  onSelect?: (vehicle: NearbyVehicle) => void;
};

export default function NearbyVehicleCard({ vehicle, onSelect }: Props) {
  return (
    <Pressable
      onPress={() => onSelect?.(vehicle)}
      className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      style={{ elevation: 2 }}
    >
      <Image
        source={{ uri: vehicle.photo }}
        className="w-16 h-16 rounded-lg bg-gray-200"
        resizeMode="cover"
      />

      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-900">
          {vehicle.vehicleName}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {vehicle.driverName}
        </Text>
        {vehicle.eta ? (
          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-400 ml-1">{vehicle.eta}</Text>
          </View>
        ) : null}
      </View>

      <View className="items-end">
        <Text className="text-lg font-bold text-gray-900">
          ₹{vehicle.price}
        </Text>
        {vehicle.rating ? (
          <View className="flex-row items-center mt-1">
            <Feather name="star" size={12} color="#F59E0B" />
            <Text className="text-xs text-gray-500 ml-1">
              {vehicle.rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
