# Phase 6: Onboarding Flow - Research

**Researched:** 2026-02-06
**Domain:** React Native onboarding flow with FlatList pager, AsyncStorage persistence, HealthKit permissions, push notifications
**Confidence:** HIGH

## Summary

Phase 6 implements a guided welcome flow for new users consisting of 2 welcome screens, login, and 2 permission screens (Health API and Push Notifications). The flow uses AsyncStorage flags to track completion, preventing repeated onboarding for returning users. Implementation leverages existing auth components (OnboardingScreen, LoginScreen, PermissionsScreen) already built and integrated into `app/_layout.tsx`.

The standard approach uses React Native FlatList with `horizontal` and `pagingEnabled` props for the welcome pager, `onViewableItemsChanged` for dot indicator synchronization, Animated.loop() for continuous logo rotation, Alert.alert() for confirmation dialogs, expo-web-browser for Terms & Conditions, @kingstinct/react-native-healthkit for HealthKit permissions (already installed), and expo-notifications for push notification permissions (requires installation).

Critical discovery: The onboarding flow is **already fully implemented** as of Feb 5, 2026. The components exist in `components/auth/`, the routing logic is in `app/_layout.tsx`, and AsyncStorage keys are documented. The implementation uses the callback pattern with `onComplete` props to trigger flag setting and navigation, uses fade animations to prevent clipping, and renders auth screens outside the Stack navigator to avoid Card component bugs.

**Primary recommendation:** Enhance existing implementation by adding skip button to welcome screens, implementing health permission decline warning dialog, adding push notification permission screen (currently only health), implementing continuous rotation animation for RotatingLogo, and adding Terms & Conditions clickable link on login screen.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Welcome pager interaction:**
- Skip button in top-right corner allows users to bypass welcome screens and jump to login
- Pagination dots at bottom show progress through welcome screens (2 dots: filled for current, outlined for next)
- Rotating TB+ Logo has continuous slow rotation animation (compass-like effect)

**Permission screen behavior:**
- Health API permission decline triggers warning dialog emphasizing missing benefit: "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?"
- Push notification permission decline proceeds directly to main app without warning
- Users can revisit and grant permissions later via Profile settings screen (Data Sync toggles)
- Warning dialog on health permission decline asks user to confirm before continuing

**Flow routing logic:**
- First launch: Welcome Screen 1 → Welcome Screen 2 → Login → Health Permission → Push Permission → Main App
- Returning users (authenticated + onboarding complete): Skip directly to main app tabs
- Partial completion: If user completes login but exits during permission screens, resume at permission screens on next launch
- Terms & Conditions link on login screen opens in-app web view modal (user stays in app)

**Visual presentation:**
- Between-screen transitions: Fade animations (not slide) to prevent content clipping during Stack navigation transitions (documented in memory)
- Welcome pager internal navigation: Horizontal slide transitions (typical pager pattern)
- Messaging tone: Match exact copy from wireframes - "Get rewarded for time in nature", "Where does the money go?", "Join Trailblazer+"
- Theme handling: Respect app/device theme setting - onboarding adapts to light/dark mode automatically

### Claude's Discretion

- Whether to support swipe gestures in addition to arrow button navigation (RECOMMENDED: Keep existing swipe support via FlatList)
- Specific AsyncStorage key naming (USE: Existing documented keys `@trailblazer_onboarding_seen`, `@trailblazer_permissions_complete`)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

The established libraries/tools for onboarding flows:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Native FlatList | Built-in | Horizontal pager | Native component, high performance, built-in pagination and scroll tracking |
| @react-native-async-storage/async-storage | 2.2.0 | Onboarding flag persistence | Already installed, standard for lightweight persistence |
| @kingstinct/react-native-healthkit | 13.1.0 | Apple HealthKit permissions | Already installed, New Architecture support (Nitro Modules) |
| expo-web-browser | 15.0.7 | In-app browser for T&C | Already installed, maintains in-app experience |
| React Native Animated API | Built-in | Logo rotation animation | Native, high performance, simpler than Reanimated for basic rotation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | ~0.29.14 | Push notification permissions | Install for permission request UI |
| React Native Alert.alert | Built-in | Warning dialog on permission decline | Native confirmation dialog |
| react-native-safe-area-context | 5.2.0+ | Safe area insets | Already installed, handles notch/home indicator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| FlatList pagination | react-native-pager-view | FlatList simpler, already familiar, no extra dependency |
| Alert.alert | Custom modal component | Alert.alert is native, works out of the box, follows platform conventions |
| Animated API | React Native Reanimated | Animated API sufficient for simple rotation, Reanimated adds complexity |
| AsyncStorage | expo-secure-store | AsyncStorage fine for non-sensitive flags, SecureStore adds overhead |

