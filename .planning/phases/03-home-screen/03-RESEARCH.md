# Phase 3: Home Screen - Research

**Researched:** 2026-01-27
**Domain:** React Native animated dashboard with horizontal swiper, 3D flip cards, and leaderboard
**Confidence:** HIGH

## Summary

Phase 3 builds a fully populated Home screen featuring a horizontal card swiper with motivation text and activity counters, flip cards for streak and Nature Score stats with 3D rotateY animations, and a leaderboard preview with Friends/Global toggle. The implementation leverages existing infrastructure: mock data layer, Reanimated 4 (already configured), expo-linear-gradient (already installed), HeroUI Native components, and the established theme system with nature-themed gradients.

The standard approach for horizontal swipers in React Native is FlatList with `horizontal={true}` and `pagingEnabled={true}`, tracking scroll position via `onViewableItemsChanged` for custom dot indicators. For 3D flip animations, Reanimated 4's `useSharedValue` and `useAnimatedStyle` with `rotateY` transforms and perspective are the authoritative solution, with Android requiring `{ perspective: 1000 }` as the FIRST transform in the array. Navigation to the Your Squad tab uses Expo Router's `router.push('/(tabs)/squad')` pattern.

**Primary recommendation:** Build three custom components (HeroSwiper, FlipCard, LeaderboardPreview) using FlatList horizontal scrolling for the swiper, Reanimated 4 for flip animations with Android-first perspective placement, and HeroUI Native Avatar components for leaderboard entries. Consume all data from existing mock layer (MOCK_HERO_CARDS, MOCK_STATS, MOCK_LEADERBOARD_FRIENDS, MOCK_LEADERBOARD_GLOBAL).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | 3D flip card animations | Official Reanimated 4 is the industry standard for complex animations, runs on UI thread, provides `useSharedValue` and `useAnimatedStyle` for smooth transforms |
| expo-linear-gradient | ^15.0.8 | Hero card nature-themed gradient overlay | Official Expo library, 100% native, supports rgba transparency for overlays, works with position:absolute for layered effects |
| FlatList | Built-in | Horizontal card swiper | React Native core component, optimized for list rendering, supports `horizontal`, `pagingEnabled`, and `onViewableItemsChanged` |
| heroui-native | ^1.0.0-beta.9 | Avatar, Chip components | Already installed, provides pre-built Avatar for leaderboard entries |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react-native | ^0.562.0 | Icons (Flame, Leaf, refresh icon) | Already installed, extensive icon library for stat card icons |
| react-native-safe-area-context | ~5.6.0 | Safe area insets | Already installed, needed for proper top padding in scrollable content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FlatList horizontal | react-native-pager-view | PagerView requires additional library, FlatList is built-in and sufficient for 2-card swiper |
| FlatList horizontal | react-native-swiper-flatlist | Third-party library adds dependency, custom FlatList implementation gives full control over dots |
| Custom dot indicators | react-native-animated-pagination-dots | Library adds 30KB, custom dots are 10 lines of code for 2-dot indicator |

**Installation:**
No new packages required - all dependencies already installed in package.json.

## Architecture Patterns

### Recommended Project Structure
```
components/
├── home/                     # Home screen components
│   ├── HeroSwiper.tsx        # 2-card horizontal swiper with dots
│   ├── FlipCard.tsx          # Generic flip card with front/back
│   ├── StatsFlipCard.tsx     # Wrapper for Streak/Nature Score cards
│   └── LeaderboardPreview.tsx# Top 5 preview with toggle
app/(tabs)/
└── index.tsx                 # Home screen (consumes components)
```

### Pattern 1: FlatList Horizontal Swiper with Dots

**What:** Horizontal card swiper using FlatList with pagination and custom dot indicators
**When to use:** For small, fixed-length card sets (2-5 cards) with full-width pagination

