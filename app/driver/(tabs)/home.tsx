import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import arrow from "../../../assets/images/map_arrow.png";
import {
  acceptBooking,
  rejectBooking,
} from "../../../src/api/bookings";
import {
  updateDriverLocation,
  updateOnlineStatus,
} from "../../../src/api/driver-profile";
import IncomingRideModal, {
  type IncomingRideRequest,
} from "../../../src/components/home/driver/IncomingRideModal";
import SlideToGoOnline from "../../../src/components/home/driver/SlideToGoOnline";
import { useRideRequests } from "../../../src/hooks/useRideRequests";

type Coords = {
  latitude: number;
  longitude: number;
};

export default function DriverHomeTab() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [location, setLocation] = useState<Coords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(false);
  const isOnlineRef = useRef(false);
  const [incomingRequest, setIncomingRequest] =
    useState<IncomingRideRequest | null>(null);

  const { requests } = useRideRequests(isOnline);

  // Show the first pending ride request when it arrives via SSE
  useEffect(() => {
    if (!isOnline || requests.length === 0) return;
    const first = requests[0];
    if (incomingRequest?.id === first._id) return;

    setIncomingRequest({
      id: first._id,
      origin: first.booking?.origin?.address ?? "Unknown",
      destination: first.booking?.destination?.address ?? "Unknown",
      distanceKm: first.estimatedDistance ?? 0,
      fareEstimate: first.booking?.fare,
    });
  }, [requests, isOnline, incomingRequest?.id]);

  async function handleAccept(id: string) {
    setIncomingRequest(null);
    try {
      const req = requests.find((r) => r._id === id);
      const bookingId = req?.bookingId ?? id;
      await acceptBooking(bookingId);
      router.push({
        pathname: "/driver/active-ride",
        params: { bookingId },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not accept ride.");
    }
  }

  async function handleReject(id: string) {
    setIncomingRequest(null);
    try {
      const req = requests.find((r) => r._id === id);
      const bookingId = req?.bookingId ?? id;
      await rejectBooking(bookingId);
    } catch {
      // silent
    }
  }

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

          // Send location to backend when online
          if (isOnlineRef.current) {
            updateDriverLocation(coords.latitude, coords.longitude, true).catch(
              () => {},
            );
          }

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

      {/* Bookings button */}
      <Pressable
        onPress={() => router.push("/driver/bookings")}
        style={styles.bookingsButton}
        className="bg-white rounded-full items-center justify-center"
      >
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={22}
          color="#374151"
        />
      </Pressable>

      <View style={styles.sliderContainer}>
        <SlideToGoOnline
          isOnline={isOnline}
          onToggle={async (online) => {
            try {
              await updateOnlineStatus(online);
              setIsOnline(online);
              isOnlineRef.current = online;
              if (!online) setIncomingRequest(null);
            } catch (err: any) {
              Alert.alert("Error", err.message ?? "Could not update status.");
            }
          }}
        />
      </View>

      <IncomingRideModal
        request={incomingRequest}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bookingsButton: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 44,
    height: 44,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sliderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});