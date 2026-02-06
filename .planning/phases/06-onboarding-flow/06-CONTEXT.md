# Phase 6: Onboarding Flow - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

New users experience a guided welcome flow (2 welcome screens → login → 2 permission screens) before reaching the main app. Returning users skip directly to login or main screen based on auth state and onboarding completion. AsyncStorage tracks completion so welcome screens only show once.

</domain>

<decisions>
## Implementation Decisions

### Welcome pager interaction
- Skip button in top-right corner allows users to bypass welcome screens and jump to login
- Pagination dots at bottom show progress through welcome screens (2 dots: filled for current, outlined for next)
- Rotating TB+ Logo has continuous slow rotation animation (compass-like effect)
- **Claude's Discretion**: Whether to support swipe gestures in addition to arrow button navigation

### Permission screen behavior
- Health API permission decline triggers warning dialog emphasizing missing benefit: "Without health data, you'll miss automatic activity tracking and accurate time logs. Sure?"
- Push notification permission decline proceeds directly to main app without warning
- Users can revisit and grant permissions later via Profile settings screen (Data Sync toggles)
- Warning dialog on health permission decline asks user to confirm before continuing

### Flow routing logic
- First launch: Welcome Screen 1 → Welcome Screen 2 → Login → Health Permission → Push Permission → Main App
- Returning users (authenticated + onboarding complete): Skip directly to main app tabs
- Partial completion: If user completes login but exits during permission screens, resume at permission screens on next launch
- Terms & Conditions link on login screen opens in-app web view modal (user stays in app)
- **Claude's Discretion**: Specific AsyncStorage key naming (use existing documented keys or similar pattern)

### Visual presentation
- Between-screen transitions: Fade animations (not slide) to prevent content clipping during Stack navigation transitions (documented in memory)
- Welcome pager internal navigation: Horizontal slide transitions (typical pager pattern)
- Messaging tone: Match exact copy from wireframes - "Get rewarded for time in nature", "Where does the money go?", "Join Trailblazer+"
- Theme handling: Respect app/device theme setting - onboarding adapts to light/dark mode automatically

</decisions>

<specifics>
## Specific Ideas

**Wireframe copy to preserve:**
- Welcome 1: "Get rewarded for time in nature" / "Trailblazer+ turns time spent in nature into progress, rewards, and real support for parks. Show up daily. The rest adds up."
- Welcome 2: "Where does the money go?" / "Membership dollars flow back into outdoor recreation and parks across BC. Participation supports the places, trails, and parks you use."
- Login: "Join Trailblazer+" / "Create an account to track progress, enter the challenge, and access member benefits."
- Health Permission: "Track automatically?" / "Giving permission to use your existing health integrations will make tracking a breeze."
- Push Permission: "Stay motivated." / "Giving permission to deliver notifications will help make sure you never miss a day!"

**Button labels:**
- Health permission: "Yes, I agree" / "No, don't use my health data"
- Push permission: "Yes, I agree" / "No, don't notify me"
- Warning dialog: Standard confirmation buttons

**Memory references:**
- Existing AsyncStorage keys documented: `@trailblazer_onboarding_seen`, `@trailblazer_permissions_complete`
- Known issue: Stack slide animations can clip content - use fade for safety on auth/onboarding screens

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-onboarding-flow*
*Context gathered: 2026-02-06*
