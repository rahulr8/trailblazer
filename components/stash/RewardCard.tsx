import { Pressable, View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/contexts/theme-context";
import type { MockReward } from "@/lib/mock";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RewardCardProps {
  reward: MockReward;
  onPress: (reward: MockReward) => void;
  variant: "carousel" | "grid";
}

export function RewardCard({ reward, onPress, variant }: RewardCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  if (variant === "carousel") {
    return (
      <AnimatedPressable
        onPress={() => onPress(reward)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        <View className="rounded-2xl overflow-hidden" style={{ aspectRatio: 16 / 10 }}>
          <Image
            source={{ uri: reward.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"] as const}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
            }}
          />
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <Text
              className="text-sm font-medium mb-1"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {reward.vendor}
            </Text>
            <Text className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
              {reward.title}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={() => onPress(reward)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View className="rounded-2xl overflow-hidden" style={{ height: 200 }}>
        <Image
          source={{ uri: reward.imageUrl }}
          style={{ width: "100%", height: 120 }}
          contentFit="cover"
        />
        <View className="p-3" style={{ backgroundColor: colors.cardBackground }}>
          <Text
            className="text-xs font-medium mb-1"
            style={{ color: colors.textSecondary }}
          >
            {reward.vendor}
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary }}
            numberOfLines={2}
          >
            {reward.title}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
