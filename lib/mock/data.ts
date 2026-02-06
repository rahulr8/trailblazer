/**
 * Mock Data Layer - Hardcoded Fixtures
 *
 * Realistic mock data for all Trailblazer+ screens.
 * Zero Firebase dependencies - UI primitives only.
 */

import type {
  MockUser,
  MockStats,
  MockReward,
  MockLeaderboardEntry,
  MockAchievement,
  MockHeroCard,
  MockPulseItem,
  MockQuest,
  MockWalletCard,
} from "./types";

/**
 * Current user profile
 */
export const MOCK_USER: MockUser = {
  id: "mock-user-123",
  displayName: "Sarah Johnson",
  photoURL: "https://i.pravatar.cc/150?img=5",
  membershipTier: "platinum",
  email: "sarah.johnson@example.com",
};

/**
 * User activity statistics
 */
export const MOCK_STATS: MockStats = {
  totalMinutes: 3420,
  totalKm: 142.5,
  totalSteps: 185250,
  currentStreak: 12,
  longestStreak: 18,
  totalActivities: 87,
  totalBadges: 12,
  totalChallenges: 3,
};

/**
 * Vendor rewards and offers
 */
export const MOCK_REWARDS: MockReward[] = [
  {
    id: "reward-1",
    vendor: "Arc'teryx",
    title: "15% Off Your Next Purchase",
    description: "Valid on regular-priced items in-store and online",
    featured: true,
    rewardType: "code",
    rewardValue: "TRAIL15ARC",
    color: "#000000",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  },
  {
    id: "reward-2",
    vendor: "Patagonia",
    title: "20% Off Fleece & Baselayers",
    description: "Show this code at checkout for instant savings",
    featured: true,
    rewardType: "barcode",
    rewardValue: "8291047365829",
    color: "#004A7C",
    imageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800&q=80",
  },
  {
    id: "reward-3",
    vendor: "MEC",
    title: "$25 Off Orders Over $150",
    description: "Scan this QR code at any MEC location",
    featured: true,
    rewardType: "qr",
    rewardValue: "MEC-TRAIL-25OFF",
    color: "#00A651",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  },
  {
    id: "reward-4",
    vendor: "The North Face",
    title: "Free Shipping on All Orders",
    description: "No minimum purchase required",
    featured: false,
    rewardType: "code",
    rewardValue: "TNFFREESHIP",
    color: "#E64025",
    imageUrl: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=800&q=80",
  },
  {
    id: "reward-5",
    vendor: "Vessi",
    title: "10% Off Waterproof Footwear",
    description: "Keep your feet dry on the trails",
    featured: false,
    rewardType: "code",
    rewardValue: "VESSI10TRAIL",
    color: "#2D3142",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: "reward-6",
    vendor: "Running Room",
    title: "Free Gait Analysis",
    description: "Book your complimentary session today",
    featured: false,
    rewardType: "qr",
    rewardValue: "RR-GAIT-FREE",
    color: "#0072CE",
    imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
  },
  {
    id: "reward-7",
    vendor: "Lululemon",
    title: "Complimentary Hemming Service",
    description: "Valid on any pants or tights purchase",
    featured: false,
    rewardType: "barcode",
    rewardValue: "7284910283746",
    color: "#D31334",
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
  },
  {
    id: "reward-8",
    vendor: "Scandinave Spa",
    title: "$30 Off Spa Day Pass",
    description: "Relax and recover after your adventures",
    featured: false,
    rewardType: "code",
    rewardValue: "SCANDI30",
    color: "#8B7355",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  },
];

/**
 * Friends leaderboard rankings
 */
export const MOCK_LEADERBOARD_FRIENDS: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user-456",
    displayName: "Mike Chen",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    totalTime: 4280,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: "mock-user-123",
    displayName: "Sarah Johnson",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    totalTime: 3420,
    isCurrentUser: true,
  },
  {
    rank: 3,
    userId: "user-789",
    displayName: "Emma Rodriguez",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    totalTime: 2915,
    isCurrentUser: false,
  },
  {
    rank: 4,
    userId: "user-234",
    displayName: "James Park",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    totalTime: 2640,
    isCurrentUser: false,
  },
  {
    rank: 5,
    userId: "user-567",
    displayName: "Olivia Taylor",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    totalTime: 2180,
    isCurrentUser: false,
  },
];

/**
 * Global leaderboard rankings
 */
