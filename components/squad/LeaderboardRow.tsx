import { Text, View } from "react-native";
import { Avatar } from "heroui-native";

import { useTheme } from "@/contexts/theme-context";
import type { MockLeaderboardEntry } from "@/lib/mock";

interface LeaderboardRowProps {
  entry: MockLeaderboardEntry;
  isHighlighted: boolean;
}

export function LeaderboardRow({ entry, isHighlighted }: LeaderboardRowProps) {
  const { colors } = useTheme();

  const getInitials = (displayName: string): string => {
    return displayName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hours = Math.floor(entry.totalTime / 60);
  const minutes = entry.totalTime % 60;
  const timeDisplay = `${hours}h ${minutes}m`;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: isHighlighted ? `${colors.accent}18` : "transparent",
      }}
    >
      <Text
        style={{
          width: 28,
          fontSize: 17,
          fontWeight: "700",
          color: colors.textSecondary,
        }}
      >
        {entry.rank}
      </Text>

      <Avatar size="sm" alt={entry.displayName}>
        <Avatar.Image source={{ uri: entry.avatarUrl }} />
        <Avatar.Fallback>{getInitials(entry.displayName)}</Avatar.Fallback>
      </Avatar>

      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "500",
          color: colors.textPrimary,
        }}
      >
        {entry.displayName}
      </Text>

      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.textSecondary,
        }}
      >
        {timeDisplay}
      </Text>
    </View>
  );
}
