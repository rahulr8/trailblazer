# Architecture Patterns: React Native UI Rebuild

**Project:** Trailblazer+ UI Rebuild
**Domain:** React Native / Expo Router navigation restructure + mock data layer + card-heavy dashboard
**Researched:** 2026-01-27
**Confidence:** HIGH

## Recommended Architecture

This architecture supports a clean separation between UI (using mock data) and future backend integration (Firebase), with minimal refactoring required when swapping data sources.

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    App Shell (_layout.tsx)                   │
│  Provider Hierarchy: Gesture → HeroUI → Theme → Auth        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Navigation Layer (Expo Router)                  │
│  • 3 Tabs: Home, Your Stash, Your Squad                     │
│  • Standalone Routes: Profile, Chat                          │
│  • Custom Tab Bar with Parker FAB overlay                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Screen Layer                             │
│  • Tab Screens: index, stash, squad                         │
│  • Full Routes: profile, chat                               │
│  • Modals: log-activity, reward-detail, add-friend          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Component Layer                             │
│  • Shared: TopBar, ParkerFAB, FlipCard                      │
│  • Feature: home/, stash/, squad/, profile/                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  Phase 1 (UI-only):  lib/mock/                              │
│  Phase 2 (Backend):  lib/db/ + lib/health/                  │
│  (Swap imports, screens unchanged)                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Boundaries

### Core Layout Components

| Component | Responsibility | Communicates With | Ownership |
|-----------|---------------|-------------------|-----------|
| `app/_layout.tsx` | Provider hierarchy, auth-based routing | Auth context, Router | App shell |
| `app/(tabs)/_layout.tsx` | Tab navigation config, custom tab bar with FAB | TabList, TabSlot from expo-router/ui | Navigation |
| `components/TopBar.tsx` | Universal header (affirmation + date + avatar) | Router (profile navigation), Mock user data | Shared |
| `components/ParkerFAB.tsx` | Floating AI chat button, always visible | Router (chat navigation) | Shared |

### Screen Components

| Screen | Responsibility | Data Dependencies | Key Children |
|--------|---------------|-------------------|--------------|
| `app/(tabs)/index.tsx` | Home dashboard assembly | `MOCK_STATS`, `MOCK_USER`, `MOCK_DAILY_QUEST`, `MOCK_GIVEAWAY`, `MOCK_FRIENDS_LEADERBOARD` | HeroSwiper, StatsGrid, DailyQuestCard, LeaderboardPreview, GrandPrizeCard |
| `app/(tabs)/stash.tsx` | Rewards catalog | `MOCK_REWARDS` | FeaturedRewardsCarousel, RewardsGrid |
| `app/(tabs)/squad.tsx` | Social feed + leaderboard | `MOCK_PULSE_ITEMS`, `MOCK_FRIENDS_LEADERBOARD`, `MOCK_GLOBAL_LEADERBOARD` | MotivationBanner, TBPulse, LeaderboardWidget |
| `app/profile.tsx` | User profile + settings | `MOCK_USER`, `MOCK_LIFETIME_STATS`, `MOCK_WALLET_CARDS`, `MOCK_ACHIEVEMENTS` | HeroIdentity, DigitalWallet, LifetimeStatsGrid, AchievementsRow |

### Feature Components (Domain-Specific)

| Component | Responsibility | Props | State Management |
|-----------|---------------|-------|------------------|
| `components/shared/FlipCard.tsx` | Reusable 3D flip animation | `front`, `back`, `onFlip?` | Local `useSharedValue` for flip state |
| `components/home/HeroSwiper.tsx` | 2-card horizontal swiper | `motivationTexts[]`, `minutesActive` | Local gesture state + scroll position |
| `components/home/StatsGrid.tsx` | 2-column flip card grid | `currentStreak`, `personalBest`, `natureScore`, `scoreBreakdown` | Delegates flip to FlipCard |
| `components/profile/DigitalWallet.tsx` | 3D stacked card deck | `cards[]` | Local state for active card + flip state |
| `components/stash/FeaturedRewardsCarousel.tsx` | Horizontal reward cards | `rewards[]`, `onRewardPress` | Scroll position for page dots |
| `components/squad/LeaderboardWidget.tsx` | Friends/Global leaderboard toggle | `friendsData[]`, `globalData[]`, `currentUserId` | Local toggle state (Friends/Global) |

