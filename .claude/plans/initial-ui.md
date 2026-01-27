# Initial UI Implementation Plan

## Overview

Build the complete Trailblazer+ UI from wireframes and user journey specs. This phase is **UI-only** — no backend integrations, no Firebase calls, no HealthKit, no AI APIs. All data is hardcoded mock data. Every screen must be production-quality, strongly typed TypeScript, and feel native on both iOS and Android.

**Design references:** `.claude/designs/` contains wireframe PNGs for each screen and two PDFs (TRA-13 User Journey, User Journeys UI Flow) that define every component, interaction, and overlay.

**Tech stack:** Expo 54, Expo Router, TypeScript (strict), Uniwind (Tailwind CSS v4), HeroUI Native, React Native Reanimated, React Native Gesture Handler, lucide-react-native icons.

---

## Critical Architectural Changes

The current codebase has 4 tabs (Home, Explore, Rewards, Profile) with Firebase/HealthKit integrations. The design specifies a fundamentally different structure:

### Navigation Restructure

**Current:** 4 bottom tabs — Home, Explore, Rewards, Profile
**Target:** 3 bottom tabs — Home, Your Stash, Your Squad + Parker FAB (bear icon, bottom-right)

- **Remove** the Explore tab entirely (not in design spec)
- **Rename** Rewards → "Your Stash" with new layout
- **Add** "Your Squad" tab (entirely new screen)
- **Remove** Profile as a tab — Profile is accessed by tapping the avatar in any screen's top bar
- **Add** Parker floating action button to the tab bar (bear icon, positioned at bottom-right of dock)
- The Home screen's "+" FAB for logging activity appears only on the Home tab

### Data Layer

Create a `lib/mock/` directory with all mock data centralized in typed files. No Firebase imports in any screen file. All screens read from mock data. This makes future backend integration a clean swap.

### Backend Code Handling

**Do NOT delete** existing Firebase, HealthKit, or auth code. Leave `lib/db/`, `lib/health/`, `contexts/auth-context.tsx`, and `firebase/` untouched. The new UI screens simply won't import from them. The `app/_layout.tsx` can keep the existing provider hierarchy but screens will use mock data instead of calling Firebase.

---

## Phase 1: Foundation & Mock Data

### 1.1 Create Mock Data Layer

Create `lib/mock/` with strongly typed mock data files:

**`lib/mock/types.ts`** — UI-specific types (not Firestore types):
```typescript
interface MockUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  membershipTier: "free" | "platinum";
  memberSince: string; // "Jan 2024"
}

interface MockStats {
  streak: number;
  personalBestStreak: number;
  natureScore: number;
  natureScoreBreakdown: string;
  minutesActive: number;
  minutesGoal: number;
}

interface MockLifetimeStats {
  daysActive: number;
  totalTime: string; // "142h"
  longestStreak: number;
  badgesEarned: number;
  friends: number;
  avgNatureScore: number;
}

interface MockReward {
  id: string;
  vendorName: string;
  rewardInfo: string;
  featured: boolean;
  couponCode?: string;
  barcodeValue?: string;
  qrValue?: string;
}

interface MockLeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalMinutes: number;
  rank: number;
  isCurrentUser: boolean;
}

interface MockPulseItem {
  id: string;
  text: string; // "Mike Chen completed 120 min hike"
  timestamp: string;
}

interface MockDailyQuest {
  title: string;
  description: string;
}

interface MockGiveaway {
  prize: string;
  requirement: string;
  entered: boolean;
}

interface MockWalletCard {
  id: string;
  title: string; // "Trailblazer+", "BC Parks Annual Pass", "NSMBA"
  color: string;
  barcodeValue: string;
  memberName: string;
  membershipType: string;
}

interface MockAchievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}
```

