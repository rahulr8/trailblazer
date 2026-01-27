# Phase 2: Navigation & Layout - Research

**Researched:** 2026-01-27
**Domain:** Expo Router v6 tab navigation, modal presentation, custom layouts
**Confidence:** HIGH

## Summary

Phase 2 implements a 3-tab bottom navigation (Home, Your Stash, Your Squad) with shared TopBar component, Parker FAB (bear icon) accessible from every screen, and modal routes for Profile and Parker Chat. The standard approach uses Expo Router's file-based routing with React Navigation v7's Bottom Tabs Navigator, custom tab bar layouts for FAB positioning, and Reanimated 4 for animations.

Expo Router v6 extends React Navigation v7's Bottom Tabs Navigator, providing file-based routing, native iOS blur effects, and modal presentations. For custom layouts with FABs alongside tabs, Expo Router UI components (Tabs, TabList, TabTrigger, TabSlot) enable complete control over tab bar rendering while maintaining navigation state.

Tab switching animations require custom implementation using Reanimated 4 or Material Top Tabs Navigator (repositioned to bottom). Pull-to-refresh uses React Native's built-in RefreshControl. Modal presentations use Expo Router's presentation options (modal, transparentModal, fullScreenModal) with platform-specific animations (iOS slides from bottom, Android slides on top).

**Primary recommendation:** Use Expo Router's custom tab layout components to render Parker FAB alongside standard tabs, implement tab switching animations with Material Top Tabs repositioned to bottom (swipe + slide built-in), use RefreshControl for affirmation rotation, and leverage HeroUI Native's Toast for "Coming Soon" feedback.

## Standard Stack

The established libraries/tools for Expo Router navigation:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Expo Router | 6.0.8 | File-based routing | Official Expo navigation solution, tight integration with React Navigation v7 |
| React Navigation | 7.1.8 | Navigation primitives | Industry standard, powers Expo Router, extensive ecosystem |
| React Native Reanimated | 4.1.1 | UI animations | Best-in-class performance (UI thread), required for New Architecture |
| expo-blur | 15.0.8 | iOS tab bar blur | Native blur effects for glassmorphic tab bars |
| expo-haptics | 15.0.7 | Tactile feedback | Standard for iOS tab interactions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-navigation/material-top-tabs | 7.4.0+ | Swipeable horizontal tabs | When tab swiping is required (can reposition to bottom) |
| @gorhom/bottom-sheet | 5.2.8 | Bottom sheets | Advanced modal interactions (already installed) |
| React Native Gesture Handler | 2.28.0 | Touch gestures | Pan gestures for custom swipe (already installed) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom layout + Material Top Tabs | Pure Bottom Tabs + manual animations | Material Top Tabs gives swipe+slide for free, Bottom Tabs requires custom gesture handling |
| Expo Router modals | Context-based modal state | Expo Router keeps navigation in URLs, better deep linking and state management |
| Custom FAB component | react-native-paper FAB | Custom FAB allows full control over styling/positioning, Paper adds dependency |

**Installation:**
```bash
# Material Top Tabs (if tab swiping needed)
npm install @react-navigation/material-top-tabs react-native-tab-view

# Already installed (verify versions)
npm install expo-router@~6.0.8 react-native-reanimated@~4.1.1 expo-blur@^15.0.8
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── _layout.tsx              # Root layout (existing - auth + providers)
├── (tabs)/                  # Bottom tab navigation
│   ├── _layout.tsx          # Tab bar configuration with Parker FAB
│   ├── index.tsx            # Home screen with TopBar + "+" button
│   ├── stash.tsx            # Your Stash screen with TopBar
│   └── squad.tsx            # Your Squad screen with TopBar + "Add Friend"
├── (modals)/                # Modal screens (existing group)
│   └── profile.tsx          # Profile modal (slide from bottom)
└── chat.tsx                 # Parker Chat (full-screen modal, existing)
components/
├── navigation/              # NEW - Navigation chrome components
│   ├── TopBar.tsx           # Shared header: affirmation, date, avatar
│   └── ParkerFAB.tsx        # Bear icon floating button
└── haptic-tab.tsx           # Existing - Tab button with haptics
```

### Pattern 1: Custom Tab Layout with FAB

