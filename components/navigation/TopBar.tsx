import { Pressable, Text, View } from "react-native";

import { router } from "expo-router";

import { Avatar } from "heroui-native";

import { Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

interface TopBarProps {
  affirmation: string;
  avatarUrl: string;
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function TopBar({ affirmation, avatarUrl }: TopBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{ fontSize: 13, color: colors.textSecondary }}
          numberOfLines={1}
        >
          {affirmation}
        </Text>
        <Text
          style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}
        >
          {getFormattedDate()}
        </Text>
      </View>

      <Pressable onPress={() => router.push("/(modals)/profile")}>
        <Avatar size="md" alt="Profile avatar">
          <Avatar.Image source={{ uri: avatarUrl }} />
          <Avatar.Fallback>TB</Avatar.Fallback>
        </Avatar>
      </Pressable>
    </View>
  );
}