**Installation:**
```bash
# Only missing piece - push notifications
npx expo install expo-notifications

# Everything else already installed
# Verify: @kingstinct/react-native-healthkit, expo-web-browser, @react-native-async-storage/async-storage
```

## Architecture Patterns

### Current Implementation Structure (Already Exists)
```
app/
├── _layout.tsx                  # Root layout with onboarding routing logic
components/
└── auth/                        # Auth-related components
    ├── OnboardingScreen.tsx     # 2-page welcome pager (EXISTS)
    ├── LoginScreen.tsx          # Join + auth modal (EXISTS)
    ├── PermissionsScreen.tsx    # Health permission (EXISTS)
    └── CLAUDE.md                # Component documentation
```

### Pattern 1: FlatList Horizontal Pager with Pagination Dots

**What:** Use FlatList with `horizontal` and `pagingEnabled` for swipeable welcome screens, track visible item with `onViewableItemsChanged` to sync pagination dots

**When to use:** Multi-screen onboarding with swipe support and visual progress indicator

**Example:**
```typescript
// Source: https://gabrielprojects.medium.com/creating-a-viewpager-using-flatlist-8107cfbfdd14
import { FlatList, ViewToken } from 'react-native';

const [currentIndex, setCurrentIndex] = useState(0);
const flatListRef = useRef<FlatList>(null);

const onViewableItemsChanged = useCallback(
  ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  },
  []
);

const viewabilityConfig = useRef({
  viewAreaCoveragePercentThreshold: 50
}).current;

<FlatList
  ref={flatListRef}
  data={pages}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onViewableItemsChanged={onViewableItemsChanged}
  viewabilityConfig={viewabilityConfig}
  renderItem={({ item }) => <PageView {...item} />}
/>

{/* Pagination dots */}
<View style={styles.dots}>
  {pages.map((page, index) => (
    <View
      key={page.id}
      style={[
        styles.dot,
        { opacity: index === currentIndex ? 1 : 0.4 }
      ]}
    />
  ))}
</View>
```

**Note:** Current implementation in `OnboardingScreen.tsx` already uses this pattern correctly.

### Pattern 2: Continuous Rotation Animation with Animated.loop()

**What:** Use Animated.loop() with Animated.timing() to create infinite rotation animation

**When to use:** Continuous animations like spinning logos, loading indicators, compass effects

**Example:**
```typescript
// Source: https://reactnative.dev/docs/animations
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const rotateValue = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(rotateValue, {
      toValue: 1,
      duration: 3000, // 3 seconds per rotation
      useNativeDriver: true, // CRITICAL: Use native driver for performance
    })
  ).start();
}, []);

const rotate = rotateValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

return (
  <Animated.Image
    source={logoSource}
    style={[styles.logo, { transform: [{ rotate }] }]}
  />
);
```

**Note:** Current `RotatingLogo.tsx` does NOT animate - it's static. Need to add rotation animation.

### Pattern 3: Alert.alert Warning Dialog on Permission Decline

**What:** Use React Native's Alert.alert() to show native confirmation dialog when user declines important permissions

**When to use:** Critical permission declines that should give user a chance to reconsider

**Example:**
```typescript
// Source: https://reactnative.dev/docs/alert
import { Alert } from 'react-native';

const handleDecline = () => {
  Alert.alert(
    "Missing Out",
    "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?",
    [
      {
        text: "Go Back",
        style: "cancel",
        onPress: () => {}, // Do nothing, stay on screen
      },
      {
        text: "Continue Anyway",
        style: "destructive", // Red text on iOS
        onPress: () => proceedWithoutPermission(),
      },
    ],
    { cancelable: false } // Prevent dismissing by tapping outside
  );
};
```

