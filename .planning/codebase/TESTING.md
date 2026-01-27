# Testing Patterns

**Analysis Date:** 2026-01-27

## Test Framework

**Status:** No testing framework is currently configured in this codebase.

**Runner:**
- Not detected

**Assertion Library:**
- Not detected

**Run Commands:**
- Not configured

## Current Testing Approach

The codebase currently relies on:

1. **Manual testing via Expo** - Type checking and visual testing on device/simulator
2. **Type safety** - TypeScript strict mode catches many issues at compile time
3. **Type checking before commits** - Enforced via: `npm run typecheck`
4. **Integration testing via manual workflows** - Testing auth flow, data sync, etc. manually

## Recommended Testing Structure (for future implementation)

When testing is added to the project, follow this structure:

### Test File Organization

**Colocated pattern (recommended):**

```
lib/
├── db/
│   ├── activities.ts
│   ├── activities.test.ts      # Test file next to implementation
│   ├── users.ts
│   └── users.test.ts
├── health/
│   ├── sync.ts
│   └── sync.test.ts
└── constants/
    ├── activity.ts
    └── activity.test.ts

components/
├── ActivityListItem.tsx
└── ActivityListItem.test.tsx
```

**Naming:** `{module}.test.ts` or `{module}.spec.ts` (prefer `.test.ts` for consistency)

### Test Structure Pattern

Based on codebase conventions, tests should follow this structure:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
// or jest.describe, jest.it for Jest

describe("logActivity", () => {
  // Setup - prepare shared state/mocks
  let uid: string;
  let mockDb: MockFirestore;

  beforeEach(() => {
    uid = "test-uid-123";
    mockDb = createMockFirestore();
  });

  afterEach(() => {
    cleanup();
  });

  // Happy path tests
  it("should create activity document with correct source", async () => {
    const input = { type: "run", distance: 5, duration: 1800, location: "Vancouver" };
    const docId = await logActivity(uid, input);

    expect(docId).toBeDefined();
    expect(mockDb.activities[uid][docId].source).toBe("manual");
  });

  it("should increment user stats after logging activity", async () => {
    const input = { type: "hike", distance: 10, duration: 3600, location: null };
    await logActivity(uid, input);

    const stats = await getUserStats(uid);
    expect(stats.totalKm).toBeGreaterThan(0);
    expect(stats.totalMinutes).toBeGreaterThan(0);
  });

  // Error cases
  it("should handle invalid input gracefully", async () => {
    const invalidInput = { type: "", distance: -5, duration: 0, location: null };

    expect(() => logActivity(uid, invalidInput)).rejects.toThrow();
  });

  // Edge cases
  it("should handle activities less than 1 minute", async () => {
    const input = { type: "walk", distance: 0.1, duration: 30, location: null };
    await logActivity(uid, input);

    const activities = await getUserActivities(uid);
    expect(activities).toHaveLength(1);
  });
});
```

**Assertion style:** Use `expect()` syntax (Vitest/Jest standard)

### Mocking Strategy

#### What to Mock

1. **Firestore operations** - Database access (never hit real DB in tests)
2. **Firebase Auth** - Authentication (mock auth state changes)
3. **HealthKit** - iOS native module (doesn't run in Node.js tests)
4. **Expo Router** - Navigation (mock router.push, router.replace)
5. **Console methods** - If testing logging behavior

#### What NOT to Mock

1. **Utility functions** - Functions like `formatDate()`, `calculateSteps()` should be tested as-is
2. **Type transformations** - `timestampToDate()` should run with real Date objects
3. **Constants** - `SOURCE_CONFIG`, `STEP_COUNTING_ACTIVITIES` should be real
4. **Helper functions** - Internal helpers like `getStartOfWeek()` should not be mocked

#### Mock Examples

**Firestore mock pattern:**

```typescript
import { vi } from "vitest";
import { collection, addDoc, getDocs } from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(async (ref, data) => ({
    id: `doc-${Date.now()}`,
    path: `users/test-uid/activities/${Date.now()}`,
  })),
  getDocs: vi.fn(async () => ({
    docs: [],
    empty: true,
  })),
  // ... other firestore functions
}));
```

**React component mock pattern:**

```typescript
import { vi } from "vitest";
import { router } from "expo-router";

