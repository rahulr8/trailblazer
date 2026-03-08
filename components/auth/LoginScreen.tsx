import { useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { CheckCircle, Eye, EyeOff, Lock, Mail, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "signup";

function getSupabaseErrorMessage(message: string): string {
  if (message.includes("Invalid login credentials")) return "Invalid email or password";
  if (message.includes("User already registered")) return "Email already registered";
  if (message.includes("Password should be at least")) return "Password must be at least 6 characters";
  if (message.includes("Unable to validate email")) return "Invalid email address";
  if (message.includes("Email rate limit exceeded")) return "Too many attempts. Please try again later";
  return message || "Authentication failed";
}

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        setSignupComplete(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        setShowLoginModal(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(getSupabaseErrorMessage(message));
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    setMode("login");
    setEmail("");
    setPassword("");
    setError(null);
    setSignupComplete(false);
    setShowLoginModal(true);
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError("Apple Sign In failed — no identity token");
        return;
      }

      const { data: signInData, error: appleError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (appleError) throw appleError;

      if (credential.fullName?.givenName && signInData.user) {
        const displayName = [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(" ");
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", signInData.user.id);
        await supabase.auth.updateUser({
          data: { display_name: displayName },
        });
      }
    } catch (err) {
      if (err instanceof Error && "code" in err && (err as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      const message = err instanceof Error ? err.message : "Apple Sign In failed";
      setError(getSupabaseErrorMessage(message));
    }
  };

  const handleTermsPress = async () => {
    await WebBrowser.openBrowserAsync("https://trailblazer.com/terms", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.centerContent}>
        <RotatingLogo size={70} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Join Trailblazer+</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Create an account to track progress, enter the challenge, and access member benefits.
        </Text>

        <Pressable
          style={[styles.outlineButton, { borderColor: colors.cardBorder }]}
          onPress={openLoginModal}
        >
          <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>Login</Text>
        </Pressable>

        <Pressable
          style={[styles.outlineButton, { borderColor: colors.cardBorder }]}
          onPress={handleAppleSignIn}
        >
          <Text style={[styles.appleIcon, { color: colors.textPrimary }]}></Text>
          <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>
            Sign up with Apple
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleTermsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.terms, { color: colors.primary }]}>Terms & Conditions Apply</Text>
      </Pressable>

      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalHeader, { paddingTop: Spacing.lg }]}>
            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
              onPress={() => setShowLoginModal(false)}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {signupComplete ? (
              <View style={styles.confirmationContainer}>
                <View
                  style={[
                    styles.confirmationIconCircle,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <CheckCircle size={40} color={colors.primary} />
                </View>
                <Text style={[styles.confirmationTitle, { color: colors.textPrimary }]}>
                  Check your email
                </Text>
                <Text style={[styles.confirmationBody, { color: colors.textSecondary }]}>
                  We sent a confirmation link to
                </Text>
                <Text style={[styles.confirmationEmail, { color: colors.textPrimary }]}>
                  {email.trim()}
                </Text>
                <View
                  style={[
                    styles.confirmationDivider,
                    { backgroundColor: colors.cardBorder },
                  ]}
                />
                <Text style={[styles.confirmationHint, { color: colors.textSecondary }]}>
                  Tap the link in the email to verify your account, then come back here to sign in.
                </Text>
                <Pressable
                  style={[styles.confirmationButton, { backgroundColor: colors.textPrimary }]}
                  onPress={() => {
                    setSignupComplete(false);
                    setMode("login");
                    setPassword("");
                    setError(null);
                  }}
                >
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>
                    Back to Sign In
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowLoginModal(false)}
                  style={styles.confirmationDismiss}
                >
                  <Text style={[styles.toggleLink, { color: colors.textSecondary }]}>
                    Close
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {mode === "login"
                    ? "Sign in to continue your adventure"
                    : "Join the BC Parks community"}
                </Text>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email address"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.textInput, { color: colors.textPrimary }]}
                    />
                  </View>

                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={[styles.textInput, { color: colors.textPrimary }]}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                </View>

                {error && (
                  <View style={[styles.errorContainer, { backgroundColor: colors.danger + "15" }]}>
                    <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                  </View>
                )}

                <Pressable
                  style={[styles.submitButton, { backgroundColor: colors.textPrimary }]}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={[styles.submitButtonText, { color: colors.background }]}>
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Text>
                  )}
                </Pressable>

                <View style={styles.toggleContainer}>
                  <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setError(null);
                    }}
                  >
                    <Text style={[styles.toggleLink, { color: colors.primary }]}>
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
    marginTop: Spacing.md,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing.sm,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appleIcon: {
    fontSize: 20,
    marginTop: -2,
  },
  terms: {
    fontSize: 13,
    textAlign: "center",
    paddingBottom: Spacing.xl,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["5xl"],
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  toggleText: {
    fontSize: 15,
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmationContainer: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
  },
  confirmationIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  confirmationBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  confirmationEmail: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  confirmationDivider: {
    width: 40,
    height: 1,
    marginVertical: Spacing.xl,
  },
  confirmationHint: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  confirmationButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: Spacing["2xl"],
  },
  confirmationDismiss: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
});
