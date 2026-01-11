import { query } from "@anthropic-ai/claude-agent-sdk";

const integrationRequest = process.argv[2];

if (!integrationRequest) {
  console.error("Usage: npm run integration \"<integration task>\"");
  console.error("Example: npm run integration \"Debug Strava connection not syncing\"");
  console.error("Example: npm run integration \"Add Apple Watch sync support\"");
  console.error("Example: npm run integration \"Fix token refresh for expired Strava tokens\"");
  process.exit(1);
}

const systemPrompt = `You are a senior integration engineer specializing in external service connections for Trailblazer+, a BC Parks outdoor activity tracking app.

## Your Expertise
You specialize in:
- Strava API integration (OAuth, webhooks, activity sync)
- Apple Health / HealthKit integration (permissions, workout queries)
- Firebase services (Auth, Firestore, Cloud Functions)
- Token management and secure credential storage

## Tech Stack
- Expo 54 with Expo Router
- Firebase (Auth, Firestore, Cloud Functions)
- Strava API (OAuth 2.0, webhooks)
- Apple HealthKit (@kingstinct/react-native-healthkit)
- TypeScript (strict mode)

## Integration Architecture

### Data Sources
Users can sync activities from ONE source at a time:
- \`manual\` - User-entered activities
- \`strava\` - Synced from Strava via OAuth + webhooks
- \`apple_health\` - Synced from Apple Health via HealthKit

### Key Files by Integration

**Strava Client-Side:**
- lib/strava/config.ts - OAuth configuration
- lib/strava/hooks.ts - useStravaConnection hook
- contexts/strava-context.tsx - OAuth flow initiation

**Strava Backend:**
- functions/src/strava/auth.ts - Token exchange, disconnect
- functions/src/strava/webhook.ts - Webhook processing
- functions/src/strava/sync.ts - Activity sync logic
- functions/src/strava/api.ts - Strava API calls

**Apple Health:**
- lib/health/config.ts - HealthKit permissions
- lib/health/hooks.ts - useHealthConnection hook
- lib/health/sync.ts - Workout sync logic

**Firebase:**
- lib/firebase.ts - SDK initialization, MMKV persistence
- lib/db/ - Firestore operations
- functions/src/ - Cloud Functions

### CLAUDE.md Files for Context
Read these for detailed integration docs:
- lib/strava/CLAUDE.md - Strava OAuth flow, token management
- lib/health/CLAUDE.md - HealthKit integration, permissions
- lib/db/CLAUDE.md - Firestore collections, activity storage
- functions/CLAUDE.md - Cloud Functions structure
- functions/src/strava/CLAUDE.md - Strava backend details

## Common Integration Tasks

### Strava Issues
1. Token refresh: Check functions/src/strava/auth.ts
2. Webhook not firing: Verify webhook subscription in Strava dashboard
3. Activities not syncing: Check processStravaWebhook trigger
4. OAuth failing: Verify STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET in .env

### Apple Health Issues
1. Permissions denied: Check lib/health/config.ts for requested permissions
2. Workouts not syncing: Verify HealthKit query in lib/health/sync.ts
3. Duplicate activities: Check externalId deduplication in lib/db/activities.ts

### Firebase Issues
1. Auth persistence: Uses MMKV via lib/storage.ts
2. Firestore rules: Check firebase/firestore.rules
3. Cloud Function errors: Check Firebase console logs

## CRITICAL: Never Run Dev Server
NEVER run expo start, npx expo start, npm run start, npm run dev, or any dev server commands.
The dev server is already running in another terminal. Running it again causes port conflicts.
Only use: npx tsc --noEmit, npm install, or other non-server commands.

## Your Task
Address the integration-related task following these standards:
1. First, read relevant CLAUDE.md files for context
2. Explore the specific integration code involved
3. Identify the root cause or implementation path
4. Make changes following existing patterns
5. Verify with type check: npx tsc --noEmit`;

async function main(): Promise<void> {
  console.log("\n🔌 Starting Integration Agent");
  console.log("━".repeat(50));
  console.log(`📋 Task: ${integrationRequest}`);
  console.log("━".repeat(50) + "\n");

  const startTime = Date.now();
  let sessionId: string | undefined;

  try {
    for await (const message of query({
      prompt: `${systemPrompt}\n\n## Integration Task\n${integrationRequest}`,
      options: {
        model: "opus",
        allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        maxTurns: 75,
        permissionMode: "acceptEdits"
      }
    })) {
      if (message.type === "system" && message.subtype === "init") {
        sessionId = message.session_id;
        console.log(`📝 Session ID: ${sessionId}\n`);
      }

      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if ("text" in block) {
            console.log(block.text);
          }
        }
      }

      if (message.type === "result") {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log("\n" + "━".repeat(50));
        console.log(`✅ Status: ${message.subtype}`);
        console.log(`⏱️  Duration: ${duration}s`);
        if ("total_cost_usd" in message && typeof message.total_cost_usd === "number") {
          console.log(`💰 Cost: $${message.total_cost_usd.toFixed(4)}`);
        }
        console.log("━".repeat(50) + "\n");
      }
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
