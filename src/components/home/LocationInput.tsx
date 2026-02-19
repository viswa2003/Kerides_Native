import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";
import TextField, { TextFieldProps } from "../ui/TextField";

type Props = Omit<TextFieldProps, "leftIcon" | "rightIcon"> & {
  icon?: React.ComponentProps<typeof Feather>["name"];
  onRightIconPress?: () => void;
  rightIconName?: React.ComponentProps<typeof Feather>["name"];
};

/**
 * Small wrapper around TextField to show a leading icon and an optional right action.
 */
export default function LocationInput({
  icon = "map-pin",
  rightIconName,
  onRightIconPress,
  ...props
}: Props) {
  return (
    <TextField
      {...(props as TextFieldProps)}
      leftIcon={<Feather name={icon} size={18} color="#6B7280" />}
      rightIcon={
        rightIconName ? (
          <Pressable
            onPress={onRightIconPress}
            accessibilityLabel="set-current-location"
          >
            <Feather name={rightIconName} size={18} color="#6B7280" />
          </Pressable>
        ) : undefined
      }
    />
  );
}
