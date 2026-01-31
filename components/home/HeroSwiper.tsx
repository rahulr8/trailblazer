import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  type ViewToken,
  type ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RefreshCw } from "lucide-react-native";

import { MOCK_HERO_CARDS } from "@/lib/mock";
import { useTheme } from "@/contexts/theme-context";
import type { MockHeroCard } from "@/lib/mock/types";

const GAP = 12;
const CARD_WIDTH = Dimensions.get("window").width - 32;

interface HeroSwiperProps {
  onRefreshMotivation?: () => void;
  motivationText?: string;
}

export function HeroSwiper({
  onRefreshMotivation,
  motivationText,
}: HeroSwiperProps) {
  const { colors, shadows, gradients } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<MockHeroCard>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<MockHeroCard> | null | undefined, index: number) => ({
      length: CARD_WIDTH + GAP,
      offset: (CARD_WIDTH + GAP) * index,
      index,
    }),
    []
  );

  const renderCard = useCallback(
    ({ item }: { item: MockHeroCard }) => {
      if (item.type === "motivation") {
        return (
          <View
            style={{
              width: CARD_WIDTH,
              marginRight: GAP,
              borderRadius: 16,
              overflow: "hidden",
              ...shadows.md,
            }}
          >
            <LinearGradient
              colors={gradients.accent.colors as readonly [ColorValue, ColorValue, ...ColorValue[]]}
              start={gradients.accent.start}
              end={gradients.accent.end}
              style={{
                padding: 24,
                minHeight: 180,
                justifyContent: "space-between",
              }}
            >
              <View style={{ alignItems: "flex-end" }}>
                <Pressable
                  onPress={onRefreshMotivation}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <RefreshCw size={20} color="white" opacity={0.8} />
                </Pressable>
              </View>

              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "600",
                  lineHeight: 28,
                }}
              >
                {motivationText ?? item.motivationText}
              </Text>
            </LinearGradient>
          </View>
        );
      }

      if (item.type === "counter" && item.minutesActive != null) {
        const hours = Math.floor(item.minutesActive / 60);
        const minutes = item.minutesActive % 60;
        const formattedTime = `${hours}h ${minutes.toString().padStart(2, "0")}m`;

        return (
          <View
            style={{
              width: CARD_WIDTH,
              marginRight: GAP,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              padding: 24,
              minHeight: 180,
              justifyContent: "center",
              alignItems: "center",
              ...shadows.md,
            }}
          >
            <Text
              style={{
                fontSize: 40,
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              {formattedTime}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 8,
              }}
            >
              Minutes Active
            </Text>
          </View>
        );
      }

      return null;
    },
    [
      colors,
      shadows,
      gradients,
      motivationText,
      onRefreshMotivation,
    ]
  );

  return (
    <View>
      <FlatList
        data={MOCK_HERO_CARDS}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginTop: 12,
        }}
      >
        {MOCK_HERO_CARDS.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentIndex ? colors.accent : colors.textTertiary,
            }}
          />
        ))}
      </View>
    </View>
  );
}