**Example:**
```typescript
// Source: https://reactnative.dev/docs/flatlist + codebase patterns
import { FlatList, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

const [currentIndex, setCurrentIndex] = useState(0);

const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 50, // Card is "visible" when 50% in view
};

const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  if (viewableItems[0]?.index != null) {
    setCurrentIndex(viewableItems[0].index);
  }
}, []);

<FlatList
  data={MOCK_HERO_CARDS}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  renderItem={({ item }) => <HeroCard card={item} />}
  keyExtractor={(item) => item.id}
  onViewableItemsChanged={onViewableItemsChanged}
  viewabilityConfig={viewabilityConfig}
  getItemLayout={(data, index) => ({
    length: CARD_WIDTH,
    offset: CARD_WIDTH * index,
    index,
  })}
/>

{/* Custom dot indicators */}
<View style={{ flexDirection: 'row', gap: 8 }}>
  {MOCK_HERO_CARDS.map((_, idx) => (
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
```

### Pattern 2: 3D Flip Card with Reanimated 4

**What:** Tap-to-flip card using rotateY transform with perspective, showing front/back faces
**When to use:** For revealing additional information on tap (stats detail, card back content)

**Example:**
```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';

const isFlipped = useSharedValue(false);

const handleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const frontAnimatedStyle = useAnimatedStyle(() => {
  const rotateValue = interpolate(
    isFlipped.value ? 1 : 0,
    [0, 1],
    [0, 180] // Front rotates 0° → 180°
  );

  return {
    transform: [
      { perspective: 1000 }, // MUST be first for Android
      { rotateY: `${withTiming(rotateValue, { duration: 400 })}deg` },
    ],
    backfaceVisibility: 'hidden',
  };
});

const backAnimatedStyle = useAnimatedStyle(() => {
  const rotateValue = interpolate(
    isFlipped.value ? 1 : 0,
    [0, 1],
    [180, 360] // Back rotates 180° → 360° (flips into view)
  );

  return {
    transform: [
      { perspective: 1000 }, // MUST be first for Android
      { rotateY: `${withTiming(rotateValue, { duration: 400 })}deg` },
    ],
    backfaceVisibility: 'hidden',
  };
});

<Pressable onPress={handleFlip}>
  <View style={{ position: 'relative' }}>
    <Animated.View style={[styles.card, frontAnimatedStyle]}>
      {/* Front content */}
    </Animated.View>
    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
      {/* Back content */}
    </Animated.View>
  </View>
</Pressable>
```

**CRITICAL Android Fix:** `{ perspective: 1000 }` MUST be the first transform in the array for 3D effects to render on Android. Source: [React Native Rotation Guide](https://chrizog.com/react-native-rotation-anchor-point)

### Pattern 3: Linear Gradient Overlay on Cards

**What:** Nature-themed gradient overlay on motivation card with white text for readability
**When to use:** For image backgrounds or color backgrounds that need text contrast

**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/linear-gradient/
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';

<View style={{ borderRadius: 16, overflow: 'hidden' }}>
  <LinearGradient
    colors={['#2d5016', '#1a2f0c']} // Nature-themed green to dark
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ padding: 20 }}
  >
    <Text style={{ color: '#FFFFFF' }}>Motivation text</Text>
  </LinearGradient>
</View>
```

Alternatively, for image overlays:
```typescript
<ImageBackground source={{ uri: bgImage }} style={styles.card}>
  <LinearGradient
    colors={['rgba(0,0,0,0.6)', 'transparent']}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
  <Text style={{ color: '#FFFFFF' }}>Overlaid text</Text>
</ImageBackground>
```

### Pattern 4: Tab Navigation with Expo Router

**What:** Programmatic navigation to specific tab screen
**When to use:** "View All" buttons that navigate to another tab (e.g., Home → Your Squad)

**Example:**
```typescript
// Source: https://docs.expo.dev/router/basics/navigation/
import { router } from 'expo-router';

const handleViewAll = () => {
  router.push('/(tabs)/squad'); // Navigate to Your Squad tab
};

<Pressable onPress={handleViewAll}>
  <Text>View All</Text>
