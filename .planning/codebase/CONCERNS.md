# Codebase Concerns

**Analysis Date:** 2026-01-27

## Tech Debt

**Incomplete Feature Implementation:**
- Issue: Social authentication (Google & Apple Sign-In) is stubbed out with TODO comments
- Files: `components/SocialAuthButtons.tsx` (lines 31, 36)
- Impact: Users cannot sign in via Google or Apple, reducing signup conversion. Currently only email/password auth works.
- Fix approach: Implement Firebase social authentication using `@react-native-google-signin/google-signin` (already in package.json) and `expo-apple-authentication` (already in package.json). Follow Firebase native auth patterns with error handling.

**Activity Logging Modal Not Implemented:**
- Issue: `app/(modals)/log-activity.tsx` is a placeholder with "Activity logging form coming soon" message
- Files: `app/(modals)/log-activity.tsx` (line 61)
- Impact: Users cannot manually log activities. The modal renders but contains no form fields, inputs, or submission logic.
- Fix approach: Implement form with activity type selector, distance input, duration input, location field. Wire to `logActivity()` function from `lib/db/activities.ts`. Add validation and error handling.

**Reset Challenge Modal Logic Missing:**
- Issue: `app/(modals)/reset-challenge.tsx` has `handleReset()` callback that does nothing (line 18-21)
- Files: `app/(modals)/reset-challenge.tsx`
- Impact: "Reset Challenge" button appears functional but does not reset user stats/activities. No error handling or user feedback.
- Fix approach: Call `resetUserChallenge()` from `lib/db/users.ts` with loading state, error handling, and success confirmation. Add haptic feedback.

**Hardcoded Profile Stats:**
- Issue: Profile screen shows hardcoded dummy stats ("156.4 km", "47 activities", etc.)
- Files: `app/(tabs)/profile.tsx` (lines 79-84)
- Impact: User sees fake data instead of their actual statistics. Stats are not fetched from Firestore or synced with real activity data.
- Fix approach: Fetch `UserDocument` from Firestore on mount, display actual `stats.totalKm`, `stats.totalMinutes`, `stats.totalSteps`, and `stats.currentStreak`. Add real-time listener for updates.

## Known Bugs

**HealthKit Authorization Recovery Has Edge Case:**
- Symptoms: After user denies HealthKit permission once, they must manually go to Settings to change it. Re-requesting via alert dialog won't re-show iOS permission sheet.
- Files: `lib/health/hooks.ts` (lines 119-154), `lib/health/config.ts` (lines 131-154)
- Trigger: User taps "Connect Apple Health", denies permission, then taps connect again in same app session
- Workaround: Direct user to Settings > Privacy & Security > Health > Trailblazer to toggle permission (error message does this at lines 147 in config.ts)
- Note: This is iOS behavior, not a bug in code, but users expect permission dialog to reappear.

**Missed Analytics on Failed Authentication:**
- Symptoms: Firebase authentication errors are caught and displayed but not logged for analytics
- Files: `app/login.tsx` (lines 86-92)
- Trigger: User attempts signup/signin with invalid credentials or experiences network errors
- Impact: No visibility into auth failure patterns. Can't identify problematic sign-up flows.
- Fix approach: Send error codes to analytics service (e.g., Firebase Analytics or Sentry). Track "auth_failed" events with error codes.

**Potential Race Condition in Auth Navigation:**
- Symptoms: User might briefly see wrong screen during auth state transition
- Files: `app/_layout.tsx` (lines 33-54)
- Trigger: Two `useEffect` hooks manage navigation (`useEffect` at line 33 and line 46). Both call `router.replace()` when user state changes.
- Impact: Navigation might execute twice, causing brief visual flicker or duplicate navigation events
- Fix approach: Consolidate into single `useEffect`. Use the `hasNavigated` ref more carefully to prevent multiple executions.

## Security Considerations

**Firebase Credentials Exposed in Env Vars:**
- Risk: Firebase API key and project ID are in environment variables prefixed with `EXPO_PUBLIC_`, meaning they are bundled into the app
- Files: `lib/firebase.ts` (lines 7-14)
- Current mitigation: Firebase Security Rules should restrict data access. Keys are public by design in Expo apps.
- Recommendations: Verify Firestore Security Rules explicitly deny anonymous access. Use Cloud Functions for sensitive operations (e.g., charging for Platinum upgrade). Monitor Firestore for unexpected queries via Analytics.

**No Input Validation on Activity Logging:**
- Risk: When activity logging is implemented, user inputs (distance, duration, location) will be stored without validation
- Files: `app/(modals)/log-activity.tsx` - not yet implemented
- Current mitigation: None
- Recommendations: Validate distance > 0, duration > 0. Sanitize location strings. Set max values to prevent unrealistic data (e.g., max 1000km per activity). Consider quota per user per day.

