import React from "react";
import { Pressable, Text, View } from "react-native";
import type { DirectionsRouteOption } from "../../api/directions";

type Props = {
  routes: DirectionsRouteOption[];
  highlightedIndex: number;
  selectedIndex: number;
  onHighlightRoute: (index: number) => void;
  onConfirmRoute: (index: number) => void;
};

export default function RouteOptionsList({
  routes,
  highlightedIndex,
  selectedIndex,
  onHighlightRoute,
  onConfirmRoute,
}: Props) {
  if (!routes.length) return null;

  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Recommended Routes
      </Text>

      <View className="gap-y-2">
        {routes.slice(0, 3).map((route, index) => {
          const isSelected = index === selectedIndex;
          const isHighlighted = index === highlightedIndex;

          return (
            <Pressable
              key={index}
              onPress={() => onHighlightRoute(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={`p-3 rounded-xl border ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : isHighlighted
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text
                  className={`text-sm font-bold ${
                    isSelected
                      ? "text-blue-700"
                      : isHighlighted
                        ? "text-blue-600"
                        : "text-gray-800"
                  }`}
                >
                  {index === 0 ? "Fastest Route" : `Route ${index + 1}`}
                </Text>

                {isSelected ? (
                  <View className="px-2 py-0.5 rounded-full bg-blue-100">
                    <Text className="text-xs font-semibold text-blue-700">
                      Selected
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="flex-row items-center gap-x-2">
                <Text className="text-sm text-gray-600">
                  {route.durationText || "—"}
                </Text>
                <Text className="text-sm text-gray-400">|</Text>
                <Text className="text-sm text-gray-600">
                  {route.distanceText || "—"}
                </Text>
              </View>

              {route.summary ? (
                <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
                  via {route.summary}
                </Text>
              ) : null}

              <View className="mt-3 flex-row justify-end">
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onConfirmRoute(index);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSelected ? "Selected route" : `Select route ${index + 1}`
                  }
                  className={`px-3 py-2 rounded-lg border ${
                    isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