</Pressable>
```

**Tab route naming:** Routes under `app/(tabs)/` are accessed by `/(tabs)/[filename]` where filename is the screen name (`squad.tsx` → `/(tabs)/squad`).

### Anti-Patterns to Avoid

- **Don't use `router.replace()` for tab navigation** - Use `router.push()` to maintain back navigation
- **Don't put perspective anywhere but first in transform array on Android** - Will fail to render 3D effects
- **Don't use interpolate() for boolean flip state** - Use conditional shared value (0 or 1) with interpolate for degrees
- **Don't build custom swiper libraries** - FlatList horizontal with pagination is simpler and performs better for small card sets
- **Don't use Animated API** - Use Reanimated 4 for all animations (runs on UI thread, better performance)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Horizontal card pagination | Custom ScrollView with scroll event tracking | FlatList with `pagingEnabled` and `onViewableItemsChanged` | FlatList handles viewability, recycling, and performance optimizations automatically |
| 3D card flip animation | Custom Animated.Value math for rotation | Reanimated 4 with `interpolate` pattern | Reanimated runs on UI thread (60fps guaranteed), Animated API runs on JS thread (drops frames) |
| Gradient overlays | ImageBackground with opacity View layers | expo-linear-gradient with rgba colors | Native gradients are hardware-accelerated, multiple View layers cause overdraw performance issues |
| Page indicator dots | Custom animated dot component | Simple View array with conditional backgroundColor | For 2-dot indicator, custom animation is overkill; conditional style is 5 lines |
| Nature Score calculation | Complex algorithm with weighted factors | Simple mock formula (placeholder for Phase 3) | User decisions specify mock data layer first; calculation algorithm is separate phase |

**Key insight:** React Native provides optimized primitives (FlatList, Pressable) that handle edge cases (accessibility, platform differences, performance) better than custom implementations. Reanimated 4 is already configured and required for smooth 60fps animations.

## Common Pitfalls

### Pitfall 1: Android Perspective Transform Order

**What goes wrong:** 3D flip animation works on iOS but renders flat or doesn't flip on Android
**Why it happens:** Android's transform rendering requires `perspective` to be applied last, which means it must be FIRST in the transform array (transforms apply in reverse order)
**How to avoid:**
```typescript
// WRONG - perspective last in array
transform: [{ rotateY: '180deg' }, { perspective: 1000 }]

// CORRECT - perspective FIRST in array
transform: [{ perspective: 1000 }, { rotateY: '180deg' }]
```
**Warning signs:**
- Flip animation works in iOS simulator but fails on Android device/emulator
- Card appears to scale instead of rotate
- No 3D depth effect visible

**Source:** [React Native Transform Documentation](https://reactnative.dev/docs/transforms), [GitHub Issue #9740](https://github.com/facebook/react-native/issues/9740)

### Pitfall 2: FlatList `getItemLayout` Performance

**What goes wrong:** Horizontal FlatList stutters during swipe or dots update incorrectly
**Why it happens:** Without `getItemLayout`, FlatList must measure each item, causing layout thrashing on scroll
**How to avoid:** Always provide `getItemLayout` for fixed-size horizontal lists:
```typescript
getItemLayout={(data, index) => ({
  length: CARD_WIDTH, // Fixed card width
  offset: CARD_WIDTH * index, // Card position
  index,
})}
```
**Warning signs:**
- Swipe gestures feel janky
- Dot indicators lag behind scroll position
- Console warnings about "VirtualizedLists should never be nested"

### Pitfall 3: Linear Gradient Border Radius Clipping

**What goes wrong:** Gradient extends beyond card rounded corners
**Why it happens:** LinearGradient doesn't inherit parent's borderRadius automatically
**How to avoid:** Wrap gradient in View with `overflow: 'hidden'`:
```typescript
// CORRECT
<View style={{ borderRadius: 16, overflow: 'hidden' }}>
  <LinearGradient colors={...} style={{ flex: 1 }}>
    {children}
  </LinearGradient>
</View>

// WRONG - gradient ignores borderRadius
<LinearGradient colors={...} style={{ borderRadius: 16 }}>
  {children}
