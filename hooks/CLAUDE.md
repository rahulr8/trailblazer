# Hooks Directory

Custom React hooks for Trailblazer+.

## Available Hooks

### useColorScheme (`use-color-scheme.ts`)

Re-exports React Native's `useColorScheme` for detecting system color scheme.

```typescript
import { useColorScheme } from "@/hooks/use-color-scheme";

const colorScheme = useColorScheme(); // "light" | "dark" | null
```

**Platform Variants**:
- `use-color-scheme.ts` - Default (re-exports from react-native)
- `use-color-scheme.web.ts` - Web-specific implementation

**Note**: For app theming, prefer `useTheme()` from `@/contexts/theme-context` which provides the full theme object including colors, shadows, and gradients.

## Integration Hooks (in lib/)

These hooks live in `lib/` with their related code, not in `hooks/`:

### useHealthConnection (`lib/health/hooks.ts`)
```typescript
const {
  isConnected,
  isLoading,
  isSyncing,
  lastSyncAt,
  error,
  connect,      // Request HealthKit permissions
  disconnect,   // Revoke connection
  sync,         // Sync workouts from Apple Health
} = useHealthConnection();
```

## Hook Naming Conventions

- Prefix with `use`
- Describe what the hook provides, not how it works
- Platform variants use `.ios.ts`, `.android.ts`, `.web.ts` suffixes

## Creating New Hooks

```typescript
import { useState, useEffect, useCallback } from "react";

export function useMyHook(param: string) {
  const [state, setState] = useState<MyType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup
    };
  }, [param]);

  const doAction = useCallback(async () => {
    // Action logic
  }, [/* dependencies */]);

  return { state, isLoading, error, doAction };
}
```

## Hook Location Guidelines

| Location | When to Use |
|----------|-------------|
| `hooks/` | Generic UI hooks, platform utilities |
| `lib/{feature}/hooks.ts` | Feature-specific hooks with related code |
| `components/` | Component-specific hooks (rare) |

**Colocate hooks with related code** - `useHealthConnection` lives in `lib/health/` because it uses HealthKit config, types, and sync functions.
