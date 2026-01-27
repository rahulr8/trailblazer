# Trailblazer+ UI Rebuild

## What This Is

A complete UI rebuild of the Trailblazer+ React Native app to match new wireframes and user journey specifications from the BC Parks Foundation client. The app is an outdoor activity tracker with community ("Your Squad"), rewards ("Your Stash"), and AI coaching ("Parker") features. This milestone is UI-only — all screens use hardcoded mock data with no backend integration.

## Core Value

Every screen must match the wireframe designs and feel native on both iOS and Android. The mock data layer must be cleanly separated so future backend integration is a swap, not a rewrite.

## Requirements

### Validated

- ✓ Firebase Authentication (Google + Apple sign-in) — existing
- ✓ Expo Router file-based navigation with modal pattern — existing
- ✓ Provider hierarchy (Gesture Handler, HeroUI, Theme, Auth, BottomSheet) — existing
- ✓ Apple HealthKit integration module — existing
- ✓ Firestore data layer (users, activities, stats) — existing
- ✓ Light/dark theme support — existing
- ✓ TypeScript strict mode with path aliases — existing

### Active

**Navigation & Layout:**
- [ ] 3-tab bottom navigation: Home, Your Stash, Your Squad
- [ ] Parker FAB (bear icon) in bottom-right of navigation dock, opens AI chat
- [ ] Shared TopBar component: daily affirmation, date (MMM DD), avatar (taps to Profile)
- [ ] Profile as standalone route (not a tab), accessed via avatar tap
- [ ] "+" FAB on Home screen for logging activity

**Home Screen (2.1):**
- [ ] Hero card swiper: motivation card (with refresh) + minutes active card, page dots
- [ ] Stats grid: Streak flip card (front: current, back: personal best) + Nature Score flip card (front: score, back: breakdown)
- [ ] Daily Quest card (AI-generated micro-challenge — mock text)
- [ ] Weekly Giveaway flip card (front: prize/enter, back: requirements/entered badge)
- [ ] Leaderboard preview with Friends/Global toggle, top 5, "View All" → Your Squad
- [ ] Healthy by Nature health tip card
- [ ] Grand Prize flip card (front: $50k + progress bar 14/60 days, back: rules + T&C)

**Your Stash Screen (2.2):**
- [ ] Featured rewards horizontal carousel (max 6 cards, page dots)
- [ ] 2-column rewards grid
- [ ] Reward Toaster overlay (slides up, shows title/description + QR/barcode/coupon code)

**Your Squad Screen (2.3):**
- [ ] AI motivation banner (mock text)
- [ ] TB Pulse — real-time notification feed (mock items)
- [ ] Leaderboard widget with Friends/Global toggle, ranked rows, current user highlighted
- [ ] "+" FAB / Add Friend icon button → Add Friend modal

**Profile & Settings Screen (2.4):**
- [ ] Hero identity: large avatar + status badge, user name, membership tier, Edit Profile button
- [ ] Digital wallet: 3D stacked card deck (TB+, BC Parks Pass, NSMBA), tap to bring front + flip for barcode
- [ ] Coach Personality selector: Drill Sgt, Bestie, Zen, Hype, Witty
- [ ] Lifetime stats grid (3x2): Total Mins, Longest Streak, Total KMs, Badges, Total Activities, Challenges
- [ ] Achievements row: horizontal scroll of circular icons (10 hrs, Early Bird, Hiker, Rain or Shine, Four Seasons)
- [ ] App Theme color picker: Green, Blue, Purple, Pink, Orange
- [ ] Action buttons: Upgrade, Download App, Settings, Reset Challenge
- [ ] Data Sync toggles: Apple Health, Google Fit
- [ ] Account management button (opens web browser)
- [ ] Privacy Policy link (opens web browser)
- [ ] Terms of Use link (opens web browser)
- [ ] Sign out button

**Overlays & Modals (3.x):**
- [ ] Log Activity overlay: Manual tab (activity chips + name + duration) and Timer tab (stopwatch + play/stop + name)
- [ ] Reward Toaster: bottom sheet with QR/barcode/coupon display
- [ ] Parker AI Chat: full-screen chat interface (existing, ensure design match)
- [ ] Add Friend modal: email input + Send Invite button

**Onboarding Flow:**
- [ ] 3-screen horizontal pager: Welcome 1, Welcome 2, Login/Signup
- [ ] Login screen with Login button + Sign up with Apple + Sign up with Google
- [ ] Permission screens: Health API opt-in, Push Notifications opt-in
- [ ] AsyncStorage onboarding completion tracking
- [ ] First launch → onboarding; subsequent → skip to login/main

