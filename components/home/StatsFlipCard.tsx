import { Text, View } from "react-native";

import { Flame, Leaf } from "lucide-react-native";

import { useTheme } from "@/contexts/theme-context";

import { FlipCard } from "./FlipCard";

interface StreakFlipCardProps {
  currentStreak: number;
  weeklyActivities: number;
}

interface NatureScoreFlipCardProps {
  natureScore: number;
  totalActivities: number;
  totalMinutes: number;
}

export function StreakFlipCard({
  currentStreak,
  weeklyActivities,
}: StreakFlipCardProps) {
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
        {currentStreak}
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
        This Week
      </Text>
      <Text
        style={{
          fontSize: 36,
          fontWeight: "800",
          color: colors.highlight,
        }}
      >
        {weeklyActivities}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
        }}
      >
        {weeklyActivities === 1 ? "activity logged" : "activities logged"}
      </Text>
    </View>
  );

  return <FlipCard front={front} back={back} height={140} duration={400} />;
}

export function NatureScoreFlipCard({
  natureScore,
  totalActivities,
  totalMinutes,
}: NatureScoreFlipCardProps) {
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
        Based on {totalMinutes} minutes of outdoor activity across {totalActivities}{" "}
        {totalActivities === 1 ? "session" : "sessions"}
      </Text>
    </View>
  );

  return <FlipCard front={front} back={back} height={140} duration={400} />;
}