### Modal Components

| Modal | Trigger | Presentation | Data Flow |
|-------|---------|--------------|-----------|
| `app/(modals)/log-activity.tsx` | "+" FAB on Home | Bottom sheet (85% snap) | Local state (activity type, duration, timer) → no-op save |
| `app/(modals)/reward-detail.tsx` | Reward card tap | Bottom sheet (60% snap) | Receives `reward` object → displays QR/barcode/coupon |
| `app/(modals)/add-friend.tsx` | UserPlus icon on Squad | Bottom sheet (50% snap) | Local state (email input) → no-op invite |

## Data Flow

### Phase 1: UI-Only (Current Milestone)

```
lib/mock/data.ts
  ↓ (import)
Screen Component (e.g., app/(tabs)/index.tsx)
  ↓ (pass as props)
Feature Components (e.g., components/home/StatsGrid.tsx)
  ↓ (render)
UI Elements
```

**Key Principle:** All screens import from `@/lib/mock` ONLY. No Firebase, no HealthKit imports.

**Example:**
```typescript
// app/(tabs)/index.tsx
import { MOCK_STATS, MOCK_USER } from '@/lib/mock';

export default function HomeScreen() {
  return (
    <ScrollView>
      <TopBar user={MOCK_USER} />
      <StatsGrid
        currentStreak={MOCK_STATS.streak}
        personalBest={MOCK_STATS.personalBestStreak}
      />
    </ScrollView>
  );
}
```

### Phase 2: Backend Integration (Future Milestone)

```
lib/db/users.ts (Firebase Firestore)
  ↓ (async fetch)
Screen Component (e.g., app/(tabs)/index.tsx)
  ↓ (pass as props)
Feature Components (unchanged)
  ↓ (render)
UI Elements (unchanged)
```

**Migration Pattern:**
```typescript
// Phase 1 (UI-only):
import { MOCK_STATS } from '@/lib/mock';
const stats = MOCK_STATS;

// Phase 2 (Backend):
import { getUserStats } from '@/lib/db/users';
const stats = await getUserStats(uid);

// Feature components receive same data shape, zero changes required
<StatsGrid currentStreak={stats.streak} personalBest={stats.personalBestStreak} />
```

### Mock Data Structure

**File Organization:**
```
lib/mock/
├── types.ts        # UI-specific interfaces (MockUser, MockStats, etc.)
├── data.ts         # All hardcoded constants (MOCK_USER, MOCK_STATS, etc.)
└── index.ts        # Re-exports for clean imports
```

**Type Alignment Strategy:**
- Mock types mirror Firebase types but with simpler serialization (no Timestamps)
- Conversion layer is trivial: `{ ...firestoreUser, createdAt: user.createdAt.toDate() }`
- Screens only see plain JavaScript objects, never Firestore-specific types

## Patterns to Follow

### Pattern 1: Custom Tab Bar with FAB Overlay

**What:** Expo Router custom tabs with a non-tab floating action button (Parker FAB)

**When:** Need to add UI elements to tab bar that aren't standard tabs

**Implementation:**
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { ParkerFAB } from '@/components/ParkerFAB';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { height: 88 },
          // Standard 3 tabs: Home, Your Stash, Your Squad
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="stash" options={{ title: "Your Stash" }} />
        <Tabs.Screen name="squad" options={{ title: "Your Squad" }} />
      </Tabs>

      {/* Parker FAB overlays tab bar */}
      <ParkerFAB />
    </>
  );
}

// components/ParkerFAB.tsx
export function ParkerFAB() {
  return (
    <Pressable
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 96 : 72, // Above tab bar
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        // Shadow, gradient, bear icon
      }}
      onPress={() => router.push('/chat')}
    >
      {/* Bear icon */}
    </Pressable>
  );
}
```

**Why this works:**
- Tabs component renders the tab bar
- ParkerFAB is a sibling, positioned absolutely above the tab bar
- FAB is visible on all tabs without being a tab itself
- Clean separation of concerns

**Sources:**
- [Expo Router Custom Tabs Documentation](https://docs.expo.dev/router/advanced/custom-tabs/)
- [How to Build Custom Tabs with Expo Router UI](https://expo.dev/blog/how-to-build-custom-tabs-with-expo-router-ui)

### Pattern 2: Repository Pattern with Mock Swap

**What:** Centralized data access layer that can swap between mock and real implementations

**When:** Building UI before backend is ready, need clean migration path

**Implementation:**
```typescript
// lib/mock/types.ts
export interface UserRepository {
  getCurrentUser(): Promise<MockUser>;
  getStats(): Promise<MockStats>;
}

