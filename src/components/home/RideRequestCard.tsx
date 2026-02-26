import React, { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Button from "../ui/Button";
import PlacesAutocompleteInput from "./PlacesAutocompleteInput";
import VehicleTypeSelector, {
  type VehicleType,
} from "./VehicleTypeSelector";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLLAPSED_HEIGHT = 280;
const ROUTE_SELECTED_HEIGHT = SCREEN_HEIGHT * 0.65;
const MAX_HEIGHT = SCREEN_HEIGHT - 140; // ✅ Stops at 80%

type Props = {
  origin: string;
  destination: string;
  onSetCurrentLocation: () => void;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  onDestinationSelected: () => void;
  loading?: boolean;
  placesApiKey?: string;
  routeSelected?: boolean;
  onProceed?: (vehicle: VehicleType) => void;
  cardHeightShared?: SharedValue<number>;
};

export default function RideRequestCard({
  origin,
  destination,
  onSetCurrentLocation,
  setOrigin,
  setDestination,
  onDestinationSelected,
  loading = false,
  placesApiKey = "",
  routeSelected = false,
  onProceed,
  cardHeightShared,
}: Props) {
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleType | null>(null);

  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);
  const startHeight = useSharedValue(COLLAPSED_HEIGHT);

  const animatedCardStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  /*
    -----------------------------
    Gesture Logic (UI Thread)
    -----------------------------
  */

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Anchor height when gesture begins
      startHeight.value = animatedHeight.value;
    })
    .onUpdate((event) => {
      const newHeight =
        startHeight.value - event.translationY;

      const clampedHeight = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(MAX_HEIGHT, newHeight)
      );

      animatedHeight.value = clampedHeight;

      if (cardHeightShared) {
        cardHeightShared.value = clampedHeight;
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityY;

      const stops = routeSelected
        ? [COLLAPSED_HEIGHT, ROUTE_SELECTED_HEIGHT, MAX_HEIGHT]
        : [COLLAPSED_HEIGHT, ROUTE_SELECTED_HEIGHT];

      let targetHeight: number;

      if (velocity > 800) {
        // Fast downward flick
        targetHeight =
          stops
            .filter((s) => s < animatedHeight.value)
            .pop() ?? COLLAPSED_HEIGHT;
      } else if (velocity < -800) {
        // Fast upward flick
        targetHeight =
          stops.find((s) => s > animatedHeight.value) ??
          stops[stops.length - 1];
      } else {
        // Snap to closest stop
        targetHeight = stops.reduce((prev, curr) =>
          Math.abs(curr - animatedHeight.value) <
          Math.abs(prev - animatedHeight.value)
            ? curr
            : prev
        );
      }

      animatedHeight.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 120,
      });

      if (cardHeightShared) {
        cardHeightShared.value = withSpring(targetHeight, {
          damping: 15,
          stiffness: 120,
        });
      }
    });

  /*
    -----------------------------
    Auto expand on route selection
    -----------------------------
  */

  useEffect(() => {
    const targetHeight = routeSelected
      ? ROUTE_SELECTED_HEIGHT
      : COLLAPSED_HEIGHT;

    animatedHeight.value = withSpring(targetHeight, {
      damping: 15,
      stiffness: 120,
    });

    if (cardHeightShared) {
      cardHeightShared.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 120,
      });
    }
  }, [routeSelected]);

  return (
    <Animated.View
      className="w-full bg-white rounded-t-3xl shadow-2xl px-6 pt-2 pb-10 elevation-5"
      style={animatedCardStyle}
    >
      {/* Drag Handle Only */}
      <GestureDetector gesture={panGesture}>
        <View className="items-center py-4">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </View>
      </GestureDetector>

      {/* Scrollable Content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <Text className="text-xl font-bold text-gray-900 mb-5">
          Where to?
        </Text>

        <View className="flex-row mb-6">
          <View className="items-center justify-center mr-4 pt-4 pb-2">
            <View className="w-2 h-2 rounded-full bg-gray-400" />
            <View className="w-0.5 h-12 bg-gray-300 my-1" />
            <View className="w-2 h-2 bg-black" />
          </View>

          <View className="flex-1">
            <View className="mb-3">
              <PlacesAutocompleteInput
                label="Origin"
                placeholder="Enter origin or use current location"
                value={origin}
                onChangeText={setOrigin}
                apiKey={placesApiKey}
                icon="map-pin"
                rightIconName="navigation"
                onRightIconPress={onSetCurrentLocation}
              />
            </View>

            <PlacesAutocompleteInput
              label="Destination"
              placeholder="Enter destination"
              value={destination}
              onChangeText={setDestination}
              apiKey={placesApiKey}
              icon="map"
              onPlaceSelected={onDestinationSelected}
            />
          </View>
        </View>

        {routeSelected && (
          <>
            <VehicleTypeSelector
              onSelect={setSelectedVehicle}
            />

            <View className="mt-4">
              <Button
                onPress={() =>
                  selectedVehicle &&
                  onProceed?.(selectedVehicle)
                }
                disabled={!selectedVehicle}
                accessibilityLabel="Proceed with ride"
              >
                Proceed
              </Button>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </Animated.View>
  );
}