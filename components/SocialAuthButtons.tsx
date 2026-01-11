import { Pressable, StyleSheet, Text, View } from "react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

interface SocialAuthButtonsProps {
  mode: "login" | "signup";
}

function GoogleIcon() {
  return (
    <View style={styles.iconContainer}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.appleLogo, { color }]}></Text>
    </View>
  );
}

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const { colors } = useTheme();
  const actionText = mode === "login" ? "Continue" : "Sign up";

  const handleGooglePress = () => {
    // TODO: Implement Google Sign-In with Firebase
    console.log("[Auth] Google sign-in pressed - not yet implemented");
  };

  const handleApplePress = () => {
    // TODO: Implement Apple Sign-In with Firebase
    console.log("[Auth] Apple sign-in pressed - not yet implemented");
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
      </View>

      <Pressable
        style={[
          styles.socialButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.cardBorder,
          },
        ]}
        onPress={handleGooglePress}
      >
        <GoogleIcon />
        <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
          {actionText} with Google
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.socialButton,
          {
            backgroundColor: "#000000",
            borderColor: "#000000",
          },
        ]}
        onPress={handleApplePress}
      >
        <AppleIcon color="#FFFFFF" />
        <Text style={[styles.socialButtonText, { color: "#FFFFFF" }]}>
          {actionText} with Apple
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  appleLogo: {
    fontSize: 20,
    marginTop: -2,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
