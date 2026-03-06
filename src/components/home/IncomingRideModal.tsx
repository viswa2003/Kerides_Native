import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

export type IncomingRideRequest = {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  fareEstimate?: number;
};

type Props = {
  request: IncomingRideRequest | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
};

export default function IncomingRideModal({ request, onAccept, onReject }: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (request) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [request]);

  if (!request) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!request}
      statusBarTranslucent
    >
      {/* Dimmed backdrop */}
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl px-6 pt-5 pb-8"
        >
          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-gray-300 mb-4" />
            <Text className="text-lg font-bold text-gray-900">New Ride Request</Text>
          </View>

          {/* Origin */}
          <View className="flex-row items-start mb-4">
            <View className="w-8 items-center pt-0.5">
              <View className="w-3 h-3 rounded-full bg-primary-600" />
              <View className="w-0.5 flex-1 bg-gray-300 my-1" style={{ minHeight: 24 }} />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Pickup
              </Text>
              <Text className="text-base text-gray-900 font-medium" numberOfLines={2}>
                {request.origin}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View className="flex-row items-start mb-5">
            <View className="w-8 items-center pt-0.5">
              <Feather name="map-pin" size={14} color="#DC2626" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Drop-off
              </Text>
              <Text className="text-base text-gray-900 font-medium" numberOfLines={2}>
                {request.destination}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View className="flex-row bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-1 items-center">
              <Feather name="navigation" size={18} color="#4B5563" />
              <Text className="text-sm font-semibold text-gray-900 mt-1">
                {request.distanceKm.toFixed(1)} km
              </Text>
              <Text className="text-xs text-gray-500">Distance</Text>
            </View>
            {request.fareEstimate !== undefined && (
              <>
                <View className="w-px bg-gray-200" />
                <View className="flex-1 items-center">
                  <Feather name="tag" size={18} color="#4B5563" />
                  <Text className="text-sm font-semibold text-gray-900 mt-1">
                    ₹{request.fareEstimate.toFixed(0)}
                  </Text>
                  <Text className="text-xs text-gray-500">Est. Fare</Text>
                </View>
              </>
            )}
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => onReject(request.id)}
              className="flex-1 rounded-xl border-2 border-red-500 py-3.5 items-center"
            >
              <Text className="text-red-500 font-bold text-base">Reject</Text>
            </Pressable>

            <Pressable
              onPress={() => onAccept(request.id)}
              className="flex-[2] rounded-xl bg-primary-600 py-3.5 items-center"
            >
              <Text className="text-white font-bold text-base">Accept</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
