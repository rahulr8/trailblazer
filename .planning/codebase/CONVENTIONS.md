# Coding Conventions

**Analysis Date:** 2026-01-27

## Naming Patterns

### Files

**Components:**
- PascalCase for component files: `ActivityListItem.tsx`, `SocialAuthButtons.tsx`
- Describe the component's purpose clearly

**Functions and utilities:**
- camelCase for files: `activities.ts`, `auth-context.tsx`, `use-color-scheme.ts`
- Use kebab-case for feature directories and multi-word files

**Constants:**
- UPPER_SNAKE_CASE for exported constants: `STEP_COUNTING_ACTIVITIES`, `DEFAULT_SYNC_DAYS`, `SOURCE_CONFIG`
- Constants live in `lib/constants/` as single source of truth

### Functions

- camelCase: `logActivity()`, `syncHealthWorkouts()`, `incrementUserStats()`
- Utility functions named for what they do: `calculateSteps()`, `formatDate()`, `timestampToDate()`
- Async functions are normal camelCase: `async function getUserActivities()`
- Helper functions inside components/files use lowercase: `getFirebaseErrorMessage()`, `mapWorkoutType()`

### Variables

- camelCase for all variables and state: `isConnected`, `isSyncing`, `lastSyncAt`, `syncedCount`
- State variables follow `is*` or `*At` patterns for clarity:
  - Booleans: `isConnected`, `isLoading`, `isSyncing`, `isDark`
  - Dates: `lastSyncAt`, `connectedAt`, `startedAt`
  - Counts/numbers: `syncedCount`, `skippedCount`, `totalKm`

### Types and Interfaces

- PascalCase for interfaces and types: `ActivityListItemProps`, `HealthConnection`, `UserDocument`, `SyncResult`
- Suffix patterns:
  - `*Document` for Firestore document types: `UserDocument`, `ActivityDocument`, `SavedAdventureDocument`
  - `*Input` for input parameters: `LogActivityInput`, `CreateUserInput`, `LogMessageInput`
  - `*Props` for component props: `ActivityListItemProps`, `SocialAuthButtonsProps`
  - No suffix for return types: `Activity`, `User`, `Message`
- Use `type` for unions/discriminated types, `interface` for object shapes

**Example type organization from `lib/db/types.ts`:**

```typescript
// Firestore document types
export interface UserDocument { ... }
export interface ActivityDocument { ... }

// Input types
export interface LogActivityInput { ... }

// Return types (converted from Firestore)
export interface Activity { ... }

// Union types
export type ActivitySource = "manual" | "apple_health";
```

## Code Style

### Formatting

- Tool: **Prettier** v3.7.4
- Config: `.prettierrc`
- Key settings:
  - Tab width: 2 spaces
  - Print width: 100 characters
  - Trailing commas: ES5 style (objects and arrays)
  - Semicolons: Always
  - Double quotes: Always
  - Arrow function parentheses: Always (even single param)

**Run formatting before commits:**

```bash
npm run format              # Format all files
npm run format:check       # Check without writing
```

### Linting

- Tool: **ESLint** v9.25.0
- Config: `eslint.config.js`
- Extends: `eslint-config-expo` + `eslint-config-prettier`
- Plugin: `@trivago/prettier-plugin-sort-imports`

**Type checking (required before commits):**

```bash
npm run typecheck          # Run tsc --noEmit
```

### Import Organization

**Order (enforced by prettier-plugin-sort-imports):**

1. React and React Native core: `import { useState } from "react";`
2. Expo packages: `import { router } from "expo-router";`
3. React Navigation: `import { ... } from "@react-navigation/native";`
4. HeroUI Native: `import { Button } from "heroui-native";`
5. Third-party packages: `import { clsx } from "clsx";`
6. Internal aliases (`@/*`): `import { useTheme } from "@/contexts/theme-context";`
7. Relative imports: `import { ... } from "../utils";`

**Groups are separated by blank lines for clarity.**

**Path alias used:**
- `@/*` maps to root directory (configured in `tsconfig.json`)
- Use `@/` for all internal imports (never relative paths)
- Examples: `@/lib/db`, `@/contexts`, `@/components`, `@/constants`

## Error Handling

### Pattern: Try-Catch with Type Narrowing

