# Requirements: Trailblazer+ UI Rebuild

**Defined:** 2026-01-27
**Core Value:** Every screen matches wireframe designs, feels native, and mock data cleanly separates from future backend.

## v1 Requirements

### Mock Data Layer

- [ ] **MOCK-01**: All UI-specific TypeScript interfaces defined in `lib/mock/types.ts`
- [ ] **MOCK-02**: All hardcoded mock data centralized in `lib/mock/data.ts` with realistic values
- [ ] **MOCK-03**: No Firebase imports in any new screen file — screens import from `@/lib/mock` only

### Navigation & Layout

- [ ] **NAV-01**: 3-tab bottom navigation: Home, Your Stash, Your Squad
- [ ] **NAV-02**: Parker FAB (bear icon, bottom-right of dock) opens Parker Chat on tap
- [ ] **NAV-03**: Shared TopBar component on all tab screens: daily affirmation text, date (MMM DD), profile avatar
- [ ] **NAV-04**: Avatar tap in TopBar navigates to Profile (standalone route, not a tab)
- [ ] **NAV-05**: "+" FAB visible on Home screen (stub — shows "Coming Soon" toast on tap)
- [ ] **NAV-06**: Add Friend button visible on Squad screen header (stub — shows "Coming Soon" toast on tap)

### Home Screen

- [ ] **HOME-01**: Hero card swiper with 2 cards (motivation text with refresh + minutes active counter), page indicator dots
- [ ] **HOME-02**: Streak flip card — front: fire icon + current streak + "Days Active"; back: personal best streak
- [ ] **HOME-03**: Nature Score flip card — front: leaf icon + calculated score + "Room to Improve"; back: breakdown logic text
- [ ] **HOME-04**: Leaderboard preview with Friends/Global toggle, top 5 ranked entries, "View All" navigates to Your Squad tab

### Your Stash Screen

- [ ] **STSH-01**: Featured rewards horizontal carousel (max 6 cards, page indicator dots)
- [ ] **STSH-02**: 2-column rewards grid with vendor name + reward info per tile
- [ ] **STSH-03**: Tapping any reward opens Reward Toaster bottom sheet (does not navigate away)

### Your Squad Screen

- [ ] **SQUD-01**: Leaderboard widget with Friends/Global toggle switch
- [ ] **SQUD-02**: Ranked rows showing avatar, name, total time — current user row highlighted
- [ ] **SQUD-03**: Screen header shows "Your Squad" title, "Everything's better together." subtitle

### Profile Screen

- [ ] **PROF-01**: Hero identity section — large avatar, user name (H1), membership tier (H2)
- [ ] **PROF-02**: Lifetime stats grid (3x2): Total Mins, Longest Streak, Total KMs, Badges, Total Activities, Challenges
- [ ] **PROF-03**: Data Sync toggles for Apple Health and Google Fit (UI-only, no real sync)
- [ ] **PROF-04**: Account management button (opens web browser placeholder URL)
- [ ] **PROF-05**: Privacy Policy link (opens web browser placeholder URL)
- [ ] **PROF-06**: Terms of Use link (opens web browser placeholder URL)
- [ ] **PROF-07**: Sign out button (uses existing auth signOut functionality)

### Onboarding Flow

- [ ] **ONBD-01**: 3-screen horizontal pager — Welcome 1 ("Get rewarded for time in nature"), Welcome 2 ("Where does the money go?"), Login screen
- [ ] **ONBD-02**: Login screen with Login button + Sign up with Apple + Sign up with Google
- [ ] **ONBD-03**: Health API permission screen with "Yes, I agree" / "No" options (UI-only, no real HealthKit request)
- [ ] **ONBD-04**: Push Notifications permission screen with "Yes, I agree" / "No" options (UI-only)
- [ ] **ONBD-05**: AsyncStorage tracks onboarding completion — first launch shows onboarding, subsequent launches skip

### Overlays

- [ ] **OVLY-01**: Reward Toaster — bottom sheet slides up, shows reward title, description, QR placeholder or barcode placeholder or coupon code text
- [ ] **OVLY-02**: Parker Chat — existing full-screen chat interface matches design navigation (bear FAB → chat)

