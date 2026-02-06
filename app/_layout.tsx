import { useEffect, useRef, useState } from "react";

import { ActivityIndicator, StyleSheet, View } from "react-native";

import { router, Stack } from "expo-router";
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
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

import LoginScreen from "@/components/auth/LoginScreen";
import OnboardingScreen from "@/components/auth/OnboardingScreen";
import PermissionsScreen from "@/components/auth/PermissionsScreen";

import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

const ONBOARDING_KEY = "@trailblazer_onboarding_seen";
const PERMISSIONS_KEY = "@trailblazer_permissions_complete";

function RootLayoutNav() {
  const { isDark, colors } = useTheme();
  const { user, isLoading } = useAuth();
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasCompletedPermissions, setHasCompletedPermissions] = useState(false);

  useEffect(() => {
    async function loadFlags() {
      try {
        const [onboarding, permissions] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(PERMISSIONS_KEY),
        ]);
        setHasSeenOnboarding(onboarding === "true");
        setHasCompletedPermissions(permissions === "true");
      } catch {
        // Defaults are false
      } finally {
        setFlagsLoaded(true);
      }
    }
    loadFlags();
  }, []);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
    setHasSeenOnboarding(true);
  };

  const handlePermissionsComplete = () => {
    AsyncStorage.setItem(PERMISSIONS_KEY, "true").catch(() => {});
    setHasCompletedPermissions(true);
  };

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

  if (!hasCompletedPermissions) {
    return (
      <>
        <PermissionsScreen onComplete={handlePermissionsComplete} />
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
            <BottomSheetModalProvider>
              <RootLayoutNav />
            </BottomSheetModalProvider>
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
