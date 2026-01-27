# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Layered React Native application with file-based routing, Firebase backend, and specialized modules for health integration.

**Key Characteristics:**
- File-based routing via Expo Router with auth-based screen routing
- Separation of concerns: presentation (screens) → business logic (lib) → data access (db)
- Provider-based global state (Auth, Theme)
- Single-source-of-truth for constants and shared configuration
- Client-side health integration with lazy loading for platform-specific code

## Layers

**Presentation Layer (UI):**
- Purpose: Screen components and UI elements rendered to users
- Location: `app/` (Expo Router pages), `components/` (reusable components)
- Contains: Screen files (.tsx), HeroUI Native components, navigation configuration
- Depends on: Contexts (auth, theme), hooks, business logic from lib/, React Native
- Used by: End users via Expo Router navigation

**Business Logic Layer:**
- Purpose: Application-specific operations and data transformations
- Location: `lib/` (core logic), `lib/health/` (Apple Health integration), `lib/constants/` (shared values)
- Contains: Activity type mappings, step calculations, health sync logic, source configurations
- Depends on: Database layer, external libraries (HealthKit SDK)
- Used by: Presentation layer screens and modals

**Data Access Layer:**
- Purpose: Firestore operations and data persistence
- Location: `lib/db/`
- Contains: CRUD operations for users, activities, saved adventures; type definitions; collection paths; batch operations
- Depends on: Firebase SDK, lib/constants
- Used by: Business logic layer and directly by some screens

**Global State Layer:**
- Purpose: Shared application state accessible across all screens
- Location: `contexts/`
- Contains: AuthContext (Firebase auth state), ThemeContext (light/dark theme)
- Depends on: Firebase Auth, React Native AsyncStorage/MMKV
- Used by: All screens via context hooks

**Backend Layer:**
- Purpose: Server-side operations (future)
- Location: `functions/src/`
- Contains: Firebase Cloud Functions bootstrap (currently minimal)
- Depends on: Firebase Admin SDK
- Used by: Firestore Cloud Functions triggers

## Data Flow

**User Authentication:**

1. `app/login.tsx` renders Google/Apple sign-in buttons
2. User taps sign-in button → Firebase Auth provider (Google/Apple)
3. Firebase returns authenticated user
4. `AuthProvider` in `contexts/auth-context.tsx` updates user state
5. Auth state triggers effect in `app/_layout.tsx`
6. `RootLayoutNav` uses `router.replace("/(tabs)")` to navigate authenticated users to main app

**Activity Logging (Manual):**

1. User taps "Log Activity" → `router.push("/(modals)/log-activity")`
2. Modal form captures: activity type, duration, distance, location
3. User submits → `logActivity(uid, input)` from `lib/db/activities.ts`
4. Function:
   - Adds document to `users/{uid}/activities` collection
   - Calculates step estimate via `calculateSteps(type, distance)`
   - Increments user stats via `incrementUserStats(uid, {km, minutes, steps})`
   - Computes/updates streak via `updateStreak(uid)`
5. Modal closes, home screen refetches data from `getUserStats()` and `getRecentActivities()`

**Activity Logging (Apple Health):**

1. User taps "Connect Apple Health" in profile → `connect()` from `useHealthConnection` hook
2. Hook calls `initHealthKit()` which requests HealthKit authorization
3. iOS shows permission dialog
4. On approval:
   - `healthConnection` stored in Firestore user doc: `{isAuthorized: true, connectedAt: Timestamp}`
   - Auto-sync effect triggers in profile/home screen
5. `sync()` executes:
   - Calls `ensureHealthKitAuthorized()` to verify permission still valid
   - Queries 30 days of HealthKit workouts via native module
   - Maps HealthKit types to app types using `mapWorkoutType()`
   - Deduplicates by `externalId` (HealthKit UUID)
   - Fetches distance statistics for each workout
   - Stores activities to `users/{uid}/activities` with `source: "apple_health"`
   - Increments user stats
6. Home screen displays activities from both sources with source-specific colors/emojis

**State Management:**

- Auth state: Persisted via MMKV in `lib/firebase.ts` initialization → `onAuthStateChanged` listener
- Theme state: Persisted to AsyncStorage in `contexts/theme-context.tsx` → computed color/shadow tokens
- Activity/stats data: Fetched on-demand by screens → stored in component state via `useState`
- No global cache: Each screen refetches when necessary (simple, prevents stale data)

## Key Abstractions

