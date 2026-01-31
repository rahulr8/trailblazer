import { FlatList, View, useWindowDimensions } from "react-native";

import { RewardCard } from "./RewardCard";
import type { MockReward } from "@/lib/mock";

interface RewardsGridProps {
  rewards: MockReward[];
  onRewardPress: (reward: MockReward) => void;
}

export function RewardsGrid({ rewards, onRewardPress }: RewardsGridProps) {
  const { width } = useWindowDimensions();
  const PADDING = 16;
  const GAP = 12;
  const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

  return (
    <FlatList
      data={rewards}
      numColumns={2}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{
        gap: GAP,
        paddingHorizontal: PADDING,
        marginBottom: 12,
      }}
      renderItem={({ item }) => (
        <View style={{ width: ITEM_WIDTH }}>
          <RewardCard reward={item} onPress={onRewardPress} variant="grid" />
        </View>
      )}
    />
  );
}
