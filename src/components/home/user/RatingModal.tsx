import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../../ui/Button";

type Props = {
  visible: boolean;
  onSubmit: (rating: number, review?: string) => void;
  onClose: () => void;
};

export default function RatingModal({ visible, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(rating, review.trim() || undefined);
    setSubmitting(false);
    setRating(0);
    setReview("");
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
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <View className="items-center mb-6">
            <View className="w-10 h-1 rounded-full bg-gray-300 mb-4" />
            <Text className="text-xl font-bold text-gray-900">
              Rate your ride
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              How was your experience?
            </Text>
          </View>

          {/* Stars */}
          <View className="flex-row justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={8}
              >
                <Feather
                  name="star"
                  size={36}
                  color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                />
              </Pressable>
            ))}
          </View>

          {/* Review */}
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
            placeholder="Leave a review (optional)"
            placeholderTextColor="#9CA3AF"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View className="gap-3">
            <Button
              onPress={handleSubmit}
              disabled={rating === 0}
              loading={submitting}
            >
              Submit Rating
            </Button>
            <Button variant="ghost" onPress={onClose}>
              Skip
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
