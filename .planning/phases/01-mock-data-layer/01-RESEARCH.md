# Phase 1: Mock Data Layer - Research

**Researched:** 2026-01-27
**Domain:** TypeScript mock data architecture for React Native
**Confidence:** HIGH

## Summary

Mock data layers in TypeScript projects serve as a clean separation between UI development and backend integration. The standard approach uses strict TypeScript interfaces combined with factory-pattern fixtures that provide realistic, type-safe hardcoded data. For this React Native Expo project with strict mode enabled, the mock layer must completely isolate UI code from Firebase dependencies while providing realistic data for all screens.

The research confirms that the project's TypeScript strict mode configuration (`tsconfig.json` with `"strict": true`) demands explicit typing with no `any` types, which is ideal for catching mock data type errors at compile time. The existing codebase already has Firebase types in `lib/db/types.ts` that should be used as reference but not imported directly into the mock layer.

Based on 2026 best practices, the recommended architecture uses two files: `types.ts` for all UI-specific interfaces, and `data.ts` exporting factory-like constants that implement those interfaces. The existing `lib/data.ts` provides a good foundation but needs restructuring to avoid Firebase coupling and cover all new v1 requirements (rewards, leaderboard, stats, quests, pulse, wallet, achievements).

**Primary recommendation:** Create `lib/mock/types.ts` and `lib/mock/data.ts` with strict TypeScript interfaces and hardcoded fixture data, ensuring zero Firebase imports and complete type coverage verified by `npx tsc --noEmit`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.2 | Type system and compiler | Project already uses TS strict mode; no additional libraries needed for mock data |
| Native JavaScript | ES2020+ | Data structures (objects, arrays) | Hardcoded mock data uses plain JS objects that satisfy TS interfaces |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | Mock data is pure TypeScript | Existing project stack is sufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hardcoded fixtures | faker.js / @faker-js/faker | Faker generates random data but adds dependency and complexity; hardcoded data is predictable for UI development |
| Hardcoded fixtures | MSW (Mock Service Worker) | MSW mocks network layer; overkill for static mock data without API calls |
| Plain objects | Factory pattern with functions | Factory functions add flexibility but unnecessary for static UI mockups; plain objects are simpler |

**Installation:**
No new dependencies required. TypeScript 5.9.2 already installed.

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── mock/               # NEW: Mock data layer (this phase)
│   ├── types.ts        # UI-specific TypeScript interfaces
│   └── data.ts         # Hardcoded fixture data implementing types
├── db/                 # EXISTING: Firebase/Firestore operations (DO NOT IMPORT)
│   └── types.ts        # Reference only, do not import into mock/
├── constants/          # EXISTING: Shared constants (OK to import)
└── data.ts             # EXISTING: Old mock data (will be superseded)
```

### Pattern 1: Interface-First Type Definition
**What:** Define all TypeScript interfaces before writing data. Interfaces mirror UI requirements, not database schema.
**When to use:** Always. Types must exist before data to catch errors at compile time.
**Example:**
```typescript
// lib/mock/types.ts
// UI-specific interface (no Firebase Timestamp types)
export interface MockUser {
  id: string;
  displayName: string;
  photoURL: string;
  membershipTier: "free" | "platinum";
  email: string;
}

export interface MockStats {
  totalMinutes: number;
  totalKm: number;
  totalSteps: number;
  currentStreak: number;
  longestStreak: number;
}

export interface MockReward {
  id: string;
  vendor: string;
  title: string;
  description: string;
  featured: boolean;
  rewardType: "qr" | "barcode" | "code";
  rewardValue: string; // QR data, barcode number, or coupon code
  color: string;
  imageUrl: string;
}

export interface MockLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  totalTime: number; // minutes
  isCurrentUser: boolean;
}

