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
  createDriverProfile,
  getMyDriverProfile,
  updateMyDriverProfile,
  type CreateDriverProfileRequest,
  type DriverProfile,
  type UpdateDriverProfileRequest,
} from "../../../src/api/driver-profile";
import Button from "../../../src/components/ui/Button";
import TextField from "../../../src/components/ui/TextField";

export default function ProfileTab() {
  const { signOut } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dob, setDob] = useState("");
  const [languages, setLanguages] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  const populateForm = (p: DriverProfile | null) => {
    setLicenseNumber(p?.licenseNumber ?? "");
    setBloodGroup(p?.bloodGroup ?? "");
    setDob(p?.dob ?? "");
    setLanguages(p?.languages?.join(", ") ?? "");
    setExperienceYears(p?.experienceYears?.toString() ?? "");
  };

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMyDriverProfile();
      setProfile(data);
      populateForm(data);
    } catch {
      // Profile may not exist yet — show creation form
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!licenseNumber.trim()) {
      Alert.alert("Required", "License number is required.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateDriverProfileRequest & UpdateDriverProfileRequest = {
        licenseNumber: licenseNumber.trim(),
        bloodGroup: bloodGroup.trim() || undefined,
        dob: dob.trim() || undefined,
        languages: languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
      };

      const updated = profile
        ? await updateMyDriverProfile(payload)
        : await createDriverProfile(payload);

      setProfile(updated);
      populateForm(updated);
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/driver/login");
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const needsCreation = !profile;

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
      <Text className="text-2xl font-bold text-gray-900">Driver Profile</Text>
      <Text className="mt-1 text-sm text-gray-500">
        {needsCreation
          ? "Set up your driver profile to start accepting rides"
          : "Manage your profile and documents"}
      </Text>

      {/* Stats row — only when profile exists */}
      {profile && (
        <View className="flex-row mt-5 gap-3">
          <StatCard label="Rating" value={profile.rating?.toFixed(1) ?? "—"} icon="star" />
          <StatCard label="Trips" value={String(profile.totalTrips ?? 0)} icon="navigation" />
          <StatCard
            label="Status"
            value={profile.isVerified ? "Verified" : "Pending"}
            icon={profile.isVerified ? "check-circle" : "clock"}
          />
        </View>
      )}

      {/* Profile form / display */}
      <View className="mt-6 bg-gray-50 rounded-2xl p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-semibold text-gray-900">
            {needsCreation ? "Create Profile" : "Profile Details"}
          </Text>
          {!needsCreation && !editing && (
            <Pressable onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={18} color="#16A34A" />
            </Pressable>
          )}
        </View>

        {editing || needsCreation ? (
          <View className="gap-3">
            <TextField
              label="License Number *"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="DL-0123456789"
              autoCapitalize="characters"
            />
            <TextField
              label="Blood Group"
              value={bloodGroup}
              onChangeText={setBloodGroup}
              placeholder="e.g. O+"
            />
            <TextField
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
            />
            <TextField
              label="Languages"
              value={languages}
              onChangeText={setLanguages}
              placeholder="English, Hindi, Malayalam"
            />
            <TextField
              label="Years of Experience"
              value={experienceYears}
              onChangeText={setExperienceYears}
              placeholder="e.g. 5"
              keyboardType="number-pad"
            />
            <View className="flex-row gap-3 mt-2">
              {!needsCreation && (
                <Button
                  variant="secondary"
                  onPress={() => {
                    setEditing(false);
                    populateForm(profile);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                onPress={handleSave}
                loading={saving}
                className="flex-1"
              >
                {needsCreation ? "Create Profile" : "Save"}
              </Button>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            <ProfileRow icon="credit-card" label="License" value={profile?.licenseNumber} />
            <ProfileRow icon="droplet" label="Blood" value={profile?.bloodGroup} />
            <ProfileRow icon="calendar" label="DOB" value={profile?.dob} />
            <ProfileRow icon="globe" label="Langs" value={profile?.languages?.join(", ")} />
            <ProfileRow icon="clock" label="Exp" value={profile?.experienceYears ? `${profile.experienceYears} yrs` : undefined} />
          </View>
        )}
      </View>

      {/* Vehicle management link */}
      {profile && (
        <Pressable
          onPress={() => router.push("/driver/vehicles")}
          className="flex-row items-center justify-between mt-5 bg-gray-50 rounded-2xl p-5"
        >
          <View className="flex-row items-center">
            <Feather name="truck" size={20} color="#16A34A" />
            <Text className="ml-3 text-base font-medium text-gray-900">
              My Vehicles
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </Pressable>
      )}

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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
      <Feather name={icon} size={18} color="#16A34A" />
      <Text className="text-lg font-bold text-gray-900 mt-1">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}
