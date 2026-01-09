# Digital Wallet Feature - Implementation Plan

## Overview

Add a digital wallet feature to the Trailblazer+ React Native app that displays membership cards in a stacked view similar to Apple Wallet. Cards are managed via a separate web app and stored in Firebase Firestore.

## Requirements

### Core Functionality
- Display membership cards in a stacked/cascading layout
- Tap card to expand and show back side with barcode
- Support multiple card types (NSMBA, BC Parks, Trailblazer+, etc.)
- Cards sync from Firebase, managed by external web app
- Works offline (cached locally)
- Cross-platform (iOS and Android)

### Out of Scope
- Screenshot prevention
- Validator app for scanning cards
- Cryptographic signing of cards
- Real-time validation infrastructure

## Technical Stack (Already Available)

| Requirement | Library | Status |
|-------------|---------|--------|
| Card animations | React Native Reanimated v4 | ✅ Installed |
| Gestures | React Native Gesture Handler | ✅ Installed |
| Gradients | expo-linear-gradient | ✅ Installed |
| Local cache | MMKV | ✅ Installed |
| Database | Firebase Firestore | ✅ Configured |
| Styling | Uniwind + HeroUI Native | ✅ Configured |

### To Install
- `react-native-barcode-svg` - For rendering barcodes from values

## Database Schema

### Card Templates Collection
Path: `cardTemplates/{templateId}`

Managed by web app. Defines the visual design for each card type.

```typescript
interface CardTemplate {
  id: string;
  name: string;                    // "NSMBA"
  organizationName: string;        // "North Shore Mountain Bike Association"
  logoUrl: string;                 // Firebase Storage URL

  front: {
    gradient: {
      colors: string[];            // ["#1a1a1a", "#2d2d2d"]
      direction: "horizontal" | "vertical" | "diagonal";
    };
    textColor: string;
    secondaryTextColor: string;
  };

  back: {
    backgroundColor: string;       // "#ffffff"
    textColor: string;             // "#000000"
    barcodeFormat: "CODE128" | "QR" | "CODE39";
  };

  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### User Wallet Cards Subcollection
Path: `users/{uid}/walletCards/{cardId}`

User's individual card instances with denormalized design data.

```typescript
interface WalletCard {
  id: string;
  templateId: string;              // Reference to cardTemplates

  // User-specific data
  memberId: string;                // "123456" - display ID
  memberSince: Timestamp;

  // Barcode data
  barcodeValue: string;            // "998811" - encoded in barcode
  barcodeLabel?: string;           // "PARKS SCANNER" - text below barcode

  // Lifecycle
  status: "active" | "expired" | "revoked";
  issuedAt: Timestamp;
  expiresAt: Timestamp | null;     // null = never expires
  lastSyncedAt: Timestamp;         // When design was synced from template

  // Denormalized design (copied from template)
  design: {
    name: string;
    organizationName: string;
    logoUrl: string;
    front: {
      gradient: {
        colors: string[];
        direction: "horizontal" | "vertical" | "diagonal";
      };
      textColor: string;
      secondaryTextColor: string;
    };
    back: {
      backgroundColor: string;
      textColor: string;
      barcodeFormat: "CODE128" | "QR" | "CODE39";
    };
  };
}
```

## UI Components to Build

### 1. WalletScreen
Path: `app/(tabs)/wallet.tsx` or integrate into existing tab

- Fetches user's wallet cards from Firestore
- Displays "DIGITAL WALLET" header
- Renders WalletCardStack component
- Handles empty state (no cards)

### 2. WalletCardStack
Path: `components/wallet/WalletCardStack.tsx`

- Renders cards in stacked/cascading layout
- Each card offset vertically, slightly scaled
- Pan gesture to spread cards apart
- Tap gesture to select/expand a card
- Uses Reanimated shared values for smooth animations

### 3. WalletCard
Path: `components/wallet/WalletCard.tsx`

- Renders individual card with front and back faces
- Front: gradient background, logo, card name, member since
- Back: white background, barcode, member ID
- Flip animation on tap (3D rotate) or expand to full screen
- Uses expo-linear-gradient for card backgrounds

### 4. BarcodeDisplay
Path: `components/wallet/BarcodeDisplay.tsx`

- Takes barcodeValue and barcodeFormat as props
- Renders barcode using react-native-barcode-svg
- Displays barcodeLabel below if provided

## Data Flow

### Initial Load
```
App opens
  → Fetch walletCards subcollection from Firestore
  → Cache to MMKV for offline access
  → Display in WalletCardStack
