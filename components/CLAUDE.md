# Components (`components/`)

Reusable UI components for Trailblazer.

## Activity Components

### ActivityListItem

Single activity item display with source-based coloring.

```typescript
import { ActivityListItem } from "@/components/ActivityListItem";

<ActivityListItem activity={activity} />
```

**Props:**

- `activity: Activity` - Activity object from database

Automatically applies correct colors based on `activity.source` using `SOURCE_CONFIG`.

### ActivitySourceCard

Complete activity card for a specific data source. Handles filtering, empty states, sync button, and activity list.

```typescript
import { ActivitySourceCard } from "@/components/ActivitySourceCard";

<ActivitySourceCard
  source="apple_health"
  activities={activities}
  isConnected={health.isConnected}
  isSyncing={health.isSyncing}
  onSync={handleSync}
/>
```

**Props:**

- `source: ActivitySource` - Data source ("apple_health" | "manual")
- `activities: Activity[]` - All activities (will be filtered by source)
- `isConnected: boolean` - Whether source is connected
- `isSyncing: boolean` - Whether sync is in progress
- `onSync: () => void` - Callback for sync button

**Renders:**

- Header with emoji and source label
- Sync button (when connected)
- Activity list (when connected and has activities)
- "No activities synced yet" (when connected but empty)
- "Tap to connect" link (when not connected)

### ConnectionStatusBox

Small status card showing connection state for a data source.

```typescript
import { ConnectionStatusBox } from "@/components/ConnectionStatusBox";

<ConnectionStatusBox
  source="apple_health"
  isConnected={health.isConnected}
  isSyncing={health.isSyncing}
  lastSyncAt={health.lastSyncAt}
/>
```

**Props:**

- `source: ActivitySource` - Data source
- `isConnected: boolean` - Whether source is connected
- `isSyncing: boolean` - Whether sync is in progress
- `lastSyncAt?: Date | null` - Last sync timestamp
- `detail?: string | null` - Custom detail text

## Design Patterns

### Source-Based Styling

All activity components use `SOURCE_CONFIG` from `lib/constants` for consistent colors:

```typescript
import { SOURCE_CONFIG } from "@/lib/constants";

const config = SOURCE_CONFIG[activity.source];
// config.color - primary color (#007AFF for Apple Health)
// config.colorLight - background color (#007AFF20)
// config.emoji - display emoji (❤️)
// config.label - display label ("Apple Health")
```

### Adding New Sources

When adding a new data source:

1. Add to `ActivitySource` type in `lib/db/types.ts`
2. Add to `SOURCE_CONFIG` in `lib/constants/sources.ts`
3. Components automatically support the new source

No component code changes needed.

## Existing Components

- `external-link.tsx` - Link that opens in in-app browser
- `haptic-tab.tsx` - Tab bar item with haptic feedback
- `hello-wave.tsx` - Animated wave emoji
- `ui/` - UI primitives
