# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
trailblazer/
├── app/                    # Expo Router pages and route configuration
│   ├── _layout.tsx         # Root layout (provider setup + auth routing)
│   ├── login.tsx           # Login screen with OAuth sign-in
│   ├── chat.tsx            # Full-screen AI chat with Parker
│   ├── (tabs)/             # Bottom tab navigation (authenticated)
│   │   ├── _layout.tsx     # Tab bar configuration with icons
│   │   ├── index.tsx       # Home dashboard (stats, activities, health connection)
│   │   ├── explore.tsx     # BC Parks adventure discovery
│   │   ├── rewards.tsx     # Rewards store and partner offers
│   │   └── profile.tsx     # User settings and integrations
│   └── (modals)/           # Modal screens (transparent overlay, fade animation)
│       ├── _layout.tsx     # Modal presentation config
│       ├── log-activity.tsx # Manual activity logging form
│       ├── badge-detail.tsx # Badge detail view
│       ├── reward-detail.tsx# Reward detail and redemption
│       ├── upgrade.tsx     # Platinum membership upgrade CTA
│       ├── giveaway.tsx    # Marketing giveaway
│       └── reset-challenge.tsx # Challenge reset confirmation
│
├── components/             # Reusable UI components
│   ├── ActivityListItem.tsx     # Single activity row component
│   ├── ActivitySourceCard.tsx   # Source-specific activity display
│   ├── ConnectionStatusBox.tsx  # Apple Health connection status UI
│   ├── SocialAuthButtons.tsx    # Google/Apple sign-in buttons
│   ├── external-link.tsx        # External link opener
│   ├── haptic-tab.tsx          # Tab bar button with haptic feedback
│   ├── hello-wave.tsx          # Greeting animation component
│   └── ui/                      # Primitive UI components
│       ├── icon-symbol.tsx      # SF Symbols icon renderer
│       └── icon-symbol.ios.tsx  # iOS-specific icon implementation
│
├── contexts/               # React Context providers for global state
│   ├── auth-context.tsx    # Firebase Auth state (user, uid, isLoading)
│   └── theme-context.tsx   # Light/dark theme with color tokens
│
├── hooks/                  # Custom React hooks
│   ├── use-color-scheme.ts # Get system color scheme preference
│   └── use-color-scheme.web.ts # Web implementation
│
├── lib/                    # Core business logic and utilities
│   ├── firebase.ts         # Firebase initialization (auth, firestore, MMKV persistence)
│   ├── storage.ts          # MMKV storage for auth persistence
│   ├── data.ts             # Data fixtures or helpers
│   ├── utils.ts            # General utilities
│   │
│   ├── db/                 # Firestore operations (data access layer)
│   │   ├── index.ts        # Barrel export of all database modules
│   │   ├── types.ts        # TypeScript interfaces (User, Activity, etc.)
│   │   ├── utils.ts        # Collection paths, query helpers, timestamp conversion
│   │   ├── users.ts        # User CRUD, stats, streaks
│   │   ├── activities.ts   # Activity logging, queries, batch operations
│   │   ├── savedAdventures.ts # Saved adventure operations
│   │   └── chatLogs.ts     # Chat conversation persistence
│   │
│   ├── health/             # Apple HealthKit integration (client-side sync)
│   │   ├── index.ts        # Exports
│   │   ├── config.ts       # HealthKit permissions, workout type mapping
│   │   ├── hooks.ts        # useHealthConnection hook (connection state + sync)
│   │   └── sync.ts         # Workout query and Firestore storage
│   │
│   └── constants/          # Shared constants and configuration
│       ├── index.ts        # Barrel export
│       ├── activity.ts     # Activity types, step calculations, sync defaults
│       └── sources.ts      # Activity source config (colors, emojis, labels)
│
├── firebase/               # Firebase configuration
│   └── [config files]      # Firebase security rules, indexes (managed by firebase CLI)
│
├── functions/              # Firebase Cloud Functions (backend)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts        # Cloud Function exports (currently minimal)
│   │   └── utils/
│   │       └── encryption.ts # AES-256-GCM token encryption
│   └── .env               # Encryption keys (never committed)
│
├── constants/              # App-level constants (separate from lib/constants)
│   └── [values used in app/ screens]
│
├── assets/                 # Static assets
│   └── images/            # PNG, SVG, etc.
│
├── ios/                    # Native iOS project (Xcode)
│   └── Trailblazer.xcodeproj
│
├── .claude/                # Claude Code workspace files
│   ├── designs/           # UI mockups and design references
│   └── plans/             # Implementation plans
│
├── .planning/codebase/     # GSD codebase analysis documents
│   ├── ARCHITECTURE.md     # This layer structure and data flow
│   ├── STRUCTURE.md        # Directory layout and file organization
│   └── [other codebase docs]
│
├── app.json                # Expo configuration (name, version, plugins)
├── babel.config.js         # Babel configuration for Expo
├── metro.config.js         # Metro bundler config (Uniwind integration)
├── tsconfig.json           # TypeScript configuration (strict mode)
├── eslint.config.js        # ESLint configuration
├── .prettierrc             # Prettier formatting config
├── package.json            # Dependencies and npm scripts
├── package-lock.json       # Locked dependency versions
├── firebase.json           # Firebase project reference
├── eas.json               # Expo Application Services (EAS) config
└── README.md              # Project documentation
```

## Directory Purposes

**`app/`**
- Purpose: Expo Router file-based routing and screen definitions
- Contains: Route files (.tsx), layout wrappers, modal definitions
- Key files: `_layout.tsx` (root provider setup), `login.tsx`, `(tabs)/_layout.tsx` (tab configuration)

**`components/`**
- Purpose: Reusable React Native UI components
- Contains: Screen components, HeroUI Native wrappers, visual components
- Key files: `ActivitySourceCard.tsx` (source-specific styling), `ConnectionStatusBox.tsx` (health status)

**`contexts/`**
- Purpose: React Context providers for global state
- Contains: Auth state, theme state, color/shadow/gradient tokens
- Key files: `auth-context.tsx` (Firebase auth listener), `theme-context.tsx` (theme persistence)

**`hooks/`**
- Purpose: Custom React hooks for reusable logic
- Contains: Platform-specific color scheme detection
- Key files: `use-color-scheme.ts` (system preference)

**`lib/db/`**
- Purpose: Firestore database operations (CRUD, queries, batch operations)
- Contains: Type definitions, collection paths, user/activity/adventure functions
- Key files: `types.ts` (interfaces), `activities.ts` (activity logging), `users.ts` (stats, streaks)

**`lib/health/`**
- Purpose: Apple HealthKit integration for syncing workouts
- Contains: HealthKit permission requests, workout mapping, sync logic
- Key files: `hooks.ts` (useHealthConnection), `sync.ts` (query and store workouts)

**`lib/constants/`**
- Purpose: Shared constants and configuration values
- Contains: Activity type mappings, step calculations, source configuration
- Key files: `sources.ts` (source colors/emojis/labels), `activity.ts` (step constants)

**`firebase/`**
- Purpose: Firebase configuration and security rules
- Contains: Firestore indexes, security rules, service account configs
- Generated/managed by Firebase CLI

**`functions/`**
- Purpose: Firebase Cloud Functions (backend/server-side logic)
- Contains: Function definitions, environment configuration, utilities
- Current state: Minimal (bootstrap only, functions to be added)

**`constants/`**
- Purpose: App-level constants used across screens
- Contains: Spacing, border radius, and other design tokens
- Key files: Index re-exports constants from submodules

**`assets/`**
- Purpose: Static media files
- Contains: Images, icons, fonts
- Key files: `images/` subdirectory for PNG/SVG assets

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout - initializes all providers and auth routing
- `app/login.tsx`: Unauthenticated entry point - OAuth sign-in buttons
- `app/(tabs)/index.tsx`: Authenticated home dashboard

**Configuration:**
- `app.json`: Expo configuration, HealthKit plugin setup, EAS config
- `tsconfig.json`: TypeScript strict mode, path aliases (@/)
- `metro.config.js`: Uniwind CSS setup, Metro bundler config
- `.env`: API keys and secrets (never committed)

**Core Logic:**
- `lib/db/activities.ts`: Activity logging and queries
- `lib/db/users.ts`: User stats and streak management
- `lib/health/hooks.ts`: useHealthConnection for HealthKit integration
- `lib/constants/sources.ts`: Single source of truth for activity source configuration

**Testing:**
- Test files would follow naming pattern `[module].test.ts` or `[module].spec.tsx`
- Currently: No test files in repo

## Naming Conventions

**Files:**
- Screen files: kebab-case (e.g., `log-activity.tsx`, `reset-challenge.tsx`)
- Component files: PascalCase (e.g., `ActivitySourceCard.tsx`, `ConnectionStatusBox.tsx`)
- Hook files: kebab-case with `use-` prefix (e.g., `use-color-scheme.ts`)
- Utility files: kebab-case or camelCase (e.g., `external-link.tsx`, `config.ts`)
- Platform-specific: `.ios.ts`, `.android.ts`, `.web.ts` suffixes (e.g., `icon-symbol.ios.tsx`)

**Directories:**
- Route groups: parentheses, kebab-case (e.g., `(tabs)`, `(modals)`)
- Feature modules: kebab-case (e.g., `lib/health/`, `app/(modals)/`)
- Private modules: underscore prefix (e.g., `_vscode/`, `.claude/`)

**Functions & Variables:**
- Hooks: camelCase with `use` prefix (e.g., `useHealthConnection`, `useTheme`)
- React components: PascalCase (e.g., `ActivitySourceCard`, `HapticTab`)
- Utilities: camelCase (e.g., `calculateSteps`, `mapWorkoutType`)
- Types/Interfaces: PascalCase (e.g., `ActivitySource`, `UserStats`)
- Constants: UPPER_SNAKE_CASE (e.g., `STEPS_PER_KM`, `DEFAULT_SYNC_DAYS`)

**Exports:**
- Barrel files: `index.ts` re-exports all named exports (e.g., `lib/db/index.ts`, `lib/health/index.ts`)
- Re-export pattern: `export * from "./module"` rather than individual exports

## Where to Add New Code

**New Feature (e.g., badges, challenges):**
- Primary code: `lib/db/badges.ts` (CRUD), `lib/constants/badges.ts` (configuration)
- Screen: `app/(tabs)/badges.tsx` (new tab) or modal in `app/(modals)/badge-detail.tsx`
- Components: `components/BadgeCard.tsx`, `components/BadgeGrid.tsx`
- Tests: `lib/db/badges.test.ts`

**New Component/Module:**
- Implementation: `components/MyComponent.tsx`
- Export in barrel: Check if `components/index.ts` exists; add export
- Usage: Import via `@/components/MyComponent`

**Utilities:**
- Shared helpers: `lib/utils.ts` (general) or feature-specific (e.g., `lib/health/sync.ts`)
- Constants: `lib/constants/` (shared across app) or colocated in module
- Type definitions: `lib/db/types.ts` (data models) or colocated

**New Data Model:**
- Types: `lib/db/types.ts`
- CRUD: `lib/db/[model].ts` (new file)
- Constants: `lib/constants/` (if shared, else inline)
- Export: Add to `lib/db/index.ts`

**New Context:**
- Create: `contexts/my-context.tsx`
- Provider: Implement provider component
- Hook: Export `useMy()` hook
- Integration: Add to provider hierarchy in `app/_layout.tsx`

**New Screen/Route:**
- Tab screen: `app/(tabs)/new-tab.tsx`, add to `app/(tabs)/_layout.tsx`
- Modal: `app/(modals)/new-modal.tsx`, add to `app/(modals)/_layout.tsx`
- Full-screen: `app/new-route.tsx`, add to `app/_layout.tsx`

## Special Directories

**`.claude/`**
- Purpose: Claude Code development workspace
- Generated: Yes (by Claude)
- Committed: Yes (stores design mockups and plans)
- Contents: UI designs (`designs/`), implementation plans (`plans/`)

**`.planning/codebase/`**
- Purpose: GSD codebase analysis and architecture documentation
- Generated: Yes (by GSD mapping commands)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**`.expo/`**
- Purpose: Expo CLI cache and configuration
- Generated: Yes (by Expo)
- Committed: No (in .gitignore)
- Contents: Build artifacts, cache, prebuild configs

**`ios/`**
- Purpose: Native iOS project files
- Generated: Yes (by `npx expo prebuild` or EAS Build)
- Committed: Yes (Xcode project stored in git)
- Contents: Swift code, native modules, signing certificates

---

*Structure analysis: 2026-01-27*
