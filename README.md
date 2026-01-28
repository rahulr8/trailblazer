# Trailblazer

BC Parks outdoor activity tracking app built with Expo and Firebase.

## Tech Stack

- **Framework**: Expo 54 with Expo Router
- **Styling**: Uniwind (Tailwind CSS v4 for React Native) + HeroUI Native
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Integrations**: Apple HealthKit for activity sync

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`)
- Firebase CLI (`bun install -g firebase-tools`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Install dependencies:

   ```bash
   bun install
   cd functions && bun install && cd ..
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

3. Set up Firebase:

   ```bash
   firebase login
   firebase use <your-project-id>
   ```

4. Deploy Cloud Functions:

   ```bash
   bun run firebase:deploy
   ```

### Running the App

```bash
# Start Expo dev server
bunx expo start

# Run on iOS
bunx expo run:ios

# Run on Android
bunx expo run:android
```

## Project Structure

```
app/                    # Expo Router pages
├── _layout.tsx         # Root layout with providers
├── (tabs)/             # Bottom tab navigation
├── (modals)/           # Modal screens
└── chat.tsx            # AI chat screen

components/             # Reusable UI components
contexts/               # React contexts (auth, theme)
lib/
├── db/                 # Firestore operations
├── health/             # Apple Health integration
└── firebase.ts         # Firebase initialization

functions/              # Firebase Cloud Functions
```

## Features

- Activity tracking (manual logging + Apple Health sync)
- 60-day outdoor challenge
- AI trail assistant (Parker)
- User stats and streaks
- Saved adventures

## Scripts

```bash
bun start               # Start Expo dev server
bun run typecheck       # TypeScript type checking
bun run format          # Format code with Prettier
bun run firebase:deploy # Build and deploy Cloud Functions
```

## Documentation

### Code Reference (CLAUDE.md files)

- `/CLAUDE.md` - Project overview and code standards
- `/lib/health/CLAUDE.md` - Apple Health integration
- `/lib/db/CLAUDE.md` - Database operations
- `/functions/CLAUDE.md` - Cloud Functions

## License

Proprietary - BC Parks Foundation
