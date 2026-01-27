import { Pressable, Text, View } from "react-native";

import { router } from "expo-router";

import { Avatar } from "heroui-native";

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
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text
        className="w-16 text-sm font-semibold"
        style={{ color: colors.textPrimary }}
      >
        {getFormattedDate()}
      </Text>

      <Text
        className="flex-1 text-center text-sm px-4"
        style={{ color: colors.textSecondary }}
        numberOfLines={2}
      >
        {affirmation}
      </Text>

      <Pressable onPress={() => router.push("/(modals)/profile")}>
        <Avatar size="md" alt="Profile avatar">
          <Avatar.Image source={{ uri: avatarUrl }} />
          <Avatar.Fallback>TB</Avatar.Fallback>
        </Avatar>
      </Pressable>
    </View>
  );
}
