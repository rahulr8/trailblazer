import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Avatar } from "heroui-native";
import { router } from "expo-router";

import { useTheme } from "@/contexts/theme-context";
import {
  MOCK_LEADERBOARD_FRIENDS,
  MOCK_LEADERBOARD_GLOBAL,
} from "@/lib/mock";

export function LeaderboardPreview() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"friends" | "global">("friends");

  const data =
    activeTab === "friends"
      ? MOCK_LEADERBOARD_FRIENDS
      : MOCK_LEADERBOARD_GLOBAL;

  const topFive = data.slice(0, 5);

  const getInitials = (displayName: string): string => {
    return displayName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            borderRadius: 24,
            backgroundColor: colors.backgroundSecondary,
            padding: 4,
          }}
        >
          <Pressable
            onPress={() => setActiveTab("friends")}
            style={{
              backgroundColor:
                activeTab === "friends" ? colors.accent : "transparent",
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: activeTab === "friends" ? "white" : colors.textSecondary,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Friends
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("global")}
            style={{
              backgroundColor:
                activeTab === "global" ? colors.accent : "transparent",
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: activeTab === "global" ? "white" : colors.textSecondary,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Global
            </Text>
          </Pressable>
        </View>
      </View>

      <View>
        {topFive.map((entry) => (
          <View
            key={entry.userId}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: entry.isCurrentUser
                ? `${colors.accent}15`
                : "transparent",
            }}
          >
            <Text
              style={{
                width: 24,
                fontSize: 16,
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
                color: colors.textPrimary,
                fontWeight: "500",
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
              {Math.floor(entry.totalTime / 60)}h
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/squad")}
        style={{ paddingVertical: 12 }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.accent,
            textAlign: "center",
          }}
        >
          View All
        </Text>
      </Pressable>
    </View>
  );
}