**Best practices:**
- Use action-oriented button labels ("Go Back" not "Cancel")
- Put destructive action on right (iOS convention)
- Use `style: "destructive"` for warning actions
- Keep message clear and focused on impact

### Pattern 4: AsyncStorage Onboarding Flags

**What:** Store completion flags in AsyncStorage to track onboarding progress and prevent repeated flows

**When to use:** Multi-step onboarding flows where users should only see onboarding once

**Example:**
```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@trailblazer_onboarding_seen';
const PERMISSIONS_KEY = '@trailblazer_permissions_complete';

// Load flags on app start
const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
const [hasCompletedPermissions, setHasCompletedPermissions] = useState(false);

useEffect(() => {
  async function loadFlags() {
    const [onboarding, permissions] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(PERMISSIONS_KEY),
    ]);
    setHasSeenOnboarding(onboarding === 'true');
    setHasCompletedPermissions(permissions === 'true');
  }
  loadFlags();
}, []);

// Set flag when onboarding completes
const handleOnboardingComplete = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  setHasSeenOnboarding(true);
};

// Clear flags on sign out (for testing or user privacy)
const handleSignOut = async () => {
  await AsyncStorage.multiRemove([ONBOARDING_KEY, PERMISSIONS_KEY]);
};
```

**Note:** Current implementation in `app/_layout.tsx` already uses this pattern correctly with proper flag clearing on sign out.

### Pattern 5: expo-notifications Permission Request

**What:** Request push notification permissions using expo-notifications with proper permission checking

**When to use:** Apps that send push notifications (local or remote)

**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
import * as Notifications from 'expo-notifications';

async function requestNotificationPermission(): Promise<boolean> {
  // Check existing permissions first
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === 'granted';
}

// Usage in permission screen
const handleAcceptNotifications = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    console.log('Notifications enabled');
  }
  // Proceed regardless of result (no warning dialog)
  await finishPermissions();
};
```

**Important:** iOS requires requesting permissions before sending any notifications. Once denied, user must manually enable in Settings.

### Pattern 6: expo-web-browser for Terms & Conditions

**What:** Open Terms & Conditions in in-app browser modal using expo-web-browser

**When to use:** Legal links (privacy policy, terms of service) that should stay in-app

**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/webbrowser/
import * as WebBrowser from 'expo-web-browser';

const handleTermsPress = async () => {
  await WebBrowser.openBrowserAsync('https://trailblazer.com/terms', {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
  });
};

// In JSX - make text tappable
<Pressable onPress={handleTermsPress}>
  <Text style={styles.termsText}>Terms & Conditions Apply</Text>
</Pressable>
```

**Note:** Component `ExternalLink.tsx` already exists and wraps this pattern. Can reuse or inline for simpler cases.

### Anti-Patterns to Avoid

- **Don't navigate from within screens after auth changes** - Let `_layout.tsx` handle routing based on flags (documented in memory and CLAUDE.md)
- **Don't use slide animations for onboarding screens** - Use fade to prevent content clipping (documented in memory)
- **Don't show warning dialog for notification permission decline** - Only show for health permission (per user decisions)
- **Don't use external browser for Terms & Conditions** - Use in-app browser to keep user in app flow
- **Don't make rotation animation CPU-bound** - Always use `useNativeDriver: true` for transform animations
- **Don't forget to clear AsyncStorage flags on sign out** - Prevents state corruption when different users use same device

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Push notification permissions | Custom permission UI | expo-notifications | Handles platform differences (iOS vs Android), proper async/await patterns, checks existing permissions |
| In-app browser | WebView component | expo-web-browser | Handles Safe Area automatically, proper dismiss gestures, native browser UI |
| Horizontal paging | Custom ScrollView + pan gestures | FlatList with pagingEnabled | Built-in snap behavior, scroll indicators, performance optimizations |
| Confirmation dialogs | Custom modal component | Alert.alert() | Native platform dialogs, follows OS conventions, accessibility built-in |
| Safe area handling | Manual padding calculations | useSafeAreaInsets hook | Handles notch/island/home indicator automatically, updates on orientation change |

