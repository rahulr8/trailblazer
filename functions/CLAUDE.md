# Firebase Cloud Functions (`functions/`)

Backend for Trailblazer handling server-side operations.

## Structure

```
functions/
├── package.json
├── tsconfig.json
├── .env.example      # Required environment variables
├── .gitignore
└── src/
    ├── index.ts      # Exports all Cloud Functions
    └── utils/
        └── encryption.ts  # AES-256-GCM token encryption
```

## Commands

```bash
npm run build         # Compile TypeScript
npm run typecheck     # Type check without emit
npm run serve         # Local emulator
npm run deploy        # Deploy to Firebase
```

## Environment Variables

Create `.env` file (never commit):

```bash
# AES-256 key: 32 bytes = 64 hex characters
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string
```

## Deployment

```bash
# Build and deploy functions
npm run build && firebase deploy --only functions

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Security

- Sensitive data encrypted with AES-256-GCM before Firestore storage
