# Project Research Summary

**Project:** Trailblazer+ UI Rebuild
**Domain:** React Native activity tracker with gamification and animated UI
**Researched:** 2026-01-27
**Confidence:** HIGH

## Executive Summary

Trailblazer+ is rebuilding the UI with heavy animations using an already-installed, production-ready stack: Expo 54 + Reanimated 4 + Gesture Handler 2 + HeroUI Native. The existing codebase is solid, but the UI needs a complete rebuild to implement 3D flip cards, horizontal swipers, stacked card decks, and a restructured navigation (3 tabs + floating FAB). The recommended approach is to build all UI with mock data first, then swap to the existing Firebase backend with minimal refactoring via a repository pattern.

The critical risk is Reanimated 4's breaking changes from v3 and Android-specific 3D transform requirements. Success hinges on establishing animation patterns early, testing on real Android devices continuously, and avoiding common pitfalls like bottom sheet gesture conflicts and safe area inconsistencies. HeroUI Native is in beta (1.0.0-beta.9), which introduces dependency stability risks that must be monitored.

The research identified a clear build order: Foundation (mock data + shared components) → Core Dashboard → Social/Rewards → Profile/Personalization → Onboarding → Advanced Animations. Each phase has well-documented patterns except the 3D stacked wallet deck, which will need experimentation during Phase 4.

## Key Findings

### Recommended Stack

The existing Expo 54 stack with Reanimated 4.1.1, Gesture Handler 2.28.0, and HeroUI Native 1.0.0-beta.9 is production-ready for complex animated UIs. All required packages are already installed. Reanimated 4 introduced breaking API changes (Gesture API replaces useAnimatedGestureHandler, scheduleOnRN replaces runOnJS) but provides 60fps UI thread animations essential for flip cards and swipers. HeroUI Native provides form/overlay components but requires @gorhom/bottom-sheet 5.2.8 integration for keyboard handling in bottom sheets.

**Core technologies:**
- **React Native Reanimated 4.1.1**: UI thread animations for 60fps performance — industry standard for flip cards, gestures
- **React Native Gesture Handler 2.28.0**: Touch gesture recognition — required by Reanimated 4, provides Gesture API
- **@gorhom/bottom-sheet 5.2.8**: Modal overlays with gesture dismissal — HeroUI Native wraps this, needed for forms
- **HeroUI Native 1.0.0-beta.9**: Pre-built components (TextField, Select, Dialog) — reduces custom component work
- **Expo Router 6.0.8**: File-based navigation — handles tab restructure and standalone routes

**Configuration notes:**
- Reanimated 4 requires New Architecture (enabled in app.json)
- react-native-worklets 0.5.1 now required separately (breaking change from v3)
- All packages already installed, no additional dependencies needed

### Expected Features

Research identified 11 table stakes features (card-based dashboard, horizontal swipers, leaderboards, bottom sheets, FABs, pull-to-refresh, activity timer), 10 differentiators (3D flip animations, stacked card deck, AI motivation, reward toaster with QR), and 12 anti-features to avoid (5+ onboarding screens, auto-rotating carousels, screenshot-redeemable QR codes).

**Must have (table stakes):**
- Card-Based Dashboard — industry standard for activity trackers (Strava, Nike, Fitbit)
- Horizontal Swiper with Pagination Dots — universal pattern for featured content
- Leaderboard with Friends/Global Toggle — core gamification, drives engagement
- Bottom Sheet Modals — native mobile pattern for contextual actions
- Floating Action Button (FAB) — cross-platform standard for primary action
- Pull-to-Refresh — universal mobile pattern for dynamic content
- Activity Timer/Stopwatch UI — essential for manual tracking
- Avatar + Badge Identity — expected for profile/identity representation
- Stats/Progress Visualization — core motivation loop
- Achievement Badges — universal gamification pattern

