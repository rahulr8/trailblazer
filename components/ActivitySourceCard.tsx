import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { RefreshCw } from "lucide-react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { Activity, ActivitySource } from "@/lib/db/types";
import { SOURCE_CONFIG } from "@/lib/constants";
import { ActivityListItem } from "./ActivityListItem";

interface ActivitySourceCardProps {
  source: ActivitySource;
  activities: Activity[];
  isConnected: boolean;
  isSyncing: boolean;
  onSync: () => void;
}

export function ActivitySourceCard({
  source,
  activities,
  isConnected,
  isSyncing,
  onSync,
}: ActivitySourceCardProps) {
  const { colors, shadows } = useTheme();
  const sourceConfig = SOURCE_CONFIG[source];
  const filteredActivities = activities.filter((a) => a.source === source);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
        shadows.md,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{sourceConfig.emoji}</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {sourceConfig.label}
          </Text>
        </View>
        {isConnected && (
          <Pressable
            onPress={onSync}
            disabled={isSyncing}
            style={[styles.syncButton, { opacity: isSyncing ? 0.5 : 1 }]}
          >
            <RefreshCw
              size={18}
              color={sourceConfig.color}
              style={isSyncing ? { transform: [{ rotate: "45deg" }] } : undefined}
            />
          </Pressable>
        )}
      </View>

      {isConnected && filteredActivities.length > 0 ? (
        <View style={styles.activitiesList}>
          {filteredActivities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </View>
      ) : isConnected ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          No activities synced yet
        </Text>
      ) : (
        <Pressable onPress={() => router.push("/(modals)/profile")}>
          <Text style={[styles.subtitle, { color: sourceConfig.color }]}>
            Tap to connect {sourceConfig.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  syncButton: {
    padding: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  activitiesList: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
});
