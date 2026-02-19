import React, { useEffect, useRef } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../ui/Button";
import LocationInput from "./LocationInput";

type Props = {
  origin: string;
  destination: string;
  onSetCurrentLocation: () => void;
  onConfirm: () => void;
  onClear: () => void;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  loading?: boolean;
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
}: Props) {
  const animatedBottom = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showEvent =
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const hideEvent =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const onShow = (e: any) => {
      const keyboardHeight = e?.endCoordinates?.height ?? 300;
      const toValue = keyboardHeight + insets.bottom; // ensure card lifts above keyboard + safe area
      Animated.timing(animatedBottom, {
        toValue,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e: any) => {
      Animated.timing(animatedBottom, {
        toValue: insets.bottom,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    };

    // initialize above the bottom safe area so content isn't hidden behind home indicator
    animatedBottom.setValue(insets.bottom);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedBottom, insets.bottom]);

  return (
    <Animated.View
      className="absolute w-full bg-white rounded-t-3xl shadow-2xl px-6 pt-6 pb-10 elevation-5"
      style={[{ bottom: animatedBottom, paddingBottom: insets.bottom }]}
    >
      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-6" />

      <Text className="text-xl font-bold text-gray-900 mb-5">Where to?</Text>

      <View className="flex-row mb-6">
        <View className="items-center justify-center mr-4 pt-4 pb-2">
          <View className="w-2 h-2 rounded-full bg-gray-400" />
          <View className="w-0.5 h-12 bg-gray-300 my-1" />
          <View className="w-2 h-2 bg-black" />
        </View>

        <View className="flex-1">
          <View className="mb-3">
            <LocationInput
              label="Origin"
              placeholder="Current Location"
              value={origin}
              onChangeText={setOrigin}
              rightIconName="navigation"
              onRightIconPress={onSetCurrentLocation}
            />
          </View>

          <View>
            <LocationInput
              label="Destination"
              placeholder="Enter destination"
              value={destination}
              onChangeText={setDestination}
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
          className="flex-[2]"
          onPress={onConfirm}
          loading={loading}
          accessibilityLabel="Search rides"
          variant="primary"
        >
          Search Rides
        </Button>
      </View>
    </Animated.View>
  );
}
