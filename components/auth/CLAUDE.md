# Auth Components (`components/auth/`)

Authentication and onboarding screens for Trailblazer.

## Onboarding Flow

The app uses a multi-step onboarding flow managed by AsyncStorage flags in `app/_layout.tsx`:

1. **First launch** (`@trailblazer_onboarding_seen` not set): `OnboardingScreen` (2 welcome pages)
2. **After onboarding / returning unauthenticated users**: `LoginScreen` (Join screen)
3. **After auth, health permission not shown** (`@trailblazer_health_permission_seen` not set): `PermissionsScreen` (health permission)
4. **After health permission, final permissions not done** (`@trailblazer_permissions_complete` not set): `NotificationPermissionScreen` (push notification permission)
5. **Returning authenticated users with all flags set**: `/(tabs)` (main app)

This ensures partial completion tracking: users who exit after health permission will resume at notification permission on next launch.

## Components

### OnboardingScreen

Two-page horizontal swiper with welcome content.

```typescript
import OnboardingScreen from "@/components/auth/OnboardingScreen";

<OnboardingScreen onComplete={handleOnboardingComplete} />
```

**Props:**

- `onComplete?: () => void` - Called when user completes onboarding (taps "Get Started" on page 2)

**Layout:**

- Page 1: RotatingLogo + "Welcome to Trailblazer+" + body text + arrow button
- Page 2: RotatingLogo + "Let's get started!" + body text + "Get Started" button

**Behavior:**

- Uses FlatList with `pagingEnabled` and `scrollEnabled={false}` (navigation via arrow/button only)
- Arrow button on page 1 scrolls to page 2 via `scrollToIndex`
- "Get Started" button on page 2 calls `onComplete` callback
- Manual index tracking with pagination dots
- RotatingLogo with continuous 360° rotation

### LoginScreen

Join screen with Login and Apple Sign Up buttons. Login button opens a modal overlay with email/password form.

```typescript
import LoginScreen from "@/components/auth/LoginScreen";

<LoginScreen />
```

**Layout:**

- Full-screen background with RotatingLogo at top
- "Join Trailblazer+" title
- "Login" button (opens modal)
- "Sign up with Apple" button (not implemented)
- "Terms & Conditions" link at bottom

**Behavior:**

- "Login" button opens modal overlay via local state
- Modal contains email/password TextFields and "Continue" button
- After successful auth, `app/_layout.tsx` handles routing to permissions or main app
- Modal dismisses on successful login or when user taps outside
- Uses Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`)
- Creates Firestore user doc on signup

**Terms & Conditions:**

- Pressable link at bottom of screen
- Opens `https://www.bcparksfoundation.ca/terms` in browser
- Styled in gray secondary text

### PermissionsScreen

Health permission request screen (first step of two-step permission flow).

```typescript
import PermissionsScreen from "@/components/auth/PermissionsScreen";

<PermissionsScreen onComplete={handleHealthPermissionComplete} />
```

**Props:**

- `onComplete?: () => void` - Called when user accepts OR declines health permission (parent handles AsyncStorage)

**Layout:**

- RotatingLogo + "Track automatically?" title + body text
- "Yes, I agree" button (triggers health permission request)
- "No, don't use my health data" button (shows warning dialog)

**Behavior:**

- Accept button: requests HealthKit authorization via `@kingstinct/react-native-healthkit`, then calls `onComplete`
- Decline button: shows Alert.alert warning dialog with "Go Back" and "Continue Anyway" options
- Warning dialog title: "Missing Out"
- Warning dialog body: "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?"
- "Continue Anyway" (destructive style) calls `onComplete` without requesting permission
- `onComplete` callback triggers `app/_layout.tsx` to set `@trailblazer_health_permission_seen` flag and show NotificationPermissionScreen
- Does NOT set `@trailblazer_permissions_complete` flag (that's set by NotificationPermissionScreen)

### NotificationPermissionScreen

Push notification permission request screen (second step of two-step permission flow).

```typescript
import NotificationPermissionScreen from "@/components/auth/NotificationPermissionScreen";

<NotificationPermissionScreen onComplete={handlePermissionsComplete} />
```

**Props:**

- `onComplete?: () => void` - Called when user accepts OR declines push notifications (parent handles AsyncStorage)

**Layout:**

- RotatingLogo + "Stay motivated." title + body text
- "Yes, I agree" button (triggers push notification permission request)
- "No, don't notify me" button (proceeds without warning)

**Behavior:**

- Accept button: requests notification permissions via `expo-notifications` with iOS alert/badge/sound, then calls `onComplete`
- Decline button: calls `onComplete` directly (NO warning dialog per user decision)
- `onComplete` callback triggers `app/_layout.tsx` to set `@trailblazer_permissions_complete` flag and navigate to main app
- Fails gracefully on simulator or if permission already granted

### RotatingLogo

Reusable animated logo component used across onboarding/auth screens.

```typescript
import { RotatingLogo } from "@/components/onboarding/RotatingLogo";

<RotatingLogo size={80} />
```

**Props:**

- `size?: number` - Logo size in pixels (default: 80)

**Behavior:**

- Continuous 360° rotation using Reanimated `withRepeat`
- 10-second duration per rotation
- Logo source: `@/assets/images/icon.png`

## AsyncStorage Keys

| Key | Purpose | Set By | Read By |
|-----|---------|--------|---------|
| `@trailblazer_onboarding_seen` | Tracks if user has seen welcome screens | `app/_layout.tsx` after OnboardingScreen | `app/_layout.tsx` on launch |
| `@trailblazer_health_permission_seen` | Tracks if user has seen health permission screen | `app/_layout.tsx` after PermissionsScreen | `app/_layout.tsx` on launch |
| `@trailblazer_permissions_complete` | Tracks if ALL permissions complete (health + notifications) | `app/_layout.tsx` after NotificationPermissionScreen | `app/_layout.tsx` on launch |

All three keys are cleared on sign out via `AsyncStorage.multiRemove`.

## Routing Logic (app/_layout.tsx)

The root layout checks flags in this order:

1. **!hasSeenOnboarding** → Show `OnboardingScreen`
2. **!user** → Show `LoginScreen`
3. **!hasSeenHealthPermission** → Show `PermissionsScreen`
4. **!hasCompletedPermissions** → Show `NotificationPermissionScreen`
5. **All flags true** → Show `(tabs)` main app

This ensures:

- First-time users: Welcome → Login → Health Permission → Push Permission → Main App
- Partial completion (exit after health): Resume at Push Permission on next launch
- Returning authenticated users with all flags: Skip directly to main app

## Design Patterns

### Callback-Based Navigation

All auth screens use `onComplete` callbacks instead of direct navigation. The parent `app/_layout.tsx` handles AsyncStorage flag updates and navigation logic. This ensures clean separation of concerns and makes screens reusable.

### No Direct AsyncStorage in Components

Auth screens do NOT directly set AsyncStorage flags. They call `onComplete` callbacks, and the parent layout handles persistence. This keeps components stateless and testable.

### Alert.alert for Native Dialogs

PermissionsScreen uses React Native's `Alert.alert` for the health permission decline warning. This provides a native iOS/Android dialog instead of a custom modal, maintaining platform consistency.


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

### Feb 5, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #670 | 7:41 PM | 🔄 | Removed redundant screenWidth from LoginScreen container | ~265 |
| #655 | 7:35 PM | 🔴 | Added alignment and spacing properties to LoginScreen container | ~257 |
</claude-mem-context>
