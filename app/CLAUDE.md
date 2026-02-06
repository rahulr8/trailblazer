# App Directory - Expo Router

Expo Router file-based routing for Trailblazer.

## Route Structure

```
app/
├── _layout.tsx          # Root layout (providers + auth-based routing + onboarding flow)
├── onboarding.tsx       # Welcome pager (2 swipeable pages, first-time only)
├── login.tsx            # Join screen (Login + Apple buttons, login modal overlay)
├── permissions.tsx      # Post-auth permissions (Health API + Notifications pager)
├── chat.tsx             # Full-screen AI chat with Parker
├── (tabs)/              # Bottom tab navigation (authenticated)
│   ├── _layout.tsx      # Material Top Tabs at bottom + CustomTabBar
│   ├── index.tsx        # Home - stats, challenge, activities
│   ├── stash.tsx        # Your Stash - rewards and perks (placeholder)
│   └── squad.tsx        # Your Squad - community and leaderboard (placeholder)
└── (modals)/            # Modal screens
    ├── _layout.tsx      # Modal presentation config
    ├── profile.tsx      # Profile settings (card modal, slide from bottom)
    ├── log-activity.tsx # Manual activity logging
    ├── badge-detail.tsx # Badge detail view
    ├── reward-detail.tsx# Reward detail + redeem
    ├── upgrade.tsx      # Platinum membership
    ├── giveaway.tsx     # Marketing giveaway
    └── reset-challenge.tsx # Challenge reset confirmation
```

## Onboarding Flow

The app uses a multi-step onboarding flow managed by AsyncStorage flags:

1. **First launch** (`@trailblazer_onboarding_seen` not set): `onboarding.tsx` (2 welcome pages)
2. **After onboarding / returning unauthenticated users**: `login.tsx` (Join screen)
3. **After auth, permissions not done** (`@trailblazer_permissions_complete` not set): `permissions.tsx`
4. **Returning authenticated users**: `/(tabs)`

### Login Screen

The login screen shows "Join Trailblazer+" with Login and Apple Sign Up buttons. Tapping "Login" opens a Modal overlay with email/password form. All existing auth logic (createUserWithEmailAndPassword, signInWithEmailAndPassword, createUser) is preserved.

### Permissions Screen

Two-page horizontal pager (not user-swipeable): Health API permission and Push Notifications. "Yes, I agree" triggers the actual permission request; "No" skips. After both pages, navigates to `/(tabs)`.

## Auth-Based Routing

The root `_layout.tsx` loads two AsyncStorage flags (`@trailblazer_onboarding_seen`, `@trailblazer_permissions_complete`) and routes based on auth state + flags:

**Critical**: Expo Router maintains navigation state separately from screen definitions. After auth changes, use `router.replace()` to navigate:

- After sign in: `router.replace("/(tabs)")` (or `/permissions` if not completed)
- After sign out: `router.replace("/login")`

## Navigation Patterns

### Tab Navigation

Uses Material Top Tabs (`@react-navigation/material-top-tabs`) positioned at bottom via `tabBarPosition="bottom"` with a custom `CustomTabBar` component. Supports swipe gestures between tabs.

3 tabs: Home, Your Stash, Your Squad — icons grouped on the left side of the bar.

Parker chat button (paw icon, accent-colored circle) is integrated into the right side of the custom tab bar, navigates to `/chat`.

Each tab screen renders a shared `TopBar` component (date + affirmation + avatar) as the first child inside its ScrollView. The TopBar scrolls with content (not sticky). Pull-to-refresh rotates the affirmation text. Each tab manages its own affirmation state independently. All screens use mock data from `@/lib/mock`.

### Opening Modals

```typescript
import { router } from "expo-router";

// Open transparent overlay modal (fade)
router.push("/(modals)/upgrade");
router.push("/(modals)/reward-detail");

// Open profile modal (slides from bottom as card)
router.push("/(modals)/profile");

// Close modal
router.back();
```

### Full-Screen Routes

```typescript
// Chat opens as full-screen modal with slide animation
router.push("/chat");
```

## Screen Responsibilities

| Screen                  | Purpose               | Key Features                                          |
| ----------------------- | --------------------- | ----------------------------------------------------- |
| `onboarding.tsx`        | Welcome pager         | 2 swipeable pages, RotatingLogo, arrow nav            |
| `login.tsx`             | Join + Authentication | Login modal overlay, Apple sign-up stub               |
| `permissions.tsx`       | Post-auth permissions | Health API + Push Notifications pager                 |
| `(tabs)/index.tsx`      | Home dashboard        | TopBar, pull-to-refresh affirmation, placeholder      |
| `(tabs)/stash.tsx`      | Your Stash            | TopBar, pull-to-refresh affirmation, placeholder      |
| `(tabs)/squad.tsx`      | Your Squad            | TopBar, pull-to-refresh affirmation, placeholder      |
| `(modals)/profile.tsx`  | User settings         | Integrations, stats, sign out, dismiss button         |
| `chat.tsx`              | AI assistant          | Chat with Parker for trail recommendations            |

## Modal Presentation

Most modals use `transparentModal` with `fade` animation (default from modals `_layout.tsx`):

- Background screen remains visible (dimmed)
- Modal content slides/fades in
- Tap outside or swipe to dismiss

**Exception:** Profile modal uses `presentation: "modal"` with `slide_from_bottom` animation -- it slides up as a card modal with opaque background.

## Provider Hierarchy

Order matters - defined in `_layout.tsx`:

```
GestureHandlerRootView
  └── HeroUINativeProvider
      └── ThemeProvider
          └── AuthProvider
              └── BottomSheetModalProvider
                  └── RootLayoutNav
```

## Adding New Screens

### New Tab Screen

1. Create `app/(tabs)/new-screen.tsx`
2. Add `<MaterialTopTabs.Screen>` entry in `app/(tabs)/_layout.tsx`
3. Choose icon from `lucide-react-native`

### New Modal

1. Create `app/(modals)/new-modal.tsx`
2. Add `<Stack.Screen>` entry in `app/(modals)/_layout.tsx`
3. Navigate with `router.push("/(modals)/new-modal")`

### New Full-Screen Route

1. Create `app/new-route.tsx`
2. Add `<Stack.Screen>` entry in `app/_layout.tsx` with presentation options


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>