```typescript
// From login.tsx
try {
  await signInWithEmailAndPassword(auth, email.trim(), password);
  router.replace("/(tabs)");
} catch (err) {
  console.error("[Auth] Error:", err);
  if (err && typeof err === "object" && "code" in err) {
    setError(getFirebaseErrorMessage(err as AuthError));
  } else {
    setError(err instanceof Error ? err.message : "An error occurred");
  }
} finally {
  setLoading(false);
}
```

**Key practices:**

1. **Always have catch blocks** - State updates should happen in finally block
2. **Type-guard before casting** - Check structure before `as` casting
3. **Use instanceof Error for unknown types** - `err instanceof Error ? err.message : String(err)`
4. **Map library-specific errors** - Firebase errors have `code` property, map to user messages
5. **Log with context prefix** - `console.error("[Auth] Error:", err)` helps identify source
6. **Set error state for UI display** - Derived from error message, not raw error

### Error Display Pattern

```typescript
// From login.tsx
{error && (
  <View style={[styles.errorContainer, { backgroundColor: colors.danger + "15" }]}>
    <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
  </View>
)}
```

Errors are user-friendly messages stored in state, never raw error objects shown in UI.

## Logging

### Framework

Console logging with context prefixes.

### Patterns

**Prefix format:** `[FeatureName]` at start of log

**Examples from codebase:**

```typescript
// Auth logging
console.log("[Auth] State changed:", firebaseUser ? firebaseUser.uid : "null");
console.error("[Auth] Error:", err);

// Health integration logging
console.log("[Health] Fetching workouts since:", since.toISOString());
console.log("[Health] Found", workouts.length, "workouts");
console.error("[Health] Failed to fetch workouts:", error);

// Sync completion
console.log("[Health] Sync complete:", { syncedCount, skippedCount });
```

**When to log:**

- Auth state changes: `onAuthStateChanged`, sign in, sign out
- Async operation start/completion: HealthKit sync, Firestore queries
- Important state transitions: connection status changes
- Errors during critical operations

**What NOT to log:**

- UI state changes (too noisy)
- Individual re-renders
- Success of every database read
- Component lifecycle hooks unless critical

## Comments

### When to Comment

Only comment **why**, never **what**. Code should be self-documenting.

**Good comments:**

```typescript
// Get workout activity type name dynamically
// (Required because HealthKit activity type is a numeric constant, not a string)
const HealthKit = await import("@kingstinct/react-native-healthkit");
const activityTypeName = HealthKit.WorkoutActivityType[workout.workoutActivityType] || "Workout";
```

```typescript
// Try to get distance from workout statistics (try each type individually)
// Some HealthKit permission grants only certain distance types
let distanceKm = 0;
const distanceTypes = [
  "HKQuantityTypeIdentifierDistanceWalkingRunning",
  "HKQuantityTypeIdentifierDistanceCycling",
  "HKQuantityTypeIdentifierDistanceSwimming",
] as const;
```

**Bad comments (avoid):**

```typescript
// Set user to null  ❌ (obvious from code)
setUser(null);

// Increment counter  ❌ (obvious)
count++;

// Create activity document  ❌ (code already says this)
const docRef = await addDoc(activitiesRef, { ... });
```

### JSDoc/TSDoc

**Not used in this codebase.** Function signatures are explicit enough with TypeScript.

**Good type signatures replace documentation:**

```typescript
// Clear from signature what this does
export async function logActivity(
  uid: string,
  input: LogActivityInput
): Promise<string>

export async function getUserActivities(
  uid: string,
  options: QueryOptions = {}
): Promise<Activity[]>
```

## Function Design

### Size Guidelines

- Target: 20-40 lines
- Maximum: ~100 lines (consider breaking up)
- Single responsibility principle: one function does one thing

**Example from `lib/db/activities.ts`:**

```typescript
// 13 lines - focused on one task
export async function getRecentActivities(
  uid: string,
  limit: number = 3
): Promise<Activity[]> {
  return getUserActivities(uid, { limit, orderByDate: "desc" });
}
```

vs.

```typescript
// ~60 lines - handles sync, stats, streak updates
// (Appropriate because these are tightly coupled operations)
export async function syncHealthWorkouts(
  uid: string,
  since?: Date
): Promise<SyncResult> {
  // Ensure auth, fetch workouts, deduplicate, transform, store
}
```

### Parameters

