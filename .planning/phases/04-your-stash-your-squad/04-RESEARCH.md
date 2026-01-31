# Phase 4: Your Stash + Your Squad - Research

**Researched:** 2026-01-30
**Domain:** React Native rewards browsing and community leaderboard with carousel, grid, bottom sheet modal, and segmented controls
**Confidence:** HIGH

## Summary

Phase 4 implements two complete tab screens: Your Stash (rewards browsing with featured carousel, 2-column grid, and detail bottom sheet) and Your Squad (community leaderboard with Friends/Global toggle and ranked entries). The implementation leverages existing infrastructure from Phase 3: FlipCard and HeroSwiper patterns (horizontal FlatList with snapToInterval), Reanimated 4, and the established mock data layer. All components consume from `@/lib/mock` with zero Firebase dependencies.

The standard approach for rewards browsing uses FlatList with `numColumns={2}` for the grid layout, maintaining the same horizontal FlatList carousel pattern from Phase 3 (featured rewards up to 6 items with page dots). For the Reward Toaster, `@gorhom/bottom-sheet` v5.2.8 (already installed) provides the BottomSheetModal component with ref-based present/dismiss methods. The leaderboard uses a simple custom pill-style segmented control (two Pressable buttons in a row) to toggle between Friends/Global datasets, following the pattern established in LeaderboardPreview but with full dataset display and "Show More" expansion.

Pull-to-refresh on Your Stash uses React Native's built-in RefreshControl component (same pattern as Home screen), with a controlled `refreshing` boolean prop and `onRefresh` callback. The carousel flows directly into the grid as one continuous ScrollView with nested horizontal FlatList (scroll axes differ, so no conflicts).

**Primary recommendation:** Build Your Stash and Your Squad tab screens using existing patterns (ScrollView + RefreshControl from Home, horizontal FlatList from HeroSwiper), implement RewardToaster as BottomSheetModal with 50% screen height snapPoint and backdrop dismissal, create custom pill segmented control for leaderboard toggle, and consume all data from MOCK_REWARDS and MOCK_LEADERBOARD_* datasets with Show More expansion state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native (FlatList) | Built-in | 2-column grid with numColumns, horizontal carousel | React Native core component optimized for list rendering with built-in grid support via numColumns prop |
| @gorhom/bottom-sheet | ^5.2.8 | Reward detail bottom sheet modal | Industry standard for performant bottom sheets, uses Reanimated 3 and Gesture Handler v2, already installed and provider configured |
| react-native (RefreshControl) | Built-in | Pull-to-refresh on Your Stash | React Native core component for pull-to-refresh, works with ScrollView and FlatList, already used on Home screen |
| react-native-reanimated | ~4.1.1 | Press animations on reward cards | Already installed and configured, used in Phase 3 for FlipCard, provides smooth UI thread animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| heroui-native | ^1.0.0-beta.9 | Avatar, Chip components for leaderboard | Already installed, provides Avatar with fallback and Chip for badges |
| lucide-react-native | ^0.562.0 | Icons (ChevronDown for Show More, lock icon for locked rewards) | Already installed, extensive icon library |
| expo-image | ~3.0.8 | Optimized image loading for reward cards | Already installed, better performance than Image for grid layouts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom pill toggle | @react-native-segmented-control/segmented-control | Library requires custom native code (not in Expo Go), custom implementation is 20 lines and matches existing patterns |
| @gorhom/bottom-sheet | react-native-modal | Bottom sheet uses native gestures and Reanimated for 60fps, already installed and provider configured |
| RefreshControl | Custom pull-to-refresh | RefreshControl is built-in, platform-native behavior, already used on Home screen |

**Installation:**
No new packages required - all dependencies already installed in package.json.

## Architecture Patterns