// lib/mock/repository.ts (Phase 1)
export const mockUserRepository: UserRepository = {
  async getCurrentUser() {
    return MOCK_USER;
  },
  async getStats() {
    return MOCK_STATS;
  },
};

// lib/db/repository.ts (Phase 2, future)
export const firebaseUserRepository: UserRepository = {
  async getCurrentUser() {
    const user = await getCurrentUser();
    return convertFirebaseUser(user);
  },
  async getStats() {
    const stats = await getUserStats(uid);
    return stats;
  },
};

// app/(tabs)/index.tsx
// Phase 1:
import { mockUserRepository as userRepo } from '@/lib/mock/repository';

// Phase 2 (one-line change):
import { firebaseUserRepository as userRepo } from '@/lib/db/repository';

// Rest of component unchanged:
const user = await userRepo.getCurrentUser();
const stats = await userRepo.getStats();
```

**Why this works:**
- Screens depend on interface, not implementation
- Mock and Firebase repos implement same interface
- Migration is a single import swap per screen
- Testing becomes trivial (inject mock repo)

**Sources:**
- [Understanding Dependency Injection in React Native](https://medium.com/@mr.kashif.samman/understanding-dependency-injection-in-react-native-patterns-and-benefits-c5f95f11a838)
- [Clean Architecture in React Native: Beyond the Basics](https://medium.com/@sharmapraveen91/clean-architecture-in-react-native-beyond-the-basics-c5894e6a78c7)

### Pattern 3: Reusable Flip Card Animation

**What:** Shared 3D flip card component using React Native Reanimated

**When:** Multiple screens need flip card UI (stats, giveaway, grand prize, wallet)

**Implementation:**
```typescript
// components/shared/FlipCard.tsx
import { useSharedValue, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  height?: number;
}

export function FlipCard({ front, back, height = 200 }: FlipCardProps) {
  const isFlipped = useSharedValue(false);

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      isFlipped.value ? 1 : 0,
      [0, 1],
      [0, 180]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      isFlipped.value ? 1 : 0,
      [0, 1],
      [180, 360]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
    };
  });

  const handleFlip = () => {
    isFlipped.value = withTiming(isFlipped.value ? 0 : 1, { duration: 400 });
  };

  return (
    <Pressable onPress={handleFlip} style={{ height }}>
      <Animated.View style={frontStyle}>
        {front}
      </Animated.View>
      <Animated.View style={backStyle}>
        {back}
      </Animated.View>
    </Pressable>
  );
}

// Usage in components/home/StatsGrid.tsx:
<FlipCard
  front={<StreakFrontCard streak={12} />}
  back={<StreakBackCard personalBest={27} />}
  height={160}
/>
```

**Why this works:**
- `useSharedValue` prevents re-renders, runs on UI thread
- `interpolate` handles rotation math cleanly
- `perspective` creates 3D depth effect
- `backfaceVisibility: 'hidden'` prevents reverse-side rendering artifacts
- Component encapsulates all flip logic, screens just pass content

**Sources:**
- [React Native Reanimated Flip Card Official Example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/)
- [Creating a 3D Animated Flip Card Component in React Native with Reanimated](https://medium.com/@gm_99/creating-a-3d-animated-flip-card-component-in-react-native-with-reanimated-d67ba35193af)

### Pattern 4: Feature-Based Component Organization

**What:** Group components by feature/screen domain, not by type

**When:** Managing 40+ components across multiple screens

**Recommended Structure:**
```
components/
├── shared/              # Global reusable (TopBar, ParkerFAB, FlipCard)
│   ├── TopBar.tsx
│   ├── ParkerFAB.tsx
│   └── FlipCard.tsx
├── home/               # Home screen-specific
│   ├── HeroSwiper.tsx
│   ├── StatsGrid.tsx
│   ├── DailyQuestCard.tsx
│   ├── WeeklyGiveawayCard.tsx
│   ├── LeaderboardPreview.tsx
│   ├── HealthTipCard.tsx
│   └── GrandPrizeCard.tsx
├── stash/              # Your Stash screen-specific
│   ├── FeaturedRewardsCarousel.tsx
│   └── RewardsGrid.tsx
├── squad/              # Your Squad screen-specific
│   ├── MotivationBanner.tsx
│   ├── TBPulse.tsx
│   └── LeaderboardWidget.tsx
└── profile/            # Profile screen-specific
    ├── HeroIdentity.tsx
    ├── DigitalWallet.tsx
    ├── CoachPersonalityPicker.tsx
    ├── LifetimeStatsGrid.tsx
    ├── AchievementsRow.tsx
    ├── AppThemePicker.tsx
    └── ProfileActions.tsx
