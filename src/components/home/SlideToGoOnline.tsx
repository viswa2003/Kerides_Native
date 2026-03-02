import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const KNOB_SIZE = 56;
const TRACK_H = 64;
const TRACK_PADDING = 4;
const SPRING_CONFIG = { damping: 40, stiffness: 200 };

type Props = {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
};

export default function SlideToGoOnline({ isOnline, onToggle }: Props) {
  const translateX = useSharedValue(0);
  const maxX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(!isOnline)
    .onStart(() => {
      // no-op
    })
    .onUpdate((e) => {
      translateX.value = Math.max(0, Math.min(e.translationX, maxX.value));
    })
    .onEnd(() => {
      if (maxX.value > 0 && translateX.value >= maxX.value * 0.75) {
        translateX.value = withSpring(maxX.value, SPRING_CONFIG);
        runOnJS(onToggle)(true);
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => {
    const max = maxX.value || 1;
    return {
      opacity: interpolate(translateX.value, [0, max * 0.5], [1, 0], "clamp"),
    };
  });

  const trackAnimStyle = useAnimatedStyle(() => {
    const max = maxX.value || 1;
    const bg = interpolateColor(
      translateX.value,
      [0, max],
      ["#F0FDF4", "#16A34A"] // green-50 → green-600
    );
    return { backgroundColor: bg };
  });

  const handleLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    maxX.value = e.nativeEvent.layout.width - KNOB_SIZE - TRACK_PADDING * 2;
  };

  if (isOnline) {
    return (
      <View style={styles.wrapper}>
        <Pressable
          onPress={() => {
            translateX.value = withSpring(0, SPRING_CONFIG);
            onToggle(false);
          }}
          style={[styles.track, { backgroundColor: "#16A34A" }]}
        >
          <View style={styles.onlineContent}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>You are Online</Text>
          </View>
          <Text style={styles.tapHint}>Tap to go offline</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.track, trackAnimStyle]}
          onLayout={handleLayout}
        >
          <Animated.View style={[styles.labelContainer, labelStyle]}>
            <Text style={styles.label}>Slide to go online</Text>
          </Animated.View>

          <Animated.View style={[styles.knob, knobStyle]}>
            <MaterialCommunityIcons
              name="chevron-double-right"
              size={28}
              color="#fff"
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: TRACK_PADDING,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0", // green-200
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#15803D", // green-700
    letterSpacing: 0.5,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "#16A34A", // green-600
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  onlineText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tapHint: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
});
