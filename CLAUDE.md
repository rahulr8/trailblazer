# Trailblazer React Native

BC Parks outdoor activity tracking app built with Expo, HeroUI Native, and Uniwind.

## Tech Stack

- **Framework**: Expo 54 with Expo Router
- **Styling**: Uniwind (Tailwind CSS v4 for React Native)
- **Components**: HeroUI Native
- **Language**: TypeScript (strict mode)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Integrations**: Apple HealthKit

## Commands

```bash
bunx expo start          # Start dev server
bunx tsc --noEmit        # Type check (run before committing)
bunx expo export         # Build for production
```

## Project Structure

```
app/                    # Expo Router pages (see app/CLAUDE.md)
├── _layout.tsx         # Root layout (providers + auth routing)
├── (tabs)/             # Bottom tab navigation
└── (modals)/           # Modal screens
components/             # Reusable components (see components/CLAUDE.md)
contexts/               # React contexts (see contexts/CLAUDE.md)
hooks/                  # Custom React hooks (see hooks/CLAUDE.md)
lib/                    # Business logic
├── db/                 # Firestore operations (see lib/db/CLAUDE.md)
├── health/             # Apple Health integration (see lib/health/CLAUDE.md)
└── constants/          # Activity constants (see lib/constants/CLAUDE.md)
functions/              # Firebase Cloud Functions (see functions/CLAUDE.md)
firebase/               # Firebase config (see firebase/CLAUDE.md)
agents/                 # AI development agents (see agents/CLAUDE.md)
```

## Data Sources

Users sync activities from ONE source at a time:

| Source       | ID             | Description             |
| ------------ | -------------- | ----------------------- |
| Manual       | `manual`       | User-entered activities |
| Apple Health | `apple_health` | HealthKit workouts      |

Source configuration lives in `lib/constants/sources.ts` - single source of truth for colors, emojis, labels.

## Code Standards

### TypeScript

- Never use `any` - use `unknown`, generics, or proper types
- All function parameters and return types must be typed
- Use type inference where obvious, explicit types where it aids clarity
- Prefer `interface` for object shapes, `type` for unions/intersections

### Code Quality

- No unnecessary comments - code should be self-documenting
- No redundant comments like `// increment counter` above `counter++`
- Only comment complex business logic or non-obvious decisions
- DRY: Extract repeated logic into functions/hooks/components
- Single responsibility: One component/function does one thing
- Avoid premature abstraction - wait for 3+ repetitions before extracting

### Logic Centralization & DRY

Write declarative, centralized code. Before writing any logic, search for existing implementations:

**Helper Functions**: Extract repeated logic into standalone functions

```typescript
// BAD: Same error detection logic in multiple places
const isAuthError = msg.includes("denied") || msg.includes("Code=5");

// GOOD: Single helper function, used everywhere
function isHealthKitAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("denied") || message.includes("Code=5");
}
```

**Shared Operations**: Centralize database/API operations

```typescript
// BAD: Same Firestore update in 3 places
await updateDoc(userRef, { healthConnection: deleteField() });

// GOOD: One function, reused everywhere
async function clearHealthConnection(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { healthConnection: deleteField() });
}
```

**Constants**: Single source of truth for magic values

```typescript
// BAD: Hardcoded strings scattered across files
if (source === "apple_health") { ... }

// GOOD: Constants file with all values
import { SOURCES } from "@/lib/constants";
if (source === SOURCES.APPLE_HEALTH) { ... }
```

**Before adding new code, ask:**

1. Does similar logic exist elsewhere in the codebase?
2. Can I extract a reusable helper function?
3. Is there a constants file this should live in?
4. Will this logic be needed in more than one place?

### Styling (Uniwind)

- Use `className` prop with Tailwind classes for styling
- Avoid inline `style` objects unless dynamic values are needed
- Use HeroUI Native components before creating custom ones

### Architecture

- Route-based modals: Use `router.push('/(modals)/...')` not context-based modals
- Dynamic routes for detail screens: `[id].tsx` pattern
- Keep navigation state in URLs, app state in contexts
- Colocate related code: component + types + utils in same directory

### Expo Router Auth Navigation

Expo Router maintains navigation state separately from conditional Stack rendering. Changing which screens are defined in `_layout.tsx` based on auth state does NOT automatically navigate the user.

**Always use explicit navigation after auth changes:**

- After sign in: `router.replace("/(tabs)")`
- After sign out: `router.replace("/login")`

Use `replace` (not `push`) to prevent back-navigation to invalid screens.

## Provider Hierarchy

Order matters - outermost to innermost in `app/_layout.tsx`:

1. `GestureHandlerRootView` (required for gestures)
2. `HeroUINativeProvider` (HeroUI theming)
3. `ThemeProvider` (app theme + colors)
4. `AuthProvider` (Firebase Auth state)
5. `BottomSheetModalProvider` (bottom sheet modals)

## Uniwind Setup Notes

- `global.css` must import in order: `tailwindcss`, `uniwind`, `heroui-native/styles`
- `@source` directive required for HeroUI: `@source './node_modules/heroui-native/lib'`
- Metro config: `withUniwindConfig` must be outermost wrapper
- Types auto-generated to `uniwind-types.d.ts` on first build

## HeroUI Native Components

Available: Button, TextField, Select, Checkbox, Radio, Switch, Avatar, Chip, Skeleton, Spinner, Card, Divider, Dialog, Popover, Toast, Accordion, Tabs, Surface

Import from: `import { Button, Card } from 'heroui-native'`

## Document updates

Anytime you update a folder (like components, db, functions, lib, etc.) make sure to update the `CLAUDE.md` file within that folder so that all subsequent Claude code sessions has the most up-to-date context on what is going on with the app.

## Anti-Patterns to Avoid

- Don't use `any` type
- Don't write obvious comments
- Don't create abstractions for single-use code
- Don't mix StyleSheet and className on same element
- Don't use context for modal state (use routes)
- Don't skip type checking before commits
