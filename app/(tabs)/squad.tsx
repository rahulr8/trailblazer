import { useCallback } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useToast } from "heroui-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";

export default function SquadScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const handleAddFriend = useCallback(() => {
    toast.show({
      label: "Coming Soon",
      description: "Friend invitations will be available soon!",
      variant: "default",
      placement: "top",
    });
  }, [toast]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: Platform.OS === "ios" ? 100 : insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Your Squad</Text>
          <Pressable onPress={handleAddFriend}>
            <Text style={[styles.addFriendText, { color: colors.accent }]}>Add Friend</Text>
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Everything's better together.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  addFriendText: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    marginTop: -8,
  },
});
