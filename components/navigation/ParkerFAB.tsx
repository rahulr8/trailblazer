import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";

import { router } from "expo-router";

import { PawPrint } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/theme-context";

const FAB_SIZE = 56;
const FAB_MARGIN_RIGHT = 16;
const FAB_MARGIN_BOTTOM = 12;

export function ParkerFAB() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          bottom: insets.bottom + FAB_MARGIN_BOTTOM,
          right: FAB_MARGIN_RIGHT,
          backgroundColor: colors.accent,
        },
      ]}
    >
      <Pressable
        onPress={() => router.push("/chat")}
        style={styles.pressable}
        accessibilityLabel="Open Parker Chat"
        accessibilityRole="button"
      >
        <PawPrint size={28} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