**What:** Use Expo Router UI components to render custom tab bar with FAB alongside tabs

**When to use:** Need to position custom UI (FAB, badges, etc.) alongside or overlapping tab bar

**Example:**
```typescript
// app/(tabs)/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/custom-tabs/
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { View, Pressable } from 'react-native';
import { Home, Package, Users } from 'lucide-react-native';
import { ParkerFAB } from '@/components/navigation/ParkerFAB';

export default function TabLayout() {
  return (
    <Tabs>
      <TabSlot />
      <View className="flex-row items-end pb-safe">
        {/* Tab buttons */}
        <View className="flex-1 flex-row bg-background/80">
          <TabTrigger name="index" className="flex-1 items-center py-2">
            {({ isFocused }) => (
              <>
                <Home color={isFocused ? '#007AFF' : '#8E8E93'} size={24} />
                <Text>Home</Text>
              </>
            )}
          </TabTrigger>
          <TabTrigger name="stash" className="flex-1 items-center py-2">
            {/* ... */}
          </TabTrigger>
          <TabTrigger name="squad" className="flex-1 items-center py-2">
            {/* ... */}
          </TabTrigger>
        </View>
        {/* Parker FAB positioned independently */}
        <ParkerFAB />
      </View>
    </Tabs>
  );
}
```

### Pattern 2: Material Top Tabs at Bottom (Swipe + Slide)

**What:** Use Material Top Tabs Navigator with `tabBarPosition="bottom"` for built-in swipe gestures and horizontal slide animations

**When to use:** Tab swiping and horizontal slide animations are required (matches Phase 2 requirements)

**Example:**
```typescript
// app/(tabs)/_layout.tsx
// Source: https://reactnavigation.org/docs/material-top-tab-navigator/
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      swipeEnabled={true}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: 'transparent',
        },
        tabBarIndicatorStyle: { display: 'none' }, // Hide swipe indicator
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Home' }} />
      <MaterialTopTabs.Screen name="stash" options={{ title: 'Your Stash' }} />
      <MaterialTopTabs.Screen name="squad" options={{ title: 'Your Squad' }} />
    </MaterialTopTabs>
  );
}
```

### Pattern 3: TopBar with Pull-to-Refresh

**What:** Shared header component that scrolls away with content and rotates affirmation on pull-to-refresh

**When to use:** All tab screens (Home, Stash, Squad) require consistent header with date, affirmation, avatar

**Example:**
```typescript
// components/navigation/TopBar.tsx
import { View, Text } from 'react-native';
import { Avatar } from 'heroui-native';
import { router } from 'expo-router';

interface TopBarProps {
  affirmation: string;
  avatarUrl: string;
}

export function TopBar({ affirmation, avatarUrl }: TopBarProps) {
  const today = new Date();
  const dateText = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }); // "Jan 27"

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Left: Date */}
      <Text className="text-sm font-semibold text-foreground">{dateText}</Text>

      {/* Center: Affirmation */}
      <Text className="flex-1 text-center text-sm text-foreground-secondary px-4">
        {affirmation}
      </Text>

      {/* Right: Avatar */}
      <Pressable onPress={() => router.push('/(modals)/profile')}>
        <Avatar size="md">
          <Avatar.Image source={{ uri: avatarUrl }} />
          <Avatar.Fallback />
        </Avatar>
      </Pressable>
    </View>
  );
}

// Usage in tab screen with ScrollView + RefreshControl
// Source: https://reactnative.dev/docs/refreshcontrol
import { ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [affirmation, setAffirmation] = useState('Stay curious');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Rotate affirmation (fetch new one)
    setAffirmation(getRandomAffirmation());
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TopBar affirmation={affirmation} avatarUrl={user.avatarUrl} />
      {/* Rest of content */}
    </ScrollView>
  );
}
```

### Pattern 4: Modal Presentations

**What:** Use Expo Router's presentation options for different modal behaviors

**When to use:** Profile (bottom modal), Parker Chat (full-screen modal)

**Example:**
```typescript
// app/_layout.tsx (existing - verify configuration)
// Source: https://docs.expo.dev/router/advanced/modals/
<Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen
    name="(modals)/profile"
    options={{
      presentation: 'modal', // Slides from bottom on iOS
      animation: 'slide_from_bottom',
    }}
  />
  <Stack.Screen
    name="chat"
    options={{
      presentation: 'fullScreenModal', // Full-screen modal
      animation: 'slide_from_bottom',
    }}
  />
</Stack>
```

