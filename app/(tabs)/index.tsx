import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useFocusEffect } from "expo-router";
import { useToast } from "heroui-native";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "@/components/navigation/TopBar";
import { HeroSwiper } from "@/components/home/HeroSwiper";
import { StreakFlipCard, NatureScoreFlipCard } from "@/components/home/StatsFlipCard";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { getActivityCount, getWeeklyActivityCount } from "@/lib/db/activities";
import { getUserStats } from "@/lib/db/profiles";
import { buildHomeActivityStats } from "@/lib/home/activity-stats";
import { MOCK_AFFIRMATIONS, MOCK_USER } from "@/lib/mock";

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { uid } = useAuth();
  const [affirmationIndex, setAffirmationIndex] = useState(
    () => Math.floor(Math.random() * MOCK_AFFIRMATIONS.length)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [homeStats, setHomeStats] = useState(() => buildHomeActivityStats({}));

  const loadHomeStats = useCallback(async () => {
    if (!uid) {
      return buildHomeActivityStats({});
    }

    const [userStats, totalActivities, weeklyActivities] = await Promise.all([
      getUserStats(uid),
      getActivityCount(uid),
      getWeeklyActivityCount(uid),
    ]);

    return buildHomeActivityStats({
      currentStreak: userStats?.currentStreak,
      totalActivities,
      totalMinutes: userStats?.totalMinutes,
      weeklyActivities,
    });
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadHomeStats()
        .then((stats) => {
          if (isActive) {
            setHomeStats(stats);
          }
        })
        .catch((error) => {
          console.error("[Home] Failed to load activity stats", error);
        });

      return () => {
        isActive = false;
      };
    }, [loadHomeStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setAffirmationIndex((prev) => (prev + 1) % MOCK_AFFIRMATIONS.length);
    try {
      setHomeStats(await loadHomeStats());
    } catch (error) {
      console.error("[Home] Failed to refresh activity stats", error);
      toast.show({
        label: "Refresh failed",
        description: "We couldn't load your latest activity stats right now.",
        placement: "top",
        variant: "default",
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadHomeStats, toast]);

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
          accessibilityLabel="Add Activity"
          accessibilityRole="button"
        >
          <Plus size={20} color={colors.accent} />
          <Text className="text-base font-semibold" style={{ color: colors.accent }}>
            Add Activity
          </Text>
        </Pressable>

        <View className="mt-4">
          <HeroSwiper
            minutesActive={homeStats.totalMinutes}
            motivationText={MOCK_AFFIRMATIONS[affirmationIndex]}
            onRefreshMotivation={onRefresh}
          />
        </View>

        <View className="flex-row gap-3 px-4 mt-4">
          <View className="flex-1">
            <StreakFlipCard
              currentStreak={homeStats.currentStreak}
              weeklyActivities={homeStats.weeklyActivities}
            />
          </View>
          <View className="flex-1">
            <NatureScoreFlipCard
              natureScore={homeStats.natureScore}
              totalActivities={homeStats.totalActivities}
              totalMinutes={homeStats.totalMinutes}
            />
          </View>
        </View>

        <View className="px-4 mt-6">
          <LeaderboardPreview />
        </View>
      </ScrollView>
    </View>
  );
}
