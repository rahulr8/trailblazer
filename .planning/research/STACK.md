# Technology Stack - Animated UI Milestone

**Project:** Trailblazer+ UI Rebuild
**Focus:** Production-quality animated card interfaces, 3D flips, horizontal swipers, gesture-driven interactions
**Researched:** 2026-01-27
**Confidence:** HIGH

## Executive Summary

The existing Expo 54 + Reanimated 4.1.1 + Gesture Handler 2.28.0 stack is production-ready for building complex animated card UIs. Reanimated 4.x introduced breaking API changes that require new patterns (Gesture API, scheduleOnRN instead of runOnJS). HeroUI Native provides form/overlay components but requires @gorhom/bottom-sheet integration for advanced keyboard handling.

## Core Animation Stack

### React Native Reanimated 4.1.1

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-reanimated | ~4.1.1 | Animation engine for 60fps UI thread animations | Industry standard for performance-critical animations. All animations run on native UI thread via worklets, avoiding JS thread bottlenecks. |

**Key API Changes from Reanimated 3:**
- `useAnimatedGestureHandler` REMOVED - must use new Gesture API from Gesture Handler 2
- `runOnJS` → `scheduleOnRN` (from react-native-worklets)
- `runOnUI` → `scheduleOnUI`
- `useWorkletCallback` removed (use `useCallback` + `'worklet';` directive)
- New Architecture only (Legacy Architecture no longer supported)

**Confidence:** HIGH - Official documentation verified

### React Native Gesture Handler 2.28.0

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-gesture-handler | ~2.28.0 | Touch gesture recognition for swipes, pans, taps | Required by Reanimated 4 for gesture-driven animations. Provides declarative Gesture API that replaced old hooks. |

**Key APIs for Card Interactions:**
- `Gesture.Pan()` for horizontal card swipers
- `Gesture.Tap()` for flip triggers
- `translationX` and `velocityX` for momentum-based swipes
- `minDistance`, `activeOffsetX`, `failOffsetX` for gesture recognition tuning

**Confidence:** HIGH - Official documentation verified

### @gorhom/bottom-sheet 5.2.8

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @gorhom/bottom-sheet | 5.2.8 | Modal bottom sheet overlays with gesture dismissal | HeroUI Native Bottom Sheet wraps this library. Direct integration needed for advanced keyboard handling with form inputs. |

**Integration Notes:**
- HeroUI Native Bottom Sheet uses this under the hood
- Use `BottomSheetTextInput` (not React Native TextInput) for keyboard handling
- `keyboardBehavior="fillParent"` + `android_keyboardInputMode` props for platform-specific behavior
- `BottomSheetScrollView` required for scrollable content with inputs

**Confidence:** HIGH - Official documentation + HeroUI Native docs verified

## Animation Patterns for This Milestone

### 3D Flip Card Animation

**Pattern:** Two overlaid animated views with rotateY interpolation

```typescript
// Core pattern from Reanimated docs
const isFlipped = useSharedValue(false);

const regularCardStyle = useAnimatedStyle(() => {
  const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
  const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });
  return {
    transform: [
      { perspective: 1000 }, // CRITICAL for 3D effect
      { rotateY: rotateValue }
    ]
  };
});

const flippedCardStyle = useAnimatedStyle(() => {
  const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
  const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });
  return {
    transform: [
      { perspective: 1000 },
      { rotateY: rotateValue }
    ]
  };
});
```

**Key Points:**
- Use `useSharedValue` for flip state (prevents re-renders)
- Two separate views: regular (0-180deg) and flipped (180-360deg)
- `perspective` transform MUST be included (especially for Android)
- Use `withTiming` for controlled duration, `withSpring` for bouncy feel
- Overlay cards with `position: 'absolute'`

**Platform Considerations:**
- Android requires explicit `perspective` in transform array
- iOS handles perspective more forgivingly but include it for consistency
- Test on both platforms - Android 3D transforms have known limitations

**Use Cases in Milestone:**
- Stats cards (tap to flip front/back)
- Giveaway cards
- Grand prize reveal
- Wallet cards in digital wallet

**Confidence:** HIGH - Official Reanimated example + verified tutorials

