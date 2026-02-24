import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";

type LatLng = { latitude: number; longitude: number };

type Props = {
  start: LatLng;
  end: LatLng;
  pulse?: boolean;
};

export default function RouteEndpointsMarkers({
  start,
  end,
  pulse = false,
}: Props) {
  const outerSize = pulse ? 34 : 28;
  const glow = pulse ? 16 : 8;

  return (
    <>
      <Marker coordinate={start} tracksViewChanges={false} zIndex={120}>
        <View className="items-center justify-center">
          <View
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              backgroundColor: "rgba(30,144,255,0.08)",
              shadowColor: "#1E90FF",
              shadowOpacity: 0.35,
              shadowRadius: glow,
              shadowOffset: { width: 0, height: 0 },
              elevation: pulse ? 10 : 6,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#ffffff",
              borderWidth: 3,
              borderColor: "#1E90FF",
              shadowColor: "#1E90FF",
              shadowOpacity: 0.8,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: 12,
            }}
          />
        </View>
      </Marker>

      <Marker coordinate={end} tracksViewChanges={false} zIndex={120}>
        <View className="items-center justify-center">
          <View
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              backgroundColor: "rgba(30,144,255,0.08)",
              shadowColor: "#1E90FF",
              shadowOpacity: 0.35,
              shadowRadius: glow,
              shadowOffset: { width: 0, height: 0 },
              elevation: pulse ? 10 : 6,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#ffffff",
              borderWidth: 3,
              borderColor: "#1E90FF",
              shadowColor: "#1E90FF",
              shadowOpacity: 0.8,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: 12,
            }}
          />
        </View>
      </Marker>
    </>
  );
}