**`lib/mock/data.ts`** — All hardcoded data, exported as typed constants:
- `MOCK_USER: MockUser`
- `MOCK_STATS: MockStats`
- `MOCK_LIFETIME_STATS: MockLifetimeStats`
- `MOCK_REWARDS: MockReward[]` (at least 8 rewards, 2-3 featured)
- `MOCK_FRIENDS_LEADERBOARD: MockLeaderboardEntry[]` (5-7 entries)
- `MOCK_GLOBAL_LEADERBOARD: MockLeaderboardEntry[]` (10 entries)
- `MOCK_PULSE_ITEMS: MockPulseItem[]` (4-5 recent notifications)
- `MOCK_DAILY_QUEST: MockDailyQuest`
- `MOCK_GIVEAWAY: MockGiveaway`
- `MOCK_WALLET_CARDS: MockWalletCard[]` (3 cards: TB+, BC Parks Pass, NSMBA)
- `MOCK_ACHIEVEMENTS: MockAchievement[]` (5 achievements per wireframe: "10 hrs in nature", "Early Bird", "Hiker", "Rain or Shine", "Four Seasons")
- `MOCK_MOTIVATION_TEXTS: string[]` (array of motivational quotes to rotate)
- `MOCK_HEALTH_TIP: string` (a single "Healthy by Nature" tip)
- `GRAND_PRIZE` constant: `{ amount: "$50k", endDate: "June 30", challengeDay: 14, totalDays: 60 }`

**`lib/mock/index.ts`** — Re-export everything.

### 1.2 Create Shared UI Constants

**`lib/constants/navigation.ts`** — Tab names, icon mappings:
```typescript
const TABS = {
  HOME: { name: "Home", icon: "Home" },
  STASH: { name: "Your Stash", icon: "Gift" },
  SQUAD: { name: "Your Squad", icon: "Users" },
} as const;
```

**`lib/constants/coach-personalities.ts`**:
```typescript
const COACH_PERSONALITIES = [
  { id: "drill_sgt", label: "Drill Sgt", icon: "shield" },
  { id: "bestie", label: "Bestie", icon: "message-circle" },
  { id: "zen", label: "Zen", icon: "leaf" },
  { id: "hype", label: "Hype", icon: "zap" },
  { id: "witty", label: "Witty", icon: "smile" },
] as const;
```

**`lib/constants/themes.ts`** — App theme color options per wireframe:
```typescript
const APP_THEMES = [
  { id: "green", label: "Green", color: "#22C55E" },
  { id: "blue", label: "Blue", color: "#3B82F6" },
  { id: "purple", label: "Purple", color: "#8B5CF6" },
  { id: "pink", label: "Pink", color: "#EC4899" },
  { id: "orange", label: "Orange", color: "#F97316" },
] as const;
```

---

## Phase 2: Navigation & Layout Restructure

### 2.1 Restructure Tab Navigation

**Modify `app/(tabs)/_layout.tsx`:**
- Change from 4 tabs to 3: Home, Your Stash, Your Squad
- Remove Explore and Profile tab entries
- Update icons: Home (house), Your Stash (gift), Your Squad (users)
- Add Parker FAB (bear/bot icon) as a floating button positioned at the bottom-right corner of the tab bar, separate from the tab items
- The Parker button should have a distinct visual style (larger, possibly elevated) to differentiate it from tab items

**Delete or repurpose:**
- `app/(tabs)/explore.tsx` — Delete (not in design)
- `app/(tabs)/rewards.tsx` — Will be completely rewritten as Your Stash
- `app/(tabs)/profile.tsx` — Move to `app/profile.tsx` as a standalone route (not a tab)

**Add new files:**
- `app/(tabs)/stash.tsx` — Your Stash tab (replaces rewards)
- `app/(tabs)/squad.tsx` — Your Squad tab (new)
- `app/profile.tsx` — Profile & Settings (full-screen, accessed via avatar)

**Update `app/_layout.tsx`:**
- Add `profile` as a Stack.Screen with `presentation: "card"` or `fullScreenModal`
- Keep existing modal and chat Stack.Screen entries

### 2.2 Create Shared Top Bar Component

**`components/TopBar.tsx`:**
Every tab screen shares the same top bar per the wireframes:
- Left side: Daily affirmation text (small) + Date (MMM DD format, bold)
- Right side: Profile avatar circle (tappable → navigates to profile)
- Use `useSafeAreaInsets()` for proper top padding
- Avatar shows user photo or fallback icon
- `onAvatarPress` → `router.push("/profile")`