### Horizontal Card Swiper with Pagination

**Recommended Approach:** FlatList with snapToInterval + pagination dots

```typescript
// Best practice pattern
<FlatList
  data={cards}
  horizontal
  pagingEnabled={false} // Use snapToInterval instead
  snapToInterval={CARD_WIDTH + (INSET_LEFT + INSET_RIGHT)}
  snapToAlignment="center"
  decelerationRate="fast"
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING }}
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  )}
  renderItem={({ item }) => <CardComponent data={item} />}
/>
```

**Key Points:**
- `snapToInterval` = card width + spacing (use integer values, not floats to avoid offset drift)
- `decelerationRate="fast"` for better snap feel
- `snapToAlignment="center"` for centered cards
- Disable `pagingEnabled` (overridden by snapToInterval)
- Use `onScroll` with Reanimated's `useAnimatedScrollHandler` for page dots
- `useNativeDriver: true` for 60fps scrolling

**Alternative for Complex Gestures:** Gesture Handler + PanGestureHandler

```typescript
// For custom swipe logic with velocity-based animations
const gesture = Gesture.Pan()
  .activeOffsetX([-10, 10])
  .onUpdate((event) => {
    translateX.value = event.translationX;
  })
  .onEnd((event) => {
    const shouldSwipe = Math.abs(event.velocityX) > VELOCITY_THRESHOLD;
    const direction = event.translationX > 0 ? 1 : -1;

    if (shouldSwipe) {
      translateX.value = withSpring(direction * CARD_WIDTH);
      runOnJS(onCardChange)(direction); // Use scheduleOnRN in Reanimated 4
    } else {
      translateX.value = withSpring(0);
    }
  });
```

**When to Use Each:**
- FlatList: Simple horizontal pagination, many cards, consistent sizing
- Gesture Handler: Custom swipe logic, Tinder-like dismissal, velocity-based decisions

**Use Cases in Milestone:**
- Horizontal card swipers with page dots
- Multi-step forms with swipeable sections

**Confidence:** HIGH - React Native docs + community patterns verified

### 3D Stacked Card Deck Animation

**Pattern:** Overlapping cards with scale/translateY interpolation based on index

```typescript
// Based on Tinder-style and stacked card tutorials
const cards = data.map((item, index) => {
  const inputRange = [-1, 0, index, index + 1];
  const outputRangeScale = [1, 1, 1, 0.95];
  const outputRangeTranslateY = [0, 0, 0, -10];
  const outputRangeRotate = [0, 0, 0, '5deg'];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      currentIndex.value,
      inputRange,
      outputRangeScale,
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      currentIndex.value,
      inputRange,
      outputRangeTranslateY,
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scale },
        { translateY },
        { perspective: 1000 }
      ],
      zIndex: data.length - index
    };
  });

  return (
    <Animated.View key={item.id} style={[styles.card, animatedStyle]}>
      <CardContent data={item} />
    </Animated.View>
  );
});
```

**Key Points:**
- Use `interpolate` with `Extrapolation.CLAMP` to prevent over-animation
- `zIndex` determines card stacking order (higher = on top)
- Animate scale (0.95-1.0), translateY (offset back cards), and optional rotate
- Use `currentIndex` shared value to drive all card positions
- Combine with Gesture.Pan() for swipe-to-dismiss top card

**Advanced: Tap to Bring Card Forward**
```typescript
const gesture = Gesture.Tap().onEnd(() => {
  currentIndex.value = withSpring(tappedCardIndex);
  runOnJS(onCardSelect)(tappedCardIndex); // scheduleOnRN in Reanimated 4
});
```

**Use Cases in Milestone:**
- Digital wallet with stacked cards (tap to bring forward + flip)

**Confidence:** MEDIUM - Based on community tutorials (2023-2025), not official docs. Test thoroughly.

### Pull-to-Refresh

**Pattern:** Built-in RefreshControl with FlatList/ScrollView

```typescript
import { RefreshControl } from 'react-native';

<FlatList
  data={items}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#007AFF"
      colors={['#007AFF']} // Android
    />
  }
  renderItem={({ item }) => <Item data={item} />}
/>
```

