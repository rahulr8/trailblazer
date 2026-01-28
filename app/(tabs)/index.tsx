import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useToast } from "heroui-native";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "@/components/navigation/TopBar";
import { HeroSwiper } from "@/components/home/HeroSwiper";
import { StreakFlipCard, NatureScoreFlipCard } from "@/components/home/StatsFlipCard";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { useTheme } from "@/contexts/theme-context";
import { MOCK_AFFIRMATIONS, MOCK_USER } from "@/lib/mock";

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [affirmationIndex, setAffirmationIndex] = useState(
    () => Math.floor(Math.random() * MOCK_AFFIRMATIONS.length)
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAffirmationIndex((prev) => (prev + 1) % MOCK_AFFIRMATIONS.length);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleAddActivity = useCallback(() => {
    toast.show({
      label: "Coming Soon",
      description: "Activity logging will be available in a future update!",
      variant: "default",
      placement: "top",
    });
  }, [toast]);

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

        <Pressable
          className="mx-4 mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: `${colors.accent}15` }}
          onPress={handleAddActivity}
        >
          <Plus size={20} color={colors.accent} />
          <Text className="text-base font-semibold" style={{ color: colors.accent }}>
            Add Activity
          </Text>
        </Pressable>

        <View className="mt-4">
          <HeroSwiper
            onRefreshMotivation={onRefresh}
            motivationText={MOCK_AFFIRMATIONS[affirmationIndex]}
          />
        </View>

        <View className="flex-row gap-3 px-4 mt-4">
          <View className="flex-1">
            <StreakFlipCard />
          </View>
          <View className="flex-1">
            <NatureScoreFlipCard />
          </View>
        </View>

        <View className="px-4 mt-6">
          <LeaderboardPreview />
        </View>
      </ScrollView>
    </View>
  );
}
