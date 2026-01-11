# Linear → Auto-Implementation Pipeline

Automatically implement Linear tickets and open PRs for review.

## Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Linear Ticket  │────▶│  Automation      │────▶│  GitHub PR      │
│  (qualified)    │     │  Runner          │     │  (for review)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Prerequisites

- [ ] Linear workspace with API key
- [ ] Linear project for Trailblazer+
- [ ] GitHub CLI (`gh`) authenticated
- [ ] Claude Code CLI authenticated
- [ ] Node.js 18+ on runner machine

## Ticket Qualification Criteria

Define which tickets trigger auto-implementation. Options:

```
Label: "auto-implement" or "claude"
Project: Trailblazer+
Estimate: ≤ 2 points (small tasks only)
State: "Ready for Dev" or "Todo"
```

## Architecture Options

### Option A: Polling (Recommended to Start)

Simple cron-based approach. Runs every N minutes.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cron      │────▶│  Check      │────▶│  Run Agent  │
│   (5 min)   │     │  Linear API │     │  + Open PR  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pros**: Simple, no server needed, can run locally
**Cons**: Not instant, polling overhead

### Option B: Webhook-based

Linear sends webhook on ticket creation.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Linear     │────▶│  Webhook    │────▶│  Run Agent  │
│  Webhook    │     │  Endpoint   │     │  + Open PR  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pros**: Instant, event-driven
**Cons**: Requires hosted endpoint (Vercel, Railway, etc.)

### Option C: GitHub Actions (Scheduled)

Run as a GitHub Action on a schedule.

**Pros**: No local machine needed, free tier available
**Cons**: Slower feedback, requires secrets management

## Implementation Plan

### Phase 1: Linear API Integration

Create `linear-client.ts`:

```typescript
// Fetch tickets matching criteria
interface LinearTicket {
  id: string;
  title: string;
  description: string;
  labels: string[];
  estimate: number | null;
  branchName: string;
}

async function getQualifiedTickets(): Promise<LinearTicket[]> {
  // Query Linear GraphQL API
  // Filter by: label, project, state, estimate
  // Return unprocessed tickets
}

async function markAsProcessing(ticketId: string): Promise<void> {
  // Update ticket state to "In Progress"
  // Add comment: "🤖 Claude is implementing this..."
}

async function markAsComplete(ticketId: string, prUrl: string): Promise<void> {
  // Add comment with PR link
  // Update state to "In Review"
}
```

### Phase 2: Automation Runner

Create `linear-runner.ts`:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getQualifiedTickets, markAsProcessing, markAsComplete } from "./linear-client";

async function processTicket(ticket: LinearTicket): Promise<void> {
  // 1. Create branch
  // git checkout -b ${ticket.branchName}

  // 2. Mark as processing in Linear
  await markAsProcessing(ticket.id);

  // 3. Run feature agent
  for await (const message of query({
    prompt: buildPrompt(ticket),
    options: {
      model: "opus",
      allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
      maxTurns: 100,
      permissionMode: "acceptEdits"
    }
  })) {
    // Stream output...
  }

  // 4. Create PR
  // gh pr create --title "${ticket.title}" --body "Implements ${ticket.id}"

  // 5. Update Linear with PR link
  await markAsComplete(ticket.id, prUrl);
}

function buildPrompt(ticket: LinearTicket): string {
  return `
## Task from Linear: ${ticket.title}

${ticket.description}

## Instructions
1. Implement this feature following project standards
2. Run type check when done: npx tsc --noEmit
3. Do NOT run the dev server

## Ticket Reference
Linear ID: ${ticket.id}
  `;
}
```

### Phase 3: Scheduling

**Local cron (macOS/Linux):**
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/agents && npm run linear-check
```

**Or launchd (macOS):**
```xml
<!-- ~/Library/LaunchAgents/com.trailblazer.linear-agent.plist -->
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.trailblazer.linear-agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/npm</string>
    <string>run</string>
    <string>linear-check</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/path/to/agents</string>
  <key>StartInterval</key>
  <integer>300</integer>
</dict>
</plist>
```

**Or GitHub Actions:**
```yaml
name: Linear Auto-Implement
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
        working-directory: agents
      - run: npm run linear-check
        working-directory: agents
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Environment Variables

```bash
# .env (never commit)
LINEAR_API_KEY=lin_api_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Or use Claude Code auth
GH_TOKEN=ghp_xxxxx  # For PR creation
```

## Safety Guards

1. **Ticket size limit**: Only process tickets with estimate ≤ 2 points
2. **Require explicit label**: Must have "auto-implement" label
3. **Branch protection**: PRs require approval before merge
4. **Cost cap**: Set maxTurns limit to prevent runaway costs
5. **Duplicate prevention**: Track processed ticket IDs in a local file/db
6. **Error handling**: On failure, comment on ticket with error details

## Linear GraphQL Queries

```graphql
# Get qualified tickets
query QualifiedTickets($projectId: ID!, $labelName: String!) {
  issues(
    filter: {
      project: { id: { eq: $projectId } }
      labels: { name: { eq: $labelName } }
      state: { name: { in: ["Todo", "Ready for Dev"] } }
    }
  ) {
    nodes {
      id
      identifier
      title
      description
      estimate
      branchName
      labels {
        nodes {
          name
        }
      }
    }
  }
}
```

## File Structure (Final)

```
agents/
├── package.json
├── feature-agent.ts
├── review-agent.ts
├── fix-agent.ts
├── linear-client.ts      # Linear API wrapper
├── linear-runner.ts      # Main automation script
├── processed-tickets.json # Track completed tickets
└── .env                   # API keys (gitignored)
```

## Getting Started Checklist

1. [ ] Create Linear API key at: https://linear.app/settings/api
2. [ ] Create a "auto-implement" label in Linear
3. [ ] Add LINEAR_API_KEY to `.env`
4. [ ] Install Linear SDK: `npm install @linear/sdk`
5. [ ] Implement `linear-client.ts`
6. [ ] Implement `linear-runner.ts`
7. [ ] Test with a single ticket manually
8. [ ] Set up scheduling (cron/launchd/GitHub Actions)

## Resources

- [Linear API Docs](https://developers.linear.app/docs)
- [Linear GraphQL Explorer](https://linear.app/graphiql)
- [@linear/sdk npm package](https://www.npmjs.com/package/@linear/sdk)
- [Claude Agent SDK](https://nader.substack.com/p/the-complete-guide-to-building-agents)
