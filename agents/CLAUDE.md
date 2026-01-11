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

### Review Agent
Reviews code for issues, type errors, and best practices.

```bash
npm run review                    # Review entire codebase
npm run review "../app/(tabs)"    # Review specific directory
npm run review "../components"    # Review components
```

### Fix Agent
Fixes bugs, type errors, and issues.

```bash
npm run fix "Fix all TypeScript errors"
npm run fix "The login button doesn't navigate correctly"
npm run fix "Profile image not loading on the settings screen"
```

## Important Note

Agents are configured to NEVER run the dev server (`expo start`, `npm run dev`, etc.) since you typically have it running in another terminal. They will only run safe commands like `npx tsc --noEmit`.

## How It Works

These agents use the same engine as Claude Code, exposed via the Agent SDK:
- They can read, write, and edit files
- They run terminal commands (like `npx tsc --noEmit`)
- They search code with Glob/Grep
- They iterate autonomously to complete tasks

## Cost

Agents track and report their API costs. Using your Pro Max plan:
- Feature agent: Uses Opus model (~$0.05-0.50 per feature)
- Review agent: Uses Sonnet model (~$0.01-0.05 per review)
- Fix agent: Uses Opus model (~$0.02-0.20 per fix)

## Creating Custom Agents

Create new agents by copying `feature-agent.ts` and modifying:
1. The `systemPrompt` with domain-specific instructions
2. The `allowedTools` array to control capabilities
3. The `model` option (opus, sonnet, haiku)

## Models

- **opus**: Most capable, best for complex features
- **sonnet**: Fast and capable, good for reviews
- **haiku**: Fastest, cheapest, good for simple tasks
