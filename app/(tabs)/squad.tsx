import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useToast } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "@/components/navigation/TopBar";
import { useTheme } from "@/contexts/theme-context";
import { MOCK_AFFIRMATIONS, MOCK_USER } from "@/lib/mock";

export default function SquadScreen() {
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

  const handleAddFriend = useCallback(() => {
    toast.show({
      label: "Coming Soon",
      description: "Friend invitations will be available soon!",
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

        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Your Squad
          </Text>
          <Pressable onPress={handleAddFriend}>
            <Text className="text-base font-semibold" style={{ color: colors.accent }}>
              Add Friend
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pt-2">
          <Text
            className="text-base"
            style={{ color: colors.textSecondary }}
          >
            Everything's better together.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
