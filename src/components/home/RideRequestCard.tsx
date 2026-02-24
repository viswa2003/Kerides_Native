import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  PanResponder,
  Platform,
  Text,
  View,
} from "react-native";
import PlacesAutocompleteInput from "./PlacesAutocompleteInput";
import VehicleTypeSelector from "./VehicleTypeSelector";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLLAPSED_HEIGHT = 280;
const ROUTE_SELECTED_HEIGHT = SCREEN_HEIGHT * 0.65;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.65;

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
}: Props) {
  const animatedBottom = useRef(new Animated.Value(0)).current;
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const currentHeight = useRef(COLLAPSED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        const clampedHeight = Math.max(
          COLLAPSED_HEIGHT,
          Math.min(EXPANDED_HEIGHT, newHeight),
        );
        animatedHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        const velocity = gestureState.vy;

        let targetHeight: number;
        if (velocity < -0.5) {
          targetHeight = EXPANDED_HEIGHT;
        } else if (velocity > 0.5) {
          targetHeight = COLLAPSED_HEIGHT;
        } else {
          const midpoint = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
          targetHeight =
            newHeight > midpoint ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
        }

        currentHeight.current = targetHeight;

        Animated.spring(animatedHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const hideEvent =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const onShow = (e: any) => {
      const toValue = e?.endCoordinates?.height ?? 300;
      Animated.timing(animatedBottom, {
        toValue,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e: any) => {
      Animated.timing(animatedBottom, {
        toValue: 0,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedBottom]);

  // Animate height when route is selected/deselected
  useEffect(() => {
    const targetHeight = routeSelected
      ? ROUTE_SELECTED_HEIGHT
      : COLLAPSED_HEIGHT;
    currentHeight.current = targetHeight;
    Animated.spring(animatedHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  }, [routeSelected, animatedHeight]);

  return (
    <Animated.View
      className="absolute w-full bg-white rounded-t-3xl shadow-2xl px-6 pt-2 pb-10 elevation-5"
      style={[{ bottom: animatedBottom, height: animatedHeight }]}
    >
      <View {...panResponder.panHandlers} className="items-center py-4">
        <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </View>

      <View className="flex-1" style={{ overflow: "visible" }}>
        <Text className="text-xl font-bold text-gray-900 mb-5">Where to?</Text>

        <View
          className="flex-row mb-6"
          style={{ zIndex: 100, overflow: "visible" }}
        >
          <View className="items-center justify-center mr-4 pt-4 pb-2">
            <View className="w-2 h-2 rounded-full bg-gray-400" />
            <View className="w-0.5 h-12 bg-gray-300 my-1" />
            <View className="w-2 h-2 bg-black" />
          </View>

          <View className="flex-1" style={{ zIndex: 100, overflow: "visible" }}>
            <View className="mb-3" style={{ zIndex: 20 }}>
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

            <View style={{ zIndex: 10 }}>
              <PlacesAutocompleteInput
                label="Destination"
                placeholder="Enter destination"
                value={destination}
                onChangeText={setDestination}
                apiKey={placesApiKey}
                icon="map"
                onPlaceSelected={() => onDestinationSelected()}
              />
            </View>
          </View>
        </View>

        {routeSelected ? <VehicleTypeSelector /> : null}
      </View>
    </Animated.View>
  );
}
