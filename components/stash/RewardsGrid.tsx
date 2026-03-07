import { View, useWindowDimensions } from "react-native";

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

  const rows: MockReward[][] = [];
  for (let i = 0; i < rewards.length; i += 2) {
    rows.push(rewards.slice(i, i + 2));
  }

  return (
    <View style={{ paddingHorizontal: PADDING }}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: "row",
            gap: GAP,
            marginBottom: 12,
          }}
        >
          {row.map((item) => (
            <View key={item.id} style={{ width: ITEM_WIDTH }}>
              <RewardCard reward={item} onPress={onRewardPress} variant="grid" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
