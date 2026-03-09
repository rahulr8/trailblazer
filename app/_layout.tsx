import { useEffect, useRef, useState } from "react";

import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { HeroUINativeProvider } from "heroui-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

import LoginScreen from "@/components/auth/LoginScreen";
import NameScreen from "@/components/auth/NameScreen";
import NotificationPermissionScreen from "@/components/auth/NotificationPermissionScreen";
import OnboardingScreen from "@/components/auth/OnboardingScreen";
import PermissionsScreen from "@/components/auth/PermissionsScreen";
import { getUser } from "@/lib/db";

import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

const ONBOARDING_KEY = "@trailblazer_onboarding_seen";
const HEALTH_PERMISSION_KEY = "@trailblazer_health_permission_seen";
const PERMISSIONS_KEY = "@trailblazer_permissions_complete";

function RootLayoutNav() {
  const { isDark, colors } = useTheme();
  const { user, isLoading } = useAuth();
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSeenHealthPermission, setHasSeenHealthPermission] = useState(false);
  const [hasCompletedPermissions, setHasCompletedPermissions] = useState(false);
  const [hasDisplayName, setHasDisplayName] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadFlags() {
      try {
        const [onboarding, healthPermission, permissions] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(HEALTH_PERMISSION_KEY),
          AsyncStorage.getItem(PERMISSIONS_KEY),
        ]);
        setHasSeenOnboarding(onboarding === "true");
        // Auto-skip health permission on non-iOS (HealthKit unavailable)
        if (Platform.OS !== "ios" && healthPermission !== "true") {
          await AsyncStorage.setItem(HEALTH_PERMISSION_KEY, "true");
          setHasSeenHealthPermission(true);
        } else {
          setHasSeenHealthPermission(healthPermission === "true");
        }
        setHasCompletedPermissions(permissions === "true");
      } catch {
        // Defaults are false
      } finally {
        setFlagsLoaded(true);
      }
    }
    loadFlags();
  }, []);

  // Check if user already has a display name (e.g. from Apple Sign In)
  useEffect(() => {
    if (!user) {
      setHasDisplayName(null);
      return;
    }

    getUser(user.id).then((profile) => {
      setHasDisplayName(!!profile?.displayName);
    }).catch(() => {
      setHasDisplayName(false);
    });
  }, [user]);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
    setHasSeenOnboarding(true);
  };

  const handlePermissionsComplete = () => {
    AsyncStorage.setItem(PERMISSIONS_KEY, "true").catch(() => {});
    setHasCompletedPermissions(true);
  };

  // Reset onboarding/permissions when user signs out (not on initial load)
  const prevUser = useRef(user);
  useEffect(() => {
    if (prevUser.current && !user) {
      // User went from logged-in to logged-out = sign out
      setHasSeenOnboarding(false);
      setHasSeenHealthPermission(false);
      setHasCompletedPermissions(false);
      setHasDisplayName(null);
      AsyncStorage.multiRemove([ONBOARDING_KEY, HEALTH_PERMISSION_KEY, PERMISSIONS_KEY]).catch(() => {});
    }
    prevUser.current = user;
  }, [user]);

  if (isLoading || !flagsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth screens rendered OUTSIDE the Stack navigator to bypass Card clipping bug
  if (!hasSeenOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <StatusBar style="auto" />
      </>
    );
  }

  // Wait for profile check before showing name screen
  if (hasDisplayName === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasDisplayName) {
    return (
      <>
        <NameScreen onComplete={() => setHasDisplayName(true)} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (!hasSeenHealthPermission) {
    return (
      <>
        <PermissionsScreen onComplete={() => {
          AsyncStorage.setItem(HEALTH_PERMISSION_KEY, "true").catch(() => {});
          setHasSeenHealthPermission(true);
        }} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (!hasCompletedPermissions) {
    return (
      <>
        <NotificationPermissionScreen onComplete={handlePermissionsComplete} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <HeroUINativeProvider>
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <BottomSheetModalProvider>
                <RootLayoutNav />
              </BottomSheetModalProvider>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
