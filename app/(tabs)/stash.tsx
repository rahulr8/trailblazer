import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "@/components/navigation/TopBar";
import { useTheme } from "@/contexts/theme-context";
import { MOCK_AFFIRMATIONS, MOCK_USER } from "@/lib/mock";

export default function StashScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [affirmationIndex, setAffirmationIndex] = useState(
    () => Math.floor(Math.random() * MOCK_AFFIRMATIONS.length)
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAffirmationIndex((prev) => (prev + 1) % MOCK_AFFIRMATIONS.length);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TopBar
          affirmation={MOCK_AFFIRMATIONS[affirmationIndex]}
          avatarUrl={MOCK_USER.photoURL}
        />

        <View className="px-4 gap-4 pt-4">
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Your Stash
          </Text>
          <Text
            className="text-base"
            style={{ color: colors.textSecondary }}
          >
            Rewards and offers from our partners
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
