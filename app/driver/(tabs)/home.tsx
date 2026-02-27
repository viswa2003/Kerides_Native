import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import arrow from "../../../assets/images/map_arrow.png"

type Coords = {
  latitude: number;
  longitude: number;
};

export default function DriverHomeTab() {
  const mapRef = useRef<MapView | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [location, setLocation] = useState<Coords | null>(null);
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Location access is required for drivers."
        );
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (loc) => {
          if (!mounted) return;

          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocation(coords);
          setHeading(loc.coords.heading ?? 0);

          mapRef.current?.animateCamera(
            {
              center: coords,
              zoom: 17,
            },
            { duration: 500 }
          );
        }
      );
    })();

    return () => {
      mounted = false;
      locationSubscription.current?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location?.latitude ?? 9.9312,
          longitude: location?.longitude ?? 76.2673,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
          >
            <Image
              source={arrow}
              style={{
                width: 20,
                height: 40,
                transform: [{ rotate: `${heading}deg` }],
              }}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>
    </View>
  );
}