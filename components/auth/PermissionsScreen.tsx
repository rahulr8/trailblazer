import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

async function requestHealthPermission(): Promise<void> {
  try {
    const { requestAuthorization } = await import("@kingstinct/react-native-healthkit");
    await requestAuthorization({
      toRead: ["HKQuantityTypeIdentifierActiveEnergyBurned" as const],
    });
  } catch {
    console.log("[Permissions] HealthKit request failed or unavailable");
  }
}

export default function PermissionsScreen({ onComplete }: { onComplete?: () => void } = {}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleAccept = async () => {
    await requestHealthPermission();
    onComplete?.();
  };

  const handleDecline = () => {
    Alert.alert(
      "Missing Out",
      "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?",
      [
        { text: "Go Back", style: "cancel" },
        { text: "Continue Anyway", style: "destructive", onPress: () => onComplete?.() },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <View style={styles.content}>
          <RotatingLogo size={80} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Track automatically?</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Giving permission to use your existing health integrations will make tracking a breeze.
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
            No, don't use my health data
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