**Should have (competitive):**
- 3D Flip Card Animations — adds polish, saves screen space for "back" content
- 3D Stacked Card Deck (Digital Wallet) — mimics physical wallet, premium feel
- Reward Toaster with QR/Barcode — combines delight (animation) + utility (redemption)
- Coach Personality Picker — increases emotional connection via AI tone customization
- Haptic Feedback — tactile response increases perceived quality
- Micro-Interactions on State Changes — small animations have big UX impact
- Theme Picker — personalization increases ownership, 2x retention
- Glassmorphism UI Elements — 2026 design trend for layered depth

**Defer (v2+):**
- Real-Time Pulse Feed — requires WebSocket/pub-sub infrastructure, high complexity
- AI Motivation Banner — requires GPT-4 backend, mock version loses value
- Daily Quest Micro-Challenges (AI-generated) — personalized quests need AI backend
- Advanced entrance/exit transitions — polish, not blocking functionality

### Architecture Approach

The recommended architecture uses a clean mock data layer (`lib/mock/`) that mirrors the existing Firebase schema, enabling UI-only development with near-zero refactoring when integrating the backend. Screens import from `@/lib/mock` during Phase 1, then swap to `@/lib/db/repository` in Phase 2 (backend integration). Component organization follows a feature-based structure (`components/home/`, `components/stash/`, `components/squad/`, `components/profile/`) to prevent flat-folder sprawl with 40+ components.

**Major components:**
1. **App Shell (`app/_layout.tsx`)** — Provider hierarchy (Gesture → HeroUI → Theme → Auth), auth-based routing
2. **Navigation Layer (`app/(tabs)/_layout.tsx`)** — Custom tab bar with 3 tabs + Parker FAB overlay (not a 4th tab)
3. **Screen Layer** — Tab screens (index, stash, squad) + standalone routes (profile, chat) + modals (log-activity, reward-detail, add-friend)
4. **Component Layer** — Shared reusables (TopBar, ParkerFAB, FlipCard) + feature-specific components organized by screen domain
5. **Data Layer** — Mock repository (Phase 1) → Firebase repository (Phase 2), same interface for zero component changes

**Key patterns:**
- **Custom Tab Bar with FAB Overlay**: Parker FAB is absolute-positioned sibling to Tabs component, not a real tab
- **Repository Pattern with Mock Swap**: Screens depend on interface, not implementation — one-line import swap per screen
- **Reusable Flip Card Animation**: Shared component using Reanimated worklets, used by stats/giveaway/wallet/grand prize
- **Feature-Based Component Organization**: Group by feature domain, not type — mirrors app/ structure
- **Standalone Route Access Pattern**: Profile is Stack screen at root level, accessible from any tab via TopBar avatar

### Critical Pitfalls

Research identified 5 critical pitfalls (rewrites/major issues), 5 moderate pitfalls (delays/debt), and 3 minor pitfalls (annoyances). The most severe are Reanimated 4 New Architecture requirements, Android 3D transform perspective ordering, and bottom sheet gesture conflicts.

1. **Reanimated 4 New Architecture Requirement Not Understood** — Must enable New Architecture + install react-native-worklets 0.5.1 separately before any animation work. Cryptic build failures if missed. Address in Phase 1 before animations.

2. **3D Transform Perspective Ordering Breaking on Android** — Android requires `{ perspective: 1000 }` as FIRST transform in array or 3D effects don't render. iOS is forgiving. Always test Android first in Phase 2 (Card Animations).

3. **GoRhom Bottom Sheet Gesture Conflicts with Touchables** — Buttons/inputs inside bottom sheets don't respond on Android unless imported from @gorhom/bottom-sheet, not react-native. Test every interactive element on Android in Phase 4 (Bottom Sheet Overlays).

4. **Expo Router Navigation State Separation During Tab Restructure** — Router v4 changed behavior. Must use `router.replace()` (not `router.push()`) after auth changes or users see blank screens. Critical for Phase 3 (Tab Restructure).

5. **Safe Area Insets Inconsistency Across Platforms and Modals** — React Native's SafeAreaView only works on iOS. Must use react-native-safe-area-context's `useSafeAreaInsets` hook and manually apply in modals. Address in Phase 1 foundation.

## Implications for Roadmap