### 2.3 Create Parker FAB Component

**`components/ParkerFAB.tsx`:**
- Floating bear/bot icon button
- Positioned at bottom-right of the screen, above the tab bar
- `onPress` → `router.push("/chat")`
- Should be visible on all tab screens
- Animated press feedback (scale down on press)
- This can be rendered either in the tab layout or as an absolute-positioned element

---

## Phase 3: Home Screen (2.1)

Completely rebuild `app/(tabs)/index.tsx` to match the home wireframe. This is the most complex screen.

### 3.1 Hero Card Swiper

**`components/home/HeroSwiper.tsx`:**
- Horizontal swipeable carousel with 2 cards and page indicator dots
- **Card 1 — Motivation Card:** Dynamic motivation text (from `MOCK_MOTIVATION_TEXTS`), subtitle "[More info]" link, refresh button icon (top-right) that cycles to next motivation text
- **Card 2 — Minutes Card:** "Time in nature" label, large `[X] Mins` display, "On Track" status text
- Both cards should be full-width with rounded corners
- Use React Native Reanimated + Gesture Handler for smooth swiping
- Page indicator dots below the swiper
- The "+" FAB button for logging activity appears to the right of the swiper per wireframe — `onPress` → `router.push("/(modals)/log-activity")`

### 3.2 Stats Grid (Flip Cards)

**`components/home/StatsGrid.tsx`:**
- 2-column grid with 2 cards
- **Streak Card:** Front shows fire icon + current streak number + "Days Active". Back (flip) shows personal best streak.
- **Nature Score Card (Health Score in wireframe):** Front shows tree/leaf icon + calculated score + "Room to Improve". Back (flip) shows breakdown logic text.
- Each card is tappable to trigger a 3D flip animation (rotate around Y-axis using Reanimated)
- Use `Animated.View` with `rotateY` interpolation for the flip

**`components/shared/FlipCard.tsx`:**
- Reusable flip card component
- Props: `front: ReactNode`, `back: ReactNode`, `height?: number`
- Manages flip state internally
- Smooth 300-400ms flip animation with perspective

### 3.3 Action Cards (Scrollable Feed)

**`components/home/DailyQuestCard.tsx`:**
- "Daily Quest" header
- AI-generated task description (mock text)
- Simple card with no special interaction

**`components/home/WeeklyGiveawayCard.tsx`:**
- Flip card: front shows "Win a [prize]" + "Log 3 activities this week to enter" + "Tap to Enter"
- Back shows giveaway requirements detail + entered badge when applicable
- Uses the shared `FlipCard` component

**`components/home/LeaderboardPreview.tsx`:**
- "Leaderboard" header
- Toggle between "Friends" and "Global" (use HeroUI Tabs or custom toggle)
- Show top 5 entries with avatar, name, and minutes
- Tappable friend entries (show quick stats concept)
- "View All" at bottom → navigates to Your Squad tab
- AI-generated leaderboard tip text at bottom

**`components/home/HealthTipCard.tsx`:**
- "Healthy by Nature" header
- Mock health tip text
- Simple display card

**`components/home/GrandPrizeCard.tsx`:**
- Flip card — large, prominent styling
- **Front:** "Grand Prize" label, end date badge ("Ends June 30"), large "$50k" text, challenge progress bar (14/60 Days), "More Info" link
- **Back:** List of rules text + "Terms & Conditions" button
- Uses the shared `FlipCard` component

### 3.4 Assemble Home Screen

**`app/(tabs)/index.tsx`:**
- `TopBar` component at top
- `ScrollView` containing in order:
  1. `HeroSwiper` with "+" FAB
  2. `StatsGrid` (2 flip cards)
  3. `DailyQuestCard`
  4. `WeeklyGiveawayCard`
  5. `LeaderboardPreview`
  6. `HealthTipCard`
  7. `GrandPrizeCard`
- Proper bottom padding to account for tab bar

---

## Phase 4: Your Stash Screen (2.2)

### 4.1 Featured Rewards Carousel

