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

import { router } from "expo-router";

import {
  type AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { createUser } from "@/lib/db/users";
import { auth } from "@/lib/firebase";

type AuthMode = "login" | "signup";

function getFirebaseErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/email-already-in-use":
      return "Email already registered";
    case "auth/weak-password":
      return "Password must be at least 6 characters";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    case "auth/network-request-failed":
      return "Network error. Please check your connection";
    default:
      return error.message || "Authentication failed";
  }
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

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await createUser(user.uid, {
          email: user.email || email.trim(),
          displayName: null,
          photoURL: null,
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setShowLoginModal(false);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        setError(getFirebaseErrorMessage(err as AuthError));
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    setMode("login");
    setEmail("");
    setPassword("");
    setError(null);
    setShowLoginModal(true);
  };

  const handleAppleSignUp = () => {
    console.log("[Auth] Apple sign-in pressed - not yet implemented");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mainContent}>
        <RotatingLogo size={70} />

        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Join Trailblazer+</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Create an account to track progress, enter the challenge, and access member benefits.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.outlineButton, { borderColor: colors.cardBorder }]}
            onPress={openLoginModal}
          >
            <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>Login</Text>
          </Pressable>

          <Pressable
            style={[styles.outlineButton, { borderColor: colors.cardBorder }]}
            onPress={handleAppleSignUp}
          >
            <Text style={[styles.appleIcon, { color: colors.textPrimary }]}></Text>
            <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>
              Sign up with Apple
            </Text>
          </Pressable>
        </View>
      </View>

      <Text
        style={[
          styles.terms,
          { color: colors.textTertiary, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        Terms & Conditions Apply
      </Text>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["2xl"],
    maxWidth: 340,
  },
  textContent: {
    alignItems: "center",
    gap: Spacing.md,
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
  buttons: {
    width: "100%",
    gap: Spacing.md,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
});
