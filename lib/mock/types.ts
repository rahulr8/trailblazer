/**
 * Mock Data Layer - TypeScript Interfaces
 *
 * UI-specific types for Trailblazer+ mock data.
 * Uses primitive types only - zero Firebase dependencies.
 */

/**
 * User profile data
 */
export interface MockUser {
  id: string;
  displayName: string;
  photoURL: string;
  membershipTier: "free" | "platinum";
  email: string;
}

/**
 * User activity statistics
 */
export interface MockStats {
  totalMinutes: number;
  totalKm: number;
  totalSteps: number;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  totalBadges: number;
  totalChallenges: number;
}

/**
 * Vendor reward/offer
 */
export interface MockReward {
  id: string;
  vendor: string;
  title: string;
  description: string;
  featured: boolean;
  rewardType: "qr" | "barcode" | "code";
  rewardValue: string;
  color: string;
  imageUrl: string;
}

/**
 * Leaderboard entry
 */
export interface MockLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  totalTime: number;
  isCurrentUser: boolean;
}

/**
 * Achievement/badge
 */
export interface MockAchievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earned: boolean;
  earnedDate: string | null;
}

/**
 * Hero card (motivation or counter)
 */
export interface MockHeroCard {
  id: string;
  type: "motivation" | "counter";
  motivationText?: string;
  minutesActive?: number;
}

/**
 * Pulse feed item
 */
export interface MockPulseItem {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  activityType: string;
  message: string;
  timestamp: string;
}

/**
 * Quest/challenge
 */
export interface MockQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetValue: number;
  currentValue: number;
  unit: string;
}

/**
 * Digital wallet card
 */
export interface MockWalletCard {
  id: string;
  name: string;
  type: "membership" | "pass" | "partner";
  barcodeType: "qr" | "barcode";
  barcodeValue: string;
  color: string;
  logoUrl: string;
}
