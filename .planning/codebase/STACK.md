# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**
- TypeScript 5.9.2 - Core application logic and type safety (strict mode enabled)
- JavaScript - React Native and Expo runtime

**Secondary:**
- Kotlin/Swift - Native mobile platform code (iOS/Android)
- CSS - Tailwind CSS v4 via Uniwind for styling

## Runtime

**Environment:**
- Expo SDK 54.0.10 - React Native development framework with managed hosting
- React 19.1.0 - UI component framework
- React Native 0.81.5 - Cross-platform mobile runtime
- Node.js 20+ - Backend functions environment

**Package Manager:**
- npm (workspace with monorepo structure)
- Lockfile: `package-lock.json` (present)
- Functions subpackage: `functions/package.json` with separate lockfile

## Frameworks

**Core:**
- Expo Router ~6.0.8 - File-based routing for React Native (with typed routes experiment)
- React Navigation 7.1.8+ - Navigation primitives (@react-navigation/bottom-tabs, @react-navigation/native, @react-navigation/elements)
- HeroUI Native 1.0.0-beta.9 - Component library for Expo (Button, TextField, Select, Card, Dialog, Toast, etc.)

**Mobile Features:**
- Expo Auth Session 7.0.10 - OAuth authentication flows
- Expo Apple Authentication 8.0.8 - Native Apple Sign-In
- React Native Google SignIn 14.0.0 - Native Google Sign-In
- Apple HealthKit (@kingstinct/react-native-healthkit 13.1.0) - HealthKit workout integration (iOS-only, Nitro Modules)

**State & Storage:**
- React Context API - Application state (Auth, Theme)
- React Native MMKV 4.1.0 - Fast persistent key-value storage for Firebase auth tokens
- React Native Async Storage 2.2.0 - Persistent user preferences

**Styling:**
- Uniwind 1.2.2 - Tailwind CSS v4 for React Native with Metro integration
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- Tailwind Merge 3.4.0 - Class merging utility
- Tailwind Variants 3.2.2 - Component variant system
- Expo Linear Gradient 15.0.8 - Gradient overlays

**Animations & Gestures:**
- React Native Reanimated ~4.1.1 - Worklet-based animations
- React Native Gesture Handler ~2.28.0 - Touch gesture detection
- React Native Worklets 0.5.1 - High-performance worklet execution
- GoRhom Bottom Sheet 5.2.8 - Bottom sheet modal component

**Icons & Media:**
- Expo Vector Icons 15.0.2 - Icon sets (Material Design, Feather, etc.)
- Lucide React Native 0.562.0 - Clean, modern SVG icons
- Expo Image 3.0.8 - Optimized image loading
- React Native SVG 15.12.1 - SVG rendering support

**UI Utilities:**
- HeroUI Native - Component library (Button, Card, Select, Dialog, etc.)
- clsx 2.1.1 - Class name utility
- Expo Blur 15.0.8 - Blur view effects
- Expo Linear Gradient 15.0.8 - Gradient backgrounds
- Expo Haptics 15.0.7 - Haptic feedback (vibration)
- Expo Symbols 1.0.7 - SF Symbols support (iOS)

**Expo Modules:**
- expo-font ~14.0.8 - Custom font loading
- expo-splash-screen ~31.0.10 - Splash screen control
- expo-status-bar ~3.0.8 - Status bar configuration
- expo-system-ui ~6.0.7 - System UI integration
- expo-updates ~29.0.15 - OTA updates
- expo-web-browser ~15.0.7 - Native browser for OAuth flows
- expo-crypto ~15.0.8 - Cryptographic functions
- expo-linking ~8.0.8 - Deep linking support
- expo-constants ~18.0.9 - App constants
- expo-secure-store ~15.0.8 - Secure credential storage
- expo-metro-runtime ~6.1.2 - Metro bundler enhancements

