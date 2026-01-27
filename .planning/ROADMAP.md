# Roadmap: Trailblazer+ UI Rebuild

## Overview

This roadmap delivers a complete UI rebuild of the Trailblazer+ React Native app across 6 phases, progressing from a mock data foundation through navigation shell, screen-by-screen construction, and onboarding. Every screen is built against hardcoded mock data with clean separation so backend integration is a future swap, not a rewrite. The build order validates animation patterns on the highest-traffic screen first (Home), then applies proven patterns to remaining screens.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Mock Data Layer** - TypeScript interfaces and hardcoded data powering all screens
- [ ] **Phase 2: Navigation & Layout** - 3-tab shell, Parker FAB, TopBar, and routing structure
- [ ] **Phase 3: Home Screen** - Hero swiper, flip card stats, leaderboard preview with animations
- [ ] **Phase 4: Your Stash + Your Squad** - Rewards carousel/grid with toaster, leaderboard widget
- [ ] **Phase 5: Profile Screen** - Identity, lifetime stats, settings, data sync, and account actions
- [ ] **Phase 6: Onboarding Flow** - Welcome pager, login, permission screens, and launch routing

## Phase Details

### Phase 1: Mock Data Layer
**Goal**: Every future screen has typed mock data to import without touching Firebase
**Depends on**: Nothing (first phase)
**Requirements**: MOCK-01, MOCK-02, MOCK-03
**Success Criteria** (what must be TRUE):
  1. A complete set of TypeScript interfaces exists in `lib/mock/types.ts` covering user, stats, rewards, leaderboard, pulse, quests, wallet, and achievements
  2. `lib/mock/data.ts` exports realistic hardcoded data for every interface with enough entries to populate all screens (leaderboard has 10+ entries, rewards has 8+ items, achievements has 5+ badges)
  3. `npx tsc --noEmit` passes with zero errors on the mock data module
  4. No file in `lib/mock/` imports from `firebase/`, `lib/db/`, or `lib/health/`
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- TypeScript interfaces and barrel export (Wave 1)
- [x] 01-02-PLAN.md -- Hardcoded fixture data and validation (Wave 2)

### Phase 2: Navigation & Layout
**Goal**: Users see a working 3-tab app shell with shared header and Parker access from every screen
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, OVLY-02
**Success Criteria** (what must be TRUE):
  1. Bottom tab bar shows three tabs (Home, Your Stash, Your Squad) and tapping each navigates to a placeholder screen
  2. Parker FAB (bear icon) is visible in the bottom-right corner of the navigation dock on every tab and opens the Parker Chat screen on tap
  3. TopBar appears on all three tab screens showing daily affirmation text, the current date formatted as "MMM DD", and a profile avatar
  4. Tapping the avatar in the TopBar navigates to the Profile screen (standalone route, not a tab)
  5. "+" FAB is visible on the Home screen and shows a "Coming Soon" toast on tap; Add Friend button is visible on the Squad screen header and shows a "Coming Soon" toast on tap
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md -- Tab bar restructure, Parker FAB, and Profile modal route (Wave 1)
- [ ] 02-02-PLAN.md -- TopBar component and Profile routing (Wave 2)
- [ ] 02-03-PLAN.md -- Stub FABs and action buttons (Wave 2)

### Phase 3: Home Screen
**Goal**: Users see a fully populated Home screen with animated hero swiper, flip card stats, and leaderboard preview
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, ANIM-01, ANIM-02
**Success Criteria** (what must be TRUE):
  1. Hero section displays a horizontal 2-card swiper (motivation text with refresh button + minutes active counter) with page indicator dots tracking swipe position
  2. Streak flip card shows fire icon, current streak, and "Days Active" on front; tapping flips smoothly (rotateY with perspective, 300-400ms) to reveal personal best streak on back
  3. Nature Score flip card shows leaf icon, calculated score, and "Room to Improve" on front; tapping flips to reveal breakdown logic text on back
  4. Leaderboard preview shows Friends/Global toggle, top 5 ranked entries with avatar and name, and "View All" button that navigates to the Your Squad tab
  5. All flip card animations render correctly on both iOS and Android (perspective as first transform on Android)
