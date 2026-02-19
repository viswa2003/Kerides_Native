import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { login, LoginRequest, Role } from "../../api/auth";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

type Props = {
  role?: Role;
  onSuccess?: (resp: any) => void;
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

/**
 * Reusable login form used by both User and Driver login pages.
 * - Sends role (if provided) to the API so server can validate scoped logins.
 */
export default function LoginForm({ role = "USER", onSuccess }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!isEmail(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);

    const payload: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
      role,
    };

    try {
      const resp = await login(payload);
      // TODO: store token / set auth state — left to app-specific auth flow
      onSuccess?.(resp);
      Alert.alert("Signed in", "Login successful.", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (err: any) {
      Alert.alert("Login failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="w-full max-w-md">
      <View className="mb-4">
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email || null}
          leftIcon={<Feather name="mail" size={18} color="#6B7280" />}
        />
      </View>

      <View className="mb-4">
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          textContentType="password"
          error={errors.password || null}
          leftIcon={<Feather name="lock" size={18} color="#6B7280" />}
          rightIcon={
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color="#6B7280"
              onPress={() => setShowPassword((v) => !v)}
            />
          }
        />
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm text-gray-500">&nbsp;</Text>
        <Text
          className="text-sm text-primary-600"
          onPress={() => Linking.openURL("/forgot-password")}
        >
          Forgot password?
        </Text>
      </View>

      <Button onPress={onSubmit} loading={loading} accessibilityLabel="Sign in">
        Sign in
      </Button>
    </View>
  );
}
