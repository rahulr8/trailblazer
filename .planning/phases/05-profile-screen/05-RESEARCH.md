# Phase 5: Profile Screen - Research

**Researched:** 2026-02-06
**Domain:** React Native profile screen with stat grids, toggles, and external link handling
**Confidence:** HIGH

## Summary

Phase 5 implements a user profile screen displaying identity, lifetime statistics, data sync settings, and account management. The screen uses existing patterns from the codebase: ScrollView with safe area handling, card-based sections with menu items, and modal presentation.

The implementation leverages existing infrastructure: Firebase Auth signOut, ThemeContext for colors/shadows, mock data from `lib/mock/`, and the existing profile route at `app/(modals)/profile.tsx`. External links open via `expo-web-browser` for native in-app browser experience. Statistics are displayed in a 3x2 grid using flexbox (no external grid library needed).

**Primary recommendation:** Use native React Native components (View, Switch, Pressable) with flexbox for stat grid layout. Use `expo-web-browser`'s `WebBrowser.openBrowserAsync()` for external links instead of `Linking.openURL` to maintain in-app experience. Reuse existing profile.tsx structure and patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-safe-area-context | ~5.6.0 | Safe area handling | Already in project, provides useSafeAreaInsets hook for bottom padding |
| expo-web-browser | ~15.0.7 | In-app browser | Already in project, provides native browser modal (iOS Safari View, Android Custom Tabs) |
| firebase | ^12.7.0 | Authentication | Already configured, provides signOut method |
| lucide-react-native | ^0.562.0 | Icons | Already in project, used throughout app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AsyncStorage | ^2.2.0 | Persistence | Already in project if flags needed (not required for this phase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-web-browser | Linking.openURL | Linking opens system browser (user leaves app), WebBrowser keeps user in-app with native modal |
| Native flexbox grid | react-native-flexible-grid | External library adds complexity; flexbox with View is sufficient for 3x2 stat grid |

**Installation:**
No new dependencies required - all libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
app/(modals)/
└── profile.tsx           # Profile screen (already exists, needs updates)

lib/mock/
├── types.ts              # MockUser, MockStats interfaces (already exist)
└── data.ts               # MOCK_USER, MOCK_STATS (already exist)

constants/
├── colors.ts             # Theme colors (already exists)
├── spacing.ts            # Spacing values (already exists)
└── index.ts              # Barrel export (already exists)
```

### Pattern 1: Modal Screen with ScrollView and Safe Area
**What:** Profile screen as modal with ScrollView, content padded by safe area insets
**When to use:** Any full-screen modal with scrollable content
**Example:**
```typescript
// Source: Existing profile.tsx (lines 80-101)
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === "ios" ? 40 : insets.bottom + Spacing.lg,
          },
        ]}
      >
        {/* Content */}
      </ScrollView>
    </View>
  );
}
```

### Pattern 2: Stat Grid with Flexbox
**What:** 3x2 grid using flexDirection: row with flexWrap and flex: 1 on items
**When to use:** Fixed-column grids with equal-width items
**Example:**
```typescript
// Source: React Native flexbox patterns
const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md, // RN 0.71+ supports gap
  },
  statItem: {
    flex: 1,
    minWidth: '30%', // 3 columns with breathing room
    alignItems: 'center',
  },
});
```

### Pattern 3: Card Section with Menu Items
**What:** Card container with pressable menu items separated by hairline dividers
**When to use:** Settings/options lists
**Example:**
```typescript
// Source: Existing profile.tsx (lines 132-207)
<View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
  <Pressable style={styles.menuItem} onPress={handlePress}>
    <View style={[styles.menuIcon, { backgroundColor: colors.accent + "20" }]}>
      <Award size={20} color={colors.accent} />
    </View>
    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Menu Label</Text>
    <ChevronRight size={20} color={colors.textSecondary} />
  </Pressable>

  <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

  {/* More menu items */}
</View>
```

### Pattern 4: Opening External Links with expo-web-browser
**What:** Use WebBrowser.openBrowserAsync for in-app browser modal
**When to use:** Opening external URLs (docs, terms, privacy)
**Example:**
```typescript
// Source: Expo WebBrowser documentation
import * as WebBrowser from 'expo-web-browser';

const openURL = async (url: string) => {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      controlsColor: colors.primary, // iOS tint color
      toolbarColor: colors.cardBackground, // Android toolbar
    });
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};