</LinearGradient>
```
**Warning signs:** Gradient appears squared at corners even with borderRadius set

### Pitfall 4: Flip Card `backfaceVisibility` Required

**What goes wrong:** Both front and back of card render simultaneously, creating visual glitch
**Why it happens:** By default, rotated Views remain visible even when facing away from camera
**How to avoid:** Always set `backfaceVisibility: 'hidden'` on both front and back Animated.Views
**Warning signs:**
- Text appears reversed/mirrored during flip
- Both sides of card visible at 90° rotation angle
- Z-fighting flicker effect during animation

### Pitfall 5: Tab Navigation State After `router.push()`

**What goes wrong:** After navigating to Your Squad tab via `router.push('/(tabs)/squad')`, the tab bar highlights the wrong tab or user can't swipe back to Home
**Why it happens:** Material Top Tabs maintain internal navigation state; pushing to a tab route navigates but doesn't update tab bar focus
**How to avoid:** This is expected behavior - `router.push()` navigates to the route and Material Top Tabs will update the active tab highlight correctly. User can swipe back or tap Home tab icon to return.
**Warning signs:** None - this is correct behavior. `router.push('/(tabs)/squad')` is the standard pattern for navigating to a specific tab programmatically.

**Source:** [Expo Router Navigation Patterns](https://docs.expo.dev/router/basics/common-navigation-patterns/)

## Code Examples

Verified patterns from official sources:

### Horizontal FlatList Swiper with Dots
```typescript
// Source: https://reactnative.dev/docs/flatlist
import { FlatList, View, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);

export function HeroSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <View>
      <FlatList
        data={MOCK_HERO_CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            {/* Card content */}
          </View>
        )}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}>
        {MOCK_HERO_CARDS.map((_, idx) => (
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
  );
}
```

### Reanimated 4 Flip Card
```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Pressable, StyleSheet } from 'react-native';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

