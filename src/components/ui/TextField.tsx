import React, { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

/**
 * Accessible text field used across auth forms.
 * Supports optional `leftIcon` and `rightIcon` nodes so inputs can show icons/buttons.
 */
export type TextFieldProps = {
  label?: string;
  error?: string | null;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & TextInputProps;

const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    { label, error, containerClassName = "", leftIcon, rightIcon, ...props },
    ref,
  ) => {
    return (
      <View className={`w-full ${containerClassName}`}>
        {label ? (
          <Text className="mb-1 text-sm font-medium text-gray-700">
            {label}
          </Text>
        ) : null}

        <View
          className={`flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 ${
            props.editable === false ? "opacity-60" : ""
          }`}
        >
          {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            {...props}
            className="flex-1 text-base text-gray-900"
            accessibilityLabel={props.accessibilityLabel || label}
            placeholderTextColor="#9CA3AF"
          />

          {rightIcon ? <View className="ml-3">{rightIcon}</View> : null}
        </View>

        {error ? (
          <Text className="mt-1 text-sm text-red-600" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";
export default TextField;