### Pattern 5: Parker FAB Positioning

**What:** Absolutely positioned FAB in bottom-right corner, independent of tab bar

**When to use:** FAB must appear on all tab screens

**Example:**
```typescript
// components/navigation/ParkerFAB.tsx
import { Pressable, View } from 'react-native';
import { PawPrint } from 'lucide-react-native'; // Bear paw icon
import { router } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

export function ParkerFAB() {
  const scale = useSharedValue(0);

  useEffect(() => {
    // Entrance animation: scale from 0 to 1
    scale.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute bottom-20 right-4"
    >
      <Pressable
        onPress={() => router.push('/chat')}
        className="bg-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <PawPrint color="white" size={28} />
      </Pressable>
    </Animated.View>
  );
}
```

### Pattern 6: HeroUI Native Toast for Feedback

**What:** Use HeroUI's built-in Toast for "Coming Soon" messages

**When to use:** Stub buttons (Home "+", Squad "Add Friend")

**Example:**
```typescript
// Source: https://github.com/heroui-inc/heroui-native/blob/beta/src/components/toast/toast.md
import { useToast } from 'heroui-native';

export default function HomeScreen() {
  const { toast } = useToast();

  const handleAddActivity = () => {
    toast.show({
      variant: 'default',
      label: 'Coming Soon',
      description: 'Activity logging will be available soon!',
      placement: 'top',
    });
  };

  return (
    <View>
      <TopBar />
      {/* Inline "+" button */}
      <Pressable onPress={handleAddActivity} className="...">
        <Plus size={24} />
      </Pressable>
    </View>
  );
}
```

### Anti-Patterns to Avoid

- **Don't use Bottom Tabs with custom gesture handlers for swiping** - Material Top Tabs (repositioned) gives swipe+slide for free with better performance
- **Don't implement tab state in React context** - Use Expo Router's navigation state (URL-based)
- **Don't make TopBar sticky** - Requirements specify it scrolls away with content
- **Don't nest TabBar in ScrollView** - Position tab bar and FAB absolutely outside scrollable content
- **Don't use `router.push()` for modal dismissal** - Use `router.back()` to maintain proper navigation stack

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab swiping with horizontal slide | Custom PanGestureHandler + Animated.View translateX | Material Top Tabs Navigator with `tabBarPosition="bottom"` | Built-in swipe velocity handling, spring physics, edge bounce, gesture cancellation—100+ lines of gesture logic |
| Pull-to-refresh | Custom PanGestureHandler + loading state | React Native's `<RefreshControl>` | Native iOS/Android refresh behavior, proper loading spinners, scroll integration, haptics |
| Modal slide-from-bottom | Custom Reanimated modal + backdrop | Expo Router `presentation: 'modal'` | Platform-specific animations (iOS slide, Android fade), native gestures (swipe-to-dismiss), back button handling |
| Tab bar blur (iOS) | Custom ImageBackground + opacity | `expo-blur` BlurView | Native iOS blur (gaussian, light/dark tint), dynamic blur based on content, accessibility |
| Toast notifications | Custom Animated.View + timeout | HeroUI Native Toast | Stacking (multiple toasts), swipe-to-dismiss with rubber effect, keyboard avoidance, accessibility announcements |
| Haptic feedback | Manual `Haptics.impactAsync()` in every button | HapticTab wrapper (existing) | Consistent timing, platform detection, graceful degradation on Android |

**Key insight:** Navigation and gestures are 90% edge cases. Stock solutions handle:
- Simultaneous gestures (scroll + swipe)
- Interrupted animations (user taps during transition)
- Accessibility (VoiceOver announcements)
- Platform differences (iOS vs Android back button)
- Safe area insets (notches, home indicator)

Custom implementations miss these until production bugs surface.

## Common Pitfalls

### Pitfall 1: Forgetting Android Perspective for 3D Transforms

**What goes wrong:** Reanimated card flip or 3D rotation animations work on iOS but render flat on Android

**Why it happens:** Android requires explicit `perspective` in transform array for 3D effects (rotateX, rotateY, rotateZ)