**Backend:**
- Firebase 12.7.0 - Real-time database, authentication, cloud functions
  - firebase/auth - Email/password, OAuth authentication
  - firebase/firestore - NoSQL document database
  - firebase/admin 12.0.0 (functions) - Backend admin SDK
  - firebase-functions 5.0.0 (functions) - Serverless functions

**New Architecture:**
- React Native Nitro Modules - New Architecture support for native modules
- Expo New Architecture enabled (`newArchEnabled: true` in app.json)
- React Compiler enabled (experimental: true in app.json)

## Key Dependencies

**Critical:**
- Firebase 12.7.0 - Authentication, Firestore database, user data persistence
- React Native MMKV 4.1.0 - Auth token storage (performant persistent storage)
- @kingstinct/react-native-healthkit 13.1.0 - Apple HealthKit integration for workout sync (iOS-only)

**Infrastructure:**
- Expo CLI 54.0 - Build and deployment tooling
- React Navigation - Tab-based and modal navigation
- Uniwind 1.2.2 - Tailwind CSS for React Native styling

**Development:**
- TypeScript 5.9.2 - Static type checking (strict mode)
- ESLint 9.25.0 - Code linting (using eslint-config-expo)
- Prettier 3.7.4 - Code formatting
- Babel 7.x - JavaScript transpilation with module-resolver plugin
- Expo Router ~6.0.8 - Production-ready file-based routing

## Configuration

**Environment Variables:**
- `.env` (never committed) - Firebase config loaded at runtime
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`

**Functions Environment:**
- `functions/.env` (never committed)
  - `ENCRYPTION_KEY` - AES-256-GCM key (64 hex characters = 32 bytes)

**Build Configuration:**
- `app.json` - Expo config (iOS bundle ID, Android package, plugins, New Architecture flags)
- `tsconfig.json` - TypeScript strict mode, path aliases (@/* for project root)
- `babel.config.js` - Babel presets with Hermes optimization and module-resolver
- `metro.config.js` - Expo Metro bundler config with Uniwind CSS integration
- `firebase.json` - Firebase CLI config (Firestore indexes, functions location)
- `.prettierrc` - Prettier formatting (100 char line width, import sort order)
- `eslint.config.js` - ESLint flat config (expo + prettier)

**Native Plugins:**
- Expo Router - File-based routing plugin
- Expo Splash Screen - Custom splash screen
- Expo Secure Store - Secure credential storage (iOS Keychain)
- @kingstinct/react-native-healthkit - HealthKit permissions and workout access (iOS)

## Platform Requirements

**Development:**
- Node.js 20+ (for build tools and functions)
- npm or yarn
- Xcode 15+ (for iOS development)
- Android Studio (for Android development)
- `npx expo prebuild` required for native modules (@kingstinct/react-native-healthkit)
- EAS CLI for managed builds

**Production:**
- Deployment: Expo Application Services (EAS) managed builds
- Firebase project (Auth, Firestore, Cloud Functions)
- iOS App Store (requires Apple Developer account)
- Google Play Store (requires Google Developer account)
- Firebase Cloud Functions deployment via firebase-cli

## Bundler & Transpilation

**Bundler:** Metro (Expo's bundler)
- Configured via `metro.config.js` with `withUniwindConfig` wrapper
- Supports both Hermes and JavaScriptCore runtimes
- Babel transpiles with `babel-preset-expo` and Hermes optimization

**Transpilation Targets:**
- Hermes bytecode (iOS/Android native)
- JavaScript (for web/expo web)
- Module resolution via `babel-plugin-module-resolver` for `@/` aliases

## Version Pinning

- **Expo** ~54.0.10 (pinned minor version)
- **React** 19.1.0 (latest major)
- **TypeScript** ~5.9.2 (pinned minor)
- **Firebase** ^12.7.0 (caret for security updates)
- Most packages use `^` or `~` semver for flexibility with security patches

---

*Stack analysis: 2026-01-27*