vi.mock("expo-router", () => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  },
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}));

// In test
expect(router.replace).toHaveBeenCalledWith("/(tabs)");
```

**HealthKit mock pattern:**

```typescript
import { vi } from "vitest";

vi.mock("@kingstinct/react-native-healthkit", async () => ({
  queryWorkoutSamples: vi.fn(async () => [
    {
      uuid: "test-uuid-123",
      workoutActivityType: "running",
      startDate: new Date("2026-01-20"),
      duration: { quantity: 1800 },
    },
  ]),
  requestAuthorization: vi.fn(async () => true),
  WorkoutActivityType: { running: "HKWorkoutActivityTypeRunning" },
}));
```

### Test Coverage Areas

#### Unit Tests

**Database operations** - Test each function in `lib/db/`:

```typescript
describe("activities.ts", () => {
  describe("logActivity", () => {
    // Test creation, stat updates, streak updates
  });

  describe("getUserActivities", () => {
    // Test filtering, ordering, limiting
  });

  describe("getActivityCountBySource", () => {
    // Test source-based counting
  });

  describe("deleteActivitiesBySource", () => {
    // Test deletion and return count
  });
});

describe("users.ts", () => {
  describe("incrementUserStats", () => {
    // Test stat increments
  });

  describe("updateStreak", () => {
    // Test streak calculation
  });
});
```

**Utility functions** - Test helpers in `lib/`:

```typescript
describe("calculateSteps", () => {
  it("should return 0 steps for non-step-counting activities", () => {
    expect(calculateSteps("bike", 10)).toBe(0);
  });

  it("should calculate steps for run/hike/walk", () => {
    const steps = calculateSteps("run", 10);
    expect(steps).toBe(13000); // 10km * 1300 steps/km
  });

  it("should handle rounding", () => {
    const steps = calculateSteps("hike", 5.5);
    expect(steps).toBeCloseTo(7150, 0);
  });
});