Based on research, suggested 6-phase structure with clear dependencies:

### Phase 1: Foundation & Mock Data Layer
**Rationale:** All phases depend on mock data types and shared animation components. Must establish patterns before feature work begins.

**Delivers:**
- Mock data types and constants (`lib/mock/types.ts`, `lib/mock/data.ts`)
- Reusable FlipCard component (Reanimated worklets)
- TopBar and ParkerFAB shared components
- Safe area wrapper utilities
- Tab restructure (3 tabs + FAB overlay)

**Addresses:**
- Table stakes: Navigation structure, FAB placement
- Avoids: Reanimated 4 architecture issues, safe area inconsistencies, TypeScript strict mode pain

**Research flag:** Standard patterns, skip research-phase. Use official Reanimated docs + Expo Router custom tabs pattern.

### Phase 2: Core Dashboard (Home Screen)
**Rationale:** Home is highest-traffic screen, validates animation patterns early. Uses all foundation components.

**Delivers:**
- HeroSwiper (horizontal 2-card swiper with pagination)
- StatsGrid (4 flip cards: Streak, Personal Best, Nature Score, Score Breakdown)
- DailyQuestCard
- LeaderboardPreview widget
- Pull-to-refresh on Home
- HealthTipCard
- GrandPrizeCard

**Addresses:**
- Table stakes: Card dashboard, horizontal swiper, stats visualization, pull-to-refresh
- Differentiators: 3D flip animations, micro-interactions

**Avoids:**
- Android 3D transform issues (test first)
- Horizontal swiper performance degradation (benchmark early)

**Research flag:** Skip research-phase. Flip card pattern from STACK.md, swiper from React Native FlatList docs.

### Phase 3: Social & Rewards (Stash + Squad Screens)
**Rationale:** Independent of Home, can parallelize if multiple devs. Introduces leaderboard toggle pattern and reward carousel.

**Delivers:**
- FeaturedRewardsCarousel (horizontal swiper)
- RewardsGrid (masonry layout)
- MotivationBanner (AI placeholder)
- TBPulse (real-time UI, mock data)
- LeaderboardWidget (Friends/Global toggle)

**Addresses:**
- Table stakes: Leaderboard with toggle, horizontal carousel
- Anti-features: Avoid infinite leaderboards without context (show Friends default)

**Avoids:**
- Leaderboard demotivation (show user rank + 5 above/below)

**Research flag:** Skip research-phase. Leaderboard patterns from FEATURES.md, carousel reuses Home swiper pattern.

### Phase 4: Profile & Digital Wallet
**Rationale:** Most complex animations (3D stacked deck), needs established patterns from Phase 2. Independent of other features.

**Delivers:**
- HeroIdentity (avatar + badge)
- DigitalWallet (3D stacked cards, tap-to-bring-front + flip)
- CoachPersonalityPicker
- LifetimeStatsGrid
- AchievementsRow (horizontal scroll)
- AppThemePicker
- ProfileActions

**Addresses:**
- Differentiators: 3D stacked card deck (premium feature)
- Table stakes: Avatar + badge, achievement badges, theme picker

**Avoids:**
- FlipCard performance issues (reuse established component)
- Gesture conflicts (wallet stack needs custom handling)

**Research flag:** NEEDS RESEARCH-PHASE for 3D stacked wallet deck. Community tutorials exist but not official docs (MEDIUM confidence). Complex gesture handling + zIndex layering + bring-to-front animation requires experimentation.

### Phase 5: Bottom Sheet Modals & Onboarding
**Rationale:** Modals depend on completed feature screens for context. Onboarding can build in parallel with Phase 2-4.

**Delivers:**
- `app/(modals)/log-activity.tsx` (Manual/Timer tabs, bottom sheet)
- `app/(modals)/reward-detail.tsx` (Reward toaster with QR/barcode)
- `app/(modals)/add-friend.tsx` (email input)
- Onboarding horizontal pager (3 screens)
- Permission screens (HealthKit, Push)

