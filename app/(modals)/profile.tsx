import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { LogOut, User, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "heroui-native";

import { BorderRadius, Spacing } from "@/constants";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { auth } from "@/lib/firebase";
import { MOCK_USER, MOCK_STATS, MOCK_ACHIEVEMENTS } from "@/lib/mock";

type CoachPersonality = "drill-sergeant" | "bestie" | "zen" | "hype" | "witty";

const COACH_OPTIONS: Array<{ id: CoachPersonality; emoji: string; label: string }> = [
  { id: "drill-sergeant", emoji: "\u{1F3CB}", label: "Drill Sgt" },
  { id: "bestie", emoji: "\u{1F917}", label: "Bestie" },
  { id: "zen", emoji: "\u{1F9D8}", label: "Zen" },
  { id: "hype", emoji: "\u{1F525}", label: "Hype" },
  { id: "witty", emoji: "\u{1F916}", label: "Witty" },
];

const EMOJI_MAP: Record<string, string> = {
  sun: "☀️",
  mountain: "⛰️",
  "cloud-rain": "🌧️",
  leaf: "🍃",
  snowflake: "❄️",
  clock: "⏰",
  calendar: "📅",
};

export default function ProfileScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>("bestie");

  const handleSignOut = async () => {
    try {
      router.back();
      await signOut(auth);
    } catch (error) {
      console.error("[Profile] Sign out error:", error);
    }
  };

  const handleEditProfile = () => {
    toast.show({
      label: "Coming Soon",
      description: "Edit Profile will be available soon.",
      variant: "default",
      placement: "top",
    });
  };

  const membershipLabel =
    MOCK_USER.membershipTier === "platinum" ? "Platinum Member" : "Free Member";

  const statsItems = [
    { label: "Total Mins", value: MOCK_STATS.totalMinutes.toLocaleString() },
    { label: "Longest Streak", value: MOCK_STATS.longestStreak.toString() },
    { label: "Total KMs", value: MOCK_STATS.totalKm.toFixed(1) },
    { label: "Badges", value: MOCK_STATS.totalBadges.toString() },
    { label: "Total Activities", value: MOCK_STATS.totalActivities.toString() },
    { label: "Challenges", value: MOCK_STATS.totalChallenges.toString() },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
          accessibilityLabel="Close profile"
          accessibilityRole="button"
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === "ios" ? 40 : insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>My Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Exclusive perks and rewards.
          </Text>
        </View>

        {/* Hero Identity Section */}
        <View style={styles.heroSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <User size={48} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {MOCK_USER.displayName}
          </Text>
          <Text style={[styles.membershipTier, { color: colors.textSecondary }]}>
            {membershipLabel}
          </Text>
          <Pressable
            style={[
              styles.editButton,
              { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground },
            ]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editButtonText, { color: colors.textPrimary }]}>
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Coach Personality Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Coach Personality:
          </Text>
          <View style={styles.coachOptions}>
            {COACH_OPTIONS.map((option) => {
              const isSelected = selectedPersonality === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.coachOption,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + "20"
                        : colors.cardBackground,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPersonality(option.id)}
                >
                  <Text style={styles.coachEmoji}>{option.emoji}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.coachLabels}>
            {COACH_OPTIONS.map((option) => (
              <Text
                key={`label-${option.id}`}
                style={[styles.coachLabel, { color: colors.textSecondary }]}
              >
                {option.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Lifetime Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Lifetime stats:
          </Text>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
              shadows.md,
            ]}
          >
            <View style={styles.statsGrid}>
              {statsItems.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Achievements Horizontal Scroll */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Achievements:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {MOCK_ACHIEVEMENTS.map((achievement) => {
              const emoji = EMOJI_MAP[achievement.iconName] || "🏆";
              return (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View
                    style={[
                      styles.badgeCircle,
                      {
                        backgroundColor: achievement.earned
                          ? colors.accent + "20"
                          : colors.cardBackground,
                        opacity: achievement.earned ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Text style={styles.badgeEmoji}>{emoji}</Text>
                  </View>
                  <Text
                    style={[styles.badgeName, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {achievement.name}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Placeholder for Plan 02 sections (settings, integrations, etc.) */}

        {/* Sign Out Button */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <View style={[styles.signOutIcon, { backgroundColor: colors.danger + "20" }]}>
            <LogOut size={20} color={colors.danger} />
          </View>
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  titleSection: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  heroSection: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  membershipTier: {
    fontSize: 14,
  },
  editButton: {
    marginTop: Spacing.xs,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  coachOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  coachOption: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  coachEmoji: {
    fontSize: 24,
  },
  coachLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -Spacing.xs,
  },
  coachLabel: {
    fontSize: 11,
    width: 56,
    textAlign: "center",
  },
  statsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: "28%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  achievementsScroll: {
    gap: Spacing.md,
  },
  achievementItem: {
    alignItems: "center",
    width: 70,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 10,
    textAlign: "center",
    marginTop: Spacing.xs,
    maxWidth: 70,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  signOutIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