**`components/stash/FeaturedRewardsCarousel.tsx`:**
- Horizontal scroll of featured reward cards (max 6 per spec)
- Each card shows "Featured" label, vendor name, reward info
- Full-width cards with page indicator dots
- `onCardPress` → triggers Reward Toaster overlay (not navigation)

### 4.2 Rewards Grid

**`components/stash/RewardsGrid.tsx`:**
- 2-column grid of smaller reward tiles
- Each tile shows vendor name + reward info
- `onTilePress` → triggers Reward Toaster overlay

### 4.3 Reward Toaster Overlay

**Modify `app/(modals)/reward-detail.tsx`:**
- Slides up from bottom (BottomSheet pattern already in place)
- Displays: Reward Title, Description, QR Code/Barcode/Coupon Code
- For QR: render a placeholder QR code visual (square grid pattern or use a library)
- For barcode: render a placeholder barcode visual
- For coupon code: display a copyable text code
- The toaster should NOT navigate away — it overlays the current screen

### 4.4 Assemble Your Stash Screen

**`app/(tabs)/stash.tsx`:**
- `TopBar` with "Your Stash" title and "Exclusive perks and rewards." subtitle below it
- `FeaturedRewardsCarousel`
- `RewardsGrid`
- All reward taps open Reward Toaster overlay

---

## Phase 5: Your Squad Screen (2.3)

### 5.1 Motivation Banner

**`components/squad/MotivationBanner.tsx`:**
- Large card at top with AI-generated motivation text (mock)
- Bold, prominent styling
- This is the "[AI generated motivation]" section from the wireframe

### 5.2 TB Pulse Feed

**`components/squad/TBPulse.tsx`:**
- "Live Pulse" header
- Scrollable list of recent notification items
- Each item is a simple text row (e.g., "Mike Chen completed 120 min hike", "New Reward Unlocked")
- Use mock data from `MOCK_PULSE_ITEMS`

### 5.3 Leaderboard Widget

**`components/squad/LeaderboardWidget.tsx`:**
- Toggle switch between "Friends" and "Global" rankings
- List of ranked rows: rank number, avatar, name, total time (minutes)
- Current user's row is highlighted with distinct background color
- Tappable entries to see quick stats (could open a small bottom sheet or tooltip)

### 5.4 Add Friend FAB

- "+" floating action button in bottom-right of the Squad screen (per wireframe)
- `onPress` → opens Add Friend Modal

### 5.5 Assemble Your Squad Screen

**`app/(tabs)/squad.tsx`:**
- `TopBar` with title "Your Squad"
- Subtitle "Everything's better together." + "Add Friend" icon button (UserPlus icon) in the header area
- `MotivationBanner`
- `TBPulse`
- `LeaderboardWidget`
- "+" FAB at bottom-right for Add Friend

---

## Phase 6: Profile & Settings Screen (2.4)

### 6.1 Hero Identity Section

**`components/profile/HeroIdentity.tsx`:**
- Large avatar (with status badge overlay)
- H1: User's name
- H2: Membership tier text
- "Edit Profile" button below

### 6.2 Digital Wallet

**`components/profile/DigitalWallet.tsx`:**
- 3D stacked card deck (Trailblazer+ card on top, BC Parks Pass behind, NSMBA behind that)
- Cards are visually stacked with slight offset (cascading down and to the right, showing the card titles peeking out from behind)
- Tapping a card brings it to front and flips to reveal barcode/ID on back
- Use Reanimated for card shuffle and flip animations
- Colors per wireframe: TB+ card is gold/yellow, BC Parks is teal/green, NSMBA is blue
- Front of each card: card title, user name, membership type
- Back: barcode or ID number

### 6.3 Coach Personality Selector

**`components/profile/CoachPersonalityPicker.tsx`:**
- "Coach Personality:" label
- Horizontal row of 5 circular icons with labels underneath
- Options per wireframe: Drill Sgt, Bestie, Zen, Hype, Witty
- Selected option has highlighted border/fill
- Tapping selects (local state only, no backend)

### 6.4 Lifetime Stats Grid

