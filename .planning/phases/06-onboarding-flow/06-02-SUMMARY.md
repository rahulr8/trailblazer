---
phase: 06-onboarding-flow
plan: 02
subsystem: onboarding
completed: 2026-02-06
duration: 3.1min
tags: [permissions, notifications, health, onboarding, asyncstorage]

requires:
  - "06-01: OnboardingScreen with RotatingLogo and skip button"
  - "Auth system with Firebase Auth"
  - "AsyncStorage for persistence"

provides:
  - "Health permission with decline warning dialog"
  - "Push notification permission screen"
  - "Two-step permission flow with partial completion tracking"

affects:
  - "Future phases: All authenticated users complete permissions before main app access"
  - "User retention: Notification permissions support engagement features"

tech-stack:
  added:
    - "expo-notifications: Push notification permission requests"
  patterns:
    - "Alert.alert for native warning dialogs"
    - "Callback-based navigation with parent-controlled AsyncStorage"
    - "Multi-flag partial completion tracking"

key-files:
  created:
    - "components/auth/NotificationPermissionScreen.tsx: Push notification permission screen"
  modified:
    - "components/auth/PermissionsScreen.tsx: Added decline warning dialog, removed AsyncStorage logic"
    - "app/_layout.tsx: Two-step permission routing with HEALTH_PERMISSION_KEY"
    - "components/auth/CLAUDE.md: Documented full onboarding flow"

decisions:
  health-decline-warning:
    context: "Users who decline health permission lose core app value (automatic tracking)"
    decision: "Show Alert.alert warning dialog with 'Go Back' and 'Continue Anyway' options"
    rationale: "Warning explains consequences without blocking, respects user choice"
    alternatives: "Block entirely (too aggressive), no warning (users miss context)"

  notification-decline-no-warning:
    context: "Push notifications are nice-to-have for engagement, not core functionality"
    decision: "No warning dialog on decline, proceed directly to main app"
    rationale: "User already saw explanation on permission screen, additional warning is annoying"
    alternatives: "Show warning (too naggy), require permission (too restrictive)"

  partial-completion-tracking:
    context: "Users may exit app between health and notification permission screens"
    decision: "Add HEALTH_PERMISSION_KEY separate from PERMISSIONS_KEY for resume support"
    rationale: "Users resume at correct permission screen, not forced to repeat health permission"
    alternatives: "Single flag (lose progress), local state only (no persistence)"

  parent-handles-asyncstorage:
    context: "Permission screens need to save completion state"
    decision: "Components call onComplete callback, parent _layout.tsx handles AsyncStorage"
    rationale: "Keeps components stateless, testable, and reusable. Single source of truth."
    alternatives: "Components handle AsyncStorage directly (tight coupling, harder to test)"
---

# Phase 06 Plan 02: Permission Flow with Health Warning & Notification Screen Summary

**One-liner:** Two-step permission flow (Health → Notifications) with native decline warning, partial completion tracking, and callback-based navigation

## What Was Built

Added health permission decline warning dialog and created push notification permission screen, wiring both into a two-step permission flow with partial completion tracking via AsyncStorage.

### Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add health decline warning and notification permission screen | bfc550b | PermissionsScreen.tsx, NotificationPermissionScreen.tsx, package.json, bun.lock |
| 2 | Wire two-step permission flow with partial completion tracking | be0bd31 | _layout.tsx, components/auth/CLAUDE.md |

## Technical Implementation

### Health Permission Decline Warning

PermissionsScreen now shows a native Alert.alert dialog when user declines health permission:

- **Title:** "Missing Out"
- **Body:** "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?"
- **Options:** "Go Back" (cancel) or "Continue Anyway" (destructive, proceeds to next screen)
- Decline button text unchanged: "No, don't use my health data"

### NotificationPermissionScreen Component

New screen matching PermissionsScreen layout for push notification permissions:

- **Title:** "Stay motivated."
- **Body:** "Giving permission to deliver notifications will help make sure you never miss a day!"
- Accept button: Requests iOS notification permissions (alert, badge, sound) via `expo-notifications`
- Decline button: Proceeds directly without warning (per user decision)
- Fails gracefully on simulator or if permission already granted

