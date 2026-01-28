# Home Components (`components/home/`)

Home screen components for the Trailblazer dashboard.

## Components

| Component           | File                 | Purpose                                                                   |
| ------------------- | -------------------- | ------------------------------------------------------------------------- |
| FlipCard            | FlipCard.tsx         | Generic 3D flip card with Reanimated 4 rotateY animation                 |
| StreakFlipCard      | StatsFlipCard.tsx    | Streak days front/personal best back, wraps FlipCard                     |
| NatureScoreFlipCard | StatsFlipCard.tsx    | Nature score front/breakdown back, wraps FlipCard                        |
| HeroSwiper          | HeroSwiper.tsx       | Horizontal 2-card swiper with gradient motivation + counter cards        |
| LeaderboardPreview  | LeaderboardPreview.tsx | Friends/Global toggle, top 5 entries, View All to Squad                |

## FlipCard

Generic reusable 3D flip card component with tap-to-flip interaction.

```typescript
import { FlipCard } from "@/components/home/FlipCard";

<FlipCard
  front={<Text>Front content</Text>}
  back={<Text>Back content</Text>}
  height={140}
  duration={400}
/>
```

**Props:**

- `front: React.ReactNode` - Content rendered on front face
- `back: React.ReactNode` - Content rendered on back face
- `height?: number` - Card height in pixels (default: 140)
- `duration?: number` - Animation duration in ms (default: 400)

**Animation details:**

- Uses Reanimated 4 with `rotateY` transform and `backfaceVisibility: 'hidden'`
- Front face rotates from 0° to 180°, back face from 180° to 360°
- **Android critical:** `{ perspective: 1000 }` must be FIRST transform in array for 3D to work
- Shared value `isFlipped` toggles between 0 and 1 on press
- Entire card is wrapped in Pressable for tap interaction

**Reusability:**

FlipCard is generic and will be reused in future phases:

- Phase 4: Giveaway flip card
- Phase 5: Grand prize flip card
- Phase 6: Wallet flip cards (rewards, membership)

## StreakFlipCard & NatureScoreFlipCard

Two specialized flip cards for stats display, both exported from `StatsFlipCard.tsx`.

```typescript
import { StreakFlipCard, NatureScoreFlipCard } from "@/components/home/StatsFlipCard";

<StreakFlipCard />
<NatureScoreFlipCard />
```

**StreakFlipCard:**

- Front: Flame icon, current streak days, "Days Active" label
- Back: "Personal Best" label, longest streak number, "day streak" label
- Data from `MOCK_STATS.currentStreak` and `MOCK_STATS.longestStreak`
- Flame icon uses `colors.highlight` (orange)

**NatureScoreFlipCard:**

- Front: Leaf icon, nature score number, "Room to Improve" label
- Back: "Nature Score" label, breakdown text showing minutes and sessions
- Nature score calculated as `Math.round(MOCK_STATS.totalMinutes * 0.05)` (mock formula)
- Leaf icon uses `colors.accent` (green)

**Note:** Real Nature Score calculation algorithm is deferred to backend integration phase.

## HeroSwiper

Horizontal swiper with two cards: gradient motivation card and minutes active counter.

```typescript
import { HeroSwiper } from "@/components/home/HeroSwiper";

<HeroSwiper
  onRefreshMotivation={() => {/* cycle affirmation */}}
  motivationText="Every step counts!"
/>
```

**Props:**

