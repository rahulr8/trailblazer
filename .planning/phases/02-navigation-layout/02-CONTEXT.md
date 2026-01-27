# Phase 2: Navigation & Layout - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Working 3-tab app shell (Home, Your Stash, Your Squad) with shared TopBar, Parker FAB on every screen, and routing to Profile and Parker Chat. Users see and interact with the navigation chrome that wraps all future screen content. Individual screen content (beyond placeholders) belongs in later phases.

</domain>

<decisions>
## Implementation Decisions

### Tab bar & Parker FAB styling
- Tab bar icon/label style: Claude's discretion (pick what fits the app's outdoor/nature brand)
- Parker FAB position: docked in bottom-right corner of the screen, independent of tab bar
- Parker FAB animation on load: Claude's discretion
- Color scheme: match existing HeroUI/app theme colors for both tab bar and Parker FAB

### TopBar design
- Layout: left = date (MMM DD), center = daily affirmation text, right = profile avatar
- Affirmation behavior: rotates when user pulls to refresh (not static per day)
- Scroll behavior: scrolls away with content (not sticky)
- Avatar size: medium (40px), comfortable tap target

### Screen transitions
- Tab switching: horizontal slide animation (content slides left/right based on tab position)
- Tab swiping: enabled — users can swipe left/right on content area to change tabs
- Profile screen: opens as modal from bottom (slide up, swipe down or X to dismiss)
- Parker Chat screen: opens as full-screen modal (slides up covering entire screen)

### Action button placement
- Home "+" button: inline in content (not a floating button) — Claude picks natural placement based on Home screen layout
- Squad "Add Friend" button: text button ("Add Friend") in the top-right of the Squad screen header
- "Coming Soon" toast: Claude's discretion — use HeroUI's built-in Toast with sensible defaults

### Claude's Discretion
- Tab bar visual style (icon + label vs icon only)
- Parker FAB entrance animation (static vs subtle scale-in)
- Exact Home "+" button inline placement
- Toast position and timing
- Tab bar and FAB exact sizing/spacing

</decisions>

<specifics>
## Specific Ideas

- Tab swiping between tabs should feel fluid paired with the horizontal slide animation
- Profile opens as a bottom modal (not push navigation) — distinct from tab navigation
- Parker Chat is full-screen modal — immersive, separate experience from tabs
- Affirmation text cycles on pull-to-refresh, giving users a reason to interact with the TopBar

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-navigation-layout*
*Context gathered: 2026-01-27*
