# Trailblazer+

BC Parks outdoor activity tracking app built with Expo and Firebase.

## Tech Stack

- **Framework**: Expo 54 with Expo Router
- **Styling**: Uniwind (Tailwind CSS v4 for React Native) + HeroUI Native
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Integrations**: Apple HealthKit for activity sync

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Install dependencies:

   ```bash
   npm install
   cd functions && npm install && cd ..
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
   npm run firebase:deploy
   ```

### Running the App

```bash
# Start Expo dev server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
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
npm start               # Start Expo dev server
npm run typecheck       # TypeScript type checking
npm run format          # Format code with Prettier
npm run firebase:deploy # Build and deploy Cloud Functions
```

## Documentation

### Code Reference (CLAUDE.md files)
- `/CLAUDE.md` - Project overview and code standards
- `/lib/health/CLAUDE.md` - Apple Health integration
- `/lib/db/CLAUDE.md` - Database operations
- `/functions/CLAUDE.md` - Cloud Functions

## License

Proprietary - BC Parks Foundation