- Max 3 positional parameters (use object destructuring for more)
- Always type all parameters
- Optional parameters use defaults: `limit: number = 3`
- Object parameters use destructuring in function signature when beneficial

**Good:**

```typescript
export async function getUserActivities(
  uid: string,
  options: QueryOptions = {}
): Promise<Activity[]>
```

**Also good - explicit object syntax:**

```typescript
export async function syncHealthWorkouts(
  uid: string,
  since?: Date
): Promise<SyncResult>
```

### Return Values

- Always type return values (never implicit)
- Single function purpose = single return type
- Async functions return `Promise<T>`

**Example return patterns:**

```typescript
// Single value
function formatDate(date: Date): string

// Multiple values (return object)
export async function syncHealthWorkouts(...): Promise<SyncResult>
// where SyncResult = { syncedCount, skippedCount }

// Array
export async function getUserActivities(...): Promise<Activity[]>

// Void for side-effects
async function clearHealthConnection(uid: string): Promise<void>
```

## Module Design

### Exports

**Named exports for everything,** no default exports

```typescript
// Good
export function logActivity(...) { }
export const SOURCE_CONFIG = { ... }

// Avoid
export default function ActivityForm() { }
```

**Reason:** Easier to find usages, clearer in imports

**Exception:** Context providers can use default export if that's the convention, but current codebase uses named exports:

```typescript
export function AuthProvider({ children }: ...) { }
export function useAuth(): ... { }
```

### Barrel Files

Used strategically in `lib/` modules to simplify imports:

**Example: `lib/constants/index.ts`**

```typescript
export { STEP_COUNTING_ACTIVITIES, calculateSteps, DEFAULT_SYNC_DAYS } from "./activity";
export { SOURCE_CONFIG, getSourceConfig } from "./sources";
```

**Usage simplification:**

```typescript
// Good - single import
import { calculateSteps, SOURCE_CONFIG } from "@/lib/constants";

// Avoid - direct submodule imports
import { calculateSteps } from "@/lib/constants/activity";
```

### Colocating Related Code

**Pattern from `lib/health/`:**

```
lib/health/
├── config.ts    # Configuration & helpers
├── hooks.ts     # useHealthConnection hook
├── sync.ts      # Sync logic
└── index.ts     # Barrel exports
```

Related code (configuration, hooks, main logic) lives in same directory.

**Pattern from `lib/db/`:**

```
lib/db/
├── types.ts      # All TypeScript interfaces
├── utils.ts      # Collection paths, helpers
├── activities.ts # Activity operations
├── users.ts      # User operations
└── index.ts      # Barrel exports
```

Database types are separate from operations for clarity.

## TypeScript

### Type Safety

- **Never use `any`** - use `unknown` or proper types
- All function parameters must be typed
- All return values must be typed (no implicit)
- Prefer type inference where obvious: `const user = getUser()` (return type is known)
- Explicit types where clarity helps: function parameters, complex state

### Strict Mode

Enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Before committing, always run:**

```bash
npm run typecheck
```

### Union Types

Use discriminated unions for type safety:

```typescript
// From types.ts
export type ActivitySource = "manual" | "apple_health";

// Used in discriminated checks
if (activity.source === "apple_health") {
  // TypeScript knows source properties here
}
```

## Code Organization Examples

### Component Structure

```typescript
// imports at top
import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/contexts/theme-context";

// interface for props
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

// helper functions
function formatValue(val: number): string {
  return val.toFixed(2);
}

// exported component
export function MyComponent({ title, onPress }: MyComponentProps) {
  const { colors } = useTheme();
  const [state, setState] = useState(false);

  // render
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

// styles at bottom
const styles = StyleSheet.create({
  container: { ... },
  title: { ... },
});
```

### Database Module Structure

```typescript
// types first
import { Activity, ActivityDocument, LogActivityInput } from "./types";

// helper/utility functions
function getStartOfWeek(date: Date): Date { ... }

// main operations (exported)
export async function logActivity(uid: string, input: LogActivityInput): Promise<string> { ... }
export async function getUserActivities(uid: string, options?: QueryOptions): Promise<Activity[]> { ... }

// related operations
export async function getRecentActivities(uid: string, limit?: number): Promise<Activity[]> { ... }
export async function getWeeklyActivityCount(uid: string): Promise<number> { ... }
```

---

*Convention analysis: 2026-01-27*
