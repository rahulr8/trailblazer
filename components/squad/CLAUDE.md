# Squad Components (`components/squad/`)

Your Squad screen components for community leaderboard in Trailblazer.

## Components

| Component          | File                     | Purpose                                               |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| SegmentedControl   | SegmentedControl.tsx     | Generic reusable pill-style toggle                   |
| LeaderboardRow     | LeaderboardRow.tsx       | Single leaderboard entry with avatar, name, time     |
| LeaderboardWidget  | LeaderboardWidget.tsx    | Full leaderboard with Friends/Global toggle          |

## SegmentedControl

Generic reusable pill-style toggle component for switching between options.

```typescript
import { SegmentedControl } from "@/components/squad/SegmentedControl";

<SegmentedControl
  options={[
    { key: "friends", label: "Friends" },
    { key: "global", label: "Global" },
  ]}
  activeKey="friends"
  onChange={(key) => setActiveKey(key)}
/>
```

**Props:**

- `options: { key: string; label: string }[]` - Array of option objects
- `activeKey: string` - Currently selected option key
- `onChange: (key: string) => void` - Callback when option is tapped

**Layout:**

- Horizontal row of pressable pills inside rounded container
- Container: `borderRadius: 16`, `padding: 4`, `gap: 4`, `alignSelf: "center"`
- Background: `colors.backgroundSecondary`
- Active pill: `colors.accent` background with white text
- Inactive pill: transparent background with `colors.textSecondary` text

**Sizing:**

Larger and more prominent than Home preview version:
- Padding: `paddingVertical: 10`, `paddingHorizontal: 28`
- Font size: `15`, font weight: `"600"`

**Reusability:**

SegmentedControl is generic and NOT leaderboard-specific. Can be reused anywhere a pill toggle is needed:

- Filter toggles (Active/Completed challenges)
- Time period selectors (Week/Month/Year)
- View mode switches (List/Map)
- Any binary or tertiary choice

## LeaderboardRow

Single leaderboard entry row with rank, avatar, name, and time display.

```typescript
import { LeaderboardRow } from "@/components/squad/LeaderboardRow";

<LeaderboardRow
  entry={mockLeaderboardEntry}
  isHighlighted={entry.isCurrentUser}
/>
```

**Props:**

- `entry: MockLeaderboardEntry` - Leaderboard entry data
- `isHighlighted: boolean` - Whether to highlight row (current user)

**Layout:**

Horizontal row with consistent spacing:
1. Rank number: `width: 28`, `fontSize: 17`, `fontWeight: "700"`, `color: textSecondary`
2. Avatar: HeroUI Avatar `size="sm"` with Image + Fallback (initials)
3. Display name: `flex: 1`, `fontSize: 15`, `fontWeight: "500"`, `color: textPrimary`
4. Time: `fontSize: 14`, `fontWeight: "600"`, `color: textSecondary`

Gap: `12px` between elements
Padding: `12px` vertical, `12px` horizontal

**Highlight state:**

If `isHighlighted` is true:
- Row background: `${colors.accent}18` (~10% opacity accent tint)
- Border radius: `12`

**Time formatting:**

Detailed time display with hours + minutes:

```typescript
const hours = Math.floor(entry.totalTime / 60);
const minutes = entry.totalTime % 60;
const timeDisplay = `${hours}h ${minutes}m`;
```

More detail than Home preview which shows hours only.

**Avatar pattern:**

HeroUI Avatar with `alt` prop (required for accessibility):

```typescript
<Avatar size="sm" alt={entry.displayName}>
  <Avatar.Image source={{ uri: entry.avatarUrl }} />
  <Avatar.Fallback>{getInitials(entry.displayName)}</Avatar.Fallback>
</Avatar>
```

Fallback initials:
- Split name by spaces
- Take first character of each word
- Uppercase and slice to 2 characters
- Example: "Sarah Johnson" → "SJ"

## LeaderboardWidget

Full leaderboard widget with Friends/Global toggle, ranked entries, and Show More expansion.

```typescript
import { LeaderboardWidget } from "@/components/squad/LeaderboardWidget";

<LeaderboardWidget />
```

**No props** - fully self-contained component importing mock data directly.

**State:**

- `activeTab: "friends" | "global"` - Currently selected tab (default: "friends")
- `showAll: boolean` - Whether to show all entries or top 10 (default: false)

**Data selection:**

```typescript
const data = activeTab === "friends"
  ? MOCK_LEADERBOARD_FRIENDS
  : MOCK_LEADERBOARD_GLOBAL;
```

- Friends: 5 entries
- Global: 10 entries

**Display logic:**

- If `showAll`: show all entries
- Otherwise: show first 10 entries (top 10)
- "Show More" button only appears if `data.length > 10`

**Reset behavior:**

When `activeTab` changes, reset `showAll` to false:

```typescript
useEffect(() => {
  setShowAll(false);
}, [activeTab]);
```

Switching tabs collapses the expanded view.

**Layout:**

1. SegmentedControl at top
2. 16px margin below toggle
3. List of LeaderboardRow components (4px gap between rows via parent `gap: 4`)
4. "Show More" button: 8px margin top, centered text + icon

**Show More button:**

- Text: "Show More" / "Show Less" based on `showAll` state
- Icon: ChevronDown / ChevronUp from lucide-react-native
- Color: `colors.accent`
- Layout: flexDirection row, centered, 4px gap between text and icon
- Only rendered if `data.length > 10`

**Current user highlight:**

Passes `entry.isCurrentUser` to LeaderboardRow as `isHighlighted` prop:

```typescript
<LeaderboardRow
  entry={entry}
  isHighlighted={entry.isCurrentUser}
/>
```

- Friends: Sarah Johnson highlighted at rank 2
- Global: Sarah Johnson highlighted at rank 4

## Mock Data Sources

All components import from `@/lib/mock`:

- `MOCK_LEADERBOARD_FRIENDS` - 5 friend entries
- `MOCK_LEADERBOARD_GLOBAL` - 10 global entries

Ready for Firebase integration in later phase - just swap imports.

## Key Patterns

### Theme Integration

All components use `useTheme()` hook for dynamic colors:

- `colors.accent` - Active pill, highlight background, buttons
- `colors.backgroundSecondary` - Segmented control container
- `colors.textPrimary/Secondary` - Text hierarchy
- `colors.cardBackground` - Used in other components

### Generic Component Design

SegmentedControl demonstrates reusable component pattern:

- Generic props (not leaderboard-specific)
- No hard-coded data
- Theme-integrated for consistent appearance
- Can be imported anywhere

Example alternate use:

```typescript
<SegmentedControl
  options={[
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ]}
  activeKey={timePeriod}
  onChange={setTimePeriod}
/>
```

### Avatar Fallback Pattern

LeaderboardRow demonstrates HeroUI Avatar fallback pattern:

```typescript
const getInitials = (displayName: string): string => {
  return displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

<Avatar size="sm" alt={entry.displayName}>
  <Avatar.Image source={{ uri: entry.avatarUrl }} />
  <Avatar.Fallback>{getInitials(entry.displayName)}</Avatar.Fallback>
</Avatar>
```

Same pattern used in Home's LeaderboardPreview component.

## Future Extensions

**Planned for later phases:**

- Live leaderboard data from Firestore
- Friends list integration (vs. mock data)
- Time period filters (weekly, monthly, all-time)
- Achievement badges next to names
- Animated position changes
- Pull-to-refresh leaderboard data


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

*No recent activity*
</claude-mem-context>