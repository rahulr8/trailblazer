import { Text, View } from "react-native";

import { Flame, Leaf } from "lucide-react-native";

import { useTheme } from "@/contexts/theme-context";
import { MOCK_STATS } from "@/lib/mock";

import { FlipCard } from "./FlipCard";

export function StreakFlipCard() {
  const { colors } = useTheme();

  const front = (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Flame size={28} color={colors.highlight} />
      <Text
        style={{
          fontSize: 32,
          fontWeight: "800",
          color: colors.textPrimary,
        }}
      >
        {MOCK_STATS.currentStreak}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        Days Active
      </Text>
    </View>
  );

  const back = (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        Personal Best
      </Text>
      <Text
        style={{
          fontSize: 36,
          fontWeight: "800",
          color: colors.highlight,
        }}
      >
        {MOCK_STATS.longestStreak}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        day streak
      </Text>
    </View>
  );

  return <FlipCard front={front} back={back} height={140} duration={400} />;
}

export function NatureScoreFlipCard() {
  const { colors } = useTheme();

  const natureScore = Math.round(MOCK_STATS.totalMinutes * 0.05);

  const front = (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Leaf size={28} color={colors.accent} />
      <Text
        style={{
          fontSize: 32,
          fontWeight: "800",
          color: colors.textPrimary,
        }}
      >
        {natureScore}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        Room to Improve
      </Text>
    </View>
  );

  const back = (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        Nature Score
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          textAlign: "center",
          paddingHorizontal: 12,
        }}
      >
        Based on {MOCK_STATS.totalMinutes} minutes of outdoor activity across{" "}
        {MOCK_STATS.totalActivities} sessions
      </Text>
    </View>
  );

  return <FlipCard front={front} back={back} height={140} duration={400} />;
}
