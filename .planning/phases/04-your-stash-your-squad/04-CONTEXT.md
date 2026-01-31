# Phase 4: Your Stash + Your Squad - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Two complete tab screens: Your Stash (rewards browsing with featured carousel, 2-column grid, and detail bottom sheet) and Your Squad (community leaderboard with Friends/Global toggle and ranked entries). Reward redemption backend, social features, and friend management are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Reward card design
- Featured carousel: image-dominant cards with vendor name + reward title overlaid at bottom (App Store card style)
- Grid tiles: informative — image thumbnail + vendor name + reward title + points/tier required
- Carousel flows into grid as one continuous scroll — no section headers or visual separation
- Each card shows a tier badge indicating required membership tier; locked rewards are slightly dimmed or show a lock icon

### Reward Toaster behavior
- Bottom sheet covers ~50% of screen height (half screen)
- Shows QR code placeholder for all rewards (consistent mock pattern)
- Includes a prominent "Redeem" button at bottom — non-functional, shows "Coming Soon" toast on tap
- Dismisses via swipe down OR backdrop tap (standard bottom sheet pattern)

### Leaderboard presentation
- Current user's row highlighted with subtle colored background (brand accent at ~10% opacity)
- Shows top 10 entries by default with "Show More" button to reveal the rest
- Larger/more prominent segmented control for Friends/Global toggle (this is the dedicated leaderboard screen, not the Home preview)
- Each row shows avatar, name, total time as primary metric, and current streak as secondary badge

### Screen transitions & states
- Your Stash supports pull-to-refresh with mock delay (simulates data fetch, sets pattern for backend)
- Empty state: friendly illustration + "No rewards yet" message with brief explanation
- Reward card tap: subtle scale-down press feedback before toaster slides up
- Home "View All" to Squad: standard tab switch using existing Material Top Tabs behavior

### Claude's Discretion
- Exact carousel card dimensions and aspect ratio
- Grid tile spacing and corner radius
- QR code placeholder design (static image or generated pattern)
- Loading skeleton layout for pull-to-refresh
- "Show More" button styling and expand animation
- Toaster content layout (image, title, description, QR arrangement)

</decisions>

<specifics>
## Specific Ideas

- Carousel cards should feel like App Store featured cards — large image with text overlay at bottom
- One continuous browsing experience from carousel into grid (no section breaks)
- Leaderboard rows show both time and streak — dual metric gives more context than Home preview
- Scale press feedback on reward card tap — tactile feel before bottom sheet opens

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-your-stash-your-squad*
*Context gathered: 2026-01-30*
