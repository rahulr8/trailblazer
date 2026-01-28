# App Directory - Expo Router

Expo Router file-based routing for Trailblazer.

## Route Structure

```
app/
├── _layout.tsx          # Root layout (providers + auth-based routing)
├── login.tsx            # Login screen (shown when no user)
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

## Auth-Based Routing

The root `_layout.tsx` conditionally renders screens based on auth state:

```typescript
// In RootLayoutNav:
if (isLoading) return <LoadingSpinner />;
if (!user) return <Stack><Stack.Screen name="login" /></Stack>;
return <Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="(modals)" options={{ presentation: "transparentModal" }} />
  <Stack.Screen name="chat" options={{ presentation: "fullScreenModal" }} />
</Stack>;
```

**Critical**: Expo Router maintains navigation state separately from screen definitions. After auth changes, use `router.replace()` to navigate:

- After sign in: `router.replace("/(tabs)")`
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
| `login.tsx`             | Authentication        | Google/Apple sign-in                                  |
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