**Addresses:**
- Table stakes: Bottom sheet modals, onboarding pager
- Differentiators: Reward toaster with QR
- Anti-features: Avoid 5+ onboarding screens, screenshot-redeemable QR codes

**Avoids:**
- Bottom sheet gesture conflicts (import touchables from @gorhom)
- Onboarding permission rejection (show value first)

**Research flag:** Skip research-phase. Bottom sheet patterns from STACK.md, QR generation server-side (out of scope for UI).

### Phase 6: Polish & Micro-Interactions
**Rationale:** After core UX validated. Optional refinements that enhance but don't block.

**Delivers:**
- Haptic feedback on card flips, swipes, achievements
- Entrance/exit animations (Reanimated entering/exiting)
- FAB scale press animations
- Glassmorphism overlays (frosted glass effects)
- Activity timer stopwatch UI (useFrameCallback)
- Loading skeletons

**Addresses:**
- Differentiators: Haptics, micro-interactions, glassmorphism

**Research flag:** Skip research-phase. Expo Haptics already installed, Reanimated entering/exiting documented.

### Phase Ordering Rationale

- **Foundation first (Phase 1)**: All phases depend on mock data types, FlipCard component, and safe area patterns. Establishing these prevents rework.
- **Home before other screens (Phase 2)**: Highest traffic, validates animation patterns early. If performance issues emerge, can adjust approach before building other screens.
- **Stash + Squad parallel (Phase 3)**: No shared components except TopBar. Can split across developers.
- **Profile after animations proven (Phase 4)**: Wallet deck is most complex animation, benefits from learnings in Phase 2. Can't parallelize due to animation complexity.
- **Modals last (Phase 5)**: Depend on completed screens for context (reward-detail needs rewards, log-activity needs Home).
- **Polish deferred (Phase 6)**: Optional enhancements after core UX validated. Can skip if timeline tight.

**Dependency flow:**
```
Phase 1 (Foundation)
    ↓
Phase 2 (Home) ← validates patterns
    ↓
Phase 3 (Stash + Squad) ← parallel
Phase 4 (Profile) ← uses proven patterns
    ↓
Phase 5 (Modals + Onboarding) ← parallel with Phase 2-4
    ↓
Phase 6 (Polish) ← optional
```

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Digital Wallet):** 3D stacked card deck with bring-to-front + flip. Community tutorials exist but not official patterns. Needs gesture experimentation with zIndex layering, simultaneous pan + tap gestures, and matchedGeometry-style animations. Allocate extra time for prototyping.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Reanimated flip card example is official, Expo Router custom tabs documented
- **Phase 2 (Home):** FlatList horizontal swiper is React Native built-in, flip cards use established pattern
- **Phase 3 (Social/Rewards):** Leaderboard UX is well-documented, carousel reuses swiper pattern
- **Phase 5 (Modals):** Bottom sheet patterns from @gorhom docs, onboarding is standard horizontal pager
- **Phase 6 (Polish):** Haptics API simple, Reanimated entering/exiting documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages already installed, official docs verified. Reanimated 4 API changes documented. HeroUI Native beta is monitored risk. |
| Features | HIGH | Verified with current 2026 sources for activity trackers (Strava, Nike) and gamification patterns. Table stakes clearly established. |
| Architecture | HIGH | Repository pattern is proven. Mock-to-Firebase swap is straightforward. Feature-based component organization scales well. |
| Pitfalls | HIGH | Critical pitfalls sourced from official troubleshooting docs (Reanimated, Bottom Sheet, Expo Router). Android 3D transform issues confirmed across multiple sources. |

**Overall confidence:** HIGH

### Gaps to Address

Research was comprehensive but identified these gaps needing attention during planning/execution:

- **Digital Wallet 3D Stack Animation**: Community tutorials provide starting point but no official pattern. Will require prototyping in Phase 4. May need to simplify if performance issues emerge on Android mid-range devices. Consider fallback to 2D card stack if 3D proves too complex.

- **HeroUI Native Beta Stability**: Version 1.0.0-beta.9 introduces risk of API changes or undiscovered bugs. Monitor GitHub issues during development. Have fallback plan to implement custom components if HeroUI components fail (TextField → custom TextInput wrapper, Select → Picker, Dialog → Modal).

- **Parker FAB Positioning Edge Cases**: Research confirms pattern but didn't cover all edge cases (device rotation, Android gesture nav, iOS bottom sheet interactions). Test extensively on multiple devices in Phase 1.

- **Mock Data Size at Scale**: If leaderboards grow to 100+ entries, will synchronous mock imports cause jank? May need to simulate async loading even with mocks to validate performance patterns. Address if Phase 3 performance testing shows issues.

- **Real-Time Pulse Feed Implementation**: Research covered UI patterns but not WebSocket/pub-sub architecture (out of scope for UI-only milestone). When integrating backend, will need separate research on Firebase Realtime Database vs Firestore listeners vs Cloud Functions + FCM.

## Sources

### Primary (HIGH confidence)
- [React Native Reanimated Official Docs](https://docs.swmansion.com/react-native-reanimated/) — Flip card example, useFrameCallback, interpolate, migration from 3.x
- [React Native Gesture Handler Official Docs](https://docs.swmansion.com/react-native-gesture-handler/) — Gesture API, Pan/Tap gestures, simultaneous handlers
- [HeroUI Native Official Docs](https://v3.heroui.com/docs/native/components) — All components, Bottom Sheet integration
- [@gorhom/bottom-sheet Official Docs](https://gorhom.dev/react-native-bottom-sheet/) — Keyboard handling, troubleshooting, gesture conflicts
- [Expo Router Official Docs](https://docs.expo.dev/router/) — Custom tabs, Stack navigation, migration guide
- [React Native Official Docs](https://reactnative.dev/docs/) — RefreshControl, ScrollView, SafeAreaView
- [React Native Safe Area Context](https://docs.expo.dev/develop/user-interface/safe-areas/) — useSafeAreaInsets hook, iOS modal issues

### Secondary (MEDIUM confidence)
- [Best Dashboard Design Examples 2026 (Muzli)](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/) — Card-based dashboard patterns
- [Strava Gamification Case Study (Trophy)](https://trophy.so/blog/strava-gamification-case-study) — Leaderboard engagement data
- [Creating 3D Flip Card in React Native (Medium)](https://medium.com/@gm_99/creating-a-3d-animated-flip-card-component-in-react-native-with-reanimated-d67ba35193af) — Community implementation
- [Clean Architecture in React Native (Medium)](https://medium.com/@sharmapraveen91/clean-architecture-in-react-native-beyond-the-basics-c5894e6a78c7) — Repository pattern
- [Mobile App Onboarding Guide 2026 (VWO)](https://vwo.com/blog/mobile-app-onboarding-guide/) — Onboarding best practices
- [AsyncStorage Best Practices (MernStackDev)](https://mernstackdev.com/react-native-asyncstorage/) — Onboarding state handling
- [Reanimated 4 Migration Issues (Medium)](https://react-developer.medium.com/fixing-useanimatedstyle-issues-in-react-native-reanimated-a-complete-developer-guide-with-dce6a8af3eb8) — Common mistakes

### Tertiary (LOW confidence, needs validation)
- [Expo Router v4 Navigation Breaking Changes (GitHub)](https://github.com/expo/expo/issues/35212) — router.navigate() behavior change
- [Bottom Sheet initialScrollIndex Bug (GitHub)](https://github.com/gorhom/react-native-bottom-sheet/issues/2026) — Known issue with large lists
- [Swipeable Performance Issues (GitHub)](https://github.com/software-mansion/react-native-gesture-handler/issues/3344) — Deprecated component
- [3D Rotating Credit Card in SwiftUI (Medium)](https://medium.com/@jeninsutariya2833/3d-rotating-credithow-to-build-a-3d-rotating-credit-card-animation-in-swiftui-c82e30e98e10) — Inspiration for wallet stack
- [React Native Stack Cards Animation (AnimateReactNative)](https://www.animatereactnative.com/post/react-native-stack-cards-animation) — Community tutorial for stacked cards

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
