import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../src/auth/AuthProvider";
import {
  getMyProfile,
  updateMyProfile,
  createUserProfile,
  type UserProfile,
  type UpdateUserProfileRequest,
} from "../../../src/api/user-profile";
import Button from "../../../src/components/ui/Button";
import TextField from "../../../src/components/ui/TextField";

export default function AccountsTab() {
  const { signOut } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setAddress(data.address ?? "");
      setCity(data.addressDetails?.city ?? "");
      setState(data.addressDetails?.state ?? "");
      setPincode(data.addressDetails?.pincode ?? "");
    } catch {
      // Profile may not exist yet
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateUserProfileRequest = {
        address: address || undefined,
        addressDetails: {
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
        },
      };

      const updated = profile
        ? await updateMyProfile(payload)
        : await createUserProfile(payload);

      setProfile(updated);
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/user/login");
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-6 pt-14 pb-12"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProfile();
          }}
        />
      }
    >
      <Text className="text-2xl font-bold text-gray-900">Account</Text>
      <Text className="mt-1 text-sm text-gray-500">
        Manage your profile and settings
      </Text>

      {/* Profile Card */}
      <View className="mt-6 bg-gray-50 rounded-2xl p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-semibold text-gray-900">
            Profile Details
          </Text>
          {!editing && (
            <Pressable onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={18} color="#16A34A" />
            </Pressable>
          )}
        </View>

        {editing ? (
          <View className="gap-3">
            <TextField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Your address"
            />
            <TextField
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="City"
            />
            <TextField
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="State"
            />
            <TextField
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
              placeholder="Pincode"
              keyboardType="number-pad"
            />
            <View className="flex-row gap-3 mt-2">
              <Button
                variant="secondary"
                onPress={() => {
                  setEditing(false);
                  setAddress(profile?.address ?? "");
                  setCity(profile?.addressDetails?.city ?? "");
                  setState(profile?.addressDetails?.state ?? "");
                  setPincode(profile?.addressDetails?.pincode ?? "");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onPress={handleSave}
                loading={saving}
                className="flex-1"
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            <ProfileRow
              icon="map-pin"
              label="Address"
              value={profile?.address}
            />
            <ProfileRow
              icon="map"
              label="City"
              value={profile?.addressDetails?.city}
            />
            <ProfileRow
              icon="globe"
              label="State"
              value={profile?.addressDetails?.state}
            />
            <ProfileRow
              icon="hash"
              label="Pincode"
              value={profile?.addressDetails?.pincode}
            />
          </View>
        )}
      </View>

      {/* Sign Out */}
      <View className="mt-8">
        <Button
          variant="secondary"
          onPress={handleSignOut}
          accessibilityLabel="Sign out"
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={16} color="#6B7280" />
      <Text className="ml-3 text-sm text-gray-500 w-16">{label}</Text>
      <Text className="flex-1 text-sm text-gray-900">
        {value || "Not set"}
      </Text>
    </View>
  );
}