```

**Import Conventions:**
```typescript
// From screen:
import { HeroSwiper } from '@/components/home/HeroSwiper';
import { StatsGrid } from '@/components/home/StatsGrid';

// From shared:
import { TopBar } from '@/components/shared/TopBar';
import { FlipCard } from '@/components/shared/FlipCard';
```

**Why this works:**
- Clear locality: "Where is the leaderboard widget?" → `components/squad/`
- Prevents "mega components folder" with 40+ flat files
- Easy to refactor: move entire `home/` folder if extracting to separate package
- Mirrors screen structure in app/
- Shared components clearly identified in `/shared`

**When to promote to shared:**
- Component used by 2+ feature folders
- Component has no domain-specific logic
- Component is a UI primitive (buttons, cards, animations)

**Sources:**
- [How to Organize Your Components in React Native](https://dev.to/paulocappa/how-to-organize-your-components-in-react-native-folder-structure-and-project-organization-1hke)
- [4 Folder Structures to Organize Your React Project](https://reboot.studio/blog/folder-structures-to-organize-react-project)
- [React App Feature-Based Folder Structure Guide](https://ahmad2point0.medium.com/react-app-feature-based-folder-structure-guide-848ddc7447d5)

### Pattern 5: Standalone Route Access Pattern

**What:** Profile as a full-screen route accessible from any tab, not a tab itself

**When:** Screen needs to be accessed from multiple places but shouldn't be in tab bar

**Implementation:**
```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen
    name="profile"
    options={{
      presentation: 'card', // iOS native card modal
      headerShown: true,
      headerTitle: 'Profile',
    }}
  />
</Stack>

// Navigate from any tab via TopBar avatar tap:
// components/shared/TopBar.tsx
<Pressable onPress={() => router.push('/profile')}>
  <Avatar source={{ uri: user.avatarUrl }} />
</Pressable>