**Key insight:** React Native and Expo provide mature, well-tested components for common onboarding patterns. Custom solutions introduce bugs (wrong safe areas, janky scrolling, non-native dialogs) and maintenance burden.

## Common Pitfalls

### Pitfall 1: onViewableItemsChanged Not Firing with scrollEnabled={false}

**What goes wrong:** When FlatList has `scrollEnabled={false}` (to disable manual scrolling), `onViewableItemsChanged` doesn't fire when programmatically scrolling via `scrollToIndex()`

**Why it happens:** React Native optimization - viewability tracking disabled when user scrolling disabled

**How to avoid:** Either keep `scrollEnabled={true}` (recommended) or manually call `setCurrentIndex()` after `scrollToIndex()` calls

**Warning signs:** Pagination dots don't update when using arrow buttons to navigate

**Note:** Documented in memory - "FlatList with scrollEnabled={false}: onViewableItemsChanged does NOT fire". Current implementation correctly keeps `scrollEnabled={true}` (implicitly via no override).

### Pitfall 2: Navigation State vs. Screen Definition Mismatch

**What goes wrong:** Changing which screens are defined in Stack/Tab navigators based on auth state doesn't automatically navigate user to valid screen

**Why it happens:** Expo Router maintains navigation state separately from conditional rendering

**How to avoid:** Always use explicit `router.replace()` after auth/onboarding changes. Example:
```typescript
// DON'T: Just change rendering
if (!hasSeenOnboarding) {
  return <OnboardingScreen onComplete={handleComplete} />;
}
// User stays on onboarding screen even after handleComplete runs

// DO: Use callback + explicit navigation
const handleComplete = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  setHasSeenOnboarding(true);
  // Screen will re-render with new routing
};
```

**Warning signs:** User "stuck" on screen after completing action, back button behavior unexpected

**Note:** Current implementation correctly uses callback pattern - setting state triggers re-render with different screen definitions.

### Pitfall 3: HealthKit Authorization Can Be Lost

**What goes wrong:** User granted HealthKit permissions, but on next app launch, authorization is "not determined"

**Why it happens:** iOS can revoke HealthKit authorization if user changes Settings, app is reinstalled, or permission expires

**How to avoid:** Always call `ensureHealthKitAuthorized()` before operations (not just on initial connect). From `lib/health/CLAUDE.md`:

```typescript
// Before every sync
await ensureHealthKitAuthorized();
await syncWorkouts();

// This re-requests authorization if needed and handles "not determined" errors
```

**Warning signs:** "Authorization not determined" errors in logs, sync fails after previously working

**Note:** Already handled in existing `lib/health/` module - permission screen should just call `requestAuthorization()` once.

### Pitfall 4: Animation Not Using Native Driver

**What goes wrong:** Rotation animation janky/stuttery, drops frames during scrolling or other interactions

**Why it happens:** Without `useNativeDriver: true`, animations run on JS thread which can be blocked by React re-renders

**How to avoid:** Always add `useNativeDriver: true` to Animated.timing/spring calls for transform/opacity animations:

```typescript
Animated.timing(value, {
  toValue: 1,
  duration: 1000,
  useNativeDriver: true, // CRITICAL
})
```

**Warning signs:** Animation stutters when user interacts with UI, 60fps not maintained

**Note:** Only works for transform and opacity - layout properties (width, height, margin) can't use native driver.

### Pitfall 5: Terms Link Not Tappable

**What goes wrong:** User tries to tap "Terms & Conditions Apply" text but nothing happens

**Why it happens:** Text component not wrapped in Pressable, or hit area too small

**How to avoid:** Wrap Text in Pressable and increase hit area:

```typescript
<Pressable
  onPress={handleTermsPress}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Text style={[styles.terms, { color: colors.primary }]}>
    Terms & Conditions Apply
  </Text>
</Pressable>
```

**Warning signs:** Users report link "doesn't work", hard to tap on small screens

