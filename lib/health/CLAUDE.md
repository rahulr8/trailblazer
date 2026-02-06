# Apple Health Module (`lib/health/`)

Client-side Apple HealthKit integration for syncing workouts to Trailblazer.

## Structure

```
lib/health/
├── index.ts    # Exports
├── config.ts   # HealthKit permissions and workout type mappings
├── hooks.ts    # useHealthConnection hook
└── sync.ts     # Workout sync logic (query + transform + store)
```

## Dependencies

```bash
npm install @kingstinct/react-native-healthkit react-native-nitro-modules
```

Uses `@kingstinct/react-native-healthkit` which supports the **New Architecture** (Nitro Modules).

Requires native build (`npx expo run:ios`) - won't work in Expo Go.

## Configuration

The library uses an Expo config plugin. In `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@kingstinct/react-native-healthkit",
        {
          "NSHealthShareUsageDescription": "Trailblazer reads your workouts...",
          "NSHealthUpdateUsageDescription": "Trailblazer can save activities..."
        }
      ]
    ]
  }
}
```

## Key Characteristics

| Aspect        | Apple Health                    |
| ------------- | ------------------------------- |
| Auth          | On-device HealthKit permission  |
| Sync trigger  | Manual pull or app open         |
| Token storage | None needed                     |
| Data location | On-device → Direct to Firestore |

**Apple Health sync is client-side only** - no Cloud Functions needed.

## useHealthConnection Hook

```typescript
const {
  isConnected, // boolean - has HealthKit authorization
  isAvailable, // boolean - is HealthKit available (iOS only)
  isLoading, // boolean - loading state
  isSyncing, // boolean - syncing workouts
  lastSyncAt, // Date | null
  error, // string | null
  connect, // () => Promise<void> - request HealthKit auth
  disconnect, // () => Promise<void> - clear local flag
  sync, // () => Promise<number> - sync workouts, return count
} = useHealthConnection(uid);
```

## Workout Type Mapping

HealthKit activity types are mapped to app types:

| HealthKit                                            | App Type |
| ---------------------------------------------------- | -------- |
| `running`                                            | run      |
| `hiking`                                             | hike     |
| `cycling`                                            | bike     |
| `walking`                                            | walk     |
| `swimming`                                           | swim     |
| `paddleSports`, `rowing`                             | paddle   |
| `snowSports`, `crossCountrySkiing`, `downhillSkiing` | snow     |
| `functionalStrengthTraining`, `crossTraining`        | workout  |
| (others)                                             | other    |

## Data Sources

Users can use:

- `manual` - Manual activity logging
- `apple_health` - Apple Health connected (iOS only)

## Database Fields

### UserDocument.healthConnection

```typescript
{
  isAuthorized: boolean; // User granted HealthKit permission
  connectedAt: Timestamp; // When connected
  lastSyncAt: Timestamp | null; // Last successful sync
}
```

### ActivityDocument.source

```typescript
source: "manual" | "apple_health";
```

## Sync Flow

1. User taps "Connect Apple Health" in profile
2. `requestAuthorization()` requests HealthKit authorization
3. iOS shows permissions sheet
4. On approval, `healthConnection` stored in Firestore
5. Auto-sync effect triggers when `isConnected` becomes true
6. **Before fetching**, `ensureHealthKitAuthorized()` verifies permissions are still valid
7. Sync queries 30 days of workouts via `queryWorkoutSamples()`
8. Workouts deduplicated by `externalId` (HealthKit's `uuid`)
9. Distance retrieved via `workout.getStatistic()` for each distance type
10. New activities stored in `users/{uid}/activities`
11. User stats updated with totals

**Important**: Only ONE sync runs at a time. The auto-sync effect uses a `hasAutoSynced` ref to prevent duplicate syncs on app open.

## Authorization Recovery

HealthKit authorization can be lost between app sessions (user revoked in Settings, app reinstall, etc.). The module handles this gracefully:

1. **Before every sync**: `ensureHealthKitAuthorized()` is called to verify/re-request authorization
2. **On "Authorization not determined" errors**: The user is automatically disconnected from Apple Health
3. **User notification**: An alert informs them to reconnect via the profile page
4. **Firestore cleanup**: `healthConnection` field is deleted so UI reflects disconnected state

This prevents the sync-error loop that occurs when Firestore says "connected" but iOS says "not authorized".

## iOS-Only Feature

HealthKit is iOS-only. The Apple Health option only appears on iOS devices where HealthKit is available. Android users should use manual logging.

## Shared Constants

This module uses shared constants from `lib/constants/`:

```typescript
import { DEFAULT_SYNC_DAYS, calculateSteps } from "@/lib/constants";
```

- `DEFAULT_SYNC_DAYS` - 30 day default sync period
- `calculateSteps()` - Step estimation for activities

See `lib/constants/CLAUDE.md` for full documentation.

## Debugging

All operations are logged with `[Health]` prefix:

```
[Health] Checking availability...
[Health] Availability check result: true
[Health] connect() called, uid: abc123
[Health] initHealthKit called
[Health] Requesting authorization via dynamic import...
[Health] Module loaded, calling requestAuthorization...
[Health] Authorization result: true
[Health] Connection saved to Firestore successfully
```

To debug issues:

1. Check Metro console for `[Health]` logs
2. Errors show Alert dialogs to user with error messages
3. Error state is also stored in `health.error` for UI display

## Exports

```typescript
// Hook for managing connection state
export { useHealthConnection } from "./hooks";

// Sync workouts to Firestore
export { syncHealthWorkouts } from "./sync";

// HealthKit utilities
export {
  isHealthKitAvailableAsync,   // Check if HealthKit is available
  initHealthKit,               // Request initial authorization
  ensureHealthKitAuthorized,   // Verify/re-request auth before operations
  mapWorkoutType,              // Map HealthKit workout types to app types
} from "./config";
```

## Dynamic Imports

All HealthKit native module functions use **dynamic imports** to gracefully handle cases where the native module isn't available:

```typescript
const HealthKit = await import("@kingstinct/react-native-healthkit");
await HealthKit.requestAuthorization({...});
```

This prevents crashes if running in Expo Go or if native linking fails.

## New Architecture Support

This module uses `@kingstinct/react-native-healthkit` v9.0+ which is built with Nitro Modules, providing full support for React Native's New Architecture (TurboModules, Fabric).


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>