### Animations

- [ ] **ANIM-01**: 3D flip card animation on Streak and Nature Score cards (smooth rotateY with perspective, 300-400ms)
- [ ] **ANIM-02**: Hero card swiper horizontal gesture with page indicator dots that track scroll position

## v2 Requirements

### Home Screen Additions

- **HOME-05**: Daily Quest card with AI-generated micro-challenge text
- **HOME-06**: Weekly Giveaway flip card (front: prize/enter, back: requirements/entered badge)
- **HOME-07**: Healthy by Nature health tip card
- **HOME-08**: Grand Prize flip card ($50k, progress bar 14/60 days, rules on back)

### Squad Additions

- **SQUD-04**: AI motivation banner at top of Squad screen
- **SQUD-05**: TB Pulse real-time notification feed

### Profile Additions

- **PROF-08**: Digital wallet 3D stacked card deck (TB+, BC Parks Pass, NSMBA) with tap-to-front + flip animation
- **PROF-09**: Coach Personality selector (Drill Sgt, Bestie, Zen, Hype, Witty)
- **PROF-10**: Achievements horizontal scroll row (10 hrs, Early Bird, Hiker, Rain or Shine, Four Seasons)
- **PROF-11**: App Theme color picker (Green, Blue, Purple, Pink, Orange)
- **PROF-12**: Edit Profile button
- **PROF-13**: Action buttons grid (Upgrade, Download App, Settings, Reset Challenge)

### Modal Additions

- **OVLY-03**: Log Activity overlay — Manual tab (activity chips + name + duration) and Timer tab (stopwatch + play/stop)
- **OVLY-04**: Add Friend modal — email input + Send Invite button

### Animation Additions

- **ANIM-03**: Digital wallet 3D stack animation (tap to bring front + flip for barcode)
- **ANIM-04**: Parker FAB scale press animation
- **ANIM-05**: Pull-to-refresh on Home and Squad (no-op spinner)
- **ANIM-06**: Haptic feedback on card flips and button presses

### AI Features (Requires Backend)

- **AI-01**: Your Legend — AI-generated fantasy description of user based on lifetime stats + share card

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend integration (Firebase reads/writes) | Separate milestone — this is UI-only with mock data |
| Real AI responses (Parker, quest, tips) | Requires AI backend — mock text in v1 |
| Push notification delivery | Permission screen is UI-only |
| Real HealthKit sync from new screens | Existing code preserved but not imported by new screens |
| Real QR/barcode generation | Placeholder visuals only — server-side generation in future |
| Video/rich media | Not in design spec |
| Real-time WebSocket feeds | TB Pulse deferred to v2, mock data only |
| OAuth token refresh | Existing auth code handles this already |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOCK-01 | Phase 1 | Pending |
| MOCK-02 | Phase 1 | Pending |
| MOCK-03 | Phase 1 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| NAV-04 | Phase 2 | Pending |
| NAV-05 | Phase 2 | Pending |
| NAV-06 | Phase 2 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-02 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |
| HOME-04 | Phase 3 | Pending |
| STSH-01 | Phase 4 | Pending |
| STSH-02 | Phase 4 | Pending |
| STSH-03 | Phase 4 | Pending |
| SQUD-01 | Phase 4 | Pending |
| SQUD-02 | Phase 4 | Pending |
| SQUD-03 | Phase 4 | Pending |
| PROF-01 | Phase 5 | Pending |
| PROF-02 | Phase 5 | Pending |
| PROF-03 | Phase 5 | Pending |
| PROF-04 | Phase 5 | Pending |
| PROF-05 | Phase 5 | Pending |
| PROF-06 | Phase 5 | Pending |
| PROF-07 | Phase 5 | Pending |
| ONBD-01 | Phase 6 | Pending |
| ONBD-02 | Phase 6 | Pending |
| ONBD-03 | Phase 6 | Pending |
| ONBD-04 | Phase 6 | Pending |
| ONBD-05 | Phase 6 | Pending |
| OVLY-01 | Phase 4 | Pending |
| OVLY-02 | Phase 2 | Pending |
| ANIM-01 | Phase 3 | Pending |
| ANIM-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after initial definition*
