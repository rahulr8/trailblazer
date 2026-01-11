# Trailblazer+ AI Agents

AI development agents powered by the Claude Agent SDK.

## Prerequisites

1. **Claude Code CLI** must be installed and authenticated:
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude  # Authenticate if not already done
   ```

2. **Node.js 18+** required

## Setup

```bash
cd agents
npm install
```

## Available Agents

### Feature Agent
Implements new features following project standards.

```bash
npm run feature "Add a favorites screen where users can save their favorite trails"
npm run feature "Create a notification system for trail alerts"
npm run feature "Add offline mode for viewing saved trails"
```

**Model**: Opus | **Max Turns**: 100 | **Tools**: Read, Write, Edit, Glob, Grep, Bash

### Review Agent
Reviews code for issues, type errors, and best practices.

```bash
npm run review                    # Review entire codebase
npm run review "../app/(tabs)"    # Review specific directory
npm run review "../components"    # Review components
```

**Model**: Sonnet | **Max Turns**: 50 | **Tools**: Read, Glob, Grep (read-only)

### Fix Agent
Fixes bugs, type errors, and issues.

```bash
npm run fix "Fix all TypeScript errors"
npm run fix "The login button doesn't navigate correctly"
npm run fix "Profile image not loading on the settings screen"
```

**Model**: Opus | **Max Turns**: 50 | **Tools**: Read, Write, Edit, Glob, Grep, Bash

### Integration Agent
Specialized for Strava, Apple Health, and Firebase integrations.

```bash
npm run integration "Debug Strava connection not syncing"
npm run integration "Add Apple Watch sync support"
npm run integration "Fix token refresh for expired Strava tokens"
npm run integration "Troubleshoot HealthKit permissions issue"
```

**Model**: Opus | **Max Turns**: 75 | **Tools**: Read, Write, Edit, Glob, Grep, Bash

Use this agent for:
- OAuth flow issues (Strava)
- Token management and refresh
- Webhook processing
- HealthKit permissions
- Firestore sync logic
- Cloud Function debugging

## Agent Selection Guide

| Task | Agent | Why |
|------|-------|-----|
| Add new screen | `feature` | Full implementation capability |
| Add new component | `feature` | Can create and style components |
| Fix TypeScript errors | `fix` | Focused troubleshooting |
| Fix runtime bugs | `fix` | Can debug and edit code |
| Code quality check | `review` | Read-only, comprehensive review |
| Strava OAuth issues | `integration` | Specialized knowledge of OAuth/tokens |
| Apple Health sync | `integration` | Knows HealthKit patterns |
| Firebase/Firestore | `integration` | Understands backend architecture |

## Important Notes

**Never Runs Dev Server**: Agents are configured to NEVER run `expo start`, `npm run dev`, etc. since you typically have the dev server running in another terminal. They only run safe commands like `npx tsc --noEmit`.

**CLAUDE.md Awareness**: Agents know to check CLAUDE.md files in relevant directories for context. Key documentation:
- `/CLAUDE.md` - Project standards
- `/lib/strava/CLAUDE.md` - Strava integration
- `/lib/health/CLAUDE.md` - Apple Health integration
- `/lib/db/CLAUDE.md` - Database operations
- `/functions/CLAUDE.md` - Cloud Functions

## Model Selection

| Model | Speed | Capability | Cost | Best For |
|-------|-------|------------|------|----------|
| **Opus** | Slower | Highest | ~$15/M tokens | Complex features, debugging |
| **Sonnet** | Fast | High | ~$3/M tokens | Reviews, simple features |
| **Haiku** | Fastest | Good | ~$0.25/M tokens | Simple tasks, quick checks |

## Creating Custom Agents

1. Copy an existing agent (e.g., `feature-agent.ts`)
2. Modify the `systemPrompt` with domain-specific instructions
3. Adjust `allowedTools` to control capabilities
4. Set appropriate `model` and `maxTurns`
5. Add script to `package.json`

## Future: Linear Automation

See `LINEAR-AUTOMATION-PLAN.md` for the planned Linear ticket auto-implementation pipeline. This will allow qualified Linear tickets to be automatically implemented and submitted as PRs.