### Recommended Project Structure
```
components/
├── stash/                     # Your Stash components
│   ├── RewardCarousel.tsx     # Featured rewards horizontal carousel with dots
│   ├── RewardsGrid.tsx        # 2-column grid with FlatList numColumns={2}
│   ├── RewardCard.tsx         # Single reward card (carousel + grid reuse)
│   └── RewardToaster.tsx      # Bottom sheet modal for reward detail
├── squad/                     # Your Squad components
│   ├── LeaderboardWidget.tsx  # Full leaderboard with toggle, Show More
│   ├── LeaderboardRow.tsx     # Single entry row (reuse from LeaderboardPreview)
│   └── SegmentedControl.tsx   # Custom pill toggle (Friends/Global)
app/(tabs)/
├── stash.tsx                  # Your Stash screen (imports stash components)
└── squad.tsx                  # Your Squad screen (imports squad components)
```

### Pattern 1: FlatList 2-Column Grid with numColumns

**What:** FlatList with `numColumns={2}` for vertical scrolling grid layout
**When to use:** For displaying multiple items in a grid pattern with consistent item heights

**Example:**
```typescript
// Source: https://reactnative.dev/docs/flatlist
import { FlatList, View, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16;
const GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - GAP) / 2;

<FlatList
  data={MOCK_REWARDS.filter(r => !r.featured)} // Non-featured only
  numColumns={2}
  keyExtractor={(item) => item.id}
  columnWrapperStyle={{
    gap: GAP,
    paddingHorizontal: PADDING,
    marginBottom: 12,
  }}
  renderItem={({ item }) => (
    <View style={{ width: ITEM_WIDTH }}>
      <RewardCard reward={item} onPress={() => handleRewardPress(item)} />
    </View>
  )}
/>
```

**Critical:** All items must have the same height for consistent grid layout. Use `aspectRatio` or fixed height.

### Pattern 2: BottomSheetModal with Ref-based Present/Dismiss

**What:** Modal bottom sheet using `@gorhom/bottom-sheet` with ref methods for presentation
**When to use:** For detail overlays that slide up from bottom and allow backdrop dismissal

**Example:**
```typescript
// Source: https://gorhom.dev/react-native-bottom-sheet/props + community examples
import { useRef } from 'react';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

const bottomSheetRef = useRef<BottomSheetModal>(null);
const [selectedReward, setSelectedReward] = useState<MockReward | null>(null);

const handleRewardPress = (reward: MockReward) => {
  setSelectedReward(reward);
  bottomSheetRef.current?.present();
};

const handleDismiss = () => {
  setSelectedReward(null);
};

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

<BottomSheetModal
  ref={bottomSheetRef}
  snapPoints={['50%']} // Half screen height
  enablePanDownToClose={true}
  backdropComponent={renderBackdrop}
  onDismiss={handleDismiss}
>
  {selectedReward && (
    <RewardDetail reward={selectedReward} />
  )}
</BottomSheetModal>
```

**Note:** BottomSheetModalProvider already configured in `app/_layout.tsx` provider hierarchy.

### Pattern 3: RefreshControl with Mock Delay

**What:** Pull-to-refresh using controlled refreshing state with simulated async delay
**When to use:** On scrollable screens to simulate data fetching (mock layer pattern)

**Example:**
```typescript
// Source: https://reactnative.dev/docs/refreshcontrol + codebase Home screen pattern
import { RefreshControl, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  // Simulate API call delay
  setTimeout(() => {
    setRefreshing(false);
    // Mock data already static, real implementation would refetch
  }, 800);
}, []);

<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Content */}
</ScrollView>
```

**Platform styling:** RefreshControl automatically uses platform-native styles (iOS spinner vs Android Material indicator).

### Pattern 4: Custom Pill Segmented Control

**What:** Two-option toggle using Pressable buttons with active/inactive styling
**When to use:** For binary state toggles (Friends vs Global, On vs Off)

