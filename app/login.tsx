import { useState } from "react";

import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  AuthError,
} from "firebase/auth";

import { Button } from "heroui-native";

import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/db/users";

type AuthMode = "login" | "signup";

interface IconProps {
  size?: number;
  color?: string;
}

function GoogleIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ size = 20, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

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
  const { colors, gradients, shadows } = useTheme();
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

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google Sign-In with Firebase
    // Uses @react-native-google-signin/google-signin + GoogleAuthProvider
    // 1. Configure GoogleSignin with webClientId from Firebase Console
    // 2. Call GoogleSignin.signIn() to get idToken
    // 3. Create credential with GoogleAuthProvider.credential(idToken)
    // 4. Call signInWithCredential(auth, credential)
    // 5. Create user document if new user
    // 6. Navigate to (tabs)
    console.log("[Auth] Google sign-in button pressed - integration pending");
    const _googleProvider = new GoogleAuthProvider();
  };

  const handleAppleSignIn = async () => {
    // TODO: Implement Apple Sign-In with Firebase
    // Uses expo-apple-authentication + OAuthProvider
    // 1. Call AppleAuthentication.signInAsync() to get credential
    // 2. Create OAuthProvider credential with identityToken and nonce
    // 3. Call signInWithCredential(auth, credential)
    // 4. Create user document if new user
    // 5. Navigate to (tabs)
    console.log("[Auth] Apple sign-in button pressed - integration pending");
    const _appleProvider = new OAuthProvider("apple.com");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={gradients.primary.colors as unknown as [string, string, ...string[]]}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.headerGradient}
        >
          <View style={[styles.headerContent, { paddingTop: insets.top + Spacing.xl }]}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Trailblazer+</Text>
              <Text style={styles.tagline}>Your outdoor adventure companion</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.formContainer, shadows.lg]}>
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
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
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>

            <Pressable
              style={[
                styles.socialButton,
                { backgroundColor: colors.glassBg, borderColor: colors.cardBorder },
              ]}
              onPress={handleGoogleSignIn}
            >
              <GoogleIcon size={20} />
              <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.socialButton,
                styles.appleButton,
              ]}
              onPress={handleAppleSignIn}
            >
              <AppleIcon size={20} color="#FFFFFF" />
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text style={[styles.toggleLink, { color: colors.primary }]}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 280,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: Spacing.xs,
  },
  formContainer: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: Spacing.xl,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  appleButtonText: {
    color: "#FFFFFF",
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
