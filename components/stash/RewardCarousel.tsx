import { useCallback, useRef, useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";

import { RewardCard } from "./RewardCard";
import type { MockReward } from "@/lib/mock";
import { useTheme } from "@/contexts/theme-context";

interface RewardCarouselProps {
  rewards: MockReward[];
  onRewardPress: (reward: MockReward) => void;
}

export function RewardCarousel({ rewards, onRewardPress }: RewardCarouselProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const CARD_WIDTH = width - 32;

  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  return (
    <View>
      <FlatList
        data={rewards}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        pagingEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH, paddingRight: 0 }}>
            <RewardCard reward={item} onPress={onRewardPress} variant="carousel" />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View className="flex-row justify-center gap-2 mt-4">
        {rewards.map((_, index) => (
          <View
            key={index}
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: index === activeIndex ? colors.primary : colors.cardBorder,
            }}
          />
        ))}
      </View>
    </View>
  );
}