## Code Examples

Verified patterns from official sources and existing codebase:

### FlatList Horizontal Pager (Current Implementation)

```typescript
// Source: components/auth/OnboardingScreen.tsx (existing)
const PAGES = [
  {
    id: 'welcome-1',
    title: 'Get rewarded for\ntime in nature.',
    body: 'Trailblazer+ turns time spent in nature into progress...',
  },
  // ...
];

<FlatList
  ref={flatListRef}
  data={PAGES}
  renderItem={renderPage}
  keyExtractor={(item) => item.id}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onViewableItemsChanged={onViewableItemsChanged}
  viewabilityConfig={viewabilityConfig}
  bounces={false}
/>
```

### Skip Button (To Add)

```typescript
// Add to OnboardingScreen.tsx header
<View style={styles.header}>
  <Pressable
    onPress={onComplete}
    hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
  >
    <Text style={[styles.skipText, { color: colors.textSecondary }]}>
      Skip
    </Text>
  </Pressable>
</View>

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: insets.top + Spacing.lg,
    paddingRight: Spacing['2xl'],
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Continuous Rotation Animation (To Add to RotatingLogo)

```typescript
// Update components/onboarding/RotatingLogo.tsx
import { useRef, useEffect } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

export function RotatingLogo({ size = 80 }: RotatingLogoProps) {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 8000, // 8 seconds per rotation (slow compass-like)
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.Image
        source={require('@/assets/images/icon.png')}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          transform: [{ rotate }],
        }}
        resizeMode="cover"
      />
      {/* Glow stays static */}
      <View style={[styles.glow, { /* ... */ }]} />
    </View>
  );
}
```

### Health Permission Warning Dialog (To Add)

```typescript
// Update components/auth/PermissionsScreen.tsx
import { Alert } from 'react-native';

const handleDecline = () => {
  Alert.alert(
    "Missing Out",
    "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?",
    [
      {
        text: "Go Back",
        style: "cancel",
      },
      {
        text: "Continue Anyway",
        style: "destructive",
        onPress: () => finishPermissions(),
      },
    ]
  );
};

// Update decline button
<Pressable onPress={handleDecline}>
  <Text style={[styles.declineText, { color: colors.textSecondary }]}>
    No, don't use my health data
  </Text>
</Pressable>
```

### Push Notification Permission Screen (New)

```typescript
// Create components/auth/NotificationPermissionScreen.tsx
import * as Notifications from 'expo-notifications';

