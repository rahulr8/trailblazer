# Database Module (`lib/db/`)

Firestore database operations for Trailblazer+.

## Structure

```
lib/db/
├── index.ts          # Re-exports all modules
├── types.ts          # TypeScript interfaces for Firestore documents
├── utils.ts          # Collection paths, helpers
├── users.ts          # User CRUD, stats, streaks
├── activities.ts     # Activity logging and queries
├── savedAdventures.ts # Saved adventure operations
└── chatLogs.ts       # AI conversation tracking
```

## Firestore Collections

```
users/{uid}
├── activities/{activityId}      # User's logged activities
└── savedAdventures/{adventureId} # Saved adventures

conversations/{sessionId}
└── messages/{messageId}          # Chat messages
```

## Key Types

### UserDocument
- `email`, `displayName`, `photoURL`
- `membershipTier`: `"free"` | `"platinum"`
- `stats`: `{ totalKm, totalMinutes, totalSteps, currentStreak }`
- `healthConnection?`: Apple Health authorization status

### ActivityDocument
- `source`: `"manual"` | `"apple_health"` - tracks where activity came from
- `externalId`: External activity ID (null for manual)
- `type`: `"run"` | `"hike"` | `"bike"` | `"walk"` | etc.
- `duration`: seconds
- `distance`: kilometers
- `location`: city name or null
- `date`, `createdAt`: Timestamps
- Optional fields: `elapsedTime`, `elevationGain`, `name`, `sportType`

### HealthConnection (on UserDocument)
- `isAuthorized`: Boolean indicating HealthKit permission granted
- `connectedAt`: When connected
- `lastSyncAt`: Last successful sync timestamp

## Collection Paths

Use `collections` object from `utils.ts` to prevent typos:

```typescript
import { collections } from '@/lib/db';

collections.users                    // "users"
collections.activities(uid)          // "users/{uid}/activities"
collections.savedAdventures(uid)     // "users/{uid}/savedAdventures"
```

## Activity Logging

When logging activities, the `source` field is automatically set:
- Manual activities via `logActivity()`: `source: "manual"`, `externalId: null`
- Apple Health activities (via client sync): `source: "apple_health"`, `externalId: "<sourceId>_<startTime>"`

User stats are automatically updated when activities are logged.

## Source Switching Helper Functions

For managing data source activities:

```typescript
// Get count of activities from a specific source
await getActivityCountBySource(uid, "apple_health"); // Returns number

// Delete all activities from a specific source
await deleteActivitiesBySource(uid, "apple_health"); // Returns count deleted

// Recalculate user stats from remaining activities
await recalculateUserStats(uid);
```

## Firestore Indexes

Required composite index for activity queries by source:
- `users/{uid}/activities`, `source` + `externalId` fields

Deploy with: `firebase deploy --only firestore:indexes`
