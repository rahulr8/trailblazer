import { StyleSheet, View } from "react-native";

import { withLayoutContext } from "expo-router";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { CustomTabBar } from "@/components/navigation/CustomTabBar";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
          lazy: true,
          lazyPreloadDistance: 0,
        }}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: "Home" }} />
        <MaterialTopTabs.Screen name="stash" options={{ title: "Your Stash" }} />
        <MaterialTopTabs.Screen name="squad" options={{ title: "Your Squad" }} />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
