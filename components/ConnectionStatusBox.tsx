import { StyleSheet, Text, View } from "react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { ActivitySource } from "@/lib/db/types";
import { SOURCE_CONFIG } from "@/lib/constants";

interface ConnectionStatusBoxProps {
  source: ActivitySource;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncAt?: Date | null;
  detail?: string | null;
}

export function ConnectionStatusBox({
  source,
  isConnected,
  isSyncing,
  lastSyncAt,
  detail,
}: ConnectionStatusBoxProps) {
  const { colors, shadows } = useTheme();
  const sourceConfig = SOURCE_CONFIG[source];

  const statusColor = isConnected ? sourceConfig.color : colors.textSecondary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
        shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: sourceConfig.colorLight }]}>
          <Text style={styles.emoji}>{sourceConfig.emoji}</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {sourceConfig.label}
        </Text>
      </View>
      <Text style={[styles.status, { color: statusColor }]}>
        {isConnected ? "Connected" : "Not Connected"}
      </Text>
      {isConnected && lastSyncAt && (
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          Synced {lastSyncAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
      {isConnected && detail && (
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {detail}
        </Text>
      )}
      {isSyncing && (
        <Text style={[styles.detail, { color: sourceConfig.color }]}>
          Syncing...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
    fontWeight: "500",
  },
  detail: {
    fontSize: 11,
    marginTop: 2,
  },
});