export function FlipCard({ front, back }: FlipCardProps) {
  const isFlipped = useSharedValue(0);

  const handlePress = () => {
    isFlipped.value = isFlipped.value ? 0 : 1;
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 }, // Android: MUST be first
      { rotateY: `${interpolate(isFlipped.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 }, // Android: MUST be first
      { rotateY: `${interpolate(isFlipped.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  return (
    <Pressable onPress={handlePress}>
      <View>
        <Animated.View style={[styles.face, frontStyle]}>
          {front}
        </Animated.View>
        <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
          {back}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  faceBack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
```

### Nature-Themed Gradient Card
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/linear-gradient/
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text } from 'react-native';

export function MotivationCard({ text }: { text: string }) {
  return (
    <View style={{ borderRadius: 16, overflow: 'hidden', shadowRadius: 8, shadowOpacity: 0.15 }}>
      <LinearGradient
        colors={['#2d5016', '#1a2f0c']} // Nature green → dark
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24, minHeight: 160 }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF' }}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
}
```

### Leaderboard Row with Avatar
```typescript
// Source: Codebase component patterns + HeroUI Native documentation
import { Avatar } from 'heroui-native';
import { View, Text } from 'react-native';

interface LeaderboardRowProps {
  entry: MockLeaderboardEntry;
  isCurrentUser: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: isCurrentUser ? `${colors.accent}15` : 'transparent',
      }}
    >
      <Text style={{ width: 24, fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>
        {entry.rank}
      </Text>
      <Avatar src={entry.avatarUrl} size="sm" />
      <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}>
        {entry.displayName}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
        {Math.floor(entry.totalTime / 60)}h
      </Text>
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Animated API (Animated.Value) | Reanimated 4 (useSharedValue) | Reanimated 2.0 (2020) | UI thread animations, no JS bridge lag, 60fps guaranteed |
| react-native-snap-carousel | FlatList horizontal + pagingEnabled | ~2021 | One less dependency, FlatList is built-in and performant |
| Custom gradient libraries | expo-linear-gradient | Expo SDK 40 (2021) | Official Expo support, native performance, simpler API |
| Context for modal state | Expo Router file-based routes | Expo Router v2 (2023) | URL-based navigation, deep linking, type-safe routing |

**Deprecated/outdated:**
- **react-native-flip-card**: Unmaintained since 2019, uses deprecated Animated API instead of Reanimated
- **react-native-swiper**: Overkill for 2-card swiper, adds 50KB bundle size for features not needed
- **Animated.timing**: Use Reanimated's `withTiming` for 60fps UI thread animations

## Open Questions

Things that couldn't be fully resolved:

1. **Nature Score Calculation Algorithm**
   - What we know: NatureScore® by NatureQuant measures natural elements (tree cover, parks, water) within 1km radius using machine learning
   - What's unclear: Specific formula for Trailblazer's Nature Score based on activity types, duration, and outdoor time percentage
   - Recommendation: Use simple mock calculation for Phase 3 (e.g., `totalMinutes * 0.05`), defer real algorithm to future phase. Mock data already includes `MOCK_STATS` with placeholder values.

2. **Flip Card Tap Affordance**
   - What we know: Context marks this as Claude's discretion (subtle flip icon, text hint, or discovery)
   - What's unclear: User testing preference - explicit affordance vs. discovery-based interaction
   - Recommendation: Start with no visual affordance (discovery-based) since flip cards are a common mobile pattern. If usability issues arise, add subtle hint text like "Tap to flip" or small flip icon.

3. **Page Indicator Dot Placement**
   - What we know: Context marks this as Claude's discretion (inside card bottom or below card)
   - What's unclear: Visual hierarchy preference - integrated vs. separated
   - Recommendation: Place dots below card (12-16px gap) to avoid competing with card content and maintain clear visual separation.

4. **Friends/Global Toggle Style**
   - What we know: Context marks this as Claude's discretion (pill segmented control or underlined tabs)
   - What's unclear: Design system preference for toggles across app
   - Recommendation: Use simple pill-style segmented control (two rounded rectangles in row, active has accent background) for consistency with modern iOS/Material patterns.

## Sources

### Primary (HIGH confidence)
- [React Native Reanimated - Flip Card Example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/) - Official flip animation pattern
- [React Native - FlatList Documentation](https://reactnative.dev/docs/flatlist) - Horizontal scrolling and pagination
- [Expo - LinearGradient Documentation](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) - Gradient overlay patterns
- [React Native - Transforms Documentation](https://reactnative.dev/docs/transforms) - Transform array ordering
- [Expo Router - Navigation Patterns](https://docs.expo.dev/router/basics/navigation/) - Tab navigation with router.push

### Secondary (MEDIUM confidence)
- [Chrizog - React Native Rotation Anchor Point Guide](https://chrizog.com/react-native-rotation-anchor-point) - Android perspective transform order
- [GitHub - react-native-swiper-flatlist](https://github.com/gusgard/react-native-swiper-flatlist) - FlatList swiper patterns (verified library for reference)
- [HeroUI v3 Components](https://v3.heroui.com/docs/react/components) - Avatar and Chip documentation
- [Expo Router - Common Navigation Patterns](https://docs.expo.dev/router/basics/common-navigation-patterns/) - Tab switching specifics

### Tertiary (LOW confidence)
- [NatureQuant - Nature Score Algorithm](https://www.naturequant.com/) - Nature scoring concepts (algorithm unclear, mock data sufficient for Phase 3)
- [Medium - React Native Gesture Handler Tutorial](https://medium.com/@malikchohra/gesture-handling-with-react-native-build-native-feeling-interactions-ed634316ff3d) - Gesture UX patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, official documentation verified, existing codebase uses Reanimated 4 (ParkerFAB.tsx)
- Architecture: HIGH - FlatList horizontal and Reanimated 4 flip patterns are official React Native/Reanimated examples, verified in production apps
- Pitfalls: HIGH - Android perspective ordering documented in official React Native GitHub issues and community guides, verified cross-platform concern

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable domain with mature libraries)
