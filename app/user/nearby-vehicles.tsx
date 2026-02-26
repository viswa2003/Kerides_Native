import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import NearbyVehicleCard, {
  type NearbyVehicle,
} from "../../src/components/home/NearbyVehicleCard";

// ── Temporary mock data ──────────────────────────────────────────────
const MOCK_VEHICLES: Record<string, NearbyVehicle[]> = {
  auto: [
    { id: "a1", vehicleName: "Bajaj RE", driverName: "Raju K.", price: 85, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.5, eta: "3 min" },
    { id: "a2", vehicleName: "Piaggio Ape", driverName: "Suresh M.", price: 90, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.2, eta: "5 min" },
    { id: "a3", vehicleName: "Bajaj RE", driverName: "Vinod S.", price: 80, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.8, eta: "7 min" },
  ],
  bike: [
    { id: "b1", vehicleName: "Honda Activa", driverName: "Anil P.", price: 45, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.6, eta: "2 min" },
    { id: "b2", vehicleName: "TVS Jupiter", driverName: "Manoj R.", price: 50, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.3, eta: "4 min" },
  ],
  hatchback: [
    { id: "h1", vehicleName: "Maruti Swift", driverName: "Ramesh T.", price: 150, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.7, eta: "4 min" },
    { id: "h2", vehicleName: "Hyundai i20", driverName: "Krishna V.", price: 160, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.4, eta: "6 min" },
    { id: "h3", vehicleName: "Tata Altroz", driverName: "Deepak J.", price: 145, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.9, eta: "8 min" },
  ],
  sedan: [
    { id: "s1", vehicleName: "Honda City", driverName: "Ajay N.", price: 220, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.8, eta: "5 min" },
    { id: "s2", vehicleName: "Hyundai Verna", driverName: "Sanjay D.", price: 210, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.5, eta: "7 min" },
    { id: "s3", vehicleName: "Maruti Ciaz", driverName: "Prakash L.", price: 200, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.6, eta: "9 min" },
  ],
  suv: [
    { id: "u1", vehicleName: "Toyota Innova", driverName: "Mohan B.", price: 350, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.9, eta: "6 min" },
    { id: "u2", vehicleName: "Mahindra XUV700", driverName: "Ganesh H.", price: 330, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.7, eta: "8 min" },
    { id: "u3", vehicleName: "Kia Seltos", driverName: "Naveen W.", price: 310, photo: "https://i.imgur.com/8Km9tLL.png", rating: 4.4, eta: "10 min" },
  ],
};
// ─────────────────────────────────────────────────────────────────────

export default function NearbyVehiclesScreen() {
  const router = useRouter();
  const { vehicleType } = useLocalSearchParams<{ vehicleType: string }>();

  const vehicles = MOCK_VEHICLES[vehicleType ?? ""] ?? [];
  const typeLabel = vehicleType
    ? vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
    : "Vehicles";

  const handleSelect = (vehicle: NearbyVehicle) => {
    // TODO: integrate with booking API
    console.log("Selected vehicle:", vehicle);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 flex-row items-center border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 p-1"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            Nearby {typeLabel}s
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}{" "}
            found
          </Text>
        </View>
      </View>

      {/* Vehicle list */}
      {vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <NearbyVehicleCard vehicle={item} onSelect={handleSelect} />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="search" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No nearby vehicles found
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Try selecting a different vehicle type.
          </Text>
        </View>
      )}
    </View>
  );
}