// Usage
<Pressable onPress={() => openURL('https://example.com/privacy')}>
  <Text>Privacy Policy</Text>
</Pressable>
```

### Pattern 5: Toggle Switches (UI-only)
**What:** React Native Switch component with theme-aware colors
**When to use:** Binary on/off settings
**Example:**
```typescript
// Source: Existing profile.tsx (lines 185-196)
const [isHealthEnabled, setIsHealthEnabled] = useState(false);

<View style={styles.menuItem}>
  <View style={[styles.menuIcon, { backgroundColor: colors.primary + "20" }]}>
    <Heart size={20} color={colors.primary} />
  </View>
  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Apple Health</Text>
  <Switch
    value={isHealthEnabled}
    onValueChange={setIsHealthEnabled}
    trackColor={{ false: colors.progressTrack, true: colors.primary + "60" }}
    thumbColor={isHealthEnabled ? colors.primary : "#fff"}
  />
</View>
```

### Pattern 6: Firebase SignOut with Navigation
**What:** Async signOut followed by router.back() to close modal
**When to use:** User logout
**Example:**
```typescript
// Source: Existing profile.tsx (lines 45-52)
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "@/lib/firebase";

const handleSignOut = async () => {
  try {
    router.back(); // Close modal first for better UX
    await signOut(auth);
    // AuthProvider's onAuthStateChanged will handle navigation to login
  } catch (error) {
    console.error("[Profile] Sign out error:", error);
  }
};
```

### Anti-Patterns to Avoid
- **Using grid libraries for simple layouts:** Flexbox handles 3x2 grids perfectly - no need for `react-native-flexible-grid` or similar
- **Opening links with Linking.openURL:** Use `expo-web-browser` instead to keep users in-app
- **Implementing real sync logic in Phase 5:** Toggles are UI-only per requirements - no API calls
- **Hardcoding stat values in components:** Use `MOCK_STATS` from `lib/mock/data.ts`
- **Manual safe area padding:** Use `useSafeAreaInsets()` hook, don't hardcode values
- **Complex Switch state management:** For UI-only toggles, local useState is sufficient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| In-app browser | Custom WebView wrapper | expo-web-browser | Handles native modals (iOS Safari View, Android Custom Tabs), cookie isolation, customization |
| Safe area handling | Manual padding calculations | useSafeAreaInsets hook | Handles all devices/notches/home indicators automatically |
| Auth state management | Custom auth listener | Existing AuthContext | Already implemented with onAuthStateChanged listener |
| Theme colors | Inline color values | useTheme hook | Provides theme-aware colors, shadows, gradients |
| Stat grid layout | Custom grid component | Native flexbox | flexDirection: row + flexWrap handles responsive grids |

**Key insight:** React Native core APIs and Expo SDK provide battle-tested solutions for profile screens. The existing codebase already has patterns for modals, cards, and menu items - reuse them.

## Common Pitfalls

### Pitfall 1: Forgetting to Close Modal Before signOut
**What goes wrong:** Modal stays open after sign out, user sees jarring flash
**Why it happens:** signOut triggers auth state change which navigates to login, but modal is still mounted
**How to avoid:** Call `router.back()` before `signOut(auth)` (see existing profile.tsx line 47)
**Warning signs:** Modal visible during auth state transition

### Pitfall 2: Using Linking.openURL Instead of WebBrowser
**What goes wrong:** User leaves app entirely, opens system browser
**Why it happens:** Linking.openURL is more commonly documented, seems simpler
**How to avoid:** Always use `WebBrowser.openBrowserAsync()` for external links in Expo apps
**Warning signs:** User complains about leaving app, no back button to return

### Pitfall 3: Hardcoding Safe Area Bottom Padding
**What goes wrong:** Bottom content clipped on devices with home indicator, too much space on older devices
**Why it happens:** Testing on single device, not accounting for all iOS/Android variations
**How to avoid:** Use `insets.bottom` from `useSafeAreaInsets()` hook
**Warning signs:** Content clipped on iPhone 14/15, excessive padding on iPhone 8

### Pitfall 4: Implementing Real Sync Logic in UI-Only Toggles
**What goes wrong:** Scope creep, added complexity, testing burden
**Why it happens:** Developer assumes toggles must actually do something
**How to avoid:** Read requirements carefully - PROF-03 says "UI-only, no real sync triggered"
**Warning signs:** Adding API calls, health sync logic, state persistence to toggles

### Pitfall 5: Using External Grid Library for Simple 3x2 Layout
**What goes wrong:** Added bundle size, learning curve, maintenance burden
**Why it happens:** Unfamiliarity with React Native flexbox capabilities
**How to avoid:** Use `flexDirection: row` + `flexWrap: wrap` + `flex: 1` on items
**Warning signs:** Installing react-native-flexible-grid or similar for basic stat cards

### Pitfall 6: Not Handling Switch Colors for Light/Dark Themes
**What goes wrong:** Switch invisible or wrong color in opposite theme
**Why it happens:** Only testing in one color scheme
**How to avoid:** Use `colors.primary` and `colors.progressTrack` from ThemeContext
**Warning signs:** Switch disappears or looks wrong when toggling dark mode

### Pitfall 7: Avatar Image vs Icon Pattern Confusion
**What goes wrong:** Trying to load user photo when none exists, error states not handled
**Why it happens:** Not checking for null/undefined photoURL
**How to avoid:** Use fallback icon pattern (existing profile.tsx lines 104-106 shows User icon in colored circle)
**Warning signs:** Blank avatar space, console errors about image loading

## Code Examples

Verified patterns from official sources and existing codebase:

### Opening External Links (Expo WebBrowser)
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/webbrowser/
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/contexts/theme-context';

export default function ProfileScreen() {
  const { colors } = useTheme();

  const openPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://example.com/privacy', {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
        controlsColor: colors.primary, // iOS toolbar tint
        toolbarColor: colors.cardBackground, // Android toolbar background
      });
    } catch (error) {
      console.error('Error opening privacy policy:', error);
    }
  };

  return (
    <Pressable onPress={openPrivacyPolicy}>
      <Text>Privacy Policy</Text>
    </Pressable>
  );
}
```

