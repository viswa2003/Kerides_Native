import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

import RideRequestCard from "../../src/components/home/RideRequestCard";

type Coords = { latitude: number; longitude: number } | null;

export default function HomeTab() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<Coords>(null);

  const [region, setRegion] = useState({
    latitude: 9.9312,
    longitude: 76.2673,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need location access to set your origin.",
        );
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);
        setRegion((r) => ({
          ...r,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      } catch (error) {
        console.log("Could not fetch initial location", error);
      }
    })();
  }, []);

  const handleSetCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
      setRegion((r) => ({
        ...r,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      setOrigin("My Current Location");
    } catch {
      Alert.alert("Error", "Could not fetch your current location.");
    }
  };

  const handleConfirm = () => {
    if (!origin || !destination) {
      Alert.alert("Missing Info", "Please enter both origin and destination.");
      return;
    }
    Alert.alert("Ride Confirmed", `From: ${origin}\nTo: ${destination}`);
  };

  const handleClear = () => {
    setOrigin("");
    setDestination("");
  };

  return (
    <View className="flex-1 bg-white relative">
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* {currentLocation && (
          <Marker coordinate={currentLocation} title="Origin">
            <View className="bg-black w-6 h-6 rounded-full border-2 border-white shadow-md" />
          </Marker>
        )} */}
      </MapView>

      <RideRequestCard
        origin={origin}
        destination={destination}
        setOrigin={setOrigin}
        setDestination={setDestination}
        onSetCurrentLocation={handleSetCurrentLocation}
        onConfirm={handleConfirm}
        onClear={handleClear}
      />
    </View>
  );
}