**Example:**
```typescript
// Source: Community patterns + existing LeaderboardPreview toggle
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

type ToggleOption = 'friends' | 'global';

const [activeTab, setActiveTab] = useState<ToggleOption>('friends');

<View style={{
  flexDirection: 'row',
  backgroundColor: colors.cardBackground,
  borderRadius: 12,
  padding: 4,
  gap: 4,
}}>
  <Pressable
    onPress={() => setActiveTab('friends')}
    style={{
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: activeTab === 'friends' ? colors.accent : 'transparent',
    }}
  >
    <Text style={{
      color: activeTab === 'friends' ? '#FFFFFF' : colors.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    }}>
      Friends
    </Text>
  </Pressable>
  <Pressable
    onPress={() => setActiveTab('global')}
    style={{
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: activeTab === 'global' ? colors.accent : 'transparent',
    }}
  >
    <Text style={{
      color: activeTab === 'global' ? '#FFFFFF' : colors.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    }}>
      Global
    </Text>
  </Pressable>
</View>
```

**Accessibility:** Pressable components automatically handle platform-native touch feedback and screen reader labels.

### Pattern 5: Nested Horizontal FlatList in ScrollView

**What:** Horizontal FlatList (carousel) inside vertical ScrollView with proper scroll handling
**When to use:** For featured content carousel above scrollable grid/list content

**Example:**
```typescript
// Source: Phase 3 HeroSwiper pattern + React Native docs
import { ScrollView, FlatList, View } from 'react-native';

<ScrollView
  showsVerticalScrollIndicator={false}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
>
  {/* Featured carousel - horizontal scroll */}
  <FlatList
    data={MOCK_REWARDS.filter(r => r.featured)}
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={CARD_WIDTH}
    decelerationRate="fast"
    pagingEnabled={false}
    renderItem={({ item }) => <RewardCard reward={item} />}
  />

  {/* Grid below carousel - vertical scroll handled by parent ScrollView */}
  <FlatList
    data={MOCK_REWARDS.filter(r => !r.featured)}
    numColumns={2}
    scrollEnabled={false} // Important: disable scroll, parent ScrollView handles it
    renderItem={({ item }) => <RewardCard reward={item} />}
  />
</ScrollView>
```

**Critical:** Set `scrollEnabled={false}` on the grid FlatList to prevent nested scroll conflicts. Parent ScrollView handles all vertical scrolling.

### Anti-Patterns to Avoid

- **Don't use separate FlatList for carousel + grid**: Embed both in single ScrollView to maintain scroll position and pull-to-refresh
- **Don't enable scrolling on nested FlatList**: Only parent ScrollView should handle vertical scroll when grid is inside ScrollView
- **Don't forget backdrop component on BottomSheetModal**: Users expect to dismiss by tapping outside the sheet
- **Don't use SectionList for carousel + grid**: Two separate lists (one horizontal, one vertical) in ScrollView is simpler and more flexible
- **Don't forget enablePanDownToClose on bottom sheet**: Swipe-down dismissal is expected mobile UX

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet modal | Custom modal with gestures and animations | @gorhom/bottom-sheet BottomSheetModal | Already installed, handles edge cases (safe area, keyboard, backdrop, gestures), uses Reanimated 3 for 60fps animations, production-tested |
| 2-column grid layout | Custom flexWrap View or manual row/column calculation | FlatList with numColumns={2} | Built-in, optimized rendering, handles item recycling, automatic row wrapping, columnWrapperStyle for gap spacing |
| Pull-to-refresh | Custom PanGestureHandler with threshold logic | RefreshControl component | Built-in, platform-native behavior (iOS elastic scroll vs Android Material), automatic scroll position handling |
| QR code/barcode display | Canvas drawing or custom SVG paths | Placeholder image or react-native-qrcode-svg (future) | For Phase 4 mock layer, static placeholder image is sufficient; real QR generation deferred to backend integration phase |
| Segmented control | Third-party library requiring custom native code | Custom pill toggle with Pressable | Libraries require ejecting from Expo Go, custom implementation is 20 lines and matches app design system |

**Key insight:** Phase 4 focuses on UI/UX patterns with mock data. All components use established libraries (FlatList, RefreshControl, BottomSheetModal) with zero custom gesture handling or layout calculations. QR/barcode generation deferred to backend phase - Phase 4 uses placeholder images or simple Text display.