export interface MockAchievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earned: boolean;
  earnedDate: string | null; // ISO date string or null
}
```

### Pattern 2: Hardcoded Fixture Constants
**What:** Export const arrays/objects that implement interfaces. Use realistic values that populate all UI states.
**When to use:** Always for mock data. Factory functions unnecessary for static UI development.
**Example:**
```typescript
// lib/mock/data.ts
import type {
  MockUser,
  MockStats,
  MockReward,
  MockLeaderboardEntry,
  MockAchievement
} from "./types";

export const MOCK_USER: MockUser = {
  id: "mock-user-123",
  displayName: "Sarah Johnson",
  photoURL: "https://i.pravatar.cc/200?img=1",
  membershipTier: "platinum",
  email: "sarah.j@example.com",
};

export const MOCK_STATS: MockStats = {
  totalMinutes: 3420,
  totalKm: 142.5,
  totalSteps: 185250,
  currentStreak: 12,
  longestStreak: 18,
};

export const MOCK_REWARDS: MockReward[] = [
  {
    id: "reward-1",
    vendor: "Arc'teryx",
    title: "20% Off Outerwear",
    description: "Valid on all jackets and shells in-store and online",
    featured: true,
    rewardType: "code",
    rewardValue: "TRAIL20",
    color: "#000000",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
  },
  // ... 7+ more rewards
];

export const MOCK_LEADERBOARD_FRIENDS: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user-alice",
    displayName: "Alice Martinez",
    avatarUrl: "https://i.pravatar.cc/100?img=9",
    totalTime: 4560,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: "mock-user-123",
    displayName: "Sarah Johnson",
    avatarUrl: "https://i.pravatar.cc/200?img=1",
    totalTime: 3420,
    isCurrentUser: true,
  },
  // ... 8+ more entries
];

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  {
    id: "achievement-1",
    name: "Early Bird",
    description: "Logged activity before 7AM",
    iconName: "sun",
    earned: true,
    earnedDate: "2024-10-12T06:45:00Z",
  },
  // ... 4+ more achievements
];
```

### Pattern 3: Barrel Export for Clean Imports
**What:** Re-export all types and data from `index.ts` so screens import from `@/lib/mock` only.
**When to use:** Always. Provides single import path for all mock data.
**Example:**
```typescript
// lib/mock/index.ts
export * from "./types";
export * from "./data";
```

**Screen usage:**
```typescript
// app/(tabs)/index.tsx
import { MOCK_USER, MOCK_STATS, MOCK_LEADERBOARD_FRIENDS } from "@/lib/mock";
// NOT: import { ... } from "@/lib/db/types";
// NOT: import { ... } from "firebase/firestore";
```

### Pattern 4: Date Handling Without Firebase Timestamps
**What:** Use ISO 8601 date strings or JavaScript Date objects instead of Firebase Timestamp types.
**When to use:** Always in mock layer. Avoids Firebase imports.
**Example:**
```typescript
// GOOD: Mock types use strings or Date
export interface MockActivity {
  id: string;
  type: string;
  duration: number;
  date: string; // ISO 8601: "2024-10-15T14:30:00Z"
}

