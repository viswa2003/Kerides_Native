import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import {
  createVehicle,
  deactivateVehicle,
  getMyVehicles,
  updateVehicle,
  type CreateVehicleRequest,
  type Vehicle,
} from "../../src/api/vehicles";
import Button from "../../src/components/ui/Button";
import TextField from "../../src/components/ui/TextField";

const VEHICLE_TYPES = ["auto", "bike", "hatchback", "sedan", "suv"] as const;

export default function VehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await getMyVehicles();
      setVehicles(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDeactivate = (vehicle: Vehicle) => {
    Alert.alert(
      "Deactivate Vehicle",
      `Deactivate ${vehicle.make} ${vehicle.vehicleModel}?`,
      [
        { text: "Cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivateVehicle(vehicle._id);
              fetchVehicles();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 flex-row items-center border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 p-1"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">My Vehicles</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setEditingVehicle(null);
            setShowForm(true);
          }}
          className="bg-green-600 rounded-full p-2"
        >
          <Feather name="plus" size={20} color="white" />
        </Pressable>
      </View>

      {vehicles.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="truck" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-400 mt-4">
            No vehicles added
          </Text>
          <Text className="text-sm text-gray-400 mt-1 text-center">
            Add a vehicle to start accepting rides.
          </Text>
          <View className="mt-4">
            <Button
              onPress={() => {
                setEditingVehicle(null);
                setShowForm(true);
              }}
            >
              Add Vehicle
            </Button>
          </View>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchVehicles();
              }}
            />
          }
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onEdit={() => {
                setEditingVehicle(item);
                setShowForm(true);
              }}
              onDeactivate={() => handleDeactivate(item)}
            />
          )}
        />
      )}

      <VehicleFormModal
        visible={showForm}
        vehicle={editingVehicle}
        onClose={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingVehicle(null);
          fetchVehicles();
        }}
      />
    </View>
  );
}

function VehicleCard({
  vehicle,
  onEdit,
  onDeactivate,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <View
      className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Feather name="truck" size={18} color="#16A34A" />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            {vehicle.make} {vehicle.vehicleModel}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-full ${vehicle.isActive !== false ? "bg-green-100" : "bg-gray-100"}`}
        >
          <Text
            className={`text-xs font-medium ${vehicle.isActive !== false ? "text-green-700" : "text-gray-500"}`}
          >
            {vehicle.isActive !== false ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View className="gap-1 mb-3">
        <DetailRow label="Reg #" value={vehicle.registrationNumber} />
        <DetailRow label="Type" value={vehicle.type} />
        {vehicle.color && <DetailRow label="Color" value={vehicle.color} />}
        {vehicle.year && <DetailRow label="Year" value={String(vehicle.year)} />}
        {vehicle.seatingCapacity && (
          <DetailRow label="Seats" value={String(vehicle.seatingCapacity)} />
        )}
      </View>

      <View className="flex-row gap-3">
        <Pressable onPress={onEdit} className="flex-row items-center">
          <Feather name="edit-2" size={14} color="#3B82F6" />
          <Text className="ml-1 text-sm text-blue-600 font-medium">Edit</Text>
        </Pressable>
        {vehicle.isActive !== false && (
          <Pressable onPress={onDeactivate} className="flex-row items-center">
            <Feather name="x-circle" size={14} color="#EF4444" />
            <Text className="ml-1 text-sm text-red-500 font-medium">
              Deactivate
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="text-xs text-gray-500 w-14">{label}</Text>
      <Text className="text-xs text-gray-800">{value}</Text>
    </View>
  );
}

function VehicleFormModal({
  visible,
  vehicle,
  onClose,
  onSaved,
}: {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!vehicle;

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [type, setType] = useState<string>(VEHICLE_TYPES[0]);
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [seats, setSeats] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.vehicleModel);
      setRegNumber(vehicle.registrationNumber);
      setType(vehicle.type);
      setColor(vehicle.color ?? "");
      setYear(vehicle.year?.toString() ?? "");
      setSeats(vehicle.seatingCapacity?.toString() ?? "");
    } else {
      setMake("");
      setModel("");
      setRegNumber("");
      setType(VEHICLE_TYPES[0]);
      setColor("");
      setYear("");
      setSeats("");
    }
  }, [vehicle, visible]);

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !regNumber.trim()) {
      Alert.alert("Required", "Make, model, and registration number are required.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateVehicleRequest = {
        make: make.trim(),
        vehicleModel: model.trim(),
        registrationNumber: regNumber.trim(),
        type,
        color: color.trim() || undefined,
        year: year ? Number(year) : undefined,
        seatingCapacity: seats ? Number(seats) : undefined,
      };

      if (isEditing) {
        await updateVehicle(vehicle._id, payload);
      } else {
        await createVehicle(payload);
      }
      onSaved();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10 max-h-[85%]">
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-gray-300 mb-3" />
            <Text className="text-lg font-bold text-gray-900">
              {isEditing ? "Edit Vehicle" : "Add Vehicle"}
            </Text>
          </View>

          <View className="gap-3">
            <TextField label="Make *" value={make} onChangeText={setMake} placeholder="e.g. Maruti" />
            <TextField label="Model *" value={model} onChangeText={setModel} placeholder="e.g. Swift" />
            <TextField
              label="Registration Number *"
              value={regNumber}
              onChangeText={setRegNumber}
              placeholder="KL-01-AB-1234"
              autoCapitalize="characters"
            />

            {/* Vehicle type picker */}
            <View>
              <Text className="mb-1 text-sm font-medium text-gray-700">Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {VEHICLE_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full border ${type === t ? "bg-green-600 border-green-600" : "border-gray-300"}`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${type === t ? "text-white" : "text-gray-700"}`}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextField label="Color" value={color} onChangeText={setColor} placeholder="e.g. White" />
            <TextField
              label="Year"
              value={year}
              onChangeText={setYear}
              placeholder="e.g. 2022"
              keyboardType="number-pad"
            />
            <TextField
              label="Seating Capacity"
              value={seats}
              onChangeText={setSeats}
              placeholder="e.g. 4"
              keyboardType="number-pad"
            />

            <View className="flex-row gap-3 mt-2">
              <Button variant="secondary" onPress={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onPress={handleSubmit} loading={saving} className="flex-1">
                {isEditing ? "Update" : "Add"}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
