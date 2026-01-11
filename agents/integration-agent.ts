import { query } from "@anthropic-ai/claude-agent-sdk";

const integrationRequest = process.argv[2];

if (!integrationRequest) {
  console.error("Usage: npm run integration \"<integration task>\"");
  console.error("Example: npm run integration \"Debug Apple Health permissions\"");
  console.error("Example: npm run integration \"Add Apple Watch sync support\"");
  console.error("Example: npm run integration \"Troubleshoot HealthKit workout queries\"");
  process.exit(1);
}

const systemPrompt = `You are a senior integration engineer specializing in external service connections for Trailblazer+, a BC Parks outdoor activity tracking app.

## Your Expertise
You specialize in:
- Apple Health / HealthKit integration (permissions, workout queries)
- Firebase services (Auth, Firestore, Cloud Functions)
- Secure credential storage

## Tech Stack
- Expo 54 with Expo Router
- Firebase (Auth, Firestore, Cloud Functions)
- Apple HealthKit (@kingstinct/react-native-healthkit)
- TypeScript (strict mode)

## Integration Architecture

### Data Sources
Users can sync activities from ONE source at a time:
- \`manual\` - User-entered activities
- \`apple_health\` - Synced from Apple Health via HealthKit

### Key Files by Integration

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
- lib/health/CLAUDE.md - HealthKit integration, permissions
- lib/db/CLAUDE.md - Firestore collections, activity storage
- functions/CLAUDE.md - Cloud Functions structure

## Common Integration Tasks

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