**HealthKit Data Not Encrypted at Rest:**
- Risk: Synced workouts from Apple Health are stored unencrypted in Firestore
- Files: `lib/health/sync.ts` (lines 125-142)
- Current mitigation: Firestore encryption handled by Google Cloud (transparent), but no app-level encryption
- Recommendations: For health data (which is sensitive), consider app-level encryption before storing, or use Firestore's client-side encryption library. Ensure Firestore rules prevent unauthorized access to other users' activities.

**Sign Out Doesn't Clear Local Cached Data:**
- Risk: User signs out but app may retain cached data from previous session if using MMKV storage
- Files: `app/(tabs)/profile.tsx` (line 47), `lib/firebase.ts` (line 24)
- Current mitigation: `signOut()` clears Firebase auth, but MMKV cache is not cleared
- Recommendations: On sign out, clear MMKV storage: `mmkvStorage.clearAll()`. Ensure no Firestore listeners continue after sign out.

## Performance Bottlenecks

**Inefficient Activity List Rendering:**
- Problem: When fetching all user activities, no pagination or virtualization
- Files: `lib/db/activities.ts` (lines 58-94), `components/ActivityListItem.tsx`
- Cause: `getUserActivities()` fetches all activities without limit. Rendering large activity lists in flat lists without virtualization causes jank.
- Impact: Apps with 100+ activities will have slow scrolling and high memory usage
- Improvement path: Implement `FlatList` with `maxToRenderPerBatch`, add pagination with cursor-based queries, or use lazy loading. Limit default query to 50 most recent activities.

**No Caching of User Stats:**
- Problem: User stats displayed on profile are fetched fresh from Firestore on each screen visit
- Files: `app/(tabs)/profile.tsx`, `lib/db/users.ts` (lines 41-57)
- Cause: No local cache, no reuse of previously fetched data
- Impact: Slow profile screen load, unnecessary Firestore reads
- Improvement path: Cache user stats in React Context or React Query. Revalidate on app focus. Use `onSnapshot()` listener for real-time updates instead of one-shot `getUser()`.

**Streak Calculation on Every Activity Log:**
- Problem: `updateStreak()` is called after every activity log, fetching full user document, comparing dates, and writing back
- Files: `lib/db/users.ts` (lines 110-141), `lib/db/activities.ts` (line 53)
- Cause: No batching. Each activity triggers separate Firestore transaction.
- Impact: Rate limiting risk if user bulk-uploads activities. Increased Firestore read/write costs.
- Improvement path: Batch multiple activity logs into single transaction. Calculate all stat deltas before writing. Use `writeBatch()` for atomic multi-document updates.

**HealthKit Sync Queries All Workouts on Every Sync:**
- Problem: `getHealthKitWorkouts()` queries all workouts since 30 days ago on every sync (even if already synced)
- Files: `lib/health/sync.ts` (lines 25-48)
- Cause: No timestamp tracking of last successful fetch. `workoutExists()` checks Firestore for duplicates, but still requires fetching from HealthKit
- Impact: Slow sync time. Battery drain on frequent syncs.
- Improvement path: Store last sync timestamp. Only query workouts since last sync time. Fall back to 30-day window on first sync.

## Fragile Areas

**Health Connection State Dependent on Firestore Listener:**
- Files: `lib/health/hooks.ts` (lines 73-105), `lib/health/sync.ts` (lines 104-161)
- Why fragile: `useHealthConnection` relies on Firestore listener to detect connection status. If listener fails or network is offline, UI may show wrong state. Auto-sync can trigger multiple times if listener re-fires.
- Safe modification: Add retry logic to listener. Track listener errors separately from state errors. Use `hasAutoSynced` ref consistently to prevent duplicate syncs.
- Test coverage: No unit tests visible. Needs tests for: connection state transitions, sync completion, authorization loss, network failures.

**Reset Challenge Cascade Delete Without Transaction:**
- Files: `lib/db/users.ts` (lines 226-253)
- Why fragile: `resetUserChallenge()` updates user stats, then separately deletes all activities and saved adventures. If deletion fails mid-way, user stats are reset but data exists, causing inconsistency.
- Safe modification: Use Firestore transactions or batch writes. Update user stats only after all deletes succeed.
- Test coverage: No visible tests. Risk of data corruption if network fails during delete.

**Expo Router Navigation During Auth Changes:**
- Files: `app/_layout.tsx` (lines 28-86)
- Why fragile: Multiple `useEffect` hooks manage navigation. If auth state changes rapidly (login → logout → login), multiple navigation events could queue up and cause unexpected screen transitions.
- Safe modification: Use single consolidated `useEffect`. Queue navigation changes instead of executing immediately. Consider using a state machine for auth flows.
- Test coverage: Needs integration tests for rapid auth state changes, network interruptions during auth.

**No Error Boundaries:**
- Files: All screen components (no error boundary visible in codebase)
- Why fragile: A single crash in any child component will crash entire app. No fallback UI or recovery.
- Safe modification: Implement error boundary wrapper around Stack navigator. Add try-catch in critical effects. Log errors to Sentry for visibility.
- Test coverage: No visible error handling tests.

## Scaling Limits

