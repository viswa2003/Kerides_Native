import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { register, RegisterRequest, Role } from "../../api/auth";
import { useAuth } from "../../auth/AuthProvider";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Checkbox from "../ui/Checkbox";
import TextField from "../ui/TextField";

type Props = {
  role?: Role;
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function isStrongPassword(value: string) {
  return value.length >= 8;
}

function isValidPhoneNumber(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

export default function RegisterForm({ role = "USER" }: Props) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!isEmail(email)) e.email = "Enter a valid email";
    if (!phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!isValidPhoneNumber(phoneNumber.trim()))
      e.phoneNumber = "Enter a valid 10-digit phone number";
    if (!isStrongPassword(password))
      e.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!acceptTerms) e.terms = "You must accept the Terms of Service";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);

    const payload: RegisterRequest = {
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
    };

    try {
      const resp = await register(payload);
      await signIn(resp.accessToken, resp.user.role);

      if (resp.user.role === "DRIVER") {
        router.replace("/driver/home");
      } else {
        router.replace("/user/home");
      }
    } catch (err: any) {
      Alert.alert("Registration failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <View className="mb-4">
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="John Doe"
          autoComplete="name"
          textContentType="name"
          error={errors.fullName || null}
          leftIcon={<Feather name="user" size={18} color="#6B7280" />}
        />
      </View>

      <View className="mb-4">
        <TextField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email || null}
          leftIcon={<Feather name="mail" size={18} color="#6B7280" />}
        />
      </View>

      <View className="mb-4">
        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="9876543210"
          keyboardType="phone-pad"
          autoComplete="tel"
          leftIcon={<Feather name="phone" size={18} color="#6B7280" />}
          error={errors.phoneNumber || null}
        />
      </View>

      <View className="mb-4">
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a strong password"
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          error={errors.password || null}
          leftIcon={<Feather name="lock" size={18} color="#6B7280" />}
          rightIcon={
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#6B7280"
              />
            </Pressable>
          }
        />
      </View>

      <View className="mb-4">
        <TextField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry={!showConfirm}
          textContentType="password"
          error={errors.confirmPassword || null}
          leftIcon={<Feather name="lock" size={18} color="#6B7280" />}
          rightIcon={
            <Pressable
              onPress={() => setShowConfirm((v) => !v)}
              accessibilityLabel={
                showConfirm ? "Hide password" : "Show password"
              }
            >
              <Feather
                name={showConfirm ? "eye-off" : "eye"}
                size={18}
                color="#6B7280"
              />
            </Pressable>
          }
        />
      </View>

      <View className="mb-4">
        <Checkbox checked={acceptTerms} onValueChange={setAcceptTerms}>
          <Text>
            I agree to the{" "}
            <Text
              className="text-primary-600 font-medium"
              onPress={() => Linking.openURL("https://example.com/terms")}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              className="text-primary-600 font-medium"
              onPress={() => Linking.openURL("https://example.com/privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </Checkbox>
        {errors.terms ? (
          <Text className="mt-2 text-sm text-red-600" accessibilityRole="alert">
            {errors.terms}
          </Text>
        ) : null}
      </View>

      <View className="mt-2">
        <Button
          onPress={onSubmit}
          loading={loading}
          accessibilityLabel="Create account"
        >
          Create Account
        </Button>
      </View>
    </Card>
  );
}