// Back button is automatic (iOS: swipe right, Android: back button)
```

**Why this works:**
- Profile is a Stack screen at root level, peers with `(tabs)`
- When pushed, it overlays tabs (tabs remain in background)
- Native back gesture works automatically
- No tab bar visible on profile screen
- Accessible from Home, Stash, Squad via shared TopBar component

**Sources:**
- [Expo Router Stack Documentation](https://docs.expo.dev/router/advanced/stack/)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Importing Firebase in Screen Components

**What:** Directly importing `lib/db/*` or Firebase SDK in screen files during UI-only phase

**Why bad:**
- Creates coupling between UI and backend
- Forces async data fetching logic into screens
- Makes future backend changes require screen modifications
- Breaks clean separation of concerns

**Instead:**
```typescript
// ❌ BAD - Couples screen to Firebase
import { getUserStats } from '@/lib/db/users';

export default function HomeScreen() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    getUserStats(uid).then(setStats); // Backend call in screen
  }, [uid]);
}

// ✅ GOOD - Screen uses data layer abstraction
import { MOCK_STATS } from '@/lib/mock';

export default function HomeScreen() {
  const stats = MOCK_STATS; // Clean mock data
}

// Future: swap to repository pattern, screen unchanged
```

### Anti-Pattern 2: Duplicating Flip Logic Across Components

**What:** Copy-pasting flip card animation code into multiple components

**Why bad:**
- Violates DRY principle
- Bugs in flip animation require fixing in 4+ places
- Inconsistent animation timing across screens
- Hard to change animation behavior globally

**Instead:**
Extract to `components/shared/FlipCard.tsx` (see Pattern 3)

### Anti-Pattern 3: Flat Component Directory

**What:** All 40+ components in a single `components/` folder

**Why bad:**
```
components/
├── HeroSwiper.tsx
├── StatsGrid.tsx
├── DailyQuestCard.tsx
├── FeaturedRewardsCarousel.tsx
├── RewardsGrid.tsx
├── MotivationBanner.tsx
├── TBPulse.tsx
├── LeaderboardWidget.tsx
├── HeroIdentity.tsx
├── DigitalWallet.tsx
... (30+ more files)
```

- Hard to find components
- No clear ownership
- Difficult to understand component relationships
- Refactoring becomes risky

**Instead:**
Use feature-based folders (see Pattern 4)

### Anti-Pattern 4: Tab Bar FAB as a Real Tab

**What:** Adding Parker FAB as a 4th tab with href: null or dummy route

**Why bad:**
- Parker is not a tab destination, it's a global action
- Tab bar semantics broken (user expects 3 destinations, gets 4 clickable items)
- Visual design shows FAB floating above tab bar, not inline
- Accessibility: screen readers announce it as a tab

**Instead:**
Render ParkerFAB as absolute-positioned sibling to Tabs component (see Pattern 1)

### Anti-Pattern 5: Mixing Mock and Real Data in Same Screen

**What:** Using `MOCK_USER` for some fields and `getUserStats(uid)` for others

**Why bad:**
- Data source ambiguity
- Impossible to know what's real vs fake during development
- Migration becomes error-prone (which imports to change?)
- Testing becomes unreliable

**Instead:**
ALL data from `@/lib/mock` in Phase 1. Zero Firebase imports. Clean boundary.

## Scalability Considerations

| Concern | Current (UI-only) | With Backend | At Scale (10K+ users) |
|---------|-------------------|--------------|----------------------|
| Data Fetching | Synchronous mock imports | `useEffect` + async Firebase calls | React Query / SWR for caching + optimistic updates |
| State Management | Local `useState` per screen | Context for global user state | Zustand or Redux for complex state trees |
| Animation Performance | Reanimated on UI thread | Same (animations independent of data) | Memoize expensive calculations, lazy load components |
| Component Re-renders | Minimal (mock data never changes) | Controlled via `useMemo` / `React.memo` | Virtualized lists for long feeds (FlashList) |
| Navigation State | Expo Router manages | Same | Persist navigation state in AsyncStorage for deep linking |

## Build Order (Dependency-Driven)

Based on component dependencies, build in this order:

### Phase 1: Foundation (No Dependencies)
1. `lib/mock/types.ts` — Define all interfaces first
2. `lib/mock/data.ts` — Populate mock constants
3. `lib/constants/` — Navigation, themes, coach personalities

### Phase 2: Shared Components (Foundation Dependencies)
4. `components/shared/FlipCard.tsx` — Needs: Reanimated
5. `components/shared/TopBar.tsx` — Needs: mock types
6. `components/shared/ParkerFAB.tsx` — Needs: router

### Phase 3: Navigation Shell (Shared Dependencies)
7. `app/(tabs)/_layout.tsx` — Restructure tabs (3 tabs + FAB)
8. `app/_layout.tsx` — Add profile route

### Phase 4: Feature Components (Parallel - Shared Dependencies)

**Home Domain:**
9. `components/home/HeroSwiper.tsx`
10. `components/home/StatsGrid.tsx` — Depends on: FlipCard
11. `components/home/DailyQuestCard.tsx`
12. `components/home/WeeklyGiveawayCard.tsx` — Depends on: FlipCard
13. `components/home/LeaderboardPreview.tsx`
14. `components/home/HealthTipCard.tsx`
15. `components/home/GrandPrizeCard.tsx` — Depends on: FlipCard

**Stash Domain:**
16. `components/stash/FeaturedRewardsCarousel.tsx`
17. `components/stash/RewardsGrid.tsx`

**Squad Domain:**
18. `components/squad/MotivationBanner.tsx`
19. `components/squad/TBPulse.tsx`
20. `components/squad/LeaderboardWidget.tsx`

**Profile Domain:**
21. `components/profile/HeroIdentity.tsx`
22. `components/profile/DigitalWallet.tsx` — Depends on: FlipCard
23. `components/profile/CoachPersonalityPicker.tsx`
24. `components/profile/LifetimeStatsGrid.tsx`
25. `components/profile/AchievementsRow.tsx`
26. `components/profile/AppThemePicker.tsx`
27. `components/profile/ProfileActions.tsx`

### Phase 5: Screens (Feature Component Dependencies)
28. `app/(tabs)/index.tsx` — Home screen assembly
29. `app/(tabs)/stash.tsx` — Your Stash assembly
30. `app/(tabs)/squad.tsx` — Your Squad assembly
31. `app/profile.tsx` — Profile assembly

### Phase 6: Modals (Screen Context Dependencies)
32. `app/(modals)/log-activity.tsx` — Rebuild with Manual/Timer tabs
33. `app/(modals)/reward-detail.tsx` — Update for QR/barcode display
34. `app/(modals)/add-friend.tsx` — New modal

### Phase 7: Onboarding (Independent)
35. `app/onboarding.tsx` — Can build in parallel with Phase 4-6

### Parallelization Opportunities:
- **Phases 4-6 can run in parallel** if multiple developers working
- Home, Stash, Squad screens share no components (except TopBar/FlipCard)
- Profile is independent until final assembly

## Migration Path to Backend

When ready to integrate Firebase:

**Step 1:** Create repository interfaces in `lib/db/repository.ts` matching mock signatures

**Step 2:** Per screen, swap imports:
```typescript
// Before:
import { MOCK_USER, MOCK_STATS } from '@/lib/mock';

// After:
import { useUserRepository } from '@/lib/db/repository';
const { user, stats } = useUserRepository();
```

**Step 3:** Add loading states:
```typescript
const { user, stats, isLoading } = useUserRepository();

if (isLoading) return <LoadingSpinner />;
```

**Step 4:** Add error handling:
```typescript
const { user, stats, isLoading, error } = useUserRepository();

if (error) return <ErrorView error={error} />;
```

**Critical:** Component JSX remains 95% unchanged. Only data sourcing changes.

## Open Questions for Phase-Specific Research

These will likely need investigation during implementation:

1. **Parker FAB Positioning:** Does `position: absolute` FAB work reliably on both iOS/Android with safe area insets? May need platform-specific adjustments.

2. **FlipCard Performance:** At 60 FPS target, will flip animation perform smoothly on mid-range Android devices? May need to adjust timing or reduce complexity.

3. **Digital Wallet Stack:** 3D stacked cards with bring-to-front + flip is complex. May need custom gesture handling beyond basic `Pressable`.

4. **Expo Router Custom Tabs:** Does the custom tab bar pattern support accessibility labels correctly? Need to test with screen readers.

5. **Mock Data Size:** If leaderboards grow to 100+ entries, will synchronous mock imports cause jank? May need to simulate async loading even with mocks.

## Sources

**Navigation & Routing:**
- [Expo Router Custom Tabs Documentation](https://docs.expo.dev/router/advanced/custom-tabs/)
- [Expo Router Stack Documentation](https://docs.expo.dev/router/advanced/stack/)
- [How to Build Custom Tabs with Expo Router UI](https://expo.dev/blog/how-to-build-custom-tabs-with-expo-router-ui)

**Mock Data Architecture:**
- [Understanding Dependency Injection in React Native](https://medium.com/@mr.kashif.samman/understanding-dependency-injection-in-react-native-patterns-and-benefits-c5f95f11a838)
- [Clean Architecture in React Native: Beyond the Basics](https://medium.com/@sharmapraveen91/clean-architecture-in-react-native-beyond-the-basics-c5894e6a78c7)
- [Dependency Injection in React (Code Driven Development)](https://codedrivendevelopment.com/posts/dependency-injection-in-react)

**Component Organization:**
- [How to Organize Your Components in React Native](https://dev.to/paulocappa/how-to-organize-your-components-in-react-native-folder-structure-and-project-organization-1hke)
- [4 Folder Structures to Organize Your React Project](https://reboot.studio/blog/folder-structures-to-organize-react-project)
- [React App Feature-Based Folder Structure Guide](https://ahmad2point0.medium.com/react-app-feature-based-folder-structure-guide-848ddc7447d5)

**Animations:**
- [React Native Reanimated Flip Card Official Example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/)
- [Creating a 3D Animated Flip Card Component in React Native with Reanimated](https://medium.com/@gm_99/creating-a-3d-animated-flip-card-component-in-react-native-with-reanimated-d67ba35193af)
- [Shared Element Transitions - React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/3.x/shared-element-transitions/overview/)
