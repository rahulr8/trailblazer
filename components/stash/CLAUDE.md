# Stash Components (`components/stash/`)

Your Stash screen components for reward display in Trailblazer.

## Components

| Component       | File               | Purpose                                                  |
| --------------- | ------------------ | -------------------------------------------------------- |
| RewardCard      | RewardCard.tsx     | Single reward card with press animation (carousel/grid) |
| RewardCarousel  | RewardCarousel.tsx | Horizontal swipeable featured rewards with page dots     |
| RewardsGrid     | RewardsGrid.tsx    | Vertical 2-column grid of all rewards                   |

## RewardCard

Single reward card with two layout variants and press animation.

```typescript
import { RewardCard } from "@/components/stash/RewardCard";

<RewardCard
  reward={mockReward}
  onPress={handlePress}
  variant="carousel"
/>
```

**Props:**

- `reward: MockReward` - Reward data with vendor, title, imageUrl
- `onPress: (reward: MockReward) => void` - Callback when card is tapped
- `variant: "carousel" | "grid"` - Layout variant

**Variants:**

**Carousel:**
- Full-width card with 16:10 aspect ratio
- Image fills entire card with gradient overlay at bottom
- Vendor name and title overlay on gradient
- White text on dark gradient for contrast

**Grid:**
- Fixed 200px height card
- 120px image at top
- Card background below with vendor + title
- Theme-colored text on card background

**Animation:**
- Uses Reanimated 4 `useSharedValue` for scale
- Scales to 0.97 on press, back to 1.0 on release
- 100ms timing for responsive feel
- `AnimatedPressable` wraps the entire card

## RewardCarousel

Horizontal swipeable carousel for featured rewards with page indicator dots.

```typescript
import { RewardCarousel } from "@/components/stash/RewardCarousel";

<RewardCarousel
  rewards={MOCK_REWARDS.filter(r => r.featured)}
  onRewardPress={handleRewardPress}
/>
```

**Props:**

- `rewards: MockReward[]` - Array of featured rewards to display
- `onRewardPress: (reward: MockReward) => void` - Callback when card is tapped

**Layout:**

- Horizontal FlatList with `snapToInterval` for card snapping
- Card width: screen width - 32px (matches pattern from HeroSwiper)
- `decelerationRate="fast"` for snappy scroll behavior (cross-platform)
- `contentContainerStyle={{ paddingHorizontal: 16 }}` for side padding
- Page indicator dots below carousel, synced to active card

**Features:**

- Viewability tracking with stable refs (`useRef` for config, `useCallback` for handler)
- Active dot uses `colors.primary`, inactive uses `colors.cardBorder`
- Each card renders as `variant="carousel"`

**Pattern:**

Same optimization patterns as HeroSwiper:
- `viewabilityConfig` as `useRef` (stable reference)
- `onViewableItemsChanged` as `useCallback` (stable reference)
- `keyExtractor` for stable item keys

## RewardsGrid

Vertical 2-column grid of all rewards.

```typescript
import { RewardsGrid } from "@/components/stash/RewardsGrid";

<RewardsGrid
  rewards={MOCK_REWARDS}
  onRewardPress={handleRewardPress}
/>
```

**Props:**

- `rewards: MockReward[]` - Array of all rewards to display
- `onRewardPress: (reward: MockReward) => void` - Callback when card is tapped

**Layout:**

- FlatList with `numColumns={2}` for grid layout
- `scrollEnabled={false}` - grid lives inside parent ScrollView (Your Stash screen)
- `columnWrapperStyle={{ gap: 12 }}` for horizontal spacing
- 12px gap between rows via `ItemSeparatorComponent`

**Nested scroll handling:**

Grid uses `scrollEnabled={false}` to defer scrolling to parent ScrollView. This prevents nested scroll conflicts. Pattern established in Phase 3 requirements:

> "RewardsGrid renders non-scrollable inside parent ScrollView (scrollEnabled=false)"

Each card renders as `variant="grid"`.

## Mock Data Sources

All components import from `@/lib/mock`:

- `MOCK_REWARDS` - Full array of 8 vendor rewards
- Featured rewards: `MOCK_REWARDS.filter(r => r.featured)` - First 3 rewards

Ready for Firebase integration in later phase - just swap imports.

## Key Patterns

### Press Animation

RewardCard demonstrates Reanimated 4 press animation pattern:

```typescript
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePressIn = () => {
  scale.value = withTiming(0.97, { duration: 100 });
};

const handlePressOut = () => {
  scale.value = withTiming(1, { duration: 100 });
};

<AnimatedPressable
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  style={animatedStyle}
>
  {/* card content */}
</AnimatedPressable>
```

Same pattern can be reused for other tappable cards (wallet cards, badges, etc.).

### Item Width Calculation

RewardCarousel uses window dimensions for responsive card sizing:

```typescript
const { width } = useWindowDimensions();
const CARD_WIDTH = width - 32;
```

Ensures cards fill screen width minus padding, adapting to device size.

### Nested Scroll Pattern

RewardsGrid demonstrates non-scrollable list inside parent ScrollView:

- Parent: `<ScrollView>` with vertical scrolling
- Child: `<FlatList scrollEnabled={false} numColumns={2}>`
- Result: Grid items scroll with parent, no nested scroll conflict

## Theme Integration

All components use `useTheme()` hook for dynamic colors:

- `colors.cardBackground` - Grid card background
- `colors.textPrimary/Secondary` - Text hierarchy
- `colors.primary` - Active page dot
- `colors.cardBorder` - Inactive page dot

Carousel variant uses hardcoded white text on dark gradient overlay for consistent contrast across all reward images.

## Future Extensions

**Planned for later phases:**

- RewardToaster: BottomSheetModal for reward redemption (Plan 04-02)
- Wallet integration: Redeemed rewards move to digital wallet
- Filtering: Filter grid by category or partner
- Search: Find specific vendors or offers
