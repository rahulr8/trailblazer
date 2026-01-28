import { Pressable, View } from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/contexts/theme-context";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  height?: number;
  duration?: number;
}

export function FlipCard({ front, back, height = 140, duration = 400 }: FlipCardProps) {
  const { colors, shadows } = useTheme();
  const isFlipped = useSharedValue(0);

  const handlePress = () => {
    isFlipped.value = withTiming(isFlipped.value === 0 ? 1 : 0, { duration });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);

    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [180, 360]);

    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  return (
    <Pressable onPress={handlePress}>
      <View style={{ position: "relative", height }}>
        <Animated.View
          style={[
            {
              flex: 1,
              borderRadius: 16,
              padding: 16,
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              overflow: "hidden",
              ...shadows.md,
            },
            frontAnimatedStyle,
          ]}
        >
          {front}
        </Animated.View>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
              padding: 16,
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              overflow: "hidden",
              ...shadows.md,
            },
            backAnimatedStyle,
          ]}
        >
          {back}
        </Animated.View>
      </View>
    </Pressable>
  );
}
