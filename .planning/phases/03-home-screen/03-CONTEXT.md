# Phase 3: Home Screen - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Fully populated Home screen with animated hero swiper, flip card stats, and leaderboard preview. Users see their daily motivation, key activity stats with flip animations, and a preview of how they rank among friends. Creating posts, editing profile, or adding social features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Hero swiper style
- Rounded cards with subtle drop shadow, floating above background
- Nature-themed gradient overlay (green to dark) with white text for motivation card
- Small refresh icon button in top-right corner of motivation card to cycle quotes
- Page indicator dots: Claude's discretion on placement (inside card bottom or below)

### Flip card feel
- Square cards, side by side in a row (two equal squares)
- Back face emphasizes big number + short context label (bold and scannable)
- Tap affordance: Claude's discretion (subtle flip icon, text hint, or discovery)
- Animation details: Claude's discretion within 300-400ms rotateY spec (may add slight scale bounce)

### Stats grid layout
- Section flow: Hero swiper → Stats row → Leaderboard preview (top to bottom)
- No section headings — sections separated by spacing and visual style alone
- Flip card row is compact relative to hero — hero dominates the viewport
- Home screen is a scrollable page (content extends below fold)

### Leaderboard preview
- Friends/Global toggle: Claude's discretion on style (pill segmented or underlined tabs)
- Current user's row highlighted with subtle accent background color
- Row stat matches wireframe spec (total time from mock data)
- "View All" button navigates to Your Squad tab

### Claude's Discretion
- Page indicator dot placement (inside card or below)
- Flip card tap affordance approach
- Flip animation flair (clean rotateY vs. slight scale bounce)
- Friends/Global toggle visual style
- Exact spacing, typography, and color values
- Error and loading state handling
- Empty state design if needed

</decisions>

<specifics>
## Specific Ideas

- Hero cards should feel elevated — rounded corners + shadow, not flat panels
- Gradient on motivation card is nature-themed (greens/darks), reinforcing outdoor brand
- Stats should feel like a quick glance dashboard — compact, not competing with the hero
- Leaderboard current-user highlight via accent background, not just text styling

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-home-screen*
*Context gathered: 2026-01-27*
