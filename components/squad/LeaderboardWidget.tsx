import { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";

import { useTheme } from "@/contexts/theme-context";
import { MOCK_LEADERBOARD_FRIENDS, MOCK_LEADERBOARD_GLOBAL } from "@/lib/mock";
import { SegmentedControl } from "./SegmentedControl";
import { LeaderboardRow } from "./LeaderboardRow";

export function LeaderboardWidget() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"friends" | "global">("friends");
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when switching tabs
  useEffect(() => {
    setShowAll(false);
  }, [activeTab]);

  const data =
    activeTab === "friends"
      ? MOCK_LEADERBOARD_FRIENDS
      : MOCK_LEADERBOARD_GLOBAL;

  const visibleEntries = showAll ? data : data.slice(0, 10);
  const hasMore = data.length > 10;

  return (
    <View style={{ gap: 4 }}>
      <SegmentedControl
        options={[
          { key: "friends", label: "Friends" },
          { key: "global", label: "Global" },
        ]}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "friends" | "global")}
      />

      <View style={{ marginTop: 16 }}>
        {visibleEntries.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            isHighlighted={entry.isCurrentUser}
          />
        ))}
      </View>

      {hasMore && (
        <Pressable
          onPress={() => setShowAll(!showAll)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingVertical: 8,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.accent,
            }}
          >
            {showAll ? "Show Less" : "Show More"}
          </Text>
          {showAll ? (
            <ChevronUp size={16} color={colors.accent} />
          ) : (
            <ChevronDown size={16} color={colors.accent} />
          )}
        </Pressable>
      )}
    </View>
  );
}