export const MOCK_LEADERBOARD_GLOBAL: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: "global-1",
    displayName: "Alex M.",
    avatarUrl: "https://i.pravatar.cc/150?img=68",
    totalTime: 8420,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: "global-2",
    displayName: "Jordan K.",
    avatarUrl: "https://i.pravatar.cc/150?img=70",
    totalTime: 7235,
    isCurrentUser: false,
  },
  {
    rank: 3,
    userId: "global-3",
    displayName: "Taylor R.",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    totalTime: 6890,
    isCurrentUser: false,
  },
  {
    rank: 4,
    userId: "mock-user-123",
    displayName: "Sarah Johnson",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    totalTime: 3420,
    isCurrentUser: true,
  },
  {
    rank: 5,
    userId: "global-5",
    displayName: "Morgan T.",
    avatarUrl: "https://i.pravatar.cc/150?img=22",
    totalTime: 3210,
    isCurrentUser: false,
  },
  {
    rank: 6,
    userId: "global-6",
    displayName: "Casey L.",
    avatarUrl: "https://i.pravatar.cc/150?img=31",
    totalTime: 2980,
    isCurrentUser: false,
  },
  {
    rank: 7,
    userId: "global-7",
    displayName: "Jamie W.",
    avatarUrl: "https://i.pravatar.cc/150?img=41",
    totalTime: 2765,
    isCurrentUser: false,
  },
  {
    rank: 8,
    userId: "global-8",
    displayName: "River D.",
    avatarUrl: "https://i.pravatar.cc/150?img=52",
    totalTime: 2540,
    isCurrentUser: false,
  },
  {
    rank: 9,
    userId: "global-9",
    displayName: "Sage P.",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    totalTime: 2310,
    isCurrentUser: false,
  },
  {
    rank: 10,
    userId: "global-10",
    displayName: "Quinn H.",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    totalTime: 2105,
    isCurrentUser: false,
  },
];

/**
 * User achievements and badges
 */
export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  {
    id: "achievement-1",
    name: "Early Bird",
    description: "Complete 5 activities before 8 AM",
    iconName: "sun",
    earned: true,
    earnedDate: "2024-09-12T06:45:00Z",
  },
  {
    id: "achievement-2",
    name: "Hiker",
    description: "Hike 100km in total",
    iconName: "mountain",
    earned: true,
    earnedDate: "2024-10-03T14:22:00Z",
  },
  {
    id: "achievement-3",
    name: "Rain or Shine",
    description: "Be active 7 days in a row",
    iconName: "cloud-rain",
    earned: true,
    earnedDate: "2024-10-15T19:30:00Z",
  },
  {
    id: "achievement-4",
    name: "10 Hour Club",
    description: "Log 10 hours of activity in one week",
    iconName: "clock",
    earned: false,
    earnedDate: null,
  },
  {
    id: "achievement-5",
    name: "Four Seasons",
    description: "Be active in all four seasons",
    iconName: "calendar",
    earned: false,
    earnedDate: null,
  },
];

/**
 * Hero cards for dashboard
 */
export const MOCK_HERO_CARDS: MockHeroCard[] = [
  {
    id: "hero-1",
    type: "motivation",
    motivationText: "You're on fire! Keep up the amazing streak.",
  },
  {
    id: "hero-2",
    type: "counter",
    minutesActive: 3420,
  },
];

/**
 * Social activity feed
 */
export const MOCK_PULSE_FEED: MockPulseItem[] = [
  {
    id: "pulse-1",
    userId: "user-456",
    displayName: "Mike Chen",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    activityType: "Hiking",
    message: "just completed a 12km hike at Lynn Canyon",
    timestamp: "2024-10-20T10:15:00Z",
  },
  {
    id: "pulse-2",
    userId: "user-789",
    displayName: "Emma Rodriguez",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    activityType: "Running",
    message: "finished a 5K run along the Seawall",
    timestamp: "2024-10-20T08:42:00Z",
  },
  {
    id: "pulse-3",
    userId: "user-234",
    displayName: "James Park",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    activityType: "Cycling",
    message: "rode 25km through Stanley Park",
    timestamp: "2024-10-19T16:30:00Z",
  },
];

/**
 * Active quests and challenges
 */
export const MOCK_QUESTS: MockQuest[] = [
  {
    id: "quest-1",
    title: "Weekend Warrior",
    description: "Complete 2 hours of outdoor activity this weekend",
    progress: 65,
    targetValue: 120,
    currentValue: 78,
    unit: "minutes",
  },
];

/**
 * Digital wallet cards
 */
export const MOCK_WALLET_CARDS: MockWalletCard[] = [
  {
    id: "wallet-1",
    name: "Trailblazer+ Platinum",
    type: "membership",
    barcodeType: "qr",
    barcodeValue: "TRAIL-PLAT-MOCK123",
    color: "#1E3A8A",
    logoUrl: "https://via.placeholder.com/120x40/1E3A8A/FFFFFF?text=Trailblazer%2B",
  },
  {
    id: "wallet-2",
    name: "BC Parks Pass 2024",
    type: "pass",
    barcodeType: "barcode",
    barcodeValue: "9182746350192",
    color: "#047857",
    logoUrl: "https://via.placeholder.com/120x40/047857/FFFFFF?text=BC+Parks",
  },
  {
    id: "wallet-3",
    name: "NSMBA Membership",
    type: "partner",
    barcodeType: "qr",
    barcodeValue: "NSMBA-2024-MOCK456",
    color: "#DC2626",
    logoUrl: "https://via.placeholder.com/120x40/DC2626/FFFFFF?text=NSMBA",
  },
];

/**
 * Daily motivational affirmations
 */
export const MOCK_AFFIRMATIONS: string[] = [
  "Every step counts! You're building healthy habits.",
  "Nature is calling. Time to answer.",
  "Fresh air and movement -- your body thanks you.",
  "You're stronger than you think. Get out there!",
  "The best view comes after the hardest climb.",
  "Small steps lead to big adventures.",
  "Your future self will thank you for moving today.",
  "The mountains are calling, and you must go.",
];
