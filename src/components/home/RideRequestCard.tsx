import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    PanResponder,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { DirectionsRouteOption } from "../../api/directions";
import Button from "../ui/Button";
import PlacesAutocompleteInput from "./PlacesAutocompleteInput";
import RouteOptionsList from "./RouteOptionsList";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLLAPSED_HEIGHT = 340;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.85;

type Props = {
  origin: string;
  destination: string;
  onSetCurrentLocation: () => void;
  onConfirm: () => void;
  onClear: () => void;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  loading?: boolean;
  routes?: DirectionsRouteOption[];
  highlightedRouteIndex?: number;
  selectedRouteIndex?: number;
  onHighlightRoute?: (index: number) => void;
  onSelectRoute?: (index: number) => void;
  placesApiKey?: string;
};

export default function RideRequestCard({
  origin,
  destination,
  onSetCurrentLocation,
  onConfirm,
  onClear,
  setOrigin,
  setDestination,
  loading = false,
  routes = [],
  highlightedRouteIndex = -1,
  selectedRouteIndex = -1,
  onHighlightRoute,
  onSelectRoute,
  placesApiKey = "",
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
              />
            </View>
          </View>
        </View>

        <View className="flex-row justify-between gap-x-4 mt-2">
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-4 rounded-xl items-center justify-center"
            onPress={onClear}
          >
            <Text className="text-gray-700 font-bold text-base">Clear</Text>
          </TouchableOpacity>

          <Button
            className="flex-1"
            onPress={onConfirm}
            loading={loading}
            accessibilityLabel="Search routes"
            variant="success"
          >
            Search Routes
          </Button>
        </View>

        <RouteOptionsList
          routes={routes}
          highlightedIndex={highlightedRouteIndex}
          selectedIndex={selectedRouteIndex}
          onHighlightRoute={(index) => onHighlightRoute?.(index)}
          onConfirmRoute={(index) => onSelectRoute?.(index)}
        />
      </View>
    </Animated.View>
  );
}
