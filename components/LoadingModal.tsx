import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

const CARD_BG_LIGHT = "#FFFFFF";
const CARD_BG_DARK = "#1C1C1E";

interface LoadingModalProps {
  visible: boolean;
  title: string;
  message?: string;
}

export function LoadingModal({ visible, title, message }: LoadingModalProps) {
  const { colors, isDark } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    const spinAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      spin.setValue(0);
      pulse.setValue(1);
    };
  }, [visible, spin, pulse]);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? CARD_BG_DARK : CARD_BG_LIGHT,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.spinnerRing,
              {
                borderColor: colors.primary + "30",
                borderTopColor: colors.primary,
                transform: [{ rotate: rotation }, { scale: pulse }],
              },
            ]}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 300,
    padding: Spacing.xl * 1.5,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.lg,
  },
  spinnerRing: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
