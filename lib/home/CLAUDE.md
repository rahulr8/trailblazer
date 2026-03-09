# Home Module (`lib/home/`)

Utility functions for the home screen dashboard.

## Structure

```
lib/home/
└── activity-stats.ts   # Stats builder and formatters
```

## Key Exports

### `buildHomeActivityStats(input)` → `HomeActivityStats`

Builds a normalized stats object for the home screen from raw DB values. Handles null/undefined inputs by defaulting to 0. Computes derived `natureScore` from `totalMinutes`.

### `formatMinutesActive(minutes)` → `string`

Formats a minute count as `"Xh XXm"` (e.g., `"2h 05m"`).

## Usage

Called from `app/(tabs)/index.tsx` on focus and pull-to-refresh. The resulting `HomeActivityStats` object is passed as props to `HeroSwiper` and `StatsFlipCard` components.
