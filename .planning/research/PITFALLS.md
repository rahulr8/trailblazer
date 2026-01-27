# Domain Pitfalls: React Native UI Rebuild with Heavy Animations

**Domain:** React Native UI rebuild with animations (Reanimated 4, Expo 54, GoRhom Bottom Sheet)
**Researched:** 2026-01-27
**Project:** Trailblazer+ UI Rebuild (3D flips, swipers, card stacks)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Reanimated 4 New Architecture Requirement Not Understood

**What goes wrong:** Developers attempt to use Reanimated 4 without enabling the New Architecture, causing cryptic build failures or runtime crashes. Version incompatibility between Reanimated JavaScript and native code causes unpredictable behavior.

**Why it happens:** Reanimated 4 is a breaking change that only works with React Native's New Architecture (Fabric + TurboModules). The documentation mentions this but developers often miss it during upgrades. Additionally, react-native-worklets is now a required separate dependency.

**Consequences:**
- Complete app crashes on initialization
- "Worklet not found" errors at runtime
- Version mismatch errors between JS and native layers
- Builds succeed but animations don't work
- Incompatibility with libraries still on Reanimated 3 (like NativeWind)

**Prevention:**
1. Enable New Architecture in app.json BEFORE upgrading to Reanimated 4
2. Install react-native-worklets as explicit dependency: `npm i react-native-worklets@0.5.1`
3. Add react-native-worklets/plugin to babel.config.js LAST in plugin list
4. Rebuild native apps completely after any Reanimated upgrade
5. Use exact versions from package.json (react-native-reanimated ~4.1.1, react-native-worklets 0.5.1)
6. Check all dependencies for Reanimated 3 incompatibilities

**Detection:** Look for errors mentioning "worklets", "New Architecture required", or build failures after Reanimated upgrade. Test on device immediately after upgrading.

**Phase mapping:** Address in Phase 1 (Foundation) before any animation work begins.