**Animations & Polish:**
- [ ] 3D flip card animations (stats, giveaway, grand prize, wallet cards)
- [ ] Hero swiper gesture with page indicator dots
- [ ] Digital wallet stack animation (tap to bring front + flip)
- [ ] Parker FAB press animation (scale)
- [ ] Pull-to-refresh on Home and Your Squad (no-op spinner)

**Mock Data Layer:**
- [ ] `lib/mock/types.ts` — all UI-specific TypeScript interfaces
- [ ] `lib/mock/data.ts` — all hardcoded mock data (user, stats, rewards, leaderboard, pulse, quests, wallet, achievements)
- [ ] No Firebase imports in any new screen file
- [ ] Clean separation: screens import from `@/lib/mock` only

### Out of Scope

- Your Legend (AI-generated fantasy description + share card) — deferred to v2 when AI backend is wired
- Real backend integration (Firebase reads/writes from new screens) — separate milestone
- Real AI responses for Parker, Daily Quest, Health Tips — mock text only
- Push notification delivery — permission screen is UI-only
- Real HealthKit data sync from new screens — existing code preserved but not imported
- Video or rich media in posts — not in design spec
- Real QR code generation for rewards — placeholder visuals only

## Context

**Existing codebase:** Expo 54 app with 4 tabs (Home, Explore, Rewards, Profile), Firebase Auth (Google + Apple), Firestore data layer, Apple HealthKit integration, HeroUI Native components, Uniwind styling, Reanimated animations. The current app is functional but the UI doesn't match the new wireframes.

**What changes:** The navigation restructures from 4 tabs to 3 tabs + Parker FAB. Explore tab is removed. Rewards becomes Your Stash. Profile moves from tab to standalone route. Every screen is rebuilt to match wireframes.

**What stays untouched:** `lib/db/`, `lib/health/`, `contexts/auth-context.tsx`, `firebase/`, `functions/` — all existing backend code remains. New screens simply don't import from it.

**Design references:** `.claude/designs/` contains wireframe PNGs for each screen and two PDFs (TRA-13 User Journey, User Journeys UI Flow) that define every component, interaction, and overlay.

**Implementation plan reference:** `.claude/plans/initial-ui.md` contains a detailed 9-phase plan generated from the wireframes. Use as a reference but the GSD roadmap may restructure phases differently.

## Constraints

- **Tech stack**: Expo 54, Expo Router, TypeScript strict, Uniwind (Tailwind v4), HeroUI Native, Reanimated, Gesture Handler, lucide-react-native — all already installed
- **No backend changes**: This milestone is UI-only. No Firestore schema changes, no Cloud Function changes
- **No new dependencies**: Use what's already in package.json. Exception: if a QR/barcode placeholder needs a library
- **Existing code preserved**: Do NOT delete `lib/db/`, `lib/health/`, `contexts/`, `firebase/` — future milestones will reconnect these
- **Both platforms**: Must look and feel native on iOS and Android (safe areas, haptics, blur effects)
- **TypeScript**: Zero `any` types. All parameters and returns typed. `npx tsc --noEmit` must pass

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| UI-only with mock data first | Clean separation enables parallel backend work; validates design before wiring data | — Pending |
| Keep existing backend code untouched | Prevents regression; future milestone swaps mock imports for real ones | — Pending |
| 3 tabs + Parker FAB (not 4 tabs) | Matches client wireframes; Parker is always-accessible AI companion | — Pending |
| Profile as standalone route | Design shows avatar-tap navigation, not tab; reduces tab bar clutter | — Pending |
| Reusable FlipCard component | Multiple screens need flip animation (stats, giveaway, grand prize, wallet) | — Pending |
| Lifetime stats from wireframe not PDF | Client wireframe is the visual source of truth: Total Mins, Longest Streak, Total KMs, Badges, Total Activities, Challenges | — Pending |
| Your Legend deferred to v2 | Requires AI backend; mock text wouldn't demonstrate the feature's value | — Pending |
| Settings includes Data Sync + Account + Privacy + Terms | Per user journey PDF; wireframe was simplified but full settings are needed | — Pending |
| Keep both Google + Apple auth | Already built; more accessible than Apple-only | — Pending |

---
*Last updated: 2026-01-27 after initialization*
