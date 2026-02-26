import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  fetchDirectionsAlternatives,
  type DirectionsRouteOption,
} from "../../../src/api/directions";
import RideRequestCard from "../../../src/components/home/RideRequestCard";
import RouteEndpointsMarkers from "../../../src/components/home/RouteEndpointsMarkers";
import type { VehicleType } from "../../../src/components/home/VehicleTypeSelector";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Coords = { latitude: number; longitude: number } | null;

export default function UserHomeTab() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const cardHeight = useSharedValue(280);

  const animatedMapStyle = useAnimatedStyle(() => {
    return {
      height: SCREEN_HEIGHT - cardHeight.value,
    };
  });

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
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need location access to set your origin."
        );
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
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
      } catch {}
    })();
  }, []);

  const handleSetCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
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

      const reverseGeocode =
        await Location.reverseGeocodeAsync(coords);

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const addressParts = [
          place.name,
          place.street,
          place.city,
          place.region,
        ].filter(Boolean);

        setOrigin(addressParts.join(", ") || "My Current Location");
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
      Alert.alert(
        "Missing Info",
        "Please enter both origin and destination."
      );
      return;
    }

    try {
      setRoutesLoading(true);
      setRoutes([]);
      setSelectedRouteIndex(-1);
      setHighlightedRouteIndex(-1);

      const originParam =
        originIsCurrentLocation && currentLocation
          ? currentLocation
          : origin;

      const result = await fetchDirectionsAlternatives({
        origin: originParam,
        destination,
        apiKey: directionsApiKey,
        maxRoutes: 3,
      });

      if (!result.length) {
        Alert.alert(
          "No Routes",
          "No routes were returned for this trip."
        );
        return;
      }

      setRoutes(result);
      setSelectedRouteIndex(0);
      setHighlightedRouteIndex(0);
    } catch (e: any) {
      Alert.alert(
        "Directions Error",
        e?.message || "Could not fetch routes."
      );
    } finally {
      setRoutesLoading(false);
    }
  };

  const activeIndex =
    selectedRouteIndex >= 0
      ? selectedRouteIndex
      : highlightedRouteIndex;

  useEffect(() => {
    if (!mapRef.current) return;
    if (activeIndex < 0) return;

    const coords = routes[activeIndex]?.coordinates;
    if (!coords?.length) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: {
        top: 80,
        right: 60,
        bottom: cardHeight.value + 40,
        left: 60,
      },
      animated: true,
    });
  }, [activeIndex, routes]);

  return (
    <View className="flex-1 bg-white">
      <Animated.View style={animatedMapStyle}>
        <MapView
          ref={(r) => (mapRef.current = r)}
          style={{ flex: 1 }}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {routes.map((route, index) => {
            const isSelected = index === selectedRouteIndex;

            return (
              <Polyline
                key={index}
                coordinates={route.coordinates}
                strokeColor={
                  isSelected ? "#1565C0" : "#90CAF9"
                }
                strokeWidth={isSelected ? 6 : 4}
                zIndex={isSelected ? 30 : 10}
                tappable
                onPress={() => {
                  setSelectedRouteIndex(index);
                  setHighlightedRouteIndex(index);
                }}
              />
            );
          })}
        </MapView>

        <View className="absolute top-12 left-0 right-0 items-center">
          <View className="bg-white/80 px-6 py-2 rounded-full">
            <Text className="text-xl font-bold text-gray-800">
              Kerides
            </Text>
          </View>
        </View>
      </Animated.View>

      <RideRequestCard
        origin={origin}
        destination={destination}
        setOrigin={setOrigin}
        setDestination={setDestination}
        onSetCurrentLocation={handleSetCurrentLocation}
        onDestinationSelected={handleConfirm}
        loading={routesLoading}
        placesApiKey={directionsApiKey}
        routeSelected={selectedRouteIndex >= 0}
        onProceed={(vehicle: VehicleType) =>
          router.push({
            pathname: "/user/nearby-vehicles",
            params: { vehicleType: vehicle.id },
          })
        }
        cardHeightShared={cardHeight}
      />
    </View>
  );
}