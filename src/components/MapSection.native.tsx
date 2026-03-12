import React from "react";
import { View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";

interface Props {
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}

export default function MapSection({ originCoords, destCoords }: Props) {
  const router = useRouter();

  return (
    <View className="h-[35%]">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: originCoords?.lat ?? 9.9312,
          longitude: originCoords?.lng ?? 76.2673,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {originCoords && (
          <Marker
            coordinate={{ latitude: originCoords.lat, longitude: originCoords.lng }}
            title="Pickup"
            pinColor="green"
          />
        )}
        {destCoords && (
          <Marker
            coordinate={{ latitude: destCoords.lat, longitude: destCoords.lng }}
            title="Drop-off"
            pinColor="red"
          />
        )}
      </MapView>

      <Pressable
        onPress={() => router.back()}
        className="absolute top-14 left-4 bg-white rounded-full p-2 shadow"
        style={{ elevation: 3 }}
      >
        <Feather name="arrow-left" size={22} color="#111827" />
      </Pressable>
    </View>
  );
}