**Activity Source (ActivitySource type):**
- Purpose: Abstraction for activity origin (manual vs. Apple Health)
- Examples: `lib/db/types.ts`, `lib/constants/sources.ts`
- Pattern: Union type with centralized source configuration
- Used by: Database queries, UI rendering (colors/emojis), activity logging

**UserStats (computed, not stored):**
- Purpose: Aggregated user metrics recalculated from activities
- Examples: `lib/db/users.ts` (getUserStats, incrementUserStats, updateStreak)
- Pattern: Calculated from activity records, updates triggered atomically with activity logging
- Used by: Home screen dashboard, rewards eligibility

**Activity Transformations:**
- Purpose: Map between internal types and external formats
- Examples: `mapWorkoutType()` (HealthKit → app types), `calculateSteps()` (activity → step estimate)
- Pattern: Pure functions, centralized in lib/constants
- Used by: Health sync, activity creation, reporting

**Modal Navigation Pattern:**
- Purpose: Route-based modals instead of context state
- Examples: Modals in `app/(modals)/`
- Pattern: `router.push("/(modals)/name")` to open, `router.back()` to close
- Used by: Log activity, badge detail, reward detail, upgrades

## Entry Points

**App Entry (`app/_layout.tsx`):**
- Location: `app/_layout.tsx`
- Triggers: App startup
- Responsibilities:
  - Initialize provider hierarchy (Gesture Handler, HeroUI, Theme, Auth, BottomSheet)
  - Listen to auth state changes
  - Conditionally render auth vs. main app screens
  - Navigate user on auth state changes using `router.replace()`

**Login Screen (`app/login.tsx`):**
- Location: `app/login.tsx`
- Triggers: App startup when user is null
- Responsibilities:
  - Render Google/Apple sign-in buttons
  - Initiate OAuth flows via Firebase
  - Display loading states and errors

**Home Tab (`app/(tabs)/index.tsx`):**
- Location: `app/(tabs)/index.tsx`
- Triggers: User taps Home in tab bar
- Responsibilities:
  - Display user stats (km, minutes, steps, streak)
  - Show recent activities feed
  - Manage Apple Health connection UI
  - Trigger activity logging modal

**Profile Tab (`app/(tabs)/profile.tsx`):**
- Location: `app/(tabs)/profile.tsx`
- Triggers: User taps Profile in tab bar
- Responsibilities:
  - Display user information
  - Manage Apple Health connection status
  - Show sign-out button

**Health Sync Hook (`lib/health/hooks.ts`):**
- Location: `lib/health/hooks.ts` (useHealthConnection hook)
- Triggers: Any component calling useHealthConnection(uid)
- Responsibilities:
  - Manage HealthKit authorization state
  - Expose `sync()` function for manual syncing
  - Auto-sync on connection
  - Handle platform availability (iOS only)

## Error Handling

**Strategy:** Errors are caught at layer boundaries and communicated to users via alerts or UI state.

**Patterns:**

- **Database errors:** Try-catch in screens, logged to console, shown as alert or fallback UI
  - Example: `app/(tabs)/index.tsx` wraps `getUserStats()` and `getRecentActivities()` in try-catch

- **Health sync errors:** Caught in `useHealthConnection`, stored in `error` state, displayed as alert
  - Example: `ensureHealthKitAuthorized()` catches permission errors, shows alert, auto-disconnects

- **Auth errors:** Handled by Firebase SDK, caught by `AuthProvider` listener, triggers navigation to login

- **Validation errors:** Form validation in modal screens, error messages shown inline
  - Example: `log-activity.tsx` validates duration/distance before submission

## Cross-Cutting Concerns

**Logging:** Console.log with prefixes for debugging
- `[Auth]` - auth context changes
- `[Health]` - Apple Health operations
- No centralized logging service

**Validation:**
- Form validation in modal screens (required fields, numeric ranges)
- Type validation via TypeScript strict mode
- No centralized validation framework

**Authentication:**
- Firebase Auth for user identity
- MMKV persistence for offline auth state
- All database operations require `uid` from `useAuth()`

**Theming:**
- Centralized in `contexts/theme-context.tsx`
- Color tokens computed from selected theme (light/dark)
- Persisted to AsyncStorage
- HeroUI Native components automatically respect theme

**Constants & Configuration:**
- Single source of truth: `lib/constants/`
- Source config (colors, emojis, labels): `lib/constants/sources.ts`
- Activity constants (steps per km, activity types): `lib/constants/activity.ts`
- Collection paths: `lib/db/utils.ts`
- HealthKit mappings: `lib/health/config.ts`

---

*Architecture analysis: 2026-01-27*
