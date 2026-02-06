import { useCallback, useRef, useState } from "react";

import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PERMISSIONS_COMPLETE_KEY = "@trailblazer_permissions_complete";

interface PermissionPage {
  id: string;
  title: string;
  body: string;
  acceptLabel: string;
  declineLabel: string;
}

const PAGES: PermissionPage[] = [
  {
    id: "health",
    title: "Track automatically?",
    body: "Giving permission to use your existing health integrations will make tracking a breeze.",
    acceptLabel: "Yes, I agree",
    declineLabel: "No, don't use my health data",
  },
  {
    id: "notifications",
    title: "Stay motivated.",
    body: "Giving permission to deliver notifications will help make sure you never miss a day!",
    acceptLabel: "Yes, I agree",
    declineLabel: "No, don't notify me",
  },
];

async function requestHealthPermission(): Promise<void> {
  try {
    const { requestAuthorization } = await import("@kingstinct/react-native-healthkit");
    await requestAuthorization({
      toRead: ["HKQuantityTypeIdentifierActiveEnergyBurned" as const],
    });
  } catch {
    console.log("[Permissions] HealthKit request failed or unavailable");
  }
}

async function requestNotificationPermission(): Promise<void> {
  try {
    const { Alert } = await import("react-native");
    Alert.alert(
      "Notifications",
      "Push notification support will be available in a future update.",
      [{ text: "OK" }]
    );
  } catch {
    console.log("[Permissions] Notification request failed");
  }
}

export default function PermissionsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<PermissionPage>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<PermissionPage>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const finishPermissions = async () => {
    await AsyncStorage.setItem(PERMISSIONS_COMPLETE_KEY, "true");
    router.replace("/(tabs)");
  };

  const advanceOrFinish = async () => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await finishPermissions();
    }
  };

  const handleAccept = async () => {
    const page = PAGES[currentIndex];
    if (page.id === "health") {
      await requestHealthPermission();
    } else if (page.id === "notifications") {
      await requestNotificationPermission();
    }
    await advanceOrFinish();
  };

  const handleDecline = async () => {
    await advanceOrFinish();
  };

  const renderPage = useCallback(
    ({ item }: { item: PermissionPage }) => (
      <View style={[styles.page, { width: SCREEN_WIDTH }]}>
        <View style={styles.content}>
          <RotatingLogo size={80} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
        </View>
      </View>
    ),
    [colors]
  );

  const currentPage = PAGES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dots}>
          {PAGES.map((page, index) => (
            <View
              key={page.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.textPrimary : colors.textTertiary,
                  opacity: index === currentIndex ? 1 : 0.4,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          style={[styles.acceptButton, { backgroundColor: colors.textPrimary }]}
          onPress={handleAccept}
        >
          <Text style={[styles.acceptButtonText, { color: colors.background }]}>
            {currentPage.acceptLabel}
          </Text>
        </Pressable>

        <Pressable onPress={handleDecline}>
          <Text style={[styles.declineText, { color: colors.textSecondary }]}>
            {currentPage.declineLabel}
          </Text>
        </Pressable>
      </View>
    </View>
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
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  acceptButton: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  declineText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: Spacing.sm,
  },
});
