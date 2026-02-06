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

import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

const ONBOARDING_KEY = "@trailblazer_onboarding_seen";
const PERMISSIONS_KEY = "@trailblazer_permissions_complete";

function RootLayoutNav() {
  const { isDark, colors } = useTheme();
  const { user, isLoading } = useAuth();
  const hasNavigated = useRef(false);
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  const hasSeenOnboarding = useRef(false);
  const hasCompletedPermissions = useRef(false);

  useEffect(() => {
    async function loadFlags() {
      try {
        const [onboarding, permissions] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(PERMISSIONS_KEY),
        ]);
        hasSeenOnboarding.current = onboarding === "true";
        hasCompletedPermissions.current = permissions === "true";
      } catch {
        // Defaults are false
      } finally {
        setFlagsLoaded(true);
      }
    }
    loadFlags();
  }, []);

  useEffect(() => {
    if (isLoading || !flagsLoaded) return;

    if (!hasNavigated.current) {
      hasNavigated.current = true;

      if (!hasSeenOnboarding.current) {
        AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
        hasSeenOnboarding.current = true;
        router.replace("/onboarding");
      } else if (user && !hasCompletedPermissions.current) {
        router.replace("/permissions");
      } else if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, user, flagsLoaded]);

  useEffect(() => {
    if (isLoading || !hasNavigated.current || !flagsLoaded) return;

    if (user && !hasCompletedPermissions.current) {
      router.replace("/permissions");
    } else if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  }, [user]);

  if (isLoading || !flagsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="onboarding" options={{ animation: "none" }} />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="permissions" options={{ animation: "fade" }} />
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