**Key Points:**
- Use built-in `RefreshControl` component (no custom Reanimated needed)
- Set `refreshing` to true when fetching, false when done
- Add 1-second minimum display time for UX (even if API is fast)
- `tintColor` (iOS) and `colors` (Android) for platform-specific styling
- Works with FlatList, ScrollView, and SectionList

**Use Cases in Milestone:**
- Leaderboard lists
- Activity feed
- Any scrollable list requiring data refresh

**Confidence:** HIGH - React Native built-in component

### Stopwatch Timer UI

**Pattern:** useFrameCallback for 60fps UI thread updates

```typescript
import { useFrameCallback } from 'react-native-reanimated';

const elapsedTime = useSharedValue(0);
const isRunning = useSharedValue(false);
const startTime = useSharedValue(0);

useFrameCallback((frameInfo) => {
  if (isRunning.value) {
    const now = frameInfo.timestamp;
    elapsedTime.value = now - startTime.value;
  }
}, isRunning.value);

const animatedTextProps = useAnimatedProps(() => ({
  text: formatTime(elapsedTime.value)
}));
```

**Key Points:**
- `useFrameCallback` runs on every frame (60fps)
- All calculations happen on UI thread (no JS thread lag)
- Use `useAnimatedProps` to update text without re-renders
- `frameInfo.timestamp` for system time in milliseconds
- `frameInfo.timeSincePreviousFrame` for delta time

**Libraries Available:**
- `react-native-animated-stopwatch-timer` - Pre-built component with digit animations
- `react-native-reanimated-chrono` - Composable Timer/Stopwatch/Clock components
- `@docren/react-native-reanimated-timer` - Expo-compatible with NativeWind support

**Recommendation:** Build custom using useFrameCallback for full control, or use `react-native-reanimated-chrono` for rapid prototyping.

**Use Cases in Milestone:**
- Activity stopwatch timer UI

**Confidence:** HIGH - Official Reanimated API + verified libraries

## HeroUI Native Component Patterns

### Form Inputs

| Component | Use Case | Notes |
|-----------|----------|-------|
| TextField | Text input with label/error | Use multiline for textareas |
| Select | Dropdown picker | Displays list of options triggered by button |
| Checkbox | Boolean toggle (checkmark) | For multi-select scenarios |
| RadioGroup | Single selection from multiple options | Exclusive selection |
| Switch | On/off toggle | Alternative to checkbox for binary states |
| Chip | Compact tag/label | Use for filters, selected items |
| InputOTP | One-time password entry | New in Beta 12 (2026) with validation |

**Form Layout Pattern:**
```typescript
import { TextField, Select, Chip } from 'heroui-native';

<FormField label="Activity Type">
  <Select placeholder="Choose activity">
    <Select.Item value="hiking">Hiking</Select.Item>
    <Select.Item value="cycling">Cycling</Select.Item>
  </Select>
</FormField>

<FormField label="Tags">
  <View className="flex-row flex-wrap gap-2">
    {selectedTags.map(tag => (
      <Chip key={tag} onClose={() => removeTag(tag)}>
        {tag}
      </Chip>
    ))}
  </View>
</FormField>
```

**Confidence:** HIGH - Official HeroUI Native docs verified

### Bottom Sheet with Forms

**Pattern:** HeroUI Native Bottom Sheet + keyboard handling

```typescript
import { BottomSheet, TextField } from 'heroui-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  isDismissKeyboardOnClose
>
  <BottomSheet.Content
    snapPoints={['50%', '90%']}
    className="p-4"
  >
    <BottomSheetScrollView>
      <TextField
        label="Activity Name"
        placeholder="Enter name"
        // Custom keyboard handling if needed
        onFocus={() => {/* custom logic */}}
        onBlur={() => {/* custom logic */}}
      />

      {/* More form fields */}
    </BottomSheetScrollView>
  </BottomSheet.Content>
</BottomSheet>
```