## Common Pitfalls

### Pitfall 1: Nested ScrollView/FlatList Scroll Conflicts

**What goes wrong:** Grid FlatList inside ScrollView fights for scroll events, causing janky scrolling or carousel not working
**Why it happens:** React Native prevents nested scrolling by default when scroll axes are the same (both vertical)
**How to avoid:**
```typescript
// WRONG - grid FlatList has scrollEnabled={true} (default)
<ScrollView>
  <FlatList data={items} numColumns={2} />
</ScrollView>

// CORRECT - disable grid FlatList scrolling, parent handles it
<ScrollView>
  <FlatList
    data={items}
    numColumns={2}
    scrollEnabled={false}  // Parent ScrollView handles scroll
  />
</ScrollView>
```
**Warning signs:**
- Pull-to-refresh doesn't work
- Scrolling feels stuttery
- FlatList stops rendering items after initial batch
- Console warnings about "VirtualizedLists should never be nested"

### Pitfall 2: BottomSheetModal Backdrop Not Dismissing

**What goes wrong:** Bottom sheet opens but tapping outside doesn't dismiss it
**Why it happens:** BottomSheetModal requires explicit `backdropComponent` prop and `enablePanDownToClose` to handle dismissal
**How to avoid:**
```typescript
// WRONG - no backdrop, no dismissal gestures
<BottomSheetModal ref={ref} snapPoints={['50%']}>
  {children}
</BottomSheetModal>

// CORRECT - backdrop component and pan-down enabled
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const renderBackdrop = useCallback(
  (props) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  ),
  []
);

<BottomSheetModal
  ref={ref}
  snapPoints={['50%']}
  enablePanDownToClose={true}
  backdropComponent={renderBackdrop}
>
  {children}
</BottomSheetModal>
```
**Warning signs:** Users can't dismiss the sheet, must use explicit close button

### Pitfall 3: FlatList numColumns Item Width Miscalculation

**What goes wrong:** Grid items overflow screen width or have inconsistent gaps
**Why it happens:** Forgetting to account for padding, gaps, and columnWrapperStyle spacing in item width calculation
**How to avoid:**
```typescript
// WRONG - doesn't account for gap between columns
const ITEM_WIDTH = SCREEN_WIDTH / 2;

// CORRECT - subtract padding and gap from available width
const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16; // Left + right padding
const GAP = 12; // Gap between columns
const ITEM_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - GAP) / 2;

<FlatList
  numColumns={2}
  columnWrapperStyle={{
    gap: GAP,
    paddingHorizontal: PADDING,
  }}
  renderItem={() => <View style={{ width: ITEM_WIDTH }} />}
/>
```
**Warning signs:** Items wrap to next line unexpectedly, gaps are uneven, horizontal scroll appears

### Pitfall 4: RefreshControl Indicator Stops Immediately

**What goes wrong:** Pull-to-refresh indicator appears briefly then disappears before "fetching" completes
**Why it happens:** `refreshing` prop is not controlled correctly - must be set to true in `onRefresh` and false after async operation
**How to avoid:**
```typescript
// WRONG - refreshing never set to true
const onRefresh = () => {
  fetchData(); // Async but no state update
};
<RefreshControl refreshing={false} onRefresh={onRefresh} />

// CORRECT - controlled state with async pattern
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
  setRefreshing(true); // Show indicator
  setTimeout(() => {
    setRefreshing(false); // Hide after "fetch"
  }, 800);
}, []);

<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
```
**Warning signs:** Indicator flashes briefly, data doesn't appear to refresh

### Pitfall 5: BottomSheetModalProvider Missing from App Root

**What goes wrong:** BottomSheetModal throws error "BottomSheetModalProvider not found"
**Why it happens:** @gorhom/bottom-sheet requires BottomSheetModalProvider wrapping the app root
**How to avoid:** Verify `app/_layout.tsx` includes BottomSheetModalProvider in provider hierarchy (already configured in codebase)
```typescript
// app/_layout.tsx (already correct)
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

<GestureHandlerRootView>
  <HeroUINativeProvider>
    <ThemeProvider>
      <AuthProvider>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
      </AuthProvider>
    </ThemeProvider>
  </HeroUINativeProvider>
</GestureHandlerRootView>
```
**Warning signs:** Runtime error on BottomSheetModal mount, crash when calling `present()`