```

### Offline Access
```
App opens (no internet)
  → Load cached cards from MMKV
  → Display cached data
  → Show "offline" indicator (optional)
```

### Card Updates (via web app)
```
Web app updates card status/design
  → Firestore updates document
  → Mobile app receives real-time update (if online)
  → Or syncs on next app open
```

### Design Refresh (optional)
```
On app open, for each card:
  if template.updatedAt > card.lastSyncedAt
    → Fetch latest template
    → Update card.design
    → Update card.lastSyncedAt
```

## File Structure

```
components/
└── wallet/
    ├── WalletCardStack.tsx
    ├── WalletCard.tsx
    ├── BarcodeDisplay.tsx
    └── types.ts

lib/
└── db/
    ├── wallet.ts          # Firestore queries for wallet cards
    └── types.ts           # Add WalletCard, CardTemplate types

contexts/
└── wallet-context.tsx     # (Optional) Wallet state management

app/
└── (tabs)/
    └── wallet.tsx         # Wallet tab screen
```

## Animation Specifications

### Stacked Card Layout
- Cards stacked with ~40px vertical offset between each
- Back cards scaled to ~0.95 of front card
- Subtle shadow on each card for depth

### Card Selection
- Tap to bring card to front
- Other cards animate down/away
- Selected card expands to show details

### Card Flip (to show barcode)
- 3D rotation around Y-axis
- Duration: ~400ms with spring physics
- Back face renders when rotation > 90deg

## Implementation Steps

1. **Database types** - Add WalletCard and CardTemplate interfaces to `lib/db/types.ts`

2. **Firestore queries** - Create `lib/db/wallet.ts` with functions:
   - `getUserWalletCards(uid)` - Fetch user's cards
   - `subscribeToWalletCards(uid, callback)` - Real-time listener

3. **Install barcode library** - `npm install react-native-barcode-svg`

4. **Build BarcodeDisplay** - Simple component that renders barcode from value

5. **Build WalletCard** - Single card with front/back, flip animation

6. **Build WalletCardStack** - Stacked layout with gestures

7. **Build WalletScreen** - Tab screen that composes everything

8. **Add to navigation** - Add wallet tab or integrate into existing screen

9. **Local caching** - Cache cards to MMKV for offline access

## Visual Reference

### Stacked View (Front)
```
┌─────────────────────────┐
│ NSMBA                   │  ← Back card (dark)
├─────────────────────────┤
│ BC PARKS                │  ← Middle card (green)
├─────────────────────────┤
│ TRAILBLAZER+            │  ← Front card (orange gradient)
│                         │
│ MEMBER SINCE            │
│ 2024                    │
└─────────────────────────┘
```

### Expanded Card (Back with Barcode)
```
┌─────────────────────────┐
│            +TRAILBLAZER │
│                         │
│      ▌▌▌ ▌▌▌▌▌ ▌▌▌     │
│        9 9 8 8 1 1      │
│      PARKS SCANNER      │
│                         │
│                         │
└─────────────────────────┘
```

## Open Questions Resolved

- **Expiration**: Cards can have optional `expiresAt` field
- **Multiple same type**: Allowed (array of cards, filtered by templateId if needed)
- **Logo storage**: Firebase Storage, URL stored in template
- **Screenshot prevention**: Not implementing
- **Validator app**: Not implementing