**Sources:**
- [Reanimated Troubleshooting](https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/)
- [Reanimated 4.x Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/)
- [React Native Reanimated 4 common mistakes](https://react-developer.medium.com/fixing-useanimatedstyle-issues-in-react-native-reanimated-a-complete-developer-guide-with-dce6a8af3eb8)

### Pitfall 2: 3D Transform Perspective Ordering Breaking on Android

**What goes wrong:** 3D flip animations (rotateY/rotateX) render incorrectly or not at all on Android while working perfectly on iOS. Cards appear flat, animations glitch, or transforms are ignored entirely.

**Why it happens:** Android requires explicit perspective in transform array AND it must be first in the array order. iOS is more forgiving. The transform order matters because React Native applies transforms sequentially.

**Consequences:**
- 3D flip animations only work on iOS
- Android shows flat cards or no animation
- Inconsistent behavior between platforms
- Wasted debugging time assuming it's a code logic issue
- Users on Android see broken UX

**Prevention:**
1. Always include perspective as FIRST transform in array: `transform: [{ perspective: 1000 }, { rotateY: rotation }]`
2. Test on Android device/emulator early and often
3. Use Reanimated's interpolate for smooth rotation transitions
4. Document the perspective requirement in component comments
5. Create reusable animated transform utilities that enforce correct ordering

**Detection:** Any 3D animation that works on iOS but not Android. Check transform array order immediately.

**Phase mapping:** Critical for Phase 2 (Card Animations) - test Android first when implementing 3D flips.

**Sources:**
- [React Native 3D animations perspective issues](https://reactnative.dev/docs/animations)
- [3D Transform anchor point guide](https://chrizog.com/react-native-rotation-anchor-point)
- [Reanimated Flip Card example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/)

### Pitfall 3: GoRhom Bottom Sheet Gesture Conflicts with Touchables

**What goes wrong:** Buttons, ScrollViews, and FlatLists inside bottom sheets don't respond to touches on Android. Users tap repeatedly but nothing happens. Horizontal swipes in FlatLists close the sheet instead of scrolling.

**Why it happens:** Bottom Sheet wraps content with TapGestureHandler and PanGestureHandler for sheet control. These intercept all touch events, preventing standard React Native touchables from receiving them. This is especially problematic on Android.

**Consequences:**
- Reward redemption buttons don't work in reward-detail modal
- Activity logging form inputs unresponsive
- Horizontal card swipers inside sheets fight with sheet gestures
- FlatList scrolling conflicts with sheet dragging
- Users think app is frozen

**Prevention:**
1. Import all touchables from @gorhom/bottom-sheet, not react-native:
   ```typescript
   import { Button, TouchableOpacity } from '@gorhom/bottom-sheet';
   ```
2. Import ScrollView/FlatList from react-native-gesture-handler:
   ```typescript
   import { ScrollView, FlatList } from 'react-native-gesture-handler';
   ```
3. For custom gesture components, wrap with NativeViewGestureHandler:
   ```typescript
   <NativeViewGestureHandler disallowInterruption={true}>
     <CustomSwiper />
   </NativeViewGestureHandler>
   ```
4. Use BottomSheetScrollView/BottomSheetFlatList for scrollable content
5. Test every interactive element inside sheets on Android device

**Detection:** Interactive elements work outside bottom sheets but not inside. Android-specific touch issues.

**Phase mapping:** Critical for Phase 4 (Bottom Sheet Overlays) - test immediately when adding interactive content.

**Sources:**
- [GoRhom Bottom Sheet Troubleshooting](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)
- [Gesture Handler with Bottom Sheet issues](https://github.com/gorhom/react-native-bottom-sheet/issues)

### Pitfall 4: Expo Router Navigation State Separation During Tab Restructure

**What goes wrong:** After restructuring from 4 tabs to 3 tabs + FAB, navigation behaves unpredictably. router.navigate() doesn't work as expected. Auth state changes but screens don't update. Back button shows wrong screens.

**Why it happens:** Expo Router v4 changed router.navigate() to behave identically to router.push(), breaking v3 behavior. Navigation state persists separately from conditional Stack rendering. Changing screen definitions doesn't automatically navigate users. AsyncStorage onboarding state can conflict with auth routing.

**Consequences:**
- Users see blank screens after sign in/out
- Back button navigates to auth-invalid screens
- Tab restructure breaks existing navigation flows
- Onboarding flow shows every session instead of once
- router.navigate() creates duplicate screens in stack

**Prevention:**
1. Always use router.replace() for auth changes, never router.push():
   ```typescript
   // After sign in
   router.replace("/(tabs)");
   // After sign out
   router.replace("/login");
   ```
2. Use router.replace() instead of router.navigate() in Expo Router v4
3. Read AsyncStorage onboarding state BEFORE auth check in _layout.tsx
4. Handle onboarding → login → tabs flow with sequential replaces
5. Test navigation with cleared AsyncStorage to verify onboarding logic
6. Document that Stack screen definitions alone don't trigger navigation

**Detection:** Navigation works in development but breaks in production. Auth state changes but screen doesn't. Back button shows invalid screens.

**Phase mapping:** Critical for Phase 3 (Tab Restructure) - implement auth navigation fixes first, then onboarding.

**Sources:**
- [Expo Router v3 to v4 breaking changes](https://github.com/expo/expo/issues/35212)
- [Expo Router migration guide](https://docs.expo.dev/router/migrate/from-react-navigation/)
- [AsyncStorage onboarding pitfalls](https://mernstackdev.com/react-native-asyncstorage/)

### Pitfall 5: Safe Area Insets Inconsistency Across Platforms and Modals

**What goes wrong:** UI elements render behind notches/status bars on iOS. Android renders differently than iOS. Modals show zero insets on iOS, causing content to render into unsafe areas. SafeAreaView and useSafeAreaInsets update at different times causing flicker.

**Why it happens:** React Native's SafeAreaView only works on iOS 10+ with no Android support. On iOS, native modals reset safe area context to zero. react-native-safe-area-context's SafeAreaView component and useSafeAreaInsets hook update independently. Android 13 and below have different inset behavior than newer versions.

**Consequences:**
- Badge detail modal text renders behind notch on iPhone
- Reward detail buttons hidden behind Android gesture bar
- Flickering during modal animations
- Inconsistent padding between platforms
- Hard-coded padding leads to wrong spacing on different devices

**Prevention:**
1. Never use React Native's SafeAreaView, always use react-native-safe-area-context
2. Prefer useSafeAreaInsets hook over SafeAreaView component to avoid flicker
3. Add SafeAreaProvider at root level (already in _layout.tsx)
4. For modals, manually apply safe area insets:
   ```typescript
   const insets = useSafeAreaInsets();
   <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
   ```
5. Test every screen on notched iPhone and Android with gesture navigation
6. Use Uniwind's safe-area utilities when available

**Detection:** Content hidden behind notch/status bar/gesture bar. Different spacing on iOS vs Android. Modal content in unsafe areas.

**Phase mapping:** Address in Phase 1 (Foundation) - create safe area wrapper utilities before building screens.

**Sources:**
- [React Native Safe Area Context issues](https://github.com/AppAndFlow/react-native-safe-area-context/issues)
- [Safe area handling guide](https://docs.expo.dev/develop/user-interface/safe-areas/)
- [iOS modal safe area issues](https://github.com/AppAndFlow/react-native-safe-area-context/issues/677)

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 6: useAnimatedGestureHandler Deprecation in Reanimated 3+

**What goes wrong:** Developers use useAnimatedGestureHandler from old tutorials, causing deprecation warnings or errors. Code works in Reanimated 3 but breaks when upgrading to Reanimated 4.

**Why it happens:** useAnimatedGestureHandler was deprecated in Reanimated 3 and removed in Reanimated 4. New Gesture API from Gesture Handler 2+ is required. Many tutorials and Stack Overflow answers still reference the old API.

**Prevention:**
1. Use Gesture API from react-native-gesture-handler 2+:
   ```typescript
   import { Gesture, GestureDetector } from 'react-native-gesture-handler';

   const panGesture = Gesture.Pan()
     .onBegin(() => {})
     .onUpdate((event) => {})
     .onEnd(() => {});

   <GestureDetector gesture={panGesture}>
     <Animated.View />
   </GestureDetector>
   ```
2. Migrate all useAnimatedGestureHandler code before upgrading to Reanimated 4
3. Reference official Reanimated examples, not blog posts from 2023

**Detection:** Deprecation warnings in console. Build errors after Reanimated upgrade.

**Phase mapping:** Phase 2 (Card Animations) - use new Gesture API from start.

**Sources:**
- [useAnimatedGestureHandler deprecation discussion](https://github.com/software-mansion/react-native-reanimated/discussions/4344)
- [Handling gestures in Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/handling-gestures/)

### Pitfall 7: Horizontal Card Swiper Performance Degradation in Lists

**What goes wrong:** Horizontal card swipers inside FlatLists render 2x slower on Android. Scrolling feels janky. Multiple swipers on screen cause frame drops. Animation performance drops to 30fps instead of 60fps.

**Why it happens:** Gesture Handler's Swipeable component is deprecated and has known performance issues when nested in FlatLists. JS-based gesture handling can't keep up with rapid scroll events. Multiple simultaneous gesture handlers compete for touch events.

**Prevention:**
1. Don't use deprecated Swipeable component - use Reanimated-based alternatives
2. Use simultaneousWithExternalGesture prop to resolve gesture conflicts:
   ```typescript
   const panGesture = Gesture.Pan()
     .simultaneousWithExternalGesture(scrollGesture);
   ```
3. Optimize FlatList with proper keyExtractor, getItemLayout, and removeClippedSubviews
4. Run animations on UI thread using runOnUI and worklets
5. Consider card stack instead of horizontal swiper for better performance
6. Limit number of simultaneous animated components on screen

**Detection:** Frame drops during scrolling. Android performance worse than iOS. Multiple swipers causing lag.

**Phase mapping:** Phase 2 (Card Animations) - benchmark early, consider alternative patterns if performance poor.

**Sources:**
- [Swipeable performance issues](https://github.com/software-mansion/react-native-gesture-handler/issues/3344)
- [Horizontal swiper gesture conflicts](https://github.com/software-mansion/react-native-gesture-handler/issues/2380)

### Pitfall 8: HeroUI Native Beta Component Compatibility Issues

**What goes wrong:** HeroUI Native components behave unexpectedly. Version mismatches with peer dependencies cause runtime errors. Components render differently than documentation examples. Uniwind styling conflicts with component internals.

**Why it happens:** HeroUI Native is in beta (1.0.0-beta.9). Beta APIs change. Peer dependency version ranges are strict. The library requires exact versions of Reanimated, Gesture Handler, Safe Area Context, etc.

**Prevention:**
1. Use exact versions from package.json, don't use ^ or ~:
   ```json
   "heroui-native": "1.0.0-beta.9",
   "react-native-reanimated": "4.1.1",
   "react-native-worklets": "0.5.1"
   ```
2. Lock all HeroUI peer dependencies to exact versions
3. Test each HeroUI component before building features on top of it
4. Monitor HeroUI GitHub issues for known beta bugs
5. Have fallback plan to implement custom components if HeroUI fails
6. Don't upgrade HeroUI mid-milestone - lock version for stability

**Detection:** Components don't match documentation. Dependency version warnings. Runtime errors mentioning HeroUI components.

**Phase mapping:** Phase 1 (Foundation) - validate all HeroUI components needed, test early, decide whether to continue with beta or use alternatives.

**Sources:**
- [HeroUI Native beta release](https://github.com/heroui-inc/heroui-native/tree/beta)
- [HeroUI Native npm package](https://www.npmjs.com/package/heroui-native)
- [Uniwind integration with HeroUI](https://uniwind.dev/)

### Pitfall 9: AsyncStorage Race Conditions in Onboarding Flow

**What goes wrong:** Onboarding screen shows every time app launches despite being completed. User sees onboarding → login → onboarding loop. AsyncStorage reads return null unexpectedly. Concurrent reads/writes cause data loss.

**Why it happens:** AsyncStorage operations are asynchronous. Auth check and onboarding check happen simultaneously. Navigator renders before AsyncStorage read completes. No error handling means failed reads are treated as "not completed". App doesn't wait for storage to be ready.

**Consequences:**
- Users see onboarding every session
- Poor first-time user experience
- Difficult to debug race conditions
- Auth flow breaks if onboarding state isn't loaded

**Prevention:**
1. Read AsyncStorage BEFORE rendering any screens:
   ```typescript
   const [isReady, setIsReady] = useState(false);

   useEffect(() => {
     async function prepare() {
       const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
       const authState = await loadAuthState();
       setIsReady(true);
     }
     prepare();
   }, []);

   if (!isReady) return <SplashScreen />;
   ```
2. Use single AsyncStorage key for all onboarding state (avoid multiple reads)
3. Handle errors - failed read should show onboarding, not crash
4. Consider using MMKV (already in package.json) for better performance
5. Centralize AsyncStorage keys in constants file
6. Add comprehensive error handling and logging

**Detection:** Onboarding shows repeatedly. Intermittent navigation bugs. Works in dev, fails in production.

**Phase mapping:** Phase 3 (Tab Restructure) when implementing onboarding flow.

**Sources:**
- [AsyncStorage best practices](https://mernstackdev.com/react-native-asyncstorage/)
- [Authentication state handling](https://www.bigbinary.com/blog/handling-authentication-state-in-react-native)
- [Onboarding screen tutorial](https://blog.openreplay.com/setting-up-onboarding-screens-in-react-native/)

### Pitfall 10: TypeScript Strict Mode with Reanimated SharedValues

**What goes wrong:** TypeScript errors on SharedValue types. useAnimatedStyle infers wrong types. Worklet functions don't type-check correctly. "any" types creep in around animated values to bypass strict mode errors.

**Why it happens:** Reanimated's TypeScript types are complex. SharedValue<T> generic requires explicit typing. Worklets run outside React context but TypeScript doesn't know this. Strict mode catches type mismatches that slip through in normal mode.

**Prevention:**
1. Explicitly type all SharedValues:
   ```typescript
   const rotation = useSharedValue<number>(0);
   const isFlipped = useSharedValue<boolean>(false);
   ```
2. Type animated style return values:
   ```typescript
   const animatedStyle = useAnimatedStyle((): StyleProp<ViewStyle> => {
     return {
       transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }]
     };
   });
   ```
3. Never use "any" - use "unknown" and type guards
4. Enable strict mode from start, don't add later
5. Run typecheck before every commit: `npx tsc --noEmit`

**Detection:** TypeScript errors referencing SharedValue, useAnimatedStyle, or worklets. Type inference failures.

**Phase mapping:** Phase 1 (Foundation) - establish TypeScript patterns for animations before building features.

**Sources:**
- [Reanimated TypeScript issues](https://github.com/software-mansion/react-native-reanimated/issues)
- [Expo SDK 54 TypeScript errors](https://github.com/expo/expo/issues/41790)

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 11: Expo Router File-Based Routing Confusion During Restructure

**What goes wrong:** Developers add new tab by creating file but forget to register in _layout.tsx. Dynamic routes don't work as expected. File naming conventions cause unexpected routing behavior.

**Why it happens:** Expo Router is file-based but still requires explicit Tab.Screen registrations for tabs. The mental model mixes file-system routing with component configuration. Documentation doesn't emphasize this clearly enough.

**Prevention:**
1. Remember: file creates route, _layout.tsx configures how it appears
2. For new tab: create file AND add <Tabs.Screen> entry
3. Test new routes immediately after creation
4. Document file naming patterns in CLAUDE.md

**Detection:** New tab file created but doesn't show in tab bar. Routes 404 unexpectedly.

**Phase mapping:** Phase 3 (Tab Restructure) - expect confusion, test frequently.

**Sources:**
- [Expo Router navigation patterns](https://docs.expo.dev/router/basics/common-navigation-patterns/)

### Pitfall 12: Bottom Sheet initialScrollIndex Bug

**What goes wrong:** BottomSheetFlatList with initialScrollIndex doesn't render correctly if index is outside render distance. List appears blank until user scrolls.

**Why it happens:** Known bug in @gorhom/bottom-sheet. Initial scroll index is set before list renders.

**Prevention:**
1. Avoid initialScrollIndex with large lists in bottom sheets
2. Use scrollToIndex after list renders as workaround
3. Keep critical items in initial render distance

**Detection:** Blank list in bottom sheet until scroll. Works with small index, breaks with large.

**Phase mapping:** Phase 4 (Bottom Sheet Overlays) - if using activity history lists in sheets.

**Sources:**
- [Bottom Sheet initialScrollIndex bug](https://github.com/gorhom/react-native-bottom-sheet/issues/2026)

### Pitfall 13: Gesture Handler Simultaneous Gesture Configuration

**What goes wrong:** Gestures conflict - pan gesture blocks scroll, tap blocks button press, multiple gestures fight for control.

**Why it happens:** By default, gestures are mutually exclusive. Requires explicit configuration to allow simultaneous handling.

**Prevention:**
1. Use simultaneousWithExternalGesture for gestures that should coexist
2. Use requireExternalGestureToFail for priority handling
3. Test all gesture interactions thoroughly

**Detection:** One gesture prevents another from working. Scrolling blocks swipe gestures.

**Phase mapping:** Phase 2 (Card Animations) when implementing card swipers with scrolling.

**Sources:**
- [Gesture Handler simultaneous gestures](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/native-gesture/)

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Foundation | Reanimated 4 New Architecture not enabled | Enable New Architecture first, verify Reanimated 4 compatibility, install react-native-worklets |
| Phase 1: Foundation | Safe area inconsistencies breaking layouts | Create safe area wrapper utilities using useSafeAreaInsets hook before building screens |
| Phase 1: Foundation | HeroUI Native beta instability | Validate all needed components early, lock exact dependency versions, have fallback plan |
| Phase 1: Foundation | TypeScript strict mode pain with animations | Establish animation type patterns before feature work begins |
| Phase 2: Card Animations | 3D transform perspective missing on Android | Always test Android first, use perspective-first transform ordering pattern |
| Phase 2: Card Animations | Gesture conflicts between swiper and scroll | Configure simultaneousWithExternalGesture, test all gesture combinations |
| Phase 2: Card Animations | Performance issues with multiple animated cards | Benchmark early, limit simultaneous animations, use UI thread optimizations |
| Phase 3: Tab Restructure | Navigation state separation causing routing bugs | Use router.replace() for auth changes, test with cleared state |
| Phase 3: Tab Restructure | AsyncStorage race conditions in onboarding | Load all async state before rendering any navigation |
| Phase 3: Tab Restructure | File-based routing confusion | Document pattern: create file + register in _layout |
| Phase 4: Bottom Sheet Overlays | Touchables don't work inside sheets | Import touchables from @gorhom/bottom-sheet, test all interactive elements on Android |
| Phase 4: Bottom Sheet Overlays | Gesture conflicts between sheet and content | Use NativeViewGestureHandler for custom gestures, use BottomSheet* components |
| Phase 4: Bottom Sheet Overlays | Safe area issues in modals on iOS | Manually apply safe area insets in modal content |
| Phase 5: Integration | Multiple animation systems fighting (Reanimated + native modals) | Audit all animation sources, consolidate to Reanimated where possible |

## Cross-Cutting Concerns

### Mock Data Management

**Risk:** Mock data drift from production schema. Components built with mock data break with real Firebase data.

**Mitigation:**
- Define TypeScript interfaces for all data models FIRST
- Generate mock data from same interfaces
- Use Firebase emulator for realistic testing
- Centralize mock data generation in single file
- Validate mock data matches Firestore schema

### Testing Strategy for Animations

**Risk:** Animations work in development but break in production builds. Frame drops only happen on lower-end devices.

**Mitigation:**
- Test release builds, not just debug builds
- Test on lower-end Android device (not just flagship or emulator)
- Measure FPS with Reanimated's fps meter
- Use Expo's production mode locally: `expo start --no-dev`
- Profile animations with React DevTools Profiler

### Cross-Platform Visual Consistency

**Risk:** Animations look great on iOS but janky on Android. Safe areas differ significantly. Fonts render differently.

**Mitigation:**
- Design for Android constraints first (lower performance ceiling)
- Test on physical devices early, not just simulators
- Use platform-specific animation configurations if needed
- Document platform differences in component comments
- Create platform-aware animation utilities

## High-Risk Dependencies

| Dependency | Version | Risk Level | Mitigation |
|------------|---------|-----------|------------|
| heroui-native | 1.0.0-beta.9 | HIGH | Beta instability, strict peer deps, monitor GitHub issues |
| react-native-reanimated | ~4.1.1 | HIGH | New Architecture only, breaking changes from v3, worklets required |
| @gorhom/bottom-sheet | ^5.2.8 | MEDIUM | Gesture conflicts, touchable issues on Android, version compatibility |
| react-native-worklets | 0.5.1 | MEDIUM | Must match Reanimated version exactly, new dependency |
| expo-router | ~6.0.8 | MEDIUM | Navigation behavior changes in v4, migration complexity |

## Sources

**Official Documentation:**
- [React Native Reanimated Troubleshooting](https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/)
- [GoRhom Bottom Sheet Troubleshooting](https://gorhom.dev/react-native-bottom-sheet/troubleshooting)
- [React Native Gesture Handler Documentation](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [Expo Router Migration Guide](https://docs.expo.dev/router/migrate/from-react-navigation/)
- [React Native Safe Area Context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/)

**Community Resources (MEDIUM confidence):**
- [Reanimated 4 Migration Issues (Medium)](https://react-developer.medium.com/fixing-useanimatedstyle-issues-in-react-native-reanimated-a-complete-developer-guide-with-dce6a8af3eb8)
- [3D Transform Anchor Point Guide](https://chrizog.com/react-native-rotation-anchor-point)
- [Expo SDK 54 Upgrade Guide (Medium)](https://medium.com/@shanavascruise/upgrading-to-expo-54-and-react-native-0-81-a-developers-survival-story-2f58abf0e326)
- [AsyncStorage Best Practices](https://mernstackdev.com/react-native-asyncstorage/)
- [Uniwind Introduction](https://www.reactnativecrossroads.com/posts/introducing-uniwind-the-fastest-tailwind-bindings-for-react-native/)

**GitHub Issues (LOW confidence, needs verification):**
- [Expo Router v4 Navigation Breaking Changes](https://github.com/expo/expo/issues/35212)
- [Bottom Sheet initialScrollIndex Bug](https://github.com/gorhom/react-native-bottom-sheet/issues/2026)
- [Expo SDK 54 TypeScript Errors](https://github.com/expo/expo/issues/41790)
- [Swipeable Performance Issues](https://github.com/software-mansion/react-native-gesture-handler/issues/3344)
