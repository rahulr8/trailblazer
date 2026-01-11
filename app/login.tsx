import { useState } from "react";

import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Stack, router } from "expo-router";

import { Button } from "heroui-native";

import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SocialAuthButtons } from "@/components/SocialAuthButtons";
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
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
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
        console.log("[Auth] Creating Firebase user...");
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        console.log("[Auth] Firebase user created:", user.uid);
        await createUser(user.uid, {
          email: user.email || email.trim(),
          displayName: null,
          photoURL: null,
        });
        console.log("[Auth] Firestore user document created");
      } else {
        console.log("[Auth] Signing in...");
        await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log("[Auth] Sign in successful");
      }
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[Auth] Error:", err);
      if (err && typeof err === "object" && "code" in err) {
        setError(getFirebaseErrorMessage(err as AuthError));
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  const title = mode === "login" ? "Welcome Back" : "Create Account";
  const subtitle =
    mode === "login" ? "Sign in to continue your adventure" : "Join the BC Parks community";
  const submitText = mode === "login" ? "Sign In" : "Create Account";
  const togglePrompt = mode === "login" ? "Don't have an account?" : "Already have an account?";
  const toggleAction = mode === "login" ? "Sign Up" : "Sign In";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + Spacing.xl },
        ]}
      >
        <View style={styles.brandingContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>Trailblazer</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your outdoor adventure companion
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.cardBackground }, shadows.lg]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>

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
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
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

          {mode === "login" && (
            <Pressable style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </Pressable>
          )}

          <Button onPress={handleAuth} isDisabled={loading} style={styles.submitButton}>
            {loading ? <ActivityIndicator size="small" color="#000" /> : submitText}
          </Button>

          <SocialAuthButtons mode={mode} />
        </View>

        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>{togglePrompt}</Text>
          <Pressable onPress={toggleMode}>
            <Text style={[styles.toggleLink, { color: colors.primary }]}>{toggleAction}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  brandingContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  formCard: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.md,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: Spacing.xl,
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