### Stat Grid Layout (Native Flexbox)
```typescript
// Source: React Native flexbox patterns + existing codebase
import { MOCK_STATS } from '@/lib/mock';

const stats = [
  { label: 'Total Mins', value: MOCK_STATS.totalMinutes.toString() },
  { label: 'Longest Streak', value: MOCK_STATS.longestStreak.toString() },
  { label: 'Total KMs', value: MOCK_STATS.totalKm.toFixed(1) },
  { label: 'Badges', value: MOCK_STATS.totalBadges.toString() },
  { label: 'Total Activities', value: MOCK_STATS.totalActivities.toString() },
  { label: 'Challenges', value: MOCK_STATS.totalChallenges.toString() },
];

<View style={[styles.statsCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
  <View style={styles.statsGrid}>
    {stats.map((stat) => (
      <View key={stat.label} style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
      </View>
    ))}
  </View>
</View>

const styles = StyleSheet.create({
  statsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '28%', // ~3 columns accounting for gap
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
```

### Hero Identity Section
```typescript
// Source: Existing profile.tsx (lines 103-111)
import { User } from 'lucide-react-native';
import { MOCK_USER } from '@/lib/mock';

<View style={styles.avatarSection}>
  <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
    <User size={40} color={colors.primary} />
  </View>
  <Text style={[styles.name, { color: colors.textPrimary }]}>{MOCK_USER.displayName}</Text>
  <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
    {MOCK_USER.membershipTier === 'platinum' ? 'Platinum Member' : 'Free Member'}
  </Text>
</View>

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  memberSince: {
    fontSize: 14,
  },
});
```

### UI-Only Toggle Switches
```typescript
// Source: Existing profile.tsx (lines 185-196) + requirements
const [appleHealthEnabled, setAppleHealthEnabled] = useState(false);
const [googleFitEnabled, setGoogleFitEnabled] = useState(false);

// Apple Health Toggle
<View style={styles.menuItem}>
  <View style={[styles.menuIcon, { backgroundColor: '#007AFF20' }]}>
    <Heart size={20} color="#007AFF" />
  </View>
  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Apple Health</Text>
  <Switch
    value={appleHealthEnabled}
    onValueChange={setAppleHealthEnabled}
    trackColor={{ false: colors.progressTrack, true: colors.primary + '60' }}
    thumbColor={appleHealthEnabled ? colors.primary : '#fff'}
  />
</View>

<View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

// Google Fit Toggle
<View style={styles.menuItem}>
  <View style={[styles.menuIcon, { backgroundColor: '#4285F420' }]}>
    <Activity size={20} color="#4285F4" />
  </View>
  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Google Fit</Text>
  <Switch
    value={googleFitEnabled}
    onValueChange={setGoogleFitEnabled}
    trackColor={{ false: colors.progressTrack, true: colors.primary + '60' }}
    thumbColor={googleFitEnabled ? colors.primary : '#fff'}
  />
</View>
```

