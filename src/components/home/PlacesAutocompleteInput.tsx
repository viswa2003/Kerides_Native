import { Feather } from "@expo/vector-icons";
import React, { useRef, useEffect } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";

type PlaceResult = {
  description: string;
  place_id: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelected?: (place: PlaceResult) => void;
  apiKey: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  rightIconName?: React.ComponentProps<typeof Feather>["name"];
  onRightIconPress?: () => void;
};

export default function PlacesAutocompleteInput({
  label,
  placeholder,
  value,
  onChangeText,
  onPlaceSelected,
  apiKey,
  icon = "map-pin",
  rightIconName,
  onRightIconPress,
}: Props) {
  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);

  // Sync external value changes (e.g., "My Current Location") to the input
  useEffect(() => {
    if (ref.current) {
      const currentText = ref.current.getAddressText();
      if (value !== currentText) {
        ref.current.setAddressText(value);
      }
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.inputRow}>
        <View style={styles.leftIcon}>
          <Feather name={icon} size={18} color="#6B7280" />
        </View>

        <GooglePlacesAutocomplete
          ref={ref}
          placeholder={placeholder || "Search"}
          minLength={2}
          fetchDetails
          onPress={(data, details = null) => {
            const description = data.description || "";
            onChangeText(description);

            if (onPlaceSelected && details?.geometry?.location) {
              onPlaceSelected({
                description,
                place_id: data.place_id || "",
                geometry: {
                  location: {
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  },
                },
              });
            }
          }}
          textInputProps={{
            onChangeText: (text) => {
              onChangeText(text);
            },
            value: undefined, // Let the component manage its own value
            placeholderTextColor: "#9CA3AF",
          }}
          query={{
            key: apiKey,
            language: "en",
            components: "country:in", // Restrict to India; remove or change as needed
          }}
          styles={{
            container: { flex: 1 },
            textInputContainer: {
              backgroundColor: "transparent",
            },
            textInput: {
              height: 40,
              color: "#111827",
              fontSize: 16,
              backgroundColor: "transparent",
              paddingHorizontal: 0,
            },
            listView: {
              position: "absolute",
              top: 44,
              left: -40,
              right: -48,
              backgroundColor: "#fff",
              borderRadius: 8,
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              zIndex: 1000,
            },
            row: {
              paddingVertical: 12,
              paddingHorizontal: 16,
            },
            description: {
              fontSize: 14,
              color: "#374151",
            },
            separator: {
              height: 1,
              backgroundColor: "#E5E7EB",
            },
          }}
          enablePoweredByContainer={false}
          debounce={300}
        />

        {rightIconName ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            accessibilityLabel="set-current-location"
          >
            <Feather name={rightIconName} size={18} color="#6B7280" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 10,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
});