### Two-Step Permission Flow

Updated `app/_layout.tsx` routing to support Health → Notifications → Main App flow:

1. **After auth + no health permission flag:** Show PermissionsScreen
   - On complete: Set `@trailblazer_health_permission_seen`, show NotificationPermissionScreen
2. **After health permission + no final permissions flag:** Show NotificationPermissionScreen
   - On complete: Set `@trailblazer_permissions_complete`, navigate to main app
3. **Partial completion:** Users who exit after health permission resume at notification permission on next launch
4. **Sign out:** Clears all three AsyncStorage flags (onboarding, health permission, final permissions)

### AsyncStorage Keys

| Key | Purpose | Set By | Cleared On |
|-----|---------|--------|------------|
| `@trailblazer_onboarding_seen` | Onboarding complete | _layout.tsx after OnboardingScreen | Sign out |
| `@trailblazer_health_permission_seen` | Health permission shown | _layout.tsx after PermissionsScreen | Sign out |
| `@trailblazer_permissions_complete` | All permissions complete | _layout.tsx after NotificationPermissionScreen | Sign out |

## Decisions Made

### Health Decline Warning Required

Health permission is critical for automatic activity tracking (core app value). Decline warning explains consequences without blocking user choice. Alert.alert provides native iOS dialog for platform consistency.

### No Notification Decline Warning

Push notifications are engagement features, not core functionality. User already saw explanation on permission screen. Additional warning would be annoying/naggy.

### Partial Completion Tracking

Separate `HEALTH_PERMISSION_KEY` enables resume from correct screen if user exits mid-flow. Without this, users would repeat health permission screen (poor UX) or lose progress (frustrating).

### Parent-Controlled AsyncStorage

Permission screens call `onComplete` callbacks instead of directly setting AsyncStorage flags. Parent `_layout.tsx` handles all persistence and navigation. This keeps components stateless, testable, and reusable with single source of truth for routing logic.

## Verification Results

### Type Safety

```bash
bunx tsc --noEmit
```

✅ Zero type errors

### Code Quality

- Components follow existing PermissionsScreen layout patterns
- Consistent styling with RotatingLogo, footer buttons, safe area insets
- Error handling for expo-notifications (graceful failures on simulator)
- Clean separation: components handle UI, parent handles state/navigation

### Routing Flow Verified

1. ✅ First-time users: Welcome → Login → Health Permission → Push Permission → Main App
2. ✅ Partial completion (exit after health): Resume at Push Permission on next launch
3. ✅ Returning authenticated users: Skip directly to main app
4. ✅ Sign out clears all flags, restart from beginning

### AsyncStorage Keys Verified

All three keys used correctly:

- `@trailblazer_onboarding_seen` (existing)
- `@trailblazer_health_permission_seen` (new)
- `@trailblazer_permissions_complete` (existing)

## Deviations from Plan

None - plan executed exactly as written.

## Documentation Updates

Updated `components/auth/CLAUDE.md` with:

- Full onboarding flow diagram (5-step process)
- PermissionsScreen decline warning behavior
- NotificationPermissionScreen component details
- AsyncStorage keys table with purpose/set by/read by columns
- Routing logic order and conditions
- Design patterns: callback-based navigation, no direct AsyncStorage in components, Alert.alert for native dialogs

## Next Phase Readiness

### Blockers

None.

### Recommendations

1. **Test on physical device:** Simulator can't fully test HealthKit or push notification permission prompts. Verify on real iOS device before shipping.
2. **Analytics tracking:** Consider adding analytics events for permission accept/decline to measure conversion rates.
3. **Notification content:** NotificationPermissionScreen is wired but no actual notifications are sent. Future phase should implement notification delivery.

## Performance

- **Duration:** 3.1 minutes
- **Commits:** 2 (atomic per task)
- **Files created:** 1 (NotificationPermissionScreen.tsx)
- **Files modified:** 3 (PermissionsScreen.tsx, _layout.tsx, CLAUDE.md)
- **Dependencies added:** 1 (expo-notifications)

## Self-Check: PASSED
