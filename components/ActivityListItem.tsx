import { StyleSheet, Text, View } from "react-native";
import { Activity as ActivityIcon } from "lucide-react-native";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { Activity } from "@/lib/db/types";
import { SOURCE_CONFIG } from "@/lib/constants";

interface ActivityListItemProps {
  activity: Activity;
}

function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (activityDate.getTime() === today.getTime()) return "Today";
  if (activityDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { colors } = useTheme();
  const sourceConfig = SOURCE_CONFIG[activity.source];
  const displayName = activity.name || activity.type.charAt(0).toUpperCase() + activity.type.slice(1);

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: sourceConfig.colorLight }]}>
        <ActivityIcon size={16} color={sourceConfig.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {displayName}
        </Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {activity.distance.toFixed(1)} km • {formatDuration(Math.round(activity.duration / 60))} • {formatDate(activity.date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  details: {
    fontSize: 13,
    marginTop: 2,
  },
});