**`components/profile/LifetimeStatsGrid.tsx`:**
- 3x2 grid layout (6 cells)
- Stats per wireframe: Total Mins, Longest Streak, Total KMs, Badges, Total Activities, Challenges
- Each cell shows the numeric value and label

### 6.5 Achievements Row

**`components/profile/AchievementsRow.tsx`:**
- "Achievements:" label
- Horizontal scrollable row of circular achievement icons
- Per wireframe: "10 hrs in nature", "Early Bird", "Hiker", "Rain or Shine", "Four Seasons"
- Unlocked achievements are fully visible, locked ones are dimmed/greyed

### 6.6 App Theme Selector

**`components/profile/AppThemePicker.tsx`:**
- "App Theme" label
- Horizontal row of 5 color circles: Green, Blue, Purple, Pink, Orange
- Selected has a check mark or border highlight
- Tapping selects (local state only)

### 6.7 Action Buttons Grid

**`components/profile/ProfileActions.tsx`:**
- 2x2 grid of buttons per wireframe:
  - "Upgrade" → `router.push("/(modals)/upgrade")`
  - "Download App" → no-op or share sheet
  - "Settings" → scrolls to settings section or opens settings
  - "Reset Challenge" → `router.push("/(modals)/reset-challenge")`

### 6.8 Assemble Profile Screen

**`app/profile.tsx`:**
- Full-screen route (not a tab)
- Back button in header to return to previous tab
- ScrollView containing in order:
  1. `TopBar` with "My Profile" title and "Exclusive perks and rewards." subtitle
  2. `HeroIdentity`
  3. `DigitalWallet` (3D card stack)
  4. `CoachPersonalityPicker`
  5. `LifetimeStatsGrid`
  6. `AchievementsRow`
  7. `AppThemePicker`
  8. `ProfileActions` (Upgrade, Download App, Settings, Reset Challenge)
- Sign out button at bottom (keep existing functionality)

---

## Phase 7: Overlays & Modals

### 7.1 Log Activity Overlay (3.1)

**Rebuild `app/(modals)/log-activity.tsx`:**
- Trigger: "+" FAB on Home screen
- BottomSheet sliding up from bottom (85% snap point, existing pattern)
- Two tabs at top: "Manual" and "Timer"

**Tab 1 — Manual:**
- Quick-select activity type chips (Hiking, Running, Cycling, Walking, Swimming, Other)
- Chips are horizontally scrollable, selected chip is highlighted
- Text input: Activity name (optional)
- Number input: Duration in minutes
- "Save Activity" button (no-op for now, just closes modal)

**Tab 2 — Timer:**
- Large stopwatch display (MM:SS format, centered)
- Play/Pause button (toggle icon) + Stop button
- Text input: Activity name
- Timer uses `useRef` + `setInterval` for counting (local state only)
- "Save Activity" button (no-op, closes modal)

### 7.2 Reward Toaster (3.2)

Already covered in Phase 4.3. Ensure it:
- Slides up from bottom
- Shows reward title, description
- Shows a QR code placeholder OR barcode placeholder OR coupon code text
- Has a close/dismiss gesture (swipe down or X button)

### 7.3 Parker AI Chat (3.3)