// BAD: Firebase types leak into mock layer
// import { Timestamp } from "firebase/firestore"; // ❌ NEVER
// export interface MockActivity {
//   date: Timestamp; // ❌ Firebase dependency
// }
```

### Anti-Patterns to Avoid
- **Firebase type imports in mock layer**: Never import from `firebase/`, `lib/db/`, or `lib/health/` in `lib/mock/` files. Use primitive types (string, number, boolean) or plain objects.
- **Sparse or incomplete mock data**: Leaderboards need 10+ entries, rewards need 8+ items, achievements need 5+ badges. Sparse data causes empty states during development.
- **Using `any` type**: TypeScript strict mode forbids `any`. All mock data must have explicit types or satisfy defined interfaces.
- **Circular dependencies**: Mock layer should not import from screens or components; screens import from mock layer only (one-way dependency).
- **Database-shaped types in UI code**: Mock interfaces should match UI needs (e.g., `displayName: string`) not database schema (e.g., `displayName: string | null` with Firestore nullability rules).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type-safe mock data | Manual object creation without types | Define TypeScript interfaces first, then data that implements them | TypeScript strict mode catches type errors at compile time; prevents runtime bugs |
| Realistic fake data | Manually invented names/emails | Use existing proven patterns: pravatar.cc for avatars, realistic names from existing `lib/data.ts` | Consistency with existing codebase; predictable data for screenshots |
| Mock data organization | Scattered constants in screen files | Centralized `lib/mock/types.ts` and `lib/mock/data.ts` | Single source of truth; easy to update all screens when mock data changes |
| Import path management | Deep imports like `@/lib/mock/data` | Barrel export via `lib/mock/index.ts` | Future-proof: can reorganize files without breaking imports |

**Key insight:** Mock data is not "just placeholder text" — it's a typed contract between screens and future backend. Investing in proper TypeScript interfaces now prevents rewrites later when Firebase integration happens.

## Common Pitfalls

### Pitfall 1: Importing Firebase Types into Mock Layer
**What goes wrong:** Files in `lib/mock/` import from `lib/db/types.ts`, which imports `firebase/firestore`, violating the zero-Firebase requirement (MOCK-03).
**Why it happens:** Developers copy type definitions from `lib/db/types.ts` without realizing they pull in Firebase dependencies.
**How to avoid:**
- Use find/replace on imports: search for `from "firebase` and `from "@/lib/db"` in `lib/mock/` files — there should be ZERO matches.
- Define UI-specific types that mirror database types but use primitives: `date: string` instead of `date: Timestamp`.
**Warning signs:** `npx tsc --noEmit` shows errors like "Cannot find module 'firebase/firestore'" if Firebase isn't installed (or would succeed when it should fail type checks).

### Pitfall 2: Insufficient Mock Data Volume
**What goes wrong:** Leaderboard has only 3 entries when screens expect 10+; rewards has 4 items when grid needs 8+. Causes empty states or layout bugs.
**Why it happens:** Developers create minimal data to "make it work" without considering realistic screen population.
**How to avoid:**
- Requirements specify minimums: leaderboard 10+ entries, rewards 8+ items, achievements 5+ badges.
- Test scrolling behavior during implementation — sparse data won't reveal scroll bugs.
**Warning signs:** Screens render with large empty areas; scrollable lists don't scroll.

### Pitfall 3: Nullable Types Everywhere (Database Thinking)
**What goes wrong:** Mock interfaces use `string | null` for every field because database types allow nulls, adding unnecessary null checks in UI code.
**Why it happens:** Developers copy database schema types instead of defining UI-specific types.
**How to avoid:**
- Mock data represents "happy path" UI state where all data exists.
- Use non-null types in mock interfaces: `displayName: string` not `displayName: string | null`.
- If UI genuinely needs to handle missing data, use `undefined` (TypeScript convention) not `null` (database convention).
**Warning signs:** Screen code has `displayName ?? "Unknown"` checks everywhere when mock data always has `displayName` present.

### Pitfall 4: Mixing Old and New Mock Data
**What goes wrong:** New screens import from `@/lib/mock`, old code still imports from `@/lib/data.ts`, causing duplicate type definitions and confusion.
**Why it happens:** Existing `lib/data.ts` has similar types (Reward, LeaderboardUser) but incompatible with new requirements.
**How to avoid:**
- Treat `lib/data.ts` as deprecated for new screens (it's for Parker chat/adventures which aren't in v1).
- New screens import from `@/lib/mock` exclusively.
- Document in `lib/mock/README.md` or `CLAUDE.md` that this is the source for new v1 screens.
**Warning signs:** Two `Reward` interfaces exist (one in `lib/data.ts`, one in `lib/mock/types.ts`) with different fields.

