# Database Module (`lib/db/`)

Supabase Postgres operations for Trailblazer.

## Structure

```
lib/db/
├── index.ts           # Re-exports all modules
├── types.ts           # TypeScript interfaces
├── profiles.ts        # User profile CRUD, stats, streaks
├── activities.ts      # Activity logging and queries
├── savedAdventures.ts # Saved adventure operations
└── conversations.ts   # AI conversation tracking
```

## Postgres Tables

```
profiles              # User profiles (auto-created via trigger on auth.users)
health_connections    # Apple Health authorization status (1:1 per user)
activities            # Logged activities (manual + apple_health)
saved_adventures      # Bookmarked adventures
conversations         # Chat sessions
messages              # Chat messages within conversations
```

## Key Types

### Profile

- `id` (uuid, matches auth.users.id)
- `email`, `displayName`, `photoUrl`
- `membershipTier`: `"free"` | `"platinum"`
- `totalKm`, `totalMinutes`, `totalSteps`, `currentStreak` (denormalized stats)
- `lastActivityDate`, `upgradedAt`, `createdAt`, `updatedAt`

### Activity

- `id` (bigint identity)
- `source`: `"manual"` | `"apple_health"`
- `externalId`: HealthKit UUID (null for manual)
- `type`, `duration` (seconds), `distance` (km), `location`, `date`
- Unique constraint on `(user_id, source, external_id)` for deduplication

### HealthConnection

- `id` (bigint identity)
- `userId`, `isAuthorized`, `connectedAt`, `lastSyncAt`
- Unique constraint on `user_id` (one connection per user)

## Database Functions (RPC)

Stats and streak logic lives in Postgres functions, called via `supabase.rpc()`:

```typescript
await supabase.rpc("increment_user_stats", { p_user_id: uid, p_km_delta: 5 });
await supabase.rpc("update_streak", { p_user_id: uid });
await supabase.rpc("recalculate_user_stats", { p_user_id: uid });
```

## Activity Logging

```typescript
// Manual activity (creates activity + updates stats + updates streak)
const activityId = await logActivity(uid, { type: "hike", duration: 3600, distance: 5, location: "Vancouver" });

// Health sync uses batch upsert with ON CONFLICT DO NOTHING
await syncHealthWorkouts(uid);
```

## Source Switching

```typescript
await getActivityCountBySource(uid, "apple_health");
await deleteActivitiesBySource(uid, "apple_health");
await recalculateUserStats(uid); // DB function recalculates from activities
```
