import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import {
  fetchDirectionsAlternatives,
  type DirectionsRouteOption,
} from "../../src/api/directions";
import RideRequestCard from "../../src/components/home/RideRequestCard";
import RouteEndpointsMarkers from "../../src/components/home/RouteEndpointsMarkers";

type Coords = { latitude: number; longitude: number } | null;

export default function HomeTab() {
  const mapRef = useRef<MapView | null>(null);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<Coords>(null);
  const [originIsCurrentLocation, setOriginIsCurrentLocation] = useState(false);

  const [routes, setRoutes] = useState<DirectionsRouteOption[]>([]);
  const [highlightedRouteIndex, setHighlightedRouteIndex] = useState(-1);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(-1);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [selectPulse, setSelectPulse] = useState(false);

  const [region, setRegion] = useState({
    latitude: 9.9312,
    longitude: 76.2673,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const directionsApiKey = useMemo(() => {
    return (
      process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY ||
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      ""
    );
  }, []);

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
        const nextRegion = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 500);
      } catch {
        // Location fetch failed silently on initial load
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
      const nextRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(nextRegion);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const addressParts = [
          place.name,
          place.street,
          place.city,
          place.region,
        ].filter(Boolean);
        const address = addressParts.join(", ") || "My Current Location";
        setOrigin(address);
      } else {
        setOrigin("My Current Location");
      }
      setOriginIsCurrentLocation(true);

      mapRef.current?.animateToRegion(nextRegion, 500);
    } catch {
      Alert.alert("Error", "Could not fetch your current location.");
    }
  };

  const handleConfirm = async () => {
    if (!origin || !destination) {
      Alert.alert("Missing Info", "Please enter both origin and destination.");
      return;
    }

    try {
      setRoutesLoading(true);
      setRoutes([]);
      setSelectedRouteIndex(-1);
      setHighlightedRouteIndex(-1);

      const originParam =
        originIsCurrentLocation && currentLocation ? currentLocation : origin;
      const result = await fetchDirectionsAlternatives({
        origin: originParam,
        destination,
        apiKey: directionsApiKey,
        maxRoutes: 3,
      });

      if (!result.length) {
        Alert.alert("No Routes", "No routes were returned for this trip.");
        return;
      }

      setRoutes(result);
      setSelectedRouteIndex(0);
      setHighlightedRouteIndex(0);
    } catch (e: any) {
      Alert.alert("Directions Error", e?.message || "Could not fetch routes.");
    } finally {
      setRoutesLoading(false);
    }
  };

  // Wrapper to reset the current location flag when user manually changes origin
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    setOriginIsCurrentLocation(false);
  };

  const activeIndex =
    selectedRouteIndex >= 0 ? selectedRouteIndex : highlightedRouteIndex;

  useEffect(() => {
    if (selectedRouteIndex < 0) return;
    setSelectPulse(true);
    const t = setTimeout(() => setSelectPulse(false), 420);
    return () => clearTimeout(t);
  }, [selectedRouteIndex]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (activeIndex < 0) return;
    const coords = routes[activeIndex]?.coordinates;
    if (!coords || coords.length === 0) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 60, bottom: 320, left: 60 },
      animated: true,
    });
  }, [activeIndex, routes]);

  return (
    <View className="flex-1 bg-white relative">
      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {selectedRouteIndex >= 0 &&
        routes[selectedRouteIndex]?.coordinates?.length ? (
          <RouteEndpointsMarkers
            start={routes[selectedRouteIndex].coordinates[0]}
            end={
              routes[selectedRouteIndex].coordinates[
                routes[selectedRouteIndex].coordinates.length - 1
              ]
            }
            pulse={selectPulse}
          />
        ) : null}

        {routes.map((route, index) => {
          const isSelected = index === selectedRouteIndex;

          const strokeColor = isSelected ? "#1565C0" : "#90CAF9";
          const strokeWidth = isSelected ? 6 : 4;
          const zIndex = isSelected ? 30 : 10;

          return (
            <Polyline
              key={index}
              coordinates={route.coordinates}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              zIndex={zIndex}
              tappable
              onPress={() => {
                setSelectedRouteIndex(index);
                setHighlightedRouteIndex(index);
              }}
            />
          );
        })}

        {selectedRouteIndex >= 0 &&
          routes[selectedRouteIndex]?.coordinates?.length &&
          routes[selectedRouteIndex]?.durationText &&
          (() => {
            const route = routes[selectedRouteIndex];
            const midIndex = Math.floor(route.coordinates.length / 2);
            const mid = route.coordinates[midIndex];

            if (!mid?.latitude || !mid?.longitude) return null;

            return (
              <Marker
                coordinate={mid}
                tracksViewChanges={false}
                zIndex={50}
                onPress={() => {
                  setHighlightedRouteIndex(selectedRouteIndex);
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: "#1565C0",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: "#1565C0",
                      minWidth: 60,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#ffffff",
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                    >
                      {route.durationText}
                    </Text>
                  </View>
                </View>
              </Marker>
            );
          })()}
      </MapView>

      <View className="absolute top-12 left-0 right-0 items-center">
        <View className="bg-white/80 px-6 py-2 rounded-full">
          <Text className="text-xl font-bold text-gray-800">Kerides</Text>
        </View>
      </View>

      <RideRequestCard
        origin={origin}
        destination={destination}
        setOrigin={handleOriginChange}
        setDestination={setDestination}
        onSetCurrentLocation={handleSetCurrentLocation}
        onDestinationSelected={handleConfirm}
        loading={routesLoading}
        placesApiKey={directionsApiKey}
        routeSelected={selectedRouteIndex >= 0}
      />
    </View>
  );
}