**How to avoid:** Always add `{ perspective: 1000 }` as FIRST item in transform array when using 3D transforms

**Warning signs:**
- Animation works in iOS simulator but not Android emulator
- Elements appear to scale instead of rotate in 3D space

**Source:** Project STATE.md (prior decision from Phase 1), confirmed by [React Native transform documentation](https://reactnative.dev/docs/animations)

**Example:**
```typescript
// BAD (works iOS, broken Android)
transform: [{ rotateY: rotateY.value + 'deg' }]

// GOOD (works both platforms)
transform: [{ perspective: 1000 }, { rotateY: rotateY.value + 'deg' }]
```

### Pitfall 2: Tab Navigation State Loss with Custom Layouts

**What goes wrong:** Using custom tab bar rendering without TabList causes navigation state to break—tabs don't switch or lose active state

**Why it happens:** Expo Router's TabTrigger components must exist in the component tree (even if hidden) to maintain navigation state

**How to avoid:** Always render a TabList (can be hidden with `display: 'none'`) when using custom tab bar layouts

**Warning signs:**
- Tab switching stops working after custom layout implementation
- `isFocused` prop always returns false
- Navigation state resets on re-render

**Source:** [Expo Router custom tabs documentation](https://docs.expo.dev/router/advanced/custom-tabs/)

**Example:**
```typescript
// BAD - Navigation breaks
<Tabs>
  <TabSlot />
  <CustomTabBar /> {/* No TabList = broken state */}
</Tabs>

// GOOD - Navigation works
<Tabs>
  <TabSlot />
  <TabList style={{ display: 'none' }}>
    <TabTrigger name="index" />
    <TabTrigger name="stash" />
  </TabList>
  <CustomTabBar /> {/* TabList maintains state */}
</Tabs>
```

### Pitfall 3: RefreshControl Stops Immediately Without State Management

**What goes wrong:** Pull-to-refresh spinner appears for a split second then disappears, even during async operations

**Why it happens:** `refreshing` prop is controlled—must be explicitly managed in state. If not set to `true` in `onRefresh`, indicator stops immediately

**How to avoid:**
1. Create `refreshing` state (useState)
2. Set to `true` at start of `onRefresh`
3. Set to `false` after async operation completes
4. Use try/finally to ensure `false` even on errors

**Warning signs:**
- Pull gesture works but spinner disappears instantly
- "It worked once but now it doesn't refresh"
- Refresh doesn't wait for data fetch

**Source:** [React Native RefreshControl documentation](https://reactnative.dev/docs/refreshcontrol)

**Example:**
```typescript
// BAD - Spinner disappears instantly
const onRefresh = async () => {
  await fetchNewData(); // refreshing never set to true
};
<RefreshControl refreshing={false} onRefresh={onRefresh} />

// GOOD - Spinner shows until complete
const [refreshing, setRefreshing] = useState(false);
const onRefresh = async () => {
  setRefreshing(true);
  try {
    await fetchNewData();
  } finally {
    setRefreshing(false); // Always reset, even on error
  }
};
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
```

### Pitfall 4: Modal Dismissal Creates Navigation Stack Bloat

**What goes wrong:** Using `router.push()` or `router.replace()` to dismiss modals creates navigation stack issues—back button behaves incorrectly

**Why it happens:** Modals are designed to be dismissed with `router.back()`, not navigated away from

**How to avoid:** Always use `router.back()` to dismiss modals, or rely on native gestures (swipe-down on iOS)

**Warning signs:**
- Back button requires multiple taps to reach home screen
- Modal reopens when navigating back
- Navigation stack grows unexpectedly

**Source:** [Expo Router modals documentation](https://docs.expo.dev/router/advanced/modals/)

**Example:**
```typescript
// BAD - Creates navigation stack issues
<Button onPress={() => router.push('/(tabs)')}>Close</Button>

// GOOD - Properly dismisses modal
<Button onPress={() => router.back()}>Close</Button>
```

### Pitfall 5: Lazy Loading Disabled on Bottom Tabs Hurts Performance

**What goes wrong:** All tab screens render immediately on app launch, causing slow startup and high memory usage

**Why it happens:** Bottom Tabs default to lazy rendering, but custom configurations can accidentally disable it

**How to avoid:**
- Don't set `lazy: false` in tab navigator options
- Use `lazy: true` (default) for better performance
- For Material Top Tabs, enable `lazy` explicitly and set `lazyPreloadDistance: 0`

**Warning signs:**
- Slow initial app load
- All tab screens log mount effects on startup
- High memory usage even when only one tab visited

**Source:** [React Navigation performance best practices](https://reactnavigation.org/docs/tab-view/)

**Example:**
```typescript
// BAD - All tabs render immediately
<MaterialTopTabs screenOptions={{ lazy: false }}>

// GOOD - Tabs render on first visit
<MaterialTopTabs screenOptions={{ lazy: true, lazyPreloadDistance: 0 }}>
```

### Pitfall 6: Missing Safe Area Insets on Custom Tab Bars

**What goes wrong:** Custom tab bar overlaps with iPhone home indicator or Android navigation buttons

**Why it happens:** Custom layouts bypass React Navigation's automatic safe area handling

**How to avoid:** Use `useSafeAreaInsets()` hook and add bottom padding to custom tab bar

**Warning signs:**
- Tab bar overlaps home indicator on iPhone
- Buttons hard to tap on devices with gesture navigation
- Layout looks correct in simulator but wrong on physical device

**Source:** React Native Safe Area Context (already installed)

**Example:**
```typescript
// BAD - Overlaps home indicator
<View className="flex-row bg-background pb-2">

// GOOD - Respects safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: insets.bottom }} className="flex-row bg-background">
  );
}
```

## Code Examples

Verified patterns from official sources:

### Complete Custom Tab Layout with Parker FAB
```typescript
// app/(tabs)/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/custom-tabs/
import { Tabs, TabSlot, TabList, TabTrigger } from 'expo-router/ui';
import { View, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Package, Users, PawPrint } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />

      {/* Hidden TabList maintains navigation state */}
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="index" />
        <TabTrigger name="stash" />
        <TabTrigger name="squad" />
      </TabList>

      {/* Custom tab bar with blur background */}
      <View style={{ paddingBottom: insets.bottom }}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={isDark ? 80 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
        <View className="flex-row items-center px-4 py-2 bg-background/80">
          <TabTrigger name="index">
            {({ isFocused }) => (
              <View className="flex-1 items-center py-2">
                <Home
                  size={24}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text className="text-xs mt-1">Home</Text>
              </View>
            )}
          </TabTrigger>

          <TabTrigger name="stash">
            {({ isFocused }) => (
              <View className="flex-1 items-center py-2">
                <Package
                  size={24}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text className="text-xs mt-1">Your Stash</Text>
              </View>
            )}
          </TabTrigger>

          <TabTrigger name="squad">
            {({ isFocused }) => (
              <View className="flex-1 items-center py-2">
                <Users
                  size={24}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                <Text className="text-xs mt-1">Your Squad</Text>
              </View>
            )}
          </TabTrigger>

          {/* Parker FAB - docked in bottom-right */}
          <Pressable
            onPress={() => router.push('/chat')}
            className="ml-2 bg-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
          >
            <PawPrint color="white" size={28} />
          </Pressable>
        </View>
      </View>
    </Tabs>
  );
}
```

### TopBar with Pull-to-Refresh Affirmation Rotation
```typescript
// components/navigation/TopBar.tsx
import { View, Text, Pressable } from 'react-native';
import { Avatar } from 'heroui-native';
import { router } from 'expo-router';

const AFFIRMATIONS = [
  'Stay curious',
  'Explore more',
  'Adventure awaits',
  'Nature is calling',
  'Find your trail',
];

interface TopBarProps {
  onRefresh?: () => void;
}

export function TopBar({ onRefresh }: TopBarProps) {
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  // Format date as "MMM DD"
  const today = new Date();
  const dateText = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const rotateAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
    onRefresh?.();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-background">
      {/* Left: Date */}
      <Text className="text-sm font-semibold text-foreground w-16">
        {dateText}
      </Text>

      {/* Center: Daily Affirmation */}
      <Text className="flex-1 text-center text-sm text-foreground-secondary px-4">
        {AFFIRMATIONS[affirmationIndex]}
      </Text>

      {/* Right: Profile Avatar */}
      <Pressable onPress={() => router.push('/(modals)/profile')}>
        <Avatar size="md">
          <Avatar.Image source={{ uri: 'https://pravatar.cc/150?img=1' }} />
          <Avatar.Fallback />
        </Avatar>
      </Pressable>
    </View>
  );
}

// Usage in tab screen
// Source: https://reactnative.dev/docs/refreshcontrol
import { ScrollView, RefreshControl } from 'react-native';
import { TopBar } from '@/components/navigation/TopBar';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const topBarRef = useRef<{ rotateAffirmation: () => void }>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger affirmation rotation
    topBarRef.current?.rotateAffirmation();
    // Could also fetch fresh data here
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <TopBar ref={topBarRef} />
      {/* Rest of screen content */}
    </ScrollView>
  );
}
```

### Material Top Tabs at Bottom (Alternative with Built-in Swipe)
```typescript
// app/(tabs)/_layout.tsx (alternative approach)
// Source: https://reactnavigation.org/docs/material-top-tab-navigator/
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      swipeEnabled={true}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: 'transparent',
          height: 64,
        },
        tabBarIndicatorStyle: { display: 'none' },
        lazy: true,
        lazyPreloadDistance: 0,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="stash"
        options={{
          title: 'Your Stash',
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="squad"
        options={{
          title: 'Your Squad',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </MaterialTopTabs>
  );
}
```

### "Coming Soon" Toast
```typescript
// Usage in Home screen (inline "+" button)
// Source: https://github.com/heroui-inc/heroui-native/blob/beta/src/components/toast/toast.md
import { useToast } from 'heroui-native';
import { Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const { toast } = useToast();

  const handleAddActivity = () => {
    toast.show({
      variant: 'default',
      label: 'Coming Soon',
      description: 'Activity logging will be available in a future update!',
      placement: 'top',
    });
  };

  return (
    <View>
      <TopBar />
      <Pressable
        onPress={handleAddActivity}
        className="mx-4 mt-4 flex-row items-center justify-center bg-accent/10 py-3 rounded-lg"
      >
        <Plus size={20} color={colors.accent} />
        <Text className="ml-2 text-accent font-semibold">Add Activity</Text>
      </Pressable>
    </View>
  );
}

// Usage in Squad screen (header button)
export default function SquadScreen() {
  const { toast } = useToast();

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TopBar />
        <Pressable
          onPress={() => toast.show('Coming Soon')}
          className="ml-2"
        >
          <Text className="text-accent font-semibold">Add Friend</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation v5 createBottomTabNavigator | Expo Router v6 file-based tabs | Expo Router v6 (late 2024) | File-based routing, better TypeScript, automatic deep linking |
| Custom modal state (context/Redux) | Expo Router presentation options | Expo Router v3+ | Navigation state in URLs, simpler mental model, better web support |
| Animated API from React Native | Reanimated 3/4 | Reanimated 3 (2022), Reanimated 4 (2024) | UI thread animations, 120fps support, New Architecture required for v4 |
| Manual tab bar rendering | Expo Router UI components (Tabs, TabSlot) | Expo Router v6 | Unstyled primitives for custom layouts while maintaining state |
| react-native-tab-view | Material Top Tabs Navigator v7 | React Navigation v7 (2024) | Better gesture handling, improved performance, unified API |

**Deprecated/outdated:**
- **createBottomTabNavigator from @react-navigation/bottom-tabs in Expo Router context**: Use Expo Router's file-based `(tabs)` directory instead
- **Animated API for complex animations**: Use Reanimated for better performance and New Architecture support
- **Manual safe area handling with `SafeAreaView`**: Use `useSafeAreaInsets()` hook from react-native-safe-area-context for finer control
- **Standalone toast libraries (react-native-toast-message)**: HeroUI Native includes built-in Toast with Reanimated animations

## Open Questions

Things that couldn't be fully resolved:

1. **Tab Switching Animation Approach: Custom Layout + Reanimated vs Material Top Tabs**
   - What we know: Material Top Tabs gives swipe+slide for free, but custom layout with Reanimated offers more control over animation style
   - What's unclear: Whether Material Top Tabs can be combined with custom tab bar rendering (for Parker FAB positioning)
   - Recommendation: Start with Material Top Tabs at bottom (simpler, swipe+slide built-in), then add custom layout if FAB positioning conflicts

2. **Parker FAB Positioning Relative to Tab Bar**
   - What we know: FAB should be "docked in bottom-right corner of the screen" independent of tab bar
   - What's unclear: Should FAB be inside custom tab bar container (easier layout) or absolutely positioned over entire screen (truly independent)?
   - Recommendation: Include FAB in custom tab bar container (same View) for easier safe area handling, but positioned with flexbox (not absolute) so it moves with tab bar

3. **Affirmation Data Source**
   - What we know: Affirmations rotate on pull-to-refresh, not static per day
   - What's unclear: Should affirmations come from mock data (Phase 1) or be hardcoded in TopBar component?
   - Recommendation: Hardcode array of affirmations in TopBar component for Phase 2 (navigation focus), move to mock data in later phase if needed

4. **Home "+" Button Inline Placement**
   - What we know: Button should be "inline in content" (not floating), Claude picks placement based on Home screen layout
   - What's unclear: Home screen content layout not defined in Phase 2 requirements
   - Recommendation: Place "+" button as first item in Home screen content (below TopBar), will adjust in Phase 3 when actual Home content is designed

## Sources

### Primary (HIGH confidence)
- [Expo Router Tabs Documentation](https://docs.expo.dev/router/advanced/tabs/) - Tab navigation configuration, styling options
- [Expo Router Custom Tabs](https://docs.expo.dev/router/advanced/custom-tabs/) - Tabs, TabSlot, TabTrigger components for custom layouts
- [Expo Router Modals](https://docs.expo.dev/router/advanced/modals/) - Modal presentation options (modal, transparentModal, fullScreenModal)
- [React Navigation Material Top Tabs](https://reactnavigation.org/docs/material-top-tab-navigator/) - swipeEnabled, tabBarPosition, lazy loading
- [React Native RefreshControl](https://reactnative.dev/docs/refreshcontrol) - Pull-to-refresh implementation
- [HeroUI Native Toast Documentation](https://github.com/heroui-inc/heroui-native/blob/beta/src/components/toast/toast.md) - Toast API, variants, placement
- [HeroUI Native Avatar Documentation](https://github.com/heroui-inc/heroui-native/blob/beta/src/components/avatar/avatar.md) - Avatar sizes (sm, md, lg), variants
- [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native) - Icon library with PawPrint (bear paw), Home, Package, Users icons

### Secondary (MEDIUM confidence)
- [Expo Router v6 Announcement](https://expo.dev/blog/expo-router-v6) - New features, React Navigation v7 integration
- [React Navigation Bottom Tabs](https://reactnavigation.org/docs/bottom-tab-navigator/) - Tab bar styling, lazy loading defaults
- [React Navigation Shared Element Transitions](https://reactnavigation.org/docs/shared-element-transitions/) - Limitations (native stack only, no tabs)
- [Lucide Icons Search - Paw Print](https://lucide.dev/icons/paw-print) - Confirmed paw-print icon for Parker FAB

### Tertiary (LOW confidence)
- [Building Glassmorphic Tab Bar Tutorial (Medium, Jan 2026)](https://medium.com/@shreechandra2378/tutorial-building-a-stunning-glassmorphic-tab-bar-in-react-native-75a15d87a975) - Custom tab bar patterns
- [Custom Tab Bar with FAB (Medium)](https://medium.com/litslink/reactnative-curved-tabbar-dc62e681c24d) - FAB positioning alongside tabs
- [React Navigation Performance Best Practices](https://viewlytics.ai/blog/react-navigation-best-practices-guide) - Lazy loading, performance optimization

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json, official documentation confirmed
- Architecture: HIGH - Patterns from official Expo Router and React Navigation docs
- Pitfalls: HIGH - Perspective issue from project STATE.md, RefreshControl and modal patterns from official docs
- Tab switching animations: MEDIUM - Material Top Tabs approach well-documented, custom Reanimated approach requires implementation testing
- Parker FAB positioning: MEDIUM - Multiple valid approaches (custom layout vs absolute positioning), recommendation based on flexibility and maintainability

**Research date:** 2026-01-27
**Valid until:** ~30 days (Expo Router and React Navigation are stable, Reanimated 4 updates may introduce new patterns)