- `onRefreshMotivation?: () => void` - Callback when refresh icon tapped on motivation card
- `motivationText?: string` - Override motivation text (defaults to card's `motivationText` from mock data)

**Layout:**

- Horizontal FlatList with `snapToInterval` for card snapping
- Card width: screen width - 32px padding (16px each side)
- `decelerationRate="fast"` for snappy scroll behavior (cross-platform)
- Page indicator dots below cards, synced to scroll position

**Cards:**

1. **Motivation card:** LinearGradient background (nature-themed accent gradient), white text, refresh icon top-right
2. **Counter card:** Minutes active formatted as "Xh YYm", centered with label

**Implementation details:**

- FlatList horizontal with `snapToInterval={CARD_WIDTH}`
- Viewability tracking with stable refs (`useRef` for config, `useCallback` for handler)
- LinearGradient colors require type assertion: `as readonly [ColorValue, ColorValue, ...ColorValue[]]`
- `getItemLayout` for performance optimization

**Nested scrolling:** HeroSwiper contains horizontal FlatList inside vertical ScrollView (Home screen). This works because scroll axes differ (horizontal vs vertical) - no `nestedScrollEnabled` needed.

## LeaderboardPreview

Friends/Global leaderboard toggle with top 5 entries and navigation to full Squad screen.

```typescript
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";

<LeaderboardPreview />
```

**No props** - fully self-contained component.

**Features:**

- Pill toggle switches between `MOCK_LEADERBOARD_FRIENDS` and `MOCK_LEADERBOARD_GLOBAL`
- Active pill has colored background (`colors.accent`), inactive is transparent
- Shows top 5 entries only (sliced from full dataset)
- Each entry: rank number, avatar (with fallback initials), display name, time in hours
- Current user row highlighted with accent background tint (`${colors.accent}15` = ~8% opacity)
- "View All" button navigates to `/(tabs)/squad` via `router.push`

**Avatar pattern:**

- HeroUI Avatar with Image + Fallback
- Fallback computes initials: `displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)`

**Time formatting:**

- Compact preview: hours only via `Math.floor(entry.totalTime / 60) + 'h'`
- Full time display (hours + minutes) reserved for squad screen detail view

## Key Patterns

### Theme Integration

All components use `useTheme()` hook for dynamic colors:

- `colors.accent` - primary brand color (green)
- `colors.highlight` - secondary accent (orange for streak)
- `colors.cardBackground` - card background color
- `colors.cardBorder` - card border color
- `colors.textPrimary/Secondary/Tertiary` - text hierarchy
- `shadows.md` - consistent shadow styling
- `gradients.accent` - LinearGradient preset for motivation card

### Mock Data Sources

All components import from `@/lib/mock`:

- `MOCK_HERO_CARDS` - HeroSwiper cards data
- `MOCK_STATS` - Stats for flip cards
- `MOCK_LEADERBOARD_FRIENDS` / `MOCK_LEADERBOARD_GLOBAL` - Leaderboard data

Ready for Firebase integration in later phase - just swap imports.

### FlatList Optimization

HeroSwiper demonstrates best practices for FlatList with pagination:

- `viewabilityConfig` as `useRef` (stable reference, prevents re-render warnings)
- `onViewableItemsChanged` as `useCallback` (stable reference)
- `getItemLayout` for performance (known item dimensions)
- `keyExtractor` for stable item keys

### Android 3D Transform Gotcha

FlipCard uses `{ perspective: 1000 }` as FIRST transform in array. On Android, perspective must come before rotate transforms or 3D effect won't render.

Correct:

```typescript
transform: [{ perspective: 1000 }, { rotateY: '180deg' }]
```

Wrong (broken on Android):

```typescript
transform: [{ rotateY: '180deg' }, { perspective: 1000 }]
```

## Future Extensions

**FlipCard reuse planned for:**

- Phase 4: Marketing giveaway flip card (tap to reveal entry status)
- Phase 5: Grand prize flip card (suspenseful reveal interaction)
- Phase 6: Wallet cards (rewards, membership tiers)

**Stats expansion:**

- Real Nature Score algorithm from backend
- Additional stat cards (total distance, elevation gain, species spotted)
- Historical trends on flip card backs

**Leaderboard enhancements:**

- Live data from Firestore
- Friends list integration (vs. mock data)
- Time period filters (weekly, monthly, all-time)