**Firestore Document Size for User Activities:**
- Current capacity: Each user subcollection can have thousands of activity documents (no visible limit)
- Limit: User stats field on main user document is updated incrementally for every activity. With 1000+ activities, a single user document could approach size limits if stats are denormalized incorrectly.
- Scaling path: Stats are already normalized (single integer fields), so no issue for document size. However, batch writes of 500+ activities may hit Firestore transaction size limits (atomic operations limited to ~100 documents).

**Activity List Query Performance:**
- Current capacity: `getUserActivities()` fetches all activities without limit
- Limit: Querying 500+ activities in single go will cause Firestore timeout or memory issues on device
- Scaling path: Implement pagination with cursor-based queries. Fetch 50 at a time. Use Cloud Functions to aggregate stats server-side instead of client-side calculations.

**Real-Time Listener Proliferation:**
- Current capacity: Each screen with `useHealthConnection` or user listener creates Firestore snapshot subscription
- Limit: 100+ concurrent listeners will degrade performance. Each listener consumes memory and network bandwidth.
- Scaling path: Consolidate listeners into single global context. Use React Query or SWR for centralized cache management. Unsubscribe listeners when screens unmount.

## Dependencies at Risk

**@kingstinct/react-native-healthkit v13.1.0:**
- Risk: Newer versions may have breaking changes. Only works on iOS (platform-specific dependency).
- Impact: Breaks Apple Health feature. Android users have no equivalent (no HealthKit sync).
- Migration plan: Monitor releases. Pin to stable version. Implement fallback to manual logging for Android. Consider alternatives like `react-native-health` if needed.

**heroui-native v1.0.0-beta.9 (Beta Version):**
- Risk: Beta version may have bugs, API changes before v1 release. Not suitable for production apps.
- Impact: Unexpected behavior in UI components. Breaking changes in future updates.
- Migration plan: Monitor for v1.0 stable release. Plan upgrade path. Test thoroughly before updating.

**expo ^54.0.10 & react-native ^0.81.5 (Actively Developed):**
- Risk: Rapid release cycles. New Architecture adoption may break compatibility.
- Impact: Build failures, new bugs with each minor update. Difficult to debug.
- Migration plan: Lock to specific patch versions. Test updates in staging before deploying to production.

## Missing Critical Features

**No Offline Support:**
- Problem: App requires internet connection for all operations. No offline fallback.
- Blocks: Users cannot view cached activities, stats, or profile offline. Cannot queue activities to sync later.
- Risk: Poor UX for users with spotty connectivity.
- Improvement: Implement local cache with periodic Firestore sync. Use `react-query` with offline persistence.

**No Analytics or Crash Reporting:**
- Problem: No visibility into user errors, feature usage, or app performance.
- Blocks: Cannot identify broken flows or popular features. Cannot triage bugs without user reports.
- Risk: Production issues go undetected. Cannot prioritize improvements.
- Improvement: Integrate Firebase Analytics and Sentry. Track key events: sign up, activity log, Apple Health sync success/failure.

**No Social Features:**
- Problem: Activities are private. No friend lists, leaderboards, or activity sharing.
- Blocks: Reduces engagement. Hard to build community.
- Note: Rewards store exists but no way to share achievements.

**No Email Verification:**
- Problem: Users can sign up with any email. No confirmation email sent.
- Blocks: Users may use wrong email and lose account access.
- Risk: Spam accounts.
- Improvement: Send verification email before activating account. Require email link click to confirm.

## Test Coverage Gaps

**No Tests for HealthKit Integration:**
- What's not tested: Authorization flow, sync deduplication, error recovery after authorization loss
- Files: `lib/health/sync.ts`, `lib/health/hooks.ts`, `lib/health/config.ts`
- Risk: HealthKit sync may silently fail or duplicate activities without detection. Authorization bugs not caught until user reports.
- Priority: High - Apple Health is critical feature

**No Tests for Activity Logging:**
- What's not tested: Stats updates, streak calculations, data consistency
- Files: `lib/db/activities.ts`, `lib/db/users.ts`
- Risk: Streaks may miscalculate. Stats may diverge from actual activities. Bugs in reset logic could corrupt data.
- Priority: High - affects core gamification

**No Tests for Auth Flow:**
- What's not tested: Sign up, sign in, sign out, error cases, navigation during auth changes
- Files: `app/login.tsx`, `contexts/auth-context.tsx`, `app/_layout.tsx`
- Risk: Auth bugs not caught until production. Race conditions in navigation.
- Priority: High - auth is foundation

**No Component Tests:**
- What's not tested: Modal interactions, form submissions, error displays
- Files: `components/`, `app/(modals)/`, `app/(tabs)/`
- Risk: UI regressions not caught. Accessibility issues not found.
- Priority: Medium - mostly UI concerns

**No Integration Tests:**
- What's not tested: End-to-end flows (sign up → log activity → view stats → sync health), error scenarios
- Risk: Features work in isolation but break in real user workflows.
- Priority: High - integration bugs are expensive to fix in production

---

*Concerns audit: 2026-01-27*
