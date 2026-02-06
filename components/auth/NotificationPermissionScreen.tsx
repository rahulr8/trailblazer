import { Pressable, StyleSheet, Text, View } from "react-native";

import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

export default function NotificationPermissionScreen({ onComplete }: { onComplete?: () => void } = {}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleAccept = async () => {
    try {
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    } catch (error) {
      // Fails gracefully on simulator or if permission already granted
      console.log("[Permissions] Notification request failed or unavailable:", error);
    }
    onComplete?.();
  };

  const handleDecline = () => {
    onComplete?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <View style={styles.content}>
          <RotatingLogo size={80} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Stay motivated.</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Giving permission to deliver notifications will help make sure you never miss a day!
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={[styles.acceptButton, { backgroundColor: colors.textPrimary }]}
          onPress={handleAccept}
        >
          <Text style={[styles.acceptButtonText, { color: colors.background }]}>Yes, I agree</Text>
        </Pressable>

        <Pressable onPress={handleDecline}>
          <Text style={[styles.declineText, { color: colors.textSecondary }]}>
            No, don't notify me
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  content: {
    alignItems: "center",
    gap: Spacing.xl,
    maxWidth: 340,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
  },
  acceptButton: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  declineText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: Spacing.sm,
  },
});
