import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Activity,
  ChevronRight,
  Crown,
  Share2,
  FileText,
  Heart,
  LogOut,
  Moon,
  RotateCcw,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "heroui-native";

import { BorderRadius, Spacing, ACCENT_THEME_LIST } from "@/constants";
import { LoadingModal } from "@/components/LoadingModal";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { getUser } from "@/lib/db";
import { useHealthConnection } from "@/lib/health";
import { supabase } from "@/lib/supabase";
import { MOCK_STATS, MOCK_ACHIEVEMENTS } from "@/lib/mock";

type CoachPersonality = "drill-sergeant" | "bestie" | "zen" | "hype" | "witty";

const COACH_OPTIONS: { id: CoachPersonality; emoji: string; label: string }[] = [
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
  const { colors, shadows, isDark, toggleColorScheme, accentTheme, setAccentTheme } = useTheme();
  const { uid } = useAuth();
  const health = useHealthConnection(uid);
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>("bestie");
  const [googleFitEnabled, setGoogleFitEnabled] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [membershipTier, setMembershipTier] = useState<"free" | "platinum">("free");

  useEffect(() => {
    if (!uid) return;
    getUser(uid).then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName);
      setPhotoUrl(profile.photoUrl);
      setMembershipTier(profile.membershipTier);
    });
  }, [uid]);

  const resolvedName = displayName || "Trailblazer";
  const showAppleHealth = Platform.OS === "ios" && health.isAvailable;
  const showGoogleFit = Platform.OS === "android";
  const showIntegrationSection = showAppleHealth || showGoogleFit;

  const handleSignOut = () => {
    Alert.alert("Sign Out?", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            router.back();
            await supabase.auth.signOut();
          } catch (error) {
            console.error("[Profile] Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    toast.show({
      label: "Coming Soon",
      description: "Edit Profile will be available soon.",
      variant: "default",
      placement: "top",
    });
  };

  const handleComingSoon = () => {
    toast.show({
      label: "Coming Soon",
      description: "This feature will be available soon.",
      variant: "default",
      placement: "top",
    });
  };

  const membershipLabel =
    membershipTier === "platinum" ? "Platinum Member" : "Free Member";

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
            paddingBottom: insets.bottom + 40,
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
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
              <User size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {resolvedName}
          </Text>
          <View
            style={[
              styles.membershipBadge,
              { backgroundColor: colors.primary + "25", borderColor: colors.primary + "40" },
            ]}
          >
            <Text style={[styles.membershipTier, { color: colors.primary }]}>
              {membershipLabel}
            </Text>
          </View>
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
                  onPress={() => {
                    if (option.id !== selectedPersonality) {
                      setSelectedPersonality(option.id);
                      handleComingSoon();
                    }
                  }}
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
            Lifetime Stats
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
            contentContainerStyle={[styles.achievementsScroll, { paddingRight: Spacing.lg }]}
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

        {/* App Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>App Theme:</Text>
          <View style={styles.themeColors}>
            {ACCENT_THEME_LIST.map((theme) => {
              const isSelected = accentTheme === theme.id;
              return (
                <Pressable
                  key={theme.id}
                  onPress={() => setAccentTheme(theme.id)}
                  style={styles.themeColorWrapper}
                  accessibilityRole="button"
                  accessibilityLabel={`${theme.label} theme`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.themeColorRing,
                        {
                          borderColor: colors.background,
                          backgroundColor: colors.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.themeColorRingInner,
                          { borderColor: colors.textPrimary },
                        ]}
                      />
                    </View>
                  )}
                  <View style={[styles.themeColorCircle, { backgroundColor: theme.preview }]} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Data Sync & Account Section */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Apple Health */}
          {showAppleHealth && (
            <Pressable style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: "#007AFF20" }]}>
                <Heart size={20} color="#007AFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Apple Health</Text>
              <Switch
                value={health.isConnected}
                disabled={health.isLoading || health.isSyncing}
                onValueChange={(value) => {
                  if (value) {
                    health.connect();
                  } else {
                    health.disconnect();
                  }
                }}
                trackColor={{ false: colors.progressTrack, true: colors.primary + "60" }}
                thumbColor={health.isConnected ? colors.primary : "#f4f3f4"}
              />
            </Pressable>
          )}

          {/* Google Fit */}
          {showGoogleFit && (
            <Pressable style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: "#4285F420" }]}>
                <Activity size={20} color="#4285F4" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Google Fit</Text>
              <Switch
                value={googleFitEnabled}
                onValueChange={(value) => {
                  if (value) {
                    handleComingSoon();
                  } else {
                    setGoogleFitEnabled(false);
                  }
                }}
                trackColor={{ false: colors.progressTrack, true: colors.primary + "60" }}
                thumbColor={googleFitEnabled ? colors.primary : "#f4f3f4"}
              />
            </Pressable>
          )}

          {showIntegrationSection && (
            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
          )}

          {/* Dark Mode */}
          <Pressable style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + "20" }]}>
              <Moon size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{ false: colors.progressTrack, true: colors.primary + "60" }}
              thumbColor={isDark ? colors.primary : "#f4f3f4"}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          {/* Account Management */}
          <Pressable
            style={styles.menuItem}
            onPress={handleComingSoon}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: colors.textSecondary + "20" }]}
            >
              <Settings size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
              Account Management
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          {/* Privacy Policy */}
          <Pressable
            style={styles.menuItem}
            onPress={() => WebBrowser.openBrowserAsync("https://bcparksfoundation.ca/privacy-policy/")}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: colors.textSecondary + "20" }]}
            >
              <Shield size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
              Privacy Policy
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          {/* Terms of Use */}
          <Pressable
            style={styles.menuItem}
            onPress={() => WebBrowser.openBrowserAsync("https://bcparksfoundation.ca/terms-of-use/")}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: colors.textSecondary + "20" }]}
            >
              <FileText size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Terms of Use</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          {/* Sign Out */}
          <Pressable style={styles.menuItem} onPress={handleSignOut}>
            <View style={[styles.menuIcon, { backgroundColor: colors.danger + "20" }]}>
              <LogOut size={20} color={colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.danger }]}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Action Buttons Grid */}
        <View style={styles.actionGrid}>
          {/* Upgrade */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleComingSoon}
          >
            <Crown size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
              Upgrade
            </Text>
          </Pressable>

          {/* Share App */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleComingSoon}
          >
            <Share2 size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
              Share App
            </Text>
          </Pressable>

          {/* Settings */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={handleComingSoon}
          >
            <Settings size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
              Settings
            </Text>
          </Pressable>

          {/* Reset Challenge */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={() => router.push("/(modals)/reset-challenge")}
          >
            <RotateCcw size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
              Reset Challenge
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingModal
        visible={health.isSyncing}
        title="Syncing Workouts"
        message="Importing your activities from Apple Health. This may take a moment..."
      />
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  membershipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  membershipTier: {
    fontSize: 12,
    fontWeight: "600",
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
  themeColors: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.sm,
  },
  themeColorWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  themeColorCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
  },
  themeColorRing: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  themeColorRingInner: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
  },
  menuCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionButton: {
    width: "47%",
    flexGrow: 1,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