describe("formatDate", () => {
  it("should format date as Mon D, YYYY", () => {
    const date = new Date("2026-01-27");
    expect(formatDate(date)).toBe("Jan 27, 2026");
  });
});
```

**Constants and configuration** - Test sources and activity types:

```typescript
describe("SOURCE_CONFIG", () => {
  it("should have all required properties", () => {
    Object.values(SOURCE_CONFIG).forEach((config) => {
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("colorLight");
      expect(config).toHaveProperty("emoji");
      expect(config).toHaveProperty("label");
    });
  });

  it("should have valid hex colors", () => {
    Object.values(SOURCE_CONFIG).forEach((config) => {
      expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});
```

#### Integration Tests

**Health sync flow** - Test Apple Health sync end-to-end:

```typescript
describe("Apple Health Sync Flow", () => {
  it("should sync workouts from HealthKit to Firestore", async () => {
    // 1. Mock HealthKit to return test workouts
    // 2. Call syncHealthWorkouts(uid)
    // 3. Verify activities stored in Firestore
    // 4. Verify user stats updated
    // 5. Verify lastSyncAt timestamp set
  });

  it("should skip duplicate workouts by externalId", async () => {
    // 1. Create activity in Firestore with externalId
    // 2. Mock HealthKit to return same workout
    // 3. Call syncHealthWorkouts(uid)
    // 4. Verify activity count unchanged (duplicate skipped)
  });

  it("should handle HealthKit permission denied", async () => {
    // 1. Mock HealthKit to throw authorization error
    // 2. Call syncHealthWorkouts(uid)
    // 3. Verify error is caught and user is disconnected
    // 4. Verify healthConnection.isAuthorized = false
  });
});
```

**Auth flow** - Test login/signup:

```typescript
describe("Authentication Flow", () => {
  it("should create Firestore user after Firebase signup", async () => {
    // 1. Mock Firebase createUserWithEmailAndPassword
    // 2. Call signup handler
    // 3. Verify createUser() called with correct uid and data
    // 4. Verify router.replace("/(tabs)") called
  });

  it("should display user-friendly error on auth failure", async () => {
    // 1. Mock Firebase with specific error code
    // 2. Simulate login attempt
    // 3. Verify error message matches getFirebaseErrorMessage mapping
    // 4. Verify error state updated in component
  });
});
```

#### Component Tests

For components, test props and state changes:

```typescript
import { render, screen } from "@testing-library/react-native";

describe("ActivityListItem", () => {
  it("should render activity name", () => {
    const activity = {
      id: "1",
      source: "manual" as const,
      externalId: null,
      type: "run",
      distance: 5,
      duration: 1800,
      location: "Vancouver",
      date: new Date(),
    };

    render(<ActivityListItem activity={activity} />);
    expect(screen.getByText("Run")).toBeOnTheScreen();
  });

  it("should format distance with 1 decimal place", () => {
    const activity = { ...baseActivity, distance: 5.234 };
    render(<ActivityListItem activity={activity} />);
    expect(screen.getByText(/5\.2 km/)).toBeOnTheScreen();
  });

  it("should use correct source colors", () => {
    const activity = { ...baseActivity, source: "apple_health" as const };
    const { getByTestId } = render(<ActivityListItem activity={activity} />);

    const iconBg = getByTestId("activity-icon");
    expect(iconBg.props.style.backgroundColor).toBe("#007AFF20");
  });
});
```

### Async Testing Pattern

```typescript
it("should handle async operations", async () => {
  // Use async/await
  const result = await logActivity(uid, input);
  expect(result).toBeDefined();
});

it("should reject on error", async () => {
  // Test promise rejection
  expect(logActivity(uid, invalidInput)).rejects.toThrow("Invalid input");
});
```

### Error Testing Pattern

```typescript
describe("error handling", () => {
  it("should throw on missing parameters", () => {
    expect(() => logActivity("", input)).toThrow();
  });

  it("should catch and map Firebase errors", async () => {
    // Mock Firebase to throw auth/user-not-found
    expect(signInUser("test@example.com", "password"))
      .rejects
      .toThrow("No account found with this email");
  });

  it("should handle network errors gracefully", async () => {
    // Mock network error
    const result = await syncHealthWorkouts(uid);
    expect(result).toEqual({ syncedCount: 0, skippedCount: 0 });
  });
});
```

## Coverage Goals

**Recommended coverage targets (once testing is added):**

- `lib/db/` - 90%+ coverage (core data operations)
- `lib/health/` - 85%+ coverage (integration with HealthKit)
- `lib/constants/` - 100% coverage (configuration)
- `components/` - 70%+ coverage (UI components)
- `contexts/` - 80%+ coverage (state management)
- `lib/utils.ts` - 100% coverage (utility functions)

## Type Checking (Current Test Substitute)

Until a testing framework is added, type safety is the primary defense:

**Required before every commit:**

```bash
npm run typecheck
```

This command:
- Compiles all TypeScript files
- Catches type mismatches
- Verifies all imports
- Ensures function signatures are correct
- Detects unused variables with `noUnusedLocals`

**Strict mode rules being enforced:**
- `strict: true` in `tsconfig.json`
- No implicit `any`
- No implicit `this`
- Strict null checks
- Strict function types

## Recommended Testing Framework

When ready to implement testing:

**Jest vs Vitest:**

- **Jest**: Wide adoption, many libraries, slower startup
- **Vitest**: Faster, Vite-based, native ES modules (recommended for modern Expo projects)

**For React Native/Expo:**
- Use `@testing-library/react-native` for component testing
- Use `jest-mock-extended` or `vitest` for mocking

**Minimal config to start:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});

// package.json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

---

*Testing analysis: 2026-01-27*
