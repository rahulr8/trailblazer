import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { updateDisplayName } from "@/lib/db";

interface NameScreenProps {
  onComplete: () => void;
}

export default function NameScreen({ onComplete }: NameScreenProps) {
  const { colors } = useTheme();
  const { uid } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const canSubmit = name.trim().length >= 2;

  const handleContinue = async () => {
    if (!canSubmit || !uid) return;

    setLoading(true);
    try {
      await updateDisplayName(uid, name.trim());
      onComplete();
    } catch (error) {
      console.error("[NameScreen] Failed to save name:", error);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.page}>
        <View style={styles.content}>
          {!keyboardVisible && <RotatingLogo size={80} />}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            What should we call you?
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            This is how you'll appear in the app and on leaderboards.
          </Text>

          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
            ]}
          >
            <TextInput
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>

          <Pressable
            style={[
              styles.continueButton,
              { backgroundColor: canSubmit ? colors.textPrimary : colors.textTertiary },
            ]}
            onPress={handleContinue}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.continueButtonText, { color: colors.background }]}>
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {!keyboardVisible && <View style={{ height: insets.bottom + Spacing.xl }} />}
    </KeyboardAvoidingView>
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
    width: "100%",
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
  inputWrapper: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 18,
    textAlign: "center",
    height: "100%",
  },
  continueButton: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
