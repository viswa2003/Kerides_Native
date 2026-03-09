import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type VehicleType = {
  id: string;
  label: string;
};

const VEHICLE_TYPES: VehicleType[] = [
  { id: "auto", label: "Auto" },
  { id: "bike", label: "Bike" },
  { id: "hatchback", label: "Hatchback" },
  { id: "sedan", label: "Sedan" },
  { id: "suv", label: "SUV" },
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
      <View className="gap-y-2">
        {VEHICLE_TYPES.map((vehicle) => {
          const isSelected = vehicle.id === selectedId;
          return (
            <Pressable
              key={vehicle.id}
              onPress={() => handlePress(vehicle)}
              className={`flex-row items-center rounded-xl px-4 py-3 ${
                isSelected
                  ? "bg-blue-600 border border-blue-600"
                  : "bg-gray-50 border border-gray-200"
              }`}
              accessibilityRole="button"
              accessibilityLabel={vehicle.label}
            >
              <Text
                className={`text-base font-medium flex-1 ${
                  isSelected ? "text-white" : "text-gray-800"
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