### Firebase SignOut Pattern
```typescript
// Source: Existing profile.tsx (lines 45-52)
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '@/lib/firebase';

const handleSignOut = async () => {
  try {
    router.back(); // Close modal before sign out for better UX
    await signOut(auth);
    // AuthProvider's onAuthStateChanged listener will handle navigation to /login
  } catch (error) {
    console.error('[Profile] Sign out error:', error);
  }
};

<Pressable style={styles.menuItem} onPress={handleSignOut}>
  <View style={[styles.menuIcon, { backgroundColor: colors.danger + '20' }]}>
    <LogOut size={20} color={colors.danger} />
  </View>
  <Text style={[styles.menuLabel, { color: colors.danger }]}>Sign Out</Text>
</Pressable>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linking.openURL | expo-web-browser | Expo SDK ~41 (2021) | In-app browser modal instead of leaving app |
| Custom grid libraries | Native flexbox gap | React Native 0.71 (2022) | gap property now supported, simpler layouts |
| SafeAreaView wrapper | useSafeAreaInsets hook | react-native-safe-area-context 3.0 (2020) | More granular control, better performance |
| StyleSheet only | StyleSheet + theme context | Modern pattern (2023+) | Dynamic theming without prop drilling |

**Deprecated/outdated:**
- `SafeAreaView` from react-native core: Use `SafeAreaView` from react-native-safe-area-context or `useSafeAreaInsets` hook instead
- Custom grid components: React Native 0.71+ supports `gap` property in flexbox - use native flexbox for simple grids
- Inline color values: Use ThemeContext for theme-aware colors that respond to light/dark mode

## Open Questions

Things that couldn't be fully resolved:

1. **Placeholder URLs for account management/privacy/terms**
   - What we know: Requirements say "open device web browser to placeholder URL"
   - What's unclear: Actual URLs to use
   - Recommendation: Use example.com placeholders, document in code comments for future replacement

2. **Membership tier display format**
   - What we know: MOCK_USER has membershipTier field ('free' | 'platinum')
   - What's unclear: Exact text to display (e.g., "Platinum Member" vs "Trailblazer+ Platinum")
   - Recommendation: Use "Platinum Member" / "Free Member" for simplicity, matches requirement PROF-01

3. **Google Fit availability**
   - What we know: Requirement PROF-03 includes Google Fit toggle
   - What's unclear: Platform-specific visibility (iOS-only? Android-only? Both?)
   - Recommendation: Show on all platforms as UI-only toggle (per requirements), hide Android-specific sync in future phases

## Sources

### Primary (HIGH confidence)
- React Native Linking API: https://reactnative.dev/docs/linking
- Expo WebBrowser API: https://docs.expo.dev/versions/latest/sdk/webbrowser/
- Expo Safe Area Context: https://docs.expo.dev/versions/latest/sdk/safe-area-context/
- React Native Switch Component: https://reactnative.dev/docs/switch
- React Navigation Auth Flow: https://reactnavigation.org/docs/auth-flow/
- Existing codebase patterns: `app/(modals)/profile.tsx`, `contexts/theme-context.tsx`, `lib/mock/`

### Secondary (MEDIUM confidence)
- React Native flexbox patterns: https://reactnative.dev/docs/layout-props
- Firebase Auth signOut patterns: https://rnfirebase.io/auth/usage
- Safe area handling patterns: https://blog.logrocket.com/improve-mobile-ui-react-native-safe-area-context/

### Tertiary (LOW confidence)
- General grid layout patterns from search results (not specific to this use case)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, verified via package.json
- Architecture: HIGH - Patterns verified in existing codebase (profile.tsx)
- External link handling: HIGH - Expo WebBrowser officially documented, verified API
- Stat grid layout: HIGH - Native flexbox pattern, no external dependencies needed
- SignOut flow: HIGH - Existing implementation verified in codebase
- Pitfalls: MEDIUM - Based on common React Native patterns and requirements interpretation

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stable domain)