## Code Examples

Verified patterns from official sources:

### Horizontal Carousel with Page Dots (Reuse Phase 3 Pattern)
```typescript
// Source: Phase 3 HeroSwiper + https://reactnative.dev/docs/flatlist
import { FlatList, View, Dimensions } from 'react-native';
import { useState, useCallback, useRef } from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const [currentIndex, setCurrentIndex] = useState(0);

const viewabilityConfig = useRef({
  viewAreaCoveragePercentThreshold: 50,
}).current;

const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  if (viewableItems.length > 0 && viewableItems[0]?.index != null) {
    setCurrentIndex(viewableItems[0].index);
  }
}, []);

const featuredRewards = MOCK_REWARDS.filter(r => r.featured);

<View>
  <FlatList
    data={featuredRewards}
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={CARD_WIDTH}
    decelerationRate="fast"
    contentContainerStyle={{ paddingHorizontal: 16 }}
    viewabilityConfig={viewabilityConfig}
    onViewableItemsChanged={onViewableItemsChanged}
    renderItem={({ item }) => (
      <View style={{ width: CARD_WIDTH }}>
        <RewardCard reward={item} />
      </View>
    )}
    keyExtractor={(item) => item.id}
  />

  {/* Page indicator dots */}
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}>
    {featuredRewards.map((_, idx) => (
      <View
        key={idx}
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: idx === currentIndex ? colors.accent : colors.textTertiary,
        }}
      />
    ))}
  </View>
</View>
```

### 2-Column Grid with Fixed Item Sizing
```typescript
// Source: https://reactnative.dev/docs/flatlist
import { FlatList, View, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 16;
const GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - GAP) / 2;
const ITEM_HEIGHT = ITEM_WIDTH * 1.3; // 1:1.3 aspect ratio

const nonFeaturedRewards = MOCK_REWARDS.filter(r => !r.featured);

<FlatList
  data={nonFeaturedRewards}
  numColumns={2}
  scrollEnabled={false} // Parent ScrollView handles scroll
  columnWrapperStyle={{
    gap: GAP,
    paddingHorizontal: PADDING,
    marginBottom: 12,
  }}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}>
      <RewardCard reward={item} onPress={() => handlePress(item)} />
    </View>
  )}
/>
```

### BottomSheetModal with Backdrop
```typescript
// Source: https://gorhom.dev/react-native-bottom-sheet/props + community examples
import { useRef, useCallback, useState } from 'react';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

const bottomSheetRef = useRef<BottomSheetModal>(null);
const [selectedReward, setSelectedReward] = useState<MockReward | null>(null);

const handleRewardPress = (reward: MockReward) => {
  setSelectedReward(reward);
  bottomSheetRef.current?.present();
};

const handleDismiss = () => {
  setSelectedReward(null);
};

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

// Inside component return
<>
  {/* Trigger */}
  <Pressable onPress={() => handleRewardPress(reward)}>
    <RewardCard reward={reward} />
  </Pressable>

  {/* Modal */}
  <BottomSheetModal
    ref={bottomSheetRef}
    snapPoints={['50%']}
    enablePanDownToClose={true}
    backdropComponent={renderBackdrop}
    onDismiss={handleDismiss}
  >
    <View style={{ flex: 1, padding: 20 }}>
      {selectedReward && (
        <>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>
            {selectedReward.title}
          </Text>
          <Text style={{ fontSize: 14, marginTop: 8 }}>
            {selectedReward.description}
          </Text>
          {/* QR code placeholder */}
          <View style={{
            marginTop: 20,
            width: 200,
            height: 200,
            backgroundColor: '#F0F0F0',
            alignSelf: 'center',
          }}>
            {/* Placeholder for QR/barcode */}
          </View>
        </>
      )}
    </View>
  </BottomSheetModal>
</>
```

