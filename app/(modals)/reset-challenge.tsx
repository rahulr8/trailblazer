import { Pressable, StyleSheet, Text, View } from "react-native";

import { BlurView } from "expo-blur";
import { router } from "expo-router";

import { AlertTriangle, X } from "lucide-react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

export default function ResetChallengeModal() {
  const { colors, shadows, isDark } = useTheme();

  const handleDismiss = () => router.back();

  const handleReset = () => {
    // Reset logic here
    router.back();
  };

  return (
    <Pressable style={styles.backdrop} onPress={handleDismiss}>
      <BlurView intensity={isDark ? 40 : 20} tint={isDark ? "dark" : "light"} style={styles.blur}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.cardBorder },
            shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
            onPress={handleDismiss}
          >
            <X size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.iconContainer, { backgroundColor: colors.danger + "20" }]}>
            <AlertTriangle size={32} color={colors.danger} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Challenge?</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            This will reset your 60-day challenge progress. Your activity history will be preserved,
            but your current streak and day count will start over.
          </Text>

          <View style={styles.buttons}>
            <Pressable
              style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
              onPress={handleDismiss}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.resetButton, { backgroundColor: colors.primary }]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          </View>
        </Pressable>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  blur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    padding: Spacing["2xl"],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  resetButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