**Keep existing `app/chat.tsx` structure** but ensure:
- Full-screen modal presentation (already configured)
- The chat UI matches the design (it's already functional with mock responses)
- Parker's personality selection from Profile affects the welcome message (local state)

### 7.4 Add Friend Modal (3.4)

**Create `app/(modals)/add-friend.tsx`:**
- Trigger: "UserPlus" icon in Your Squad tab header, or "+" FAB on Squad screen
- Simple BottomSheet modal
- Single email text input field
- "Send Invite" button (no-op, shows success toast and closes)
- Register this new modal in `app/(modals)/_layout.tsx`

---

## Phase 8: Onboarding Flow

### 8.1 Welcome Screens

**Create `app/onboarding.tsx`** (or a group `app/(onboarding)/`):

A horizontal pager with 3 screens (swipeable + arrow button to advance):

**Screen 1:**
- Rotating TB+ logo placeholder (animated rotating view)
- H1: "Get rewarded for time in nature."
- Body: "Trailblazer+ turns time spent in nature into progress, rewards, and real support for parks. Show up daily. The rest adds up."
- Arrow button at bottom to advance

**Screen 2:**
- Rotating TB+ logo placeholder
- H1: "Where does the money go?"
- Body: "Membership dollars flow back into outdoor recreation and parks across BC. Participation supports the places, trails, and parks you use."
- Arrow button at bottom to advance

**Screen 3 (Login):**
- Rotating TB+ logo placeholder
- H1: "Join Trailblazer+"
- Body: "Create an account to track progress, enter the challenge, and access member benefits."
- "Login" button (→ existing login flow or mock)
- "Sign up with Apple" button
- "Terms & Conditions Apply" footer text

### 8.2 Permissions Screens

After login/signup, show two permission request screens:

**Screen 4 — Health API:**
- Rotating TB+ logo placeholder
- H1: "Track automatically?"
- Body: "Giving permission to use your existing health integrations will make tracking a breeze."
- "Yes, I agree" button (no-op, advances to next)
- "No, don't use my health data" text link (skips, advances to next)

**Screen 5 — Push Notifications:**
- Rotating TB+ logo placeholder
- H1: "Stay motivated."
- Body: "Giving permission to deliver notifications will help make sure you never miss a day!"
- "Yes, I agree" button (no-op, navigates to main app)
- "No, don't notify me" text link (skips, navigates to main app)

### 8.3 Onboarding State

- Use AsyncStorage to track whether onboarding has been completed
- First launch → show onboarding
- Subsequent launches → skip directly to login or main app
- Update `app/_layout.tsx` routing logic to check onboarding completion state

---

## Phase 9: Animations & Polish

### 9.1 Flip Card Animations
- Smooth 3D flip on stats cards, giveaway card, grand prize card, wallet cards
- Use `Animated.Value` with `rotateY` transform + perspective
- Front and back content swap visibility at 90-degree rotation point

### 9.2 Card Swiper Gestures
- Hero swiper on Home uses horizontal pan gesture
- Featured rewards carousel on Your Stash uses horizontal scroll
- Both show page indicator dots that animate with scroll position

### 9.3 Digital Wallet Stack Animation
- Cards in the wallet deck use z-index + translateY for stacked appearance
- Tapping a card animates it to front position (translateY to 0, scale up)
- Selected card flips to show back

### 9.4 Parker FAB
- Subtle scale animation on press
- Consider a gentle idle animation (pulse or breathe) to draw attention

### 9.5 Tab Transitions
- Keep existing haptic feedback on tab press
- Ensure smooth transitions between tabs

### 9.6 Pull-to-Refresh
- Add pull-to-refresh on Home and Your Squad screens (no-op action, just shows spinner briefly)

---

## Implementation Order & Dependencies

Execute phases in this order, as each builds on the previous:

```
Phase 1 (Foundation)
  ├── 1.1 Mock Data Layer
  └── 1.2 Shared Constants
         ↓
Phase 2 (Navigation)
  ├── 2.1 Tab Restructure
  ├── 2.2 TopBar Component
  └── 2.3 Parker FAB
         ↓
Phase 3 (Home) ──────── Phase 4 (Stash) ──────── Phase 5 (Squad)
  [can be parallelized after Phase 2]
         ↓                    ↓                        ↓
Phase 6 (Profile) ← depends on components from 3, 4, 5
         ↓
Phase 7 (Overlays) ← depends on screen context
         ↓
Phase 8 (Onboarding) ← can be done independently after Phase 2
         ↓
Phase 9 (Polish) ← final pass after all screens built
```

---

## File Inventory (New & Modified)

### New Files
```
lib/mock/types.ts
lib/mock/data.ts
lib/mock/index.ts
lib/constants/navigation.ts
lib/constants/coach-personalities.ts
lib/constants/themes.ts

components/TopBar.tsx
components/ParkerFAB.tsx
components/shared/FlipCard.tsx

components/home/HeroSwiper.tsx
components/home/StatsGrid.tsx
components/home/DailyQuestCard.tsx
components/home/WeeklyGiveawayCard.tsx
components/home/LeaderboardPreview.tsx
components/home/HealthTipCard.tsx
components/home/GrandPrizeCard.tsx

components/stash/FeaturedRewardsCarousel.tsx
components/stash/RewardsGrid.tsx

components/squad/MotivationBanner.tsx
components/squad/TBPulse.tsx
components/squad/LeaderboardWidget.tsx

components/profile/HeroIdentity.tsx
components/profile/DigitalWallet.tsx
components/profile/CoachPersonalityPicker.tsx
components/profile/LifetimeStatsGrid.tsx
components/profile/AchievementsRow.tsx
components/profile/AppThemePicker.tsx
components/profile/ProfileActions.tsx

app/(tabs)/stash.tsx
app/(tabs)/squad.tsx
app/profile.tsx
app/onboarding.tsx
app/(modals)/add-friend.tsx
```

### Modified Files
```
app/(tabs)/_layout.tsx          # 3 tabs + Parker FAB
app/(tabs)/index.tsx            # Complete rewrite for Home
app/_layout.tsx                 # Add profile route, onboarding check
app/(modals)/_layout.tsx        # Register add-friend modal
app/(modals)/log-activity.tsx   # Add Manual/Timer tabs with full UI
app/(modals)/reward-detail.tsx  # Toaster with QR/barcode/coupon display
```

### Deleted Files
```
app/(tabs)/explore.tsx          # Not in design spec
app/(tabs)/rewards.tsx          # Replaced by stash.tsx
app/(tabs)/profile.tsx          # Moved to app/profile.tsx
```

---

## Code Standards Enforcement

Every file must follow these rules from `CLAUDE.md`:

- **TypeScript:** No `any`. All parameters and returns typed. Use `interface` for objects, `type` for unions.
- **Styling:** Use `className` with Uniwind (Tailwind) where possible. Use `StyleSheet.create` for complex layouts. Use HeroUI Native components (Button, Card, TextField, Tabs, Chip, etc.) before building custom.
- **Architecture:** Route-based modals via `router.push("/(modals)/...")`. Dynamic routes with `[id].tsx`. Contexts for global state, local `useState` for component state.
- **No comments** unless explaining non-obvious business logic.
- **DRY:** Extract `FlipCard`, `TopBar`, `ParkerFAB` as shared components rather than duplicating flip logic or header layout.
- **Navigation:** Use `router.replace()` for auth transitions, `router.push()` for modal/screen transitions, `router.back()` for dismissal.
- **Safe areas:** Every screen uses `useSafeAreaInsets()` for proper padding on notched devices.
- **Platform handling:** Use `Platform.OS` checks where iOS/Android behavior differs (tab bar height, keyboard avoiding, blur effects).
- **Icons:** Use `lucide-react-native` consistently. Import only needed icons.

---

## Mock Data Principles

- All data is hardcoded in `lib/mock/data.ts`
- No API calls, no Firebase reads, no async data fetching in screens
- Screens import from `@/lib/mock` only
- Use realistic-looking data (real BC Parks locations, plausible reward names, real-sounding usernames)
- All numeric values should be plausible (e.g., streak of 12, not 99999)
- This structure allows future phases to swap `lib/mock` imports for real `lib/db` calls with minimal screen changes

---

## Success Criteria

- All 4 main screens (Home, Your Stash, Your Squad, Profile) render correctly on both iOS and Android
- All wireframe components are present and positioned as shown in designs
- All flip card animations work smoothly (no jank, no frame drops)
- Card swipers are gesture-responsive with proper page indicators
- Navigation between all screens and modals works correctly
- Digital wallet card stack is interactive (tap to bring to front + flip)
- Log Activity modal has both Manual and Timer tabs functional
- Reward Toaster shows QR/barcode/coupon on reward tap
- Add Friend modal opens and accepts email input
- Onboarding flow shows on first launch and is skippable
- Parker FAB is visible on all tab screens and opens chat
- Top bar avatar navigates to Profile from any tab
- TypeScript compiles with zero errors (`npx tsc --noEmit`)
- No `any` types anywhere in new code
- App feels native on both platforms (proper safe areas, haptics, blur effects)