### Pull-to-Refresh with Mock Delay
```typescript
// Source: https://reactnative.dev/docs/refreshcontrol + codebase Home screen pattern
import { ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(() => {
  setRefreshing(true);
  // Simulate API call
  setTimeout(() => {
    setRefreshing(false);
  }, 800);
}, []);

<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Content */}
</ScrollView>
```

### Pill Segmented Control
```typescript
// Source: Community patterns + codebase LeaderboardPreview
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

type LeaderboardTab = 'friends' | 'global';

const [activeTab, setActiveTab] = useState<LeaderboardTab>('friends');

const data = activeTab === 'friends'
  ? MOCK_LEADERBOARD_FRIENDS
  : MOCK_LEADERBOARD_GLOBAL;

<View style={{
  flexDirection: 'row',
  backgroundColor: colors.cardBackground,
  borderRadius: 12,
  padding: 4,
  gap: 4,
  alignSelf: 'center',
  marginBottom: 16,
}}>
  <Pressable
    onPress={() => setActiveTab('friends')}
    style={{
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: activeTab === 'friends' ? colors.accent : 'transparent',
    }}
  >
    <Text style={{
      fontSize: 14,
      fontWeight: '600',
      color: activeTab === 'friends' ? '#FFFFFF' : colors.textSecondary,
    }}>
      Friends
    </Text>
  </Pressable>
  <Pressable
    onPress={() => setActiveTab('global')}
    style={{
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: activeTab === 'global' ? colors.accent : 'transparent',
    }}
  >
    <Text style={{
      fontSize: 14,
      fontWeight: '600',
      color: activeTab === 'global' ? '#FFFFFF' : colors.textSecondary,
    }}>
      Global
    </Text>
  </Pressable>
</View>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-native-modal | @gorhom/bottom-sheet | ~2021 | Native gestures, Reanimated 3 for 60fps, better UX with backdrop and swipe-down dismissal |
| Custom segmented control libraries | Simple Pressable pill toggle | 2023+ | Libraries require custom native code (breaks Expo Go), custom implementation is simpler and more flexible |
| Custom pull-to-refresh implementations | Built-in RefreshControl | Always standard | Platform-native behavior, automatic scroll position handling, no custom gesture logic needed |
| flexWrap for grids | FlatList numColumns | ~2017 | FlatList optimizes rendering with item recycling, handles large datasets efficiently |

**Deprecated/outdated:**
- **react-native-modal**: Still functional but @gorhom/bottom-sheet provides better gestures and animations
- **@react-native-segmented-control/segmented-control**: Requires custom native code, breaks Expo Go, simple pill toggle is more flexible
- **SectionList for mixed layouts**: Using ScrollView with nested FlatLists (different scroll axes) is simpler for carousel + grid pattern

## Open Questions

Things that couldn't be fully resolved:

1. **QR Code/Barcode Placeholder Design**
   - What we know: Mock layer uses placeholder - static image, colored rectangle, or text display
   - What's unclear: Exact placeholder design (should it look like a real QR code or just a gray box?)
   - Recommendation: Use simple gray rounded rectangle with centered text showing reward type ("QR Code", "Barcode", or "Code: XXXXX"). Real QR/barcode generation deferred to backend integration phase. Libraries like react-native-qrcode-svg available but not needed for mock layer.

2. **Featured Carousel Max Items (Up to 6)**
   - What we know: Context specifies "up to 6 cards" but current MOCK_REWARDS has 3 featured items
   - What's unclear: Should we add 3 more featured rewards to reach 6, or is 3 sufficient for Phase 4?
   - Recommendation: Keep 3 featured rewards for now (sufficient to demonstrate carousel + dots), easy to add more later if needed.

3. **Show More Button Styling**
   - What we know: Context marks as Claude's discretion - button or link style
   - What's unclear: Should it match Add Activity button style (colored background) or be a text link?
   - Recommendation: Use text link style (accent color, centered, with ChevronDown icon) to avoid competing with primary actions. Consistent with "View All" pattern on Home screen's LeaderboardPreview.

4. **Reward Card Press Animation Timing**
   - What we know: Context specifies "subtle scale-down press feedback before toaster slides up"
   - What's unclear: Exact scale value and timing for press feedback
   - Recommendation: Use Reanimated withTiming for scale animation (0.98 scale, 100ms duration) on press in, then present bottom sheet. Similar to FlipCard press pattern but without flip.

5. **Empty State Illustration**
   - What we know: Context specifies "friendly illustration + No rewards yet message"
   - What's unclear: Should we use an icon, emoji, or require a custom SVG illustration?
   - Recommendation: Use lucide-react-native Gift icon (large size, light opacity) above text "No rewards yet" with subtitle "Check back soon for partner offers". SVG illustrations can be added in polish phase.

## Sources

### Primary (HIGH confidence)
- [React Native - FlatList Documentation](https://reactnative.dev/docs/flatlist) - numColumns, columnWrapperStyle, grid layouts
- [React Native - RefreshControl Documentation](https://reactnative.dev/docs/refreshcontrol) - Pull-to-refresh patterns
- [@gorhom/bottom-sheet - Props Documentation](https://gorhom.dev/react-native-bottom-sheet/props) - snapPoints, enablePanDownToClose, backdropComponent
- [@gorhom/bottom-sheet - npm Package](https://www.npmjs.com/package/@gorhom/bottom-sheet) - Version 5.2.8 features and setup
- Phase 3 Research (file://.planning/phases/03-home-screen/03-RESEARCH.md) - HeroSwiper carousel pattern, Reanimated 4 animations
- Codebase (app/(tabs)/index.tsx) - RefreshControl pattern on Home screen

### Secondary (MEDIUM confidence)
- [Galaxies.dev - React Native Bottom Sheet Guide](https://galaxies.dev/react-native-bottom-sheet) - BottomSheetModal examples with present/dismiss
- [Medium - Managing Multiple Bottom Sheets in React Native](https://paufau.medium.com/managing-multiple-bottom-sheets-in-react-native-e1e95c35a872) - Best practices for modal usage
- [DEV Community - React Native FlatList Grid Lessons](https://dev.to/christiankohler/lessons-learned-from-building-a-grid-list-in-react-native-ckn) - numColumns pitfalls and solutions
- [Repeato - Managing Column Width in React Native FlatList](https://www.repeato.app/managing-column-width-in-react-native-flatlist/) - Item width calculations for grids
- [Medium - Pull to Refresh Beyond Default Spinner (Jan 2026)](https://medium.com/@nomanakram1999/pull-to-refresh-in-react-native-beyond-the-default-spinner-01998230c9b2) - Recent 2026 RefreshControl patterns

### Tertiary (LOW confidence)
- [Scanova - Placeholder QR Code Guide (2026)](https://scanova.io/blog/placeholder-qr-code-complete-guide/) - QR code placeholder design patterns (general guide, not React Native specific)
- [@react-native-segmented-control/segmented-control - Expo Docs](https://docs.expo.dev/versions/latest/sdk/segmented-control/) - Library requires custom native code (not suitable for Expo Go)
- [GitHub - react-native-qrcode-styled](https://github.com/tokkozhin/react-native-qrcode-styled) - QR code customization library (deferred to backend phase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and configured, FlatList and RefreshControl are React Native core, @gorhom/bottom-sheet v5 documentation is authoritative
- Architecture: HIGH - Patterns reuse Phase 3 HeroSwiper (horizontal FlatList), Home screen RefreshControl, and existing component structures. FlatList numColumns is documented React Native API.
- Pitfalls: HIGH - Nested scroll conflicts and BottomSheetModal backdrop issues are well-documented in official docs and community discussions. Item width calculations for numColumns grids have established solutions.

**Research date:** 2026-01-30
**Valid until:** 2026-02-28 (30 days - stable domain with mature libraries)
