# Contexts Directory

React Context providers for global state management in Trailblazer+.

## Available Contexts

### AuthContext (`auth-context.tsx`)

Firebase Authentication state management.

```typescript
interface AuthContextValue {
  user: User | null;      // Firebase User object
  uid: string | null;     // Shorthand for user.uid
  isLoading: boolean;     // True while checking auth state
}

// Usage
const { user, uid, isLoading } = useAuth();
```

**Behavior**:
- Listens to `onAuthStateChanged` from Firebase
- Persists auth state via MMKV (see `lib/firebase.ts`)
- `isLoading` is true until initial auth check completes

### StravaContext (`strava-context.tsx`)

Strava OAuth flow management.

```typescript
interface StravaContextValue {
  initiateOAuth: () => Promise<void>;  // Start OAuth flow
  isConnecting: boolean;                // True during OAuth
  error: string | null;                 // OAuth error message
}

// Usage
const { initiateOAuth, isConnecting, error } = useStrava();
```

**Behavior**:
- Opens Strava OAuth in system browser via `expo-web-browser`
- On success, calls Cloud Function `stravaTokenExchange` to store tokens
- Does NOT manage connection status - use `useStravaConnection` hook for that

### ThemeContext (`theme-context.tsx`)

Light/dark theme management with persistence.

```typescript
interface ThemeContextValue {
  colorScheme: "light" | "dark";
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  isDark: boolean;
  colors: ColorTokens;    // Theme-aware color palette
  shadows: ShadowTokens;  // Theme-aware shadows
  gradients: GradientTokens; // Theme-aware gradients
}

// Usage
const { isDark, colors, toggleColorScheme } = useTheme();
```

**Behavior**:
- Persists preference to AsyncStorage
- Falls back to system preference on first launch
- Provides pre-computed `colors`, `shadows`, `gradients` for current theme

## Provider Hierarchy

Order is critical - defined in `app/_layout.tsx`:

```typescript
<GestureHandlerRootView>
  <HeroUINativeProvider>
    <ThemeProvider>
      <AuthProvider>
        <StravaProvider>
          <BottomSheetModalProvider>
            {children}
          </BottomSheetModalProvider>
        </StravaProvider>
      </AuthProvider>
    </ThemeProvider>
  </HeroUINativeProvider>
</GestureHandlerRootView>
```

**Why this order?**
1. `GestureHandlerRootView` - Required for gesture handling (React Native Gesture Handler)
2. `HeroUINativeProvider` - HeroUI theming (needs gesture handler)
3. `ThemeProvider` - App theme (provides colors to subsequent providers)
4. `AuthProvider` - Auth state (needed by StravaProvider)
5. `StravaProvider` - Strava OAuth (depends on auth state)
6. `BottomSheetModalProvider` - Bottom sheet modals

## Creating New Contexts

Follow this pattern:

```typescript
import { createContext, useContext, ReactNode } from "react";

interface MyContextValue {
  // Define your context shape
}

const MyContext = createContext<MyContextValue | null>(null);

export function MyProvider({ children }: { children: ReactNode }) {
  // Implement provider logic
  return (
    <MyContext.Provider value={/* your value */}>
      {children}
    </MyContext.Provider>
  );
}

export function useMy(): MyContextValue {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMy must be used within MyProvider");
  }
  return context;
}
```

## Context vs Hook Pattern

| Use Context When | Use Hook When |
|------------------|---------------|
| State shared across many components | State local to one component tree |
| Auth, theme, global settings | Data fetching, API calls |
| Provider hierarchy matters | No provider needed |

**Examples**:
- `AuthContext` - auth state used everywhere
- `useStravaConnection` - hook that reads Firestore, not context
- `useHealthConnection` - hook that interacts with HealthKit, not context
