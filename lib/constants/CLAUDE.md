# Constants Module (`lib/constants/`)

Shared constants and configuration values used across the Trailblazer+ app.

## Structure

```
lib/constants/
├── index.ts      # Barrel exports
├── activity.ts   # Activity-related constants
└── sources.ts    # Data source configuration
```

## Activity Constants (`activity.ts`)

```typescript
import { STEPS_PER_KM, STEP_COUNTING_ACTIVITIES, calculateSteps, DEFAULT_SYNC_DAYS } from "@/lib/constants";
```

| Constant | Value | Description |
|----------|-------|-------------|
| `STEPS_PER_KM` | `1300` | Empirical average steps per kilometer |
| `STEP_COUNTING_ACTIVITIES` | `["walk", "hike", "run"]` | Activity types that count toward step totals |
| `DEFAULT_SYNC_DAYS` | `30` | Default sync period for health integrations |

### calculateSteps Function

```typescript
function calculateSteps(activityType: string, distanceKm: number): number
```

Returns estimated step count for an activity. Only returns non-zero for step-counting activities (walk, hike, run).

## Source Configuration (`sources.ts`)

Centralized configuration for all activity data sources.

```typescript
import { SOURCE_CONFIG, getSourceConfig } from "@/lib/constants";

const healthConfig = SOURCE_CONFIG["apple_health"];
// { color: "#007AFF", colorLight: "#007AFF20", emoji: "❤️", label: "Apple Health" }
```

### SOURCE_CONFIG

| Source | Color | Emoji | Label |
|--------|-------|-------|-------|
| `apple_health` | `#007AFF` | ❤️ | Apple Health |
| `strava` | `#FC4C02` | 🏃 | Strava |
| `manual` | `#6B7280` | ✏️ | Manual |

### Adding New Sources

1. Add the source to `ActivitySource` type in `lib/db/types.ts`
2. Add configuration to `SOURCE_CONFIG` in `sources.ts`
3. UI components will automatically use the new source's colors and labels

## Usage

Constants should be imported from the barrel export:

```typescript
// Good
import { STEPS_PER_KM, SOURCE_CONFIG } from "@/lib/constants";

// Avoid direct imports from submodules
import { STEPS_PER_KM } from "@/lib/constants/activity";
```

## Single Source of Truth

These constants replace duplicated values that previously existed in:
- `lib/db/activities.ts`
- `lib/db/users.ts`
- `lib/health/sync.ts`
- `lib/health/config.ts`
- `app/(tabs)/index.tsx`

Any changes to step calculation or source colors should be made here only.