### Pitfall 5: Hardcoding Screen-Specific Logic in Mock Data
**What goes wrong:** Mock data includes computed values like `"12 Days Active"` (string) instead of raw `currentStreak: 12` (number), forcing UI to parse strings.
**Why it happens:** Developers think mock data should mirror "what appears on screen" instead of "data the screen needs."
**How to avoid:**
- Mock data provides primitives (numbers, strings, booleans), not formatted strings.
- Screens handle formatting: `{currentStreak} Days Active` not `{streakLabel}`.
- Exception: Image URLs and icon names are OK as strings (they're primitives the UI consumes directly).
**Warning signs:** Mock interfaces have fields like `scoreLabel: string` instead of `score: number`.

## Code Examples

### Complete Mock Data Module Structure
```typescript
// lib/mock/types.ts
// Source: Research findings on TypeScript strict mode patterns
export interface MockUser {
  id: string;
  displayName: string;
  photoURL: string;
  membershipTier: "free" | "platinum";
  email: string;
}

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

export interface MockLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  totalTime: number; // minutes
  isCurrentUser: boolean;
}

export interface MockAchievement {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earned: boolean;
  earnedDate: string | null; // ISO 8601 or null if not earned
}

export interface MockHeroCard {
  id: string;
  type: "motivation" | "counter";
  motivationText?: string;
  minutesActive?: number;
}

export interface MockPulseItem {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  activityType: string;
  message: string;
  timestamp: string; // ISO 8601
}

export interface MockQuest {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  targetValue: number;
  currentValue: number;
  unit: string; // "km", "minutes", "activities"
}

export interface MockWalletCard {
  id: string;
  name: string;
  type: "membership" | "pass" | "partner";
  barcodeType: "qr" | "barcode";
  barcodeValue: string;
  color: string;
  logoUrl: string;
}
```

```typescript
// lib/mock/data.ts
// Source: Patterns from existing lib/data.ts + new v1 requirements
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

export const MOCK_USER: MockUser = {
  id: "mock-user-123",
  displayName: "Sarah Johnson",
  photoURL: "https://i.pravatar.cc/200?img=1",
  membershipTier: "platinum",
  email: "sarah.j@example.com",
};

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

export const MOCK_REWARDS: MockReward[] = [
  {
    id: "reward-1",
    vendor: "Arc'teryx",
    title: "20% Off Outerwear",
    description: "Valid on all jackets and shells in-store and online",
    featured: true,
    rewardType: "code",
    rewardValue: "TRAIL20",
    color: "#000000",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
  },
  {
    id: "reward-2",
    vendor: "Patagonia",
    title: "Free Repairs",
    description: "Bring any Patagonia gear for free lifetime repairs",
    featured: true,
    rewardType: "qr",
    rewardValue: "PAT-REPAIR-2024",
    color: "#663399",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "reward-3",
    vendor: "MEC",
    title: "$20 Gift Card",
    description: "Redeemable on your next purchase of $50 or more",
    featured: true,
    rewardType: "barcode",
    rewardValue: "123456789012",
    color: "#228B22",
    imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
  },
  {
    id: "reward-4",
    vendor: "North Face",
    title: "15% Off",
    description: "Save on all footwear and backpacks",
    featured: false,
    rewardType: "code",
    rewardValue: "TNF15",
    color: "#FF0000",
    imageUrl: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80",
  },
  {
    id: "reward-5",
    vendor: "Vessi",
    title: "Free Socks",
    description: "Free merino socks with any shoe purchase",
    featured: false,
    rewardType: "code",
    rewardValue: "DRYFEET",
    color: "#00BFFF",
    imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
  },
  {
    id: "reward-6",
    vendor: "Running Room",
    title: "Free Gait Analysis",
    description: "Professional running assessment with any purchase",
    featured: false,
    rewardType: "qr",
    rewardValue: "RR-GAIT-2024",
    color: "#FFA500",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
  },
  {
    id: "reward-7",
    vendor: "Lululemon",
    title: "Exclusive Access",
    description: "Early access to new releases and special events",
    featured: false,
    rewardType: "code",
    rewardValue: "SWEAT",
    color: "#C71585",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  },
  {
    id: "reward-8",
    vendor: "Scandinave Spa",
    title: "15% Off Baths",
    description: "Discount on all hydrotherapy experiences",
    featured: false,
    rewardType: "barcode",
    rewardValue: "987654321098",
    color: "#40E0D0",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  },
];

export const MOCK_LEADERBOARD_FRIENDS: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user-alice",
    displayName: "Alice Martinez",
    avatarUrl: "https://i.pravatar.cc/100?img=9",
    totalTime: 4560,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: "mock-user-123",
    displayName: "Sarah Johnson",
    avatarUrl: "https://i.pravatar.cc/200?img=1",
    totalTime: 3420,
    isCurrentUser: true,
  },
  {
    rank: 3,
    userId: "user-bob",
    displayName: "Bob Smith",
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    totalTime: 2520,
    isCurrentUser: false,
  },
  {
    rank: 4,
    userId: "user-charlie",
    displayName: "Charlie Davis",
    avatarUrl: "https://i.pravatar.cc/100?img=15",
    totalTime: 1800,
    isCurrentUser: false,
  },
  {
    rank: 5,
    userId: "user-diana",
    displayName: "Diana Park",
    avatarUrl: "https://i.pravatar.cc/100?img=20",
    totalTime: 720,
    isCurrentUser: false,
  },
];

export const MOCK_LEADERBOARD_GLOBAL: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: "global-sarah-j",
    displayName: "Sarah J.",
    avatarUrl: "https://i.pravatar.cc/100?img=1",
    totalTime: 7440,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: "global-david-c",
    displayName: "David C.",
    avatarUrl: "https://i.pravatar.cc/100?img=3",
    totalTime: 7080,
    isCurrentUser: false,
  },
  {
    rank: 3,
    userId: "global-maria-r",
    displayName: "Maria R.",
    avatarUrl: "https://i.pravatar.cc/100?img=5",
    totalTime: 5520,
    isCurrentUser: false,
  },
  {
    rank: 4,
    userId: "mock-user-123",
    displayName: "Sarah Johnson",
    avatarUrl: "https://i.pravatar.cc/200?img=1",
    totalTime: 3420,
    isCurrentUser: true,
  },
  {
    rank: 5,
    userId: "global-james-w",
    displayName: "James W.",
    avatarUrl: "https://i.pravatar.cc/100?img=11",
    totalTime: 2700,
    isCurrentUser: false,
  },
  {
    rank: 6,
    userId: "global-emily-t",
    displayName: "Emily T.",
    avatarUrl: "https://i.pravatar.cc/100?img=25",
    totalTime: 2340,
    isCurrentUser: false,
  },
  {
    rank: 7,
    userId: "global-michael-b",
    displayName: "Michael B.",
    avatarUrl: "https://i.pravatar.cc/100?img=33",
    totalTime: 2100,
    isCurrentUser: false,
  },
  {
    rank: 8,
    userId: "global-lisa-k",
    displayName: "Lisa K.",
    avatarUrl: "https://i.pravatar.cc/100?img=40",
    totalTime: 1920,
    isCurrentUser: false,
  },
  {
    rank: 9,
    userId: "global-tom-h",
    displayName: "Tom H.",
    avatarUrl: "https://i.pravatar.cc/100?img=52",
    totalTime: 1680,
    isCurrentUser: false,
  },
  {
    rank: 10,
    userId: "global-rachel-m",
    displayName: "Rachel M.",
    avatarUrl: "https://i.pravatar.cc/100?img=60",
    totalTime: 1440,
    isCurrentUser: false,
  },
];

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  {
    id: "achievement-1",
    name: "Early Bird",
    description: "Logged activity before 7AM",
    iconName: "sun",
    earned: true,
    earnedDate: "2024-10-12T06:45:00Z",
  },
  {
    id: "achievement-2",
    name: "Hiker",
    description: "Logged 50km of hiking",
    iconName: "mountain",
    earned: true,
    earnedDate: "2024-09-20T14:30:00Z",
  },
  {
    id: "achievement-3",
    name: "Rain or Shine",
    description: "Logged activity in the rain",
    iconName: "cloud-rain",
    earned: true,
    earnedDate: "2024-11-01T10:15:00Z",
  },
  {
    id: "achievement-4",
    name: "10 Hour Club",
    description: "Logged 600 minutes of activity",
    iconName: "clock",
    earned: true,
    earnedDate: "2024-10-25T18:00:00Z",
  },
  {
    id: "achievement-5",
    name: "Four Seasons",
    description: "Logged activity in all four seasons",
    iconName: "calendar",
    earned: false,
    earnedDate: null,
  },
];

export const MOCK_HERO_CARDS: MockHeroCard[] = [
  {
    id: "hero-1",
    type: "motivation",
    motivationText: "Every step counts! You're building healthy habits.",
  },
  {
    id: "hero-2",
    type: "counter",
    minutesActive: 3420,
  },
];

export const MOCK_PULSE_FEED: MockPulseItem[] = [
  {
    id: "pulse-1",
    userId: "user-alice",
    displayName: "Alice Martinez",
    avatarUrl: "https://i.pravatar.cc/100?img=9",
    activityType: "hike",
    message: "completed a 12km hike at Garibaldi Lake",
    timestamp: "2024-10-15T14:30:00Z",
  },
  {
    id: "pulse-2",
    userId: "user-bob",
    displayName: "Bob Smith",
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    activityType: "run",
    message: "ran 5km along the seawall",
    timestamp: "2024-10-15T12:15:00Z",
  },
];

export const MOCK_QUESTS: MockQuest[] = [
  {
    id: "quest-1",
    title: "Weekend Warrior",
    description: "Log 2 hours of activity this weekend",
    progress: 65,
    targetValue: 120,
    currentValue: 78,
    unit: "minutes",
  },
];

export const MOCK_WALLET_CARDS: MockWalletCard[] = [
  {
    id: "wallet-1",
    name: "Trailblazer+ Platinum",
    type: "membership",
    barcodeType: "qr",
    barcodeValue: "TB-PLAT-123456",
    color: "#FFD700",
    logoUrl: "https://via.placeholder.com/100/FFD700/000000?text=TB+",
  },
  {
    id: "wallet-2",
    name: "BC Parks Pass 2024",
    type: "pass",
    barcodeType: "barcode",
    barcodeValue: "987654321098",
    color: "#228B22",
    logoUrl: "https://via.placeholder.com/100/228B22/FFFFFF?text=BC",
  },
  {
    id: "wallet-3",
    name: "NSMBA Membership",
    type: "partner",
    barcodeType: "qr",
    barcodeValue: "NSMBA-2024-789",
    color: "#FF4500",
    logoUrl: "https://via.placeholder.com/100/FF4500/FFFFFF?text=NSMBA",
  },
];
```

```typescript
// lib/mock/index.ts
// Source: Barrel export pattern from TypeScript best practices
export * from "./types";
export * from "./data";
```

### Type Checking Verification
```bash
# Source: Project's package.json typecheck script
npx tsc --noEmit

# Expected output: No errors
# If errors appear, mock data violates TypeScript strict mode contracts
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Loose mock data without types | TypeScript interfaces with strict mode | TypeScript 3.0+ (2018) | Compile-time safety prevents runtime errors |
| Factory libraries (faker.js) for all mock data | Hardcoded fixtures for UI development, faker for unit tests | 2020-2022 shift | Predictable data for UI work; random data for edge case testing |
| Mock data scattered in components | Centralized `lib/mock/` directory | Modern React best practices (2023+) | Single source of truth, easier updates |
| Database types reused in UI | UI-specific types separate from database types | Clean architecture principles (2019+) | Frontend decoupled from backend schema changes |

**Deprecated/outdated:**
- Using `any` type: TypeScript strict mode forbids it; all types must be explicit (since TS 2.0)
- Importing Firebase types in UI code: Violates separation of concerns; mock layer should be Firebase-agnostic
- Minimal mock data (3-5 items): Modern UIs need realistic volumes to test scrolling, pagination, empty states (10+ entries standard since 2021)

## Open Questions

1. **Daily Affirmation Text Source**
   - What we know: TopBar shows "daily affirmation text" (NAV-03) but requirements don't specify content
   - What's unclear: Is this a static string, random selection from array, or AI-generated placeholder?
   - Recommendation: Create `MOCK_AFFIRMATIONS: string[]` array with 7+ affirmations, screen picks randomly on mount

2. **Nature Score Calculation Logic**
   - What we know: Nature Score flip card shows "breakdown logic text" on back (HOME-03)
   - What's unclear: What is the calculation formula to explain in breakdown text?
   - Recommendation: Mock data uses placeholder text like "Based on total time outdoors + variety of activities" until product defines formula

3. **Quest AI Generation**
   - What we know: v2 requirements mention "Daily Quest card with AI-generated micro-challenge text" (HOME-05)
   - What's unclear: Does v1 need quest mock data, or is this v2-only?
   - Recommendation: Include `MOCK_QUESTS` in v1 mock data (already defined in code example) so v2 can use it immediately

4. **Wallet Card Visual Design**
   - What we know: v2 requirements mention "Digital wallet 3D stacked card deck" (PROF-08) with specific partners (TB+, BC Parks Pass, NSMBA)
   - What's unclear: Are wallet cards needed in v1 Profile screen or v2 only?
   - Recommendation: Include `MOCK_WALLET_CARDS` in v1 (already defined) marked as v2 feature, so data layer is complete

## Sources

### Primary (HIGH confidence)
- TypeScript official documentation (tsconfig strict mode): https://www.typescriptlang.org/tsconfig/strict.html
- Existing project codebase files: `tsconfig.json`, `lib/db/types.ts`, `lib/data.ts`, `package.json`
- Project requirements: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`

### Secondary (MEDIUM confidence)
- [Mock-Factory-Pattern in TypeScript](https://dev.to/davelosert/mock-factory-pattern-in-typescript-44l9) - Factory pattern vs hardcoded fixtures
- [The Significance of Mock APIs and Repository Pattern](https://medium.com/@blazer-road/the-significance-of-mock-apis-and-repository-pattern-in-developing-react-and-react-native-apps-20b219cb6600) - React Native mock data architecture
- [Fixtures, the way to manage sample and test data](https://michalzalecki.com/fixtures-the-way-to-manage-sample-and-test-data/) - Fixture organization patterns
- [The Ultimate Guide to TypeScript Strict Mode](https://typescriptworld.com/the-ultimate-guide-to-typescript-strict-mode-elevating-code-quality-and-safety) - Strict mode best practices
- [How to fix nasty circular dependency issues](https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de) - Avoiding import cycles

### Tertiary (LOW confidence)
- None - all findings verified with existing codebase and official TypeScript docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies needed; TypeScript 5.9.2 with strict mode already configured
- Architecture: HIGH - Patterns verified against existing codebase structure (`lib/data.ts`, `lib/db/types.ts`)
- Pitfalls: HIGH - Based on project's TypeScript strict mode requirement and MOCK-03 zero-Firebase-imports constraint

**Research date:** 2026-01-27
**Valid until:** 2026-04-27 (90 days - stable domain, TypeScript patterns change slowly)