**Plans**: TBD

Plans:
- [ ] 03-01: FlipCard reusable component
- [ ] 03-02: Hero swiper and stats grid
- [ ] 03-03: Leaderboard preview widget

### Phase 4: Your Stash + Your Squad
**Goal**: Users can browse rewards and view community leaderboard across two complete tab screens
**Depends on**: Phase 2 (navigation shell); Phase 3 (FlipCard component and swiper patterns reused)
**Requirements**: STSH-01, STSH-02, STSH-03, SQUD-01, SQUD-02, SQUD-03, OVLY-01
**Success Criteria** (what must be TRUE):
  1. Your Stash shows a featured rewards horizontal carousel (up to 6 cards with page dots) above a 2-column rewards grid with vendor name and reward info per tile
  2. Tapping any reward (carousel or grid) opens a Reward Toaster bottom sheet that slides up showing reward title, description, and a QR placeholder or barcode placeholder or coupon code text -- does not navigate away from the screen
  3. Your Squad screen displays "Your Squad" title and "Everything's better together." subtitle in the header
  4. Leaderboard widget on Your Squad shows Friends/Global toggle, ranked rows with avatar, name, and total time, with the current user's row visually highlighted
  5. Dismissing the Reward Toaster returns to Your Stash with no navigation side effects
**Plans**: TBD

Plans:
- [ ] 04-01: Your Stash screen (carousel + grid)
- [ ] 04-02: Reward Toaster bottom sheet
- [ ] 04-03: Your Squad screen (leaderboard widget)

### Phase 5: Profile Screen
**Goal**: Users can view their identity, lifetime stats, and access all account settings from a single Profile route
**Depends on**: Phase 2 (Profile route registered and accessible via avatar tap)
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, PROF-07
**Success Criteria** (what must be TRUE):
  1. Profile screen shows hero identity section with large avatar, user name (H1), and membership tier (H2)
  2. Lifetime stats grid displays 6 items in a 3x2 layout: Total Mins, Longest Streak, Total KMs, Badges, Total Activities, Challenges -- all populated from mock data
  3. Data Sync section shows toggles for Apple Health and Google Fit (UI-only, no real sync triggered)
  4. Account management button, Privacy Policy link, and Terms of Use link each open the device web browser to a placeholder URL
  5. Sign out button triggers existing auth signOut and navigates to login screen
**Plans**: TBD

Plans:
- [ ] 05-01: Profile hero and lifetime stats
- [ ] 05-02: Settings, sync toggles, and account actions

### Phase 6: Onboarding Flow
**Goal**: New users experience a guided welcome flow before reaching the main app; returning users skip directly to login or main screen
**Depends on**: Phase 2 (navigation shell for post-login routing)
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05
**Success Criteria** (what must be TRUE):
  1. First app launch shows a 3-screen horizontal pager: Welcome 1 ("Get rewarded for time in nature"), Welcome 2 ("Where does the money go?"), Login screen
  2. Login screen offers Login button, Sign up with Apple, and Sign up with Google -- all functional using existing Firebase Auth
  3. After login, Health API permission screen appears with "Yes, I agree" / "No" options (UI-only, does not request real HealthKit permission)
  4. Push Notifications permission screen appears with "Yes, I agree" / "No" options (UI-only, does not request real push permission)
  5. AsyncStorage records onboarding completion so subsequent launches skip the welcome pager and go directly to login or main screen

**Plans**: TBD

Plans:
- [ ] 06-01: Welcome pager and login screen
- [ ] 06-02: Permission screens and launch routing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Mock Data Layer | 2/2 | Complete | 2026-01-27 |
| 2. Navigation & Layout | 0/3 | Not started | - |
| 3. Home Screen | 0/3 | Not started | - |
| 4. Your Stash + Your Squad | 0/3 | Not started | - |
| 5. Profile Screen | 0/2 | Not started | - |
| 6. Onboarding Flow | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-27*
*Last updated: 2026-01-27 -- Phase 2 planned*
