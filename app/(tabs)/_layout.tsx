import { Platform, StyleSheet, View } from "react-native";

import { withLayoutContext } from "expo-router";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Gift, Home, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ParkerFAB } from "@/components/navigation/ParkerFAB";
import { useTheme } from "@/contexts/theme-context";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          lazy: true,
          lazyPreloadDistance: 0,
          tabBarActiveTintColor: colors.tabIconActive,
          tabBarInactiveTintColor: colors.tabIconInactive,
          tabBarShowIcon: true,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          tabBarIndicatorStyle: styles.tabBarIndicator,
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: insets.bottom,
              backgroundColor: colors.tabBarBackground,
              borderTopColor: colors.tabBarBorder,
            },
          ],
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }: { color: string }) => <Home size={22} color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="stash"
          options={{
            title: "Your Stash",
            tabBarIcon: ({ color }: { color: string }) => <Gift size={22} color={color} />,
          }}
        />
        <MaterialTopTabs.Screen
          name="squad"
          options={{
            title: "Your Squad",
            tabBarIcon: ({ color }: { color: string }) => <Users size={22} color={color} />,
          }}
        />
      </MaterialTopTabs>
      <ParkerFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    height: Platform.OS === "ios" ? 88 : 64,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "none",
  },
  tabBarItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  tabBarIndicator: {
    display: "none",
  },
});