**Key Points:**
- Use `BottomSheetScrollView` (not ScrollView) for keyboard avoidance
- `isDismissKeyboardOnClose` prop automatically dismisses keyboard
- `snapPoints` define sheet positions (e.g., ['25%', '50%', '90%'])
- HeroUI's `onOpenChange` reliably fires for all close scenarios
- Use `useBottomSheet()` hook to access state/control functions

**Use Cases in Milestone:**
- "Log Activity" bottom sheet with form inputs
- "Reward Details" bottom sheet overlay

**Confidence:** HIGH - HeroUI Native + @gorhom/bottom-sheet docs verified

### Overlay Components

| Component | Use Case | Best For |
|-----------|----------|----------|
| Dialog | Full-screen modal alerts | Confirmation dialogs, blocking interactions |
| Bottom Sheet | Slide-up forms/details | Forms, contextual actions, filters |
| Popover | Anchored floating content | Tooltips, small menus, info bubbles |
| Toast | Temporary notifications | Success/error messages, non-blocking feedback |

**Confidence:** HIGH - Official HeroUI Native docs verified

## What NOT to Do

### Anti-Pattern 1: Using useAnimatedGestureHandler
**What:** Reanimated 3 hook for gesture handling
**Why avoid:** REMOVED in Reanimated 4. Will cause runtime errors.
**Instead:** Use Gesture API from Gesture Handler 2 with Gesture.Pan(), Gesture.Tap(), etc.

### Anti-Pattern 2: Using runOnJS/runOnUI Directly
**What:** Reanimated 3 functions for thread switching
**Why avoid:** API changed in Reanimated 4 (now `scheduleOnRN`/`scheduleOnUI` from react-native-worklets)
**Instead:** Import from `react-native-worklets` and use new syntax:
```typescript
// OLD (Reanimated 3)
runOnJS((arg) => callback(arg))("value");

// NEW (Reanimated 4)
import { scheduleOnRN } from 'react-native-worklets';
scheduleOnRN((arg) => callback(arg), "value");
```

### Anti-Pattern 3: Float Values for snapToInterval
**What:** Using decimal values for FlatList snapToInterval
**Why avoid:** Causes progressively increasing offset drift in long lists
**Instead:** Use integer values only (round card width + spacing to nearest integer)

### Anti-Pattern 4: Standard TextInput in Bottom Sheets
**What:** React Native TextInput in @gorhom/bottom-sheet
**Why avoid:** Keyboard doesn't push sheet content properly
**Instead:** Use `BottomSheetTextInput` + `BottomSheetScrollView` from @gorhom/bottom-sheet

### Anti-Pattern 5: Missing perspective on Android 3D Transforms
**What:** Using rotateY/rotateX without perspective in transform array
**Why avoid:** 3D effect doesn't render on Android (works on iOS, fails on Android)
**Instead:** Always include `{ perspective: 1000 }` before rotation transforms

### Anti-Pattern 6: Over-abstracting Animation Code
**What:** Creating generic "animation helpers" before seeing patterns
**Why avoid:** Premature abstraction (project standards: wait for 3+ repetitions)
**Instead:** Copy-paste animation patterns until clear abstractions emerge

## Performance Optimization

### General Best Practices

1. **Use Reanimated worklets for all animations** - Runs on UI thread at 60fps, avoiding JS thread bottlenecks
2. **Enable useNativeDriver where possible** - For Animated API (not Reanimated)
3. **Implement image caching** - Use expo-image (already installed) or react-native-fast-image
4. **Minimize re-renders** - Use useSharedValue instead of useState for animation-driven values
5. **Lazy load images** - Use FlatList's built-in windowing for card lists
6. **Set removeClippedSubviews={true}** - On FlatList for large datasets
7. **Avoid heavy computations in worklets** - Keep math simple, pre-calculate constants

### Card Carousel Specific

1. **Use react-native-reanimated-carousel for complex carousels** - Industry standard (though not needed for simple horizontal FlatList pagination)
2. **Set scrollEventThrottle carefully** - Value of 1 increases accuracy but can cause bridge performance issues. Default (16) is usually fine.
3. **Defer computationally intensive work** - Use InteractionManager.runAfterInteractions for non-animation tasks

**Confidence:** HIGH - Official docs + community best practices verified

## Installation

All packages already installed in Trailblazer project:

