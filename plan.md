# Trailblazer+ React Native: Implementation Plan

---

## Phase 1: Uniwind Setup (Do First)

Uniwind provides Tailwind CSS v4 bindings for React Native - required by HeroUI Native.

### Step 1.1: Install Uniwind

```bash
npm install uniwind tailwindcss
```

### Step 1.2: Create global.css

Create `global.css` in project root:

```css
@import 'tailwindcss';
@import 'uniwind';
```

### Step 1.3: Configure Metro

Create/update `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// IMPORTANT: withUniwindConfig must be the outermost wrapper
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
```

### Step 1.4: Import in Root Layout

Update `app/_layout.tsx`:

```tsx
import '../global.css';
// ... rest of layout
```

### Step 1.5: Generate Types

Run `npx expo start` once to generate `uniwind-types.d.ts` for TypeScript support.

### Files to modify:
- `metro.config.js` (create/update)
- `global.css` (create)
- `app/_layout.tsx` (add import)

---

## Phase 2: HeroUI Native Setup (Do Second)

### Step 2.1: Install HeroUI Native + Missing Peer Dependencies

Already installed (from Expo template):
- ✅ react-native-screens@~4.16.0
- ✅ react-native-reanimated@~4.1.1
- ✅ react-native-gesture-handler@~2.28.0
- ✅ react-native-safe-area-context@~5.6.0
- ✅ react-native-worklets@0.5.1

Need to install:

```bash
npm install heroui-native react-native-svg@^15.12.1 @gorhom/bottom-sheet@^5 tailwind-variants@^3.1.0 tailwind-merge@^3.3.1
```

Optional (recommended for better keyboard handling):

```bash
npm install react-native-keyboard-controller
```

### Step 2.2: Update global.css

Add HeroUI Native styles:

```css
@import 'tailwindcss';
@import 'uniwind';
@import 'heroui-native/styles';

@source './node_modules/heroui-native/lib';
```

### Step 2.3: Configure Provider Hierarchy

Update `app/_layout.tsx`:

```tsx
import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <HeroUINativeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(modals)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

### Step 2.4: Verify Setup

Create a test component using HeroUI Native:

```tsx
import { Button } from 'heroui-native';
import { View } from 'react-native';

export default function TestScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Button onPress={() => console.log('Works!')}>
        HeroUI Native Works
      </Button>
    </View>
  );
}
```

### Files to modify:
- `package.json` (dependencies)
- `global.css` (add heroui imports)
- `app/_layout.tsx` (provider setup)

### Available HeroUI Native Components:
- **Form:** Button, TextField, Select, Checkbox, Radio, Switch, Form Field
- **Display:** Avatar, Chip, Skeleton, Spinner, Card, Divider
- **Overlay:** Dialog, Popover, Toast, Bottom Sheet
- **Layout:** Accordion, Tabs, Surface, Scroll Shadow

---

## Phase 3: Navigation Architecture (Expo Router)

### Decision: Keep Expo Router

Already configured. File-based routing with typed routes enabled.

### Route Structure

```
app/
├── _layout.tsx              # Root (GestureHandler + HeroUI Provider)
├── (tabs)/
│   ├── _layout.tsx          # Bottom tabs
│   ├── index.tsx            # Home
│   ├── explore.tsx          # Adventures
│   ├── rewards.tsx          # Rewards
│   └── profile.tsx          # Profile
├── (modals)/
│   ├── _layout.tsx          # Modal stack (presentation: 'modal')
│   ├── log-activity.tsx
│   ├── activity/[id].tsx
│   ├── reward/[id].tsx
│   ├── notifications.tsx
│   ├── upgrade.tsx
│   ├── badge/[id].tsx
│   ├── reset-challenge.tsx
│   └── giveaway.tsx
├── chat.tsx                 # Full-screen Parker AI
└── login.tsx                # Auth flow
```

### Route-Based Modals Pattern

```tsx
// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="log-activity" options={{ title: 'Log Activity' }} />
      <Stack.Screen name="reward/[id]" options={{ title: 'Reward' }} />
      {/* ... */}
    </Stack>
  );
}
```

Opening modals:
```tsx
import { router } from 'expo-router';
router.push('/(modals)/log-activity');
```

---

## Phase 4: Theme & Design System

### Translate PWA Theme to HeroUI Native

The PWA uses CSS variables. HeroUI Native uses Tailwind + CSS variables via Uniwind.

Map PWA colors to Tailwind config or CSS variables in `global.css`:

```css
@import 'tailwindcss';
@import 'uniwind';
@import 'heroui-native/styles';

@source './node_modules/heroui-native/lib';

/* Custom theme colors (matching PWA) */
:root {
  --color-primary: #00f2ff;
  --color-accent: #2aff5d;
  --color-highlight: #ffaa00;
  --color-purple: #bf5af2;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #050505;
    --color-foreground: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --color-background: #f2f2f7;
    --color-foreground: #1c1c1e;
  }
}
```

---

## Summary: Implementation Order

1. **Uniwind** - Install, configure metro, create global.css
2. **HeroUI Native** - Install, add to global.css, set up providers
3. **Navigation** - Restructure app/ with (tabs) and (modals) groups
4. **Theme** - Port PWA design tokens to Uniwind/HeroUI
5. **Components** - Build screens using HeroUI Native components
6. **Firebase** - Set up auth and Firestore contexts
7. **Features** - Port activity tracking, Parker AI, rewards

---

## Resources

- [Uniwind Docs](https://docs.uniwind.dev/quickstart)
- [HeroUI Native GitHub](https://github.com/heroui-inc/heroui-native)
- [HeroUI Native Example](https://github.com/heroui-inc/heroui-native-example)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
