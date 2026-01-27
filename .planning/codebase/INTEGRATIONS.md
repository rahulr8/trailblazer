# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**Authentication & OAuth:**
- Google Sign-In - User authentication via Google account
  - SDK/Client: `@react-native-google-signin/google-signin` ^14.0.0
  - Implementation: Native module, OAuth flow via Google
  - Status: Implemented (login screen supports Google button)

- Apple Sign-In - User authentication via Apple ID
  - SDK/Client: `expo-apple-authentication` ^8.0.8
  - Implementation: Native iOS Sign-In button
  - Status: Implemented (login screen supports Apple button)

**Health & Fitness Data:**
- Apple HealthKit - Workout data from iOS Health app
  - SDK/Client: `@kingstinct/react-native-healthkit` ^13.1.0
  - Auth: On-device HealthKit permission (no tokens, no cloud sync)
  - Data: Workouts synced directly from device to Firestore
  - Platform: iOS only (unavailable on Android)
  - Workout types mapped: running, hiking, cycling, walking, swimming, paddling, skiing, yoga, workouts
  - Implementation: Client-side only - user grants permission, app queries workouts, stores in Firestore
  - Connection tracking: `users/{uid}/healthConnection` document stores auth status and sync timestamps

## Data Storage

**Primary Database:**
- Firebase Firestore (NoSQL document database)
  - Connection: `lib/firebase.ts` initializes via `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - Client: `firebase/firestore` SDK (Web SDK for React Native)
  - Collections:
    - `users/{uid}` - User profiles, membership tier, stats, health connection status
    - `users/{uid}/activities` - Logged activities (manual and Apple Health synced)
    - `users/{uid}/savedAdventures` - Favorited BC Parks adventures
    - `conversations/{sessionId}` - AI chat sessions (Parker conversations)
    - `conversations/{sessionId}/messages` - Chat messages (future AI integration)
  - Security: Firestore Rules enforce user document isolation (`users/{uid}` only readable/writable by uid owner)
  - Persistence: Web SDK with MMKV adapter for React Native offline support
  - Indexes: Composite index required for activity queries (deployed via `firebase deploy --only firestore:indexes`)

**Authentication State Storage:**
- Firebase Auth (Web SDK)
  - Persistence: MMKV (`react-native-mmkv`) for offline token storage
  - Adapter: Custom MMKV wrapper in `lib/storage.ts` implements Firebase Auth storage interface
  - Auth tokens persisted with `getReactNativePersistence(mmkvStorage)` in `lib/firebase.ts`
  - Session lifecycle: Managed via `onAuthStateChanged` listener in `contexts/auth-context.tsx`

**User Preferences Storage:**
- React Native AsyncStorage 2.2.0
  - Usage: Theme preference (light/dark), app-level user settings
  - Implementation: `contexts/theme-context.tsx` persists theme choice

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication (custom + OAuth)
  - Email/Password: `signInWithEmailAndPassword()`, `createUserWithEmailAndPassword()` (app/login.tsx)
  - OAuth providers: Google and Apple (via native SDKs)
  - Session management: `onAuthStateChanged()` listener in AuthProvider
  - User object: Firebase User type with `uid`, `email`, `displayName`, `photoURL`
  - No external user database - user profile created in Firestore on first signup

**Social Login:**
- Google OAuth via `@react-native-google-signin/google-signin`
  - Flow: Native module handles OAuth token exchange with Google
  - Callback: Not yet implemented (placeholder in components/SocialAuthButtons.tsx)

- Apple Sign-In via `expo-apple-authentication`
  - Flow: Native iOS Sign-In button triggers system auth dialog
  - Callback: Not yet implemented (placeholder in components/SocialAuthButtons.tsx)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Bugsnag, or similar integration

**Logs:**
- Console logging via `console.log()` and `console.error()`
- Prefixed logs: `[Auth]`, `[Health]`, etc. for filtering
- Metro bundler shows logs during development
- Firebase Functions logs available via `firebase functions:log` CLI command
- No centralized error tracking or log aggregation configured

**Debugging:**
- Expo development server with Metro bundler logs
- Type checking: `npm run typecheck` runs TypeScript type checking
- Strict mode enabled - catches many errors at compile time

## CI/CD & Deployment

**Hosting:**
- Expo Application Services (EAS) - Managed builds and deployment
  - iOS builds compiled to App Store binaries
  - Android builds for Google Play
  - Config: `eas.json` defines build profiles (development, preview, production)

- Firebase Hosting - Optional (not currently configured for web)

**Deployment Tools:**
- Firebase CLI - Deploy Firestore rules, indexes, and Cloud Functions
  - `firebase deploy` - Deploy all (functions, Firestore rules, indexes)
  - `firebase deploy --only functions` - Deploy only Cloud Functions
  - `firebase deploy --only firestore:rules` - Deploy only security rules
  - `firebase deploy --only firestore:indexes` - Deploy only composite indexes

- Expo CLI (`npx expo`) - Local development and preview builds
  - `npx expo start` - Development server
  - `npx expo export` - Production build preparation
  - `eas build` - EAS managed builds (requires setup and GitHub connection)

**Build Scripts (package.json):**
- `npm run firebase:build` - Compile functions with TypeScript
- `npm run firebase:deploy` - Build and deploy functions
- `npm run firebase:deploy:all` - Deploy everything (functions + Firestore)

**Functions Deployment:**
- Separate `functions/` directory with `functions/package.json`
- Functions compiled to `functions/lib/` via `npm run build`
- Firebase Admin SDK initializes automatically via `firebase-functions` plugin
- Node.js 20 runtime requirement

## Environment Configuration

**Required env vars:**

**App-level (.env in root):**
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase Web API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (*.firebaseapp.com)
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Cloud Messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

**Functions-level (functions/.env):**
- `ENCRYPTION_KEY` - AES-256-GCM key (64 hex chars = 32 bytes) for sensitive data encryption

**Secrets location:**
- `.env` and `functions/.env` - Local files (never committed, listed in .gitignore)
- Production: Environment variables configured in EAS and Firebase Cloud Functions console

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Apple HealthKit sync - One-way data flow: HealthKit → App → Firestore (no webhooks)
- Firebase Auth state changes - Event listener (`onAuthStateChanged`) in client code
- Firestore database triggers - No Cloud Functions with database triggers currently deployed

## Data Flow Patterns

**User Authentication:**
1. User enters email/password or taps Google/Apple button
2. Firebase Auth verifies credentials
3. Firebase returns User object with UID
4. Auth state change triggers `onAuthStateChanged` listener
5. App navigates to `/(tabs)` if authenticated
6. Firestore document created at `users/{uid}` on first signup

**Activity Logging - Manual:**
1. User fills activity form in `log-activity` modal
2. Form posted to `logActivity()` function in `lib/db/activities.ts`
3. Activity document created in `users/{uid}/activities`
4. User stats automatically updated in `users/{uid}/stats`

**Activity Logging - Apple Health:**
1. User taps "Connect Apple Health" in profile
2. `initHealthKit()` requests HealthKit permissions (iOS system dialog)
3. On approval, connection saved to `users/{uid}/healthConnection`
4. Auto-sync effect triggers, calls `syncHealthWorkouts(uid)`
5. App queries 30 days of HealthKit workouts via `queryWorkoutSamples()`
6. Each workout deduplicated by `externalId` (HealthKit UUID)
7. Workouts stored in `users/{uid}/activities` with `source: "apple_health"`
8. Stats updated with distance and duration from all sources

**Conversation (Chat) - Future:**
- Documents structure prepared in Firestore:
  - `conversations/{sessionId}` - Session metadata
  - `conversations/{sessionId}/messages` - Message history
  - Security rules allow both authenticated and anonymous access
  - Real-time sync ready via Firestore listeners (not yet implemented in UI)

## Third-Party Libraries Integration Points

**Expo:**
- Manages native build pipeline
- OTA updates via `expo-updates` (not actively configured)
- Deep linking via `expo-linking`

**React Navigation:**
- Bottom tab navigation in `(tabs)/` route
- Modal navigation via transparent modal presentation
- Gesture handling via `react-native-gesture-handler`

**HeroUI Native:**
- Pre-built components: Button, TextField, Select, Card, Dialog, etc.
- Theming integrated with Uniwind + ThemeContext
- Animation support via Reanimated

**Uniwind + Tailwind:**
- Tailwind classes compiled to React Native styles
- Metro integration via `withUniwindConfig` wrapper
- Global styles from `global.css`

---

*Integration audit: 2026-01-27*
