# Stash Components (`components/stash/`)

Your Stash screen components for reward display in Trailblazer.

## Components

| Component       | File               | Purpose                                                  |
| --------------- | ------------------ | -------------------------------------------------------- |
| RewardCard      | RewardCard.tsx     | Single reward card with press animation (carousel/grid) |
| RewardCarousel  | RewardCarousel.tsx | Horizontal swipeable featured rewards with page dots     |
| RewardsGrid     | RewardsGrid.tsx    | Vertical 2-column grid of all rewards                   |
| RewardToaster   | RewardToaster.tsx  | Bottom sheet modal for reward detail and redemption     |

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

## RewardToaster

Bottom sheet modal that displays reward details and redemption placeholder.

```typescript
import { RewardToaster } from "@/components/stash/RewardToaster";

const bottomSheetRef = useRef<BottomSheetModal>(null);
const [selectedReward, setSelectedReward] = useState<MockReward | null>(null);

// Open on card tap
const handleRewardPress = (reward: MockReward) => {
  setSelectedReward(reward);
  bottomSheetRef.current?.present();
};

// Close handler
const handleDismiss = () => {
  setSelectedReward(null);
};

<RewardToaster
  ref={bottomSheetRef}
  reward={selectedReward}
  onDismiss={handleDismiss}
/>
```

**Props:**

- `reward: MockReward | null` - Currently selected reward to display (null when closed)
- `onDismiss: () => void` - Callback when sheet dismisses (swipe down or backdrop tap)

**Ref pattern:**

Uses `forwardRef` to expose `BottomSheetModal` ref to parent. Parent calls `bottomSheetRef.current?.present()` to open.

**Layout:**

- `snapPoints={['50%']}` - Half screen height
- `enablePanDownToClose={true}` - Swipe down to dismiss
- `backdropComponent` - Backdrop tap to dismiss
- Top section: Vendor name (uppercase, small, secondary), title (bold, xl), description (base, secondary)
- Middle section: Type-appropriate placeholder based on `reward.rewardType`:
  - `"qr"`: 160x160 gray rounded rectangle with "QR Code" label + rewardValue below
  - `"barcode"`: 200x80 gray rounded rectangle with barcode placeholder "||||||||||||" + rewardValue below
  - `"code"`: Accent-bordered rounded rectangle with rewardValue in large monospace font
- Bottom section: Full-width "Redeem" button (HeroUI Button with primary background)

**Redeem button:**

Shows Coming Soon toast via `useToast()`:

```typescript
toast.show({
  label: "Coming Soon",
  description: "Redemption will be available soon!",
  variant: "default",
  placement: "top",
});
```

**Integration pattern:**

RewardToaster renders as sibling to ScrollView in parent screen (not nested inside). This ensures bottom sheet overlays properly without scroll interference.

**Dismiss behavior:**

- Swipe down gesture
- Backdrop tap
- Both trigger `onDismiss` callback
- No navigation side effects (stays on Your Stash screen)

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

## BottomSheetModal Pattern

RewardToaster demonstrates the app's BottomSheetModal integration pattern using `@gorhom/bottom-sheet`:

```typescript
import { forwardRef, useCallback } from "react";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

export const Component = forwardRef<BottomSheetModal, Props>(({ onDismiss }, ref) => {
  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: colors.cardBackground }}
      handleIndicatorStyle={{ backgroundColor: colors.cardBorder }}
    >
      <BottomSheetView>
        {/* content */}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
```

**Key requirements:**

- `forwardRef` pattern for parent control
- `renderBackdrop` memoized with `useCallback`
- `BottomSheetView` wrapper for content
- Theme-colored background and handle indicator

This pattern can be reused for other bottom sheet modals (badge detail, upgrade flow, etc.).

## Future Extensions

**Planned for later phases:**

- Wallet integration: Redeemed rewards move to digital wallet
- Filtering: Filter grid by category or partner
- Search: Find specific vendors or offers
- Real redemption: Replace Coming Soon toast with actual QR/barcode generation
