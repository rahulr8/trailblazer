import type { ActivitySource } from "@/lib/db/types";

export interface SourceConfig {
  color: string;
  colorLight: string;
  emoji: string;
  label: string;
}

export const SOURCE_CONFIG: Record<ActivitySource, SourceConfig> = {
  apple_health: {
    color: "#007AFF",
    colorLight: "#007AFF20",
    emoji: "❤️",
    label: "Apple Health",
  },
  manual: {
    color: "#6B7280",
    colorLight: "#6B728020",
    emoji: "✏️",
    label: "Manual",
  },
};

export function getSourceConfig(source: ActivitySource): SourceConfig {
  return SOURCE_CONFIG[source];
}
