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

import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RotatingLogo } from "@/components/onboarding/RotatingLogo";
import { Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WelcomePage {
  id: string;
  title: string;
  body: string;
}

const PAGES: WelcomePage[] = [
  {
    id: "welcome-1",
    title: "Get rewarded for\ntime in nature.",
    body: "Trailblazer+ turns time spent in nature into progress, rewards, and real support for parks. Show up daily. The rest adds up.",
  },
  {
    id: "welcome-2",
    title: "Where does the\nmoney go?",
    body: "Membership dollars flow back into outdoor recreation and parks across BC. Participation supports the places, trails, and parks you use.",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<WelcomePage>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<WelcomePage>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleArrowPress = () => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace("/login");
    }
  };

  const renderPage = useCallback(
    ({ item }: { item: WelcomePage }) => (
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
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
          style={[styles.arrowButton, { borderColor: colors.cardBorder }]}
          onPress={handleArrowPress}
        >
          <ArrowRight size={24} color={colors.textPrimary} />
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
    gap: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
