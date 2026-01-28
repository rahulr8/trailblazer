import { Pressable, StyleSheet, View } from "react-native";

import { router } from "expo-router";

import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Gift, Home, PawPrint, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/theme-context";

const TAB_ICONS: Record<string, typeof Home> = {
  index: Home,
  stash: Gift,
  squad: Users,
};

const ICON_SIZE = 26;
const PARKER_SIZE = 56;

export function CustomTabBar({ state, navigation }: MaterialTopTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.tabBarBackground,
            borderColor: colors.tabBarBorder,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name];
          if (!Icon) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabButton,
                isFocused && {
                  backgroundColor: colors.tabIconActiveBg,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
            >
              <Icon
                size={ICON_SIZE}
                color={isFocused ? colors.tabIconActive : colors.tabIconInactive}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/chat")}
        style={[styles.parkerButton, { backgroundColor: colors.accent }]}
        accessibilityLabel="Open Parker Chat"
        accessibilityRole="button"
      >
        <PawPrint size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 28,
    borderWidth: 1,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  parkerButton: {
    width: PARKER_SIZE,
    height: PARKER_SIZE,
    borderRadius: PARKER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
