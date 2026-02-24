import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type VehicleType = {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const VEHICLE_TYPES: VehicleType[] = [
  { id: "auto", label: "Auto", icon: "truck" },
  { id: "bike", label: "Bike", icon: "zap" },
  { id: "hatchback", label: "Hatchback", icon: "navigation" },
  { id: "sedan", label: "Sedan", icon: "navigation-2" },
  { id: "suv", label: "SUV", icon: "compass" },
];

type Props = {
  onSelect?: (vehicle: VehicleType) => void;
};

export default function VehicleTypeSelector({ onSelect }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePress = (vehicle: VehicleType) => {
    setSelectedId(vehicle.id);
    onSelect?.(vehicle);
  };

  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Choose Vehicle
      </Text>
      <View className="flex-row justify-between">
        {VEHICLE_TYPES.map((vehicle) => {
          const isSelected = vehicle.id === selectedId;
          return (
            <Pressable
              key={vehicle.id}
              onPress={() => handlePress(vehicle)}
              className={`items-center justify-center rounded-xl py-3 px-2 flex-1 mx-1 ${
                isSelected ? "bg-blue-600" : "bg-gray-100"
              }`}
              accessibilityRole="button"
              accessibilityLabel={vehicle.label}
            >
              <Feather
                name={vehicle.icon}
                size={20}
                color={isSelected ? "#fff" : "#374151"}
              />
              <Text
                className={`text-xs mt-1 font-medium ${
                  isSelected ? "text-white" : "text-gray-700"
                }`}
                numberOfLines={1}
              >
                {vehicle.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