```bash
# Already in package.json
react-native-reanimated ~4.1.1
react-native-gesture-handler ~2.28.0
@gorhom/bottom-sheet 5.2.8
heroui-native 1.0.0-beta.9
expo-haptics ~15.0.7
expo-blur ^15.0.8
expo-linear-gradient ^15.0.8
lucide-react-native ^0.562.0
```

**No additional installations needed.**

## Configuration Notes

### Reanimated 4 Setup
- Babel plugin configured in babel.config.js
- Worklets enabled for UI thread execution
- New Architecture only (Legacy Architecture dropped in v4)

### Gesture Handler Setup
- `GestureHandlerRootView` wraps app in app/_layout.tsx
- Required for all gesture-based interactions

### HeroUI Native Setup
- `@source` directive in global.css for component styles
- `HeroUINativeProvider` in provider hierarchy
- Uniwind for Tailwind CSS v4 styling

**All configurations already in place.**

## Migration Considerations

If you find older Reanimated 3 patterns in codebase examples:

1. Replace `useAnimatedGestureHandler` → Gesture API (Gesture.Pan(), etc.)
2. Replace `runOnJS` → `scheduleOnRN` from react-native-worklets
3. Replace `runOnUI` → `scheduleOnUI` from react-native-worklets
4. Replace `useWorkletCallback` → `useCallback` with `'worklet';` directive
5. Update `withSpring` parameters if using restDisplacementThreshold/restSpeedThreshold (now energyThreshold)

## Sources

**Official Documentation (HIGH Confidence):**
- [React Native Reanimated - Flip Card Example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/)
- [React Native Reanimated - Entering/Exiting Animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations)
- [React Native Reanimated - Interpolate Function](https://docs.swmansion.com/react-native-reanimated/docs/utilities/interpolate/)
- [React Native Reanimated - Migration from 3.x to 4.x](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/)
- [React Native Reanimated - useFrameCallback](https://docs.swmansion.com/react-native-reanimated/docs/advanced/useFrameCallback/)
- [React Native Gesture Handler - Pan Gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture)
- [HeroUI Native - All Components](https://v3.heroui.com/docs/native/components)
- [HeroUI Native - Bottom Sheet](https://v3.heroui.com/docs/native/components/bottom-sheet)
- [React Native - RefreshControl](https://reactnative.dev/docs/refreshcontrol)
- [React Native - ScrollView](https://reactnative.dev/docs/scrollview)
- [@gorhom/bottom-sheet - Keyboard Handling](https://gorhom.dev/react-native-bottom-sheet/keyboard-handling)

**Community Resources (MEDIUM Confidence):**
- [Creating a 3D Animated Flip Card Component in React Native with Reanimated](https://medium.com/@gm_99/creating-a-3d-animated-flip-card-component-in-react-native-with-reanimated-d67ba35193af)
- [React Native Stack Cards Animation](https://www.animatereactnative.com/post/react-native-stack-cards-animation)
- [How to Create a Tinder-Like Card Stack Using React Native](https://stormotion.io/blog/how-to-create-a-tinder-like-card-stack-using-react-native/)
- [React Native FlatList Snap to Alignment Feature - GeeksforGeeks](https://www.geeksforgeeks.org/javascript/how-to-add-snap-to-alignment-feature-in-flatlist-in-react-native/)
- [React Native Reanimated Carousel - Official Site](https://rn-carousel.dev/)
- [React Native Reanimated Carousel Setup Guide 2025](https://javascript.plainenglish.io/react-native-reanimated-carousel-setup-tips-tricks-2025-developer-guide-ea25b8ae3c3b)
- [Implementing 3D Animations in React Native - LogRocket](https://blog.logrocket.com/implementing-3d-animations-react-native/)

**Libraries (MEDIUM Confidence):**
- [react-native-animated-stopwatch-timer](https://github.com/rgommezz/react-native-animated-stopwatch-timer)
- [react-native-reanimated-chrono](https://github.com/amilmohd155/reanimated-chrono)
- [@docren/react-native-reanimated-timer](https://www.npmjs.com/package/@docren/react-native-reanimated-timer)
