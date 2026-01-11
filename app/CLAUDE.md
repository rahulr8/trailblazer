# App Directory - Expo Router

Expo Router file-based routing for Trailblazer+.

## Route Structure

```
app/
├── _layout.tsx          # Root layout (providers + auth-based routing)
├── login.tsx            # Login screen (shown when no user)
├── chat.tsx             # Full-screen AI chat with Parker
├── (tabs)/              # Bottom tab navigation (authenticated)
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home - stats, challenge, activities
│   ├── explore.tsx      # BC Parks adventures grid
│   ├── rewards.tsx      # Rewards store
│   └── profile.tsx      # Settings, integrations, sign out
└── (modals)/            # Modal screens (transparent overlay)
    ├── _layout.tsx      # Modal presentation config
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

### Opening Modals
```typescript
import { router } from "expo-router";

// Open modal (transparent overlay with fade)
router.push("/(modals)/upgrade");
router.push("/(modals)/reward-detail");

// Close modal
router.back();
```

### Full-Screen Routes
```typescript
// Chat opens as full-screen modal with slide animation
router.push("/chat");
```

### Tab Navigation
Tabs handle their own navigation. Users switch via bottom tab bar with haptic feedback.

## Screen Responsibilities

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| `login.tsx` | Authentication | Google/Apple sign-in |
| `(tabs)/index.tsx` | Home dashboard | Stats, challenge progress, activity feed, connections |
| `(tabs)/explore.tsx` | Adventure discovery | BC Parks grid, difficulty levels |
| `(tabs)/rewards.tsx` | Rewards store | Partner offers, platinum upgrade CTA |
| `(tabs)/profile.tsx` | User settings | Integrations, stats, sign out |
| `chat.tsx` | AI assistant | Chat with Parker for trail recommendations |

## Modal Presentation

All modals use `transparentModal` with `fade` animation:
- Background screen remains visible (dimmed)
- Modal content slides/fades in
- Tap outside or swipe to dismiss

## Provider Hierarchy

Order matters - defined in `_layout.tsx`:

```
GestureHandlerRootView
  └── HeroUINativeProvider
      └── ThemeProvider
          └── AuthProvider
              └── StravaProvider
                  └── BottomSheetModalProvider
                      └── RootLayoutNav
```

## Adding New Screens

### New Tab Screen
1. Create `app/(tabs)/new-screen.tsx`
2. Add `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx`
3. Choose icon from `lucide-react-native`

### New Modal
1. Create `app/(modals)/new-modal.tsx`
2. Add `<Stack.Screen>` entry in `app/(modals)/_layout.tsx`
3. Navigate with `router.push("/(modals)/new-modal")`

### New Full-Screen Route
1. Create `app/new-route.tsx`
2. Add `<Stack.Screen>` entry in `app/_layout.tsx` with presentation options