export default function NotificationPermissionScreen({
  onComplete
}: {
  onComplete?: () => void
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleAccept = async () => {
    try {
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    } catch (error) {
      console.log('[Permissions] Notification request failed:', error);
    }
    // Proceed regardless of result
    onComplete?.();
  };

  const handleDecline = () => {
    // No warning dialog for notifications (per user decisions)
    onComplete?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <View style={styles.content}>
          <RotatingLogo size={80} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Stay motivated.
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Giving permission to deliver notifications will help make sure you never miss a day!
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={[styles.acceptButton, { backgroundColor: colors.textPrimary }]}
          onPress={handleAccept}
        >
          <Text style={[styles.acceptButtonText, { color: colors.background }]}>
            Yes, I agree
          </Text>
        </Pressable>

        <Pressable onPress={handleDecline}>
          <Text style={[styles.declineText, { color: colors.textSecondary }]}>
            No, don't notify me
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Styles same as PermissionsScreen.tsx
```

### Multi-Screen Permission Pager (Alternative Approach)

```typescript
// Alternative: Combine health + notification into one pager component
// Similar to OnboardingScreen.tsx pattern
const PERMISSION_PAGES = [
  { id: 'health', type: 'health', /* ... */ },
  { id: 'notification', type: 'notification', /* ... */ },
];

// Use FlatList with horizontal paging, same pattern as welcome screens
```

### Terms & Conditions Link (To Add to LoginScreen)

```typescript
// Update components/auth/LoginScreen.tsx
import * as WebBrowser from 'expo-web-browser';

const handleTermsPress = async () => {
  await WebBrowser.openBrowserAsync('https://trailblazer.com/terms', {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
  });
};

// Replace static Text with Pressable
<Pressable
  onPress={handleTermsPress}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Text style={[styles.terms, { color: colors.primary }]}>
    Terms & Conditions Apply
  </Text>
</Pressable>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Conditional navigation with router.push | Conditional rendering outside Stack | Expo Router v6 | Simpler auth flows, no navigation state conflicts |
| react-native-view-pager | FlatList with pagingEnabled | ~2022 | One less dependency, FlatList more flexible and performant |
| Permissions package (deprecated) | expo-notifications + native modules | Expo SDK 40+ | Better TypeScript support, maintained packages |
| Custom rotation with setInterval | Animated.loop with native driver | React Native 0.62+ | Smooth 60fps animations, no JS thread blocking |

**Deprecated/outdated:**
- `expo-permissions` package: Deprecated in SDK 42, replaced by module-specific permission methods
- `react-native-pager-view`: Still valid but FlatList simpler for basic paging
- `Linking.openURL` for external links: Use `expo-web-browser` for in-app experience

## Open Questions

Things that couldn't be fully resolved:

1. **Push Notification Permission Screen Implementation Approach**
   - What we know: Need 2 permission screens (health + notifications), can use separate screens or single pager
   - What's unclear: Best UX pattern - separate sequential screens or single pager with arrow navigation like welcome screens
   - Recommendation: Use separate screens (simpler state management, clearer navigation flow). Match PermissionsScreen pattern for consistency.

2. **Skip Button Behavior**
   - What we know: Skip button should bypass welcome screens and jump to login
   - What's unclear: Should skip button set `hasSeenOnboarding` flag? (if yes, user never sees onboarding again)
   - Recommendation: Yes, set flag. User skipped intentionally, don't force onboarding on next launch.

3. **Logo Rotation Speed**
   - What we know: Should be "slow rotation animation (compass-like effect)"
   - What's unclear: Exact duration (8s? 10s? 12s?)
   - Recommendation: 8-10 seconds per rotation. Test on device to find what feels "compass-like" without being distracting.

4. **Terms & Conditions URL**
   - What we know: Should open in-app browser modal
   - What's unclear: Actual URL (placeholder `https://trailblazer.com/terms`)
   - Recommendation: Use placeholder for now, client provides real URL before production.

## Sources

### Primary (HIGH confidence)
- [React Native Animations Documentation](https://reactnative.dev/docs/animations) - Animated.loop() pattern
- [React Native FlatList Documentation](https://reactnative.dev/docs/flatlist) - Pagination and viewability
- [React Native Alert Documentation](https://reactnative.dev/docs/alert) - Native dialog patterns
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/) - Permission requests
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/) - In-app browser
- [Expo Router Authentication Guide](https://docs.expo.dev/router/advanced/authentication/) - AsyncStorage flag pattern
- Existing codebase: `app/_layout.tsx`, `components/auth/*.tsx`, `lib/health/CLAUDE.md`

### Secondary (MEDIUM confidence)
- [Creating a ViewPager using FlatList](https://gabrielprojects.medium.com/creating-a-viewpager-using-flatlist-8107cfbfdd14) - FlatList pagination pattern
- [React Native Alert Best Practices](https://galaxies.dev/quickwin/react-native-alert) - Warning dialog patterns
- [Continuous Animation in React Native](https://www.makeuseof.com/create-continuous-animation-in-react-native/) - Animated.loop() examples

### Tertiary (LOW confidence)
- [react-native-animated-pagination-dots](https://github.com/weahforsage/react-native-animated-pagination-dots) - Library reference (not using, but informs dot pattern)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed except expo-notifications, patterns verified in existing code
- Architecture: HIGH - Onboarding flow already implemented, enhancements follow existing patterns
- Pitfalls: HIGH - Documented in memory and existing code, common React Native gotchas

**Research date:** 2026-02-06
**Valid until:** ~30 days (stable domain - onboarding patterns don't change rapidly)

**Key discovery:** Most work already done (Feb 5, 2026 implementation). Phase 6 is enhancement/completion phase, not greenfield.
