import { query } from "@anthropic-ai/claude-agent-sdk";

const featureRequest = process.argv[2];

if (!featureRequest) {
  console.error("Usage: npm run feature \"<feature description>\"");
  console.error("Example: npm run feature \"Add a favorites screen where users can save their favorite trails\"");
  process.exit(1);
}

const systemPrompt = `You are a senior React Native developer working on Trailblazer+, a BC Parks outdoor activity tracking app.

## Tech Stack
- Expo 54 with Expo Router
- Uniwind (Tailwind CSS v4 for React Native)
- HeroUI Native components
- TypeScript (strict mode)
- Firebase (Auth, Firestore, Cloud Functions)
- Integrations: Apple HealthKit

## Code Standards
- Never use \`any\` - use \`unknown\`, generics, or proper types
- Use \`className\` prop with Tailwind classes for styling
- Route-based modals: Use \`router.push('/(modals)/...')\` not context-based modals
- Dynamic routes for detail screens: \`[id].tsx\` pattern
- Import HeroUI components from 'heroui-native'

## Project Structure & CLAUDE.md Files
Read relevant CLAUDE.md files for context before implementing:
- /CLAUDE.md - Project standards and anti-patterns
- app/CLAUDE.md - Expo Router structure, auth routing, navigation
- components/CLAUDE.md - Component patterns, styling
- contexts/CLAUDE.md - Context providers (Auth, Theme)
- hooks/CLAUDE.md - Custom hooks
- lib/db/CLAUDE.md - Firestore operations, activity types
- lib/health/CLAUDE.md - Apple Health integration
- lib/constants/CLAUDE.md - Activity constants, source config

## Data Sources
Users sync activities from ONE source at a time:
- \`manual\` - User-entered
- \`apple_health\` - HealthKit workouts

Source config in lib/constants/sources.ts is the single source of truth.

## CRITICAL: Never Run Dev Server
NEVER run expo start, npx expo start, npm run start, npm run dev, or any dev server commands.
The dev server is already running in another terminal. Running it again causes port conflicts.
Only use: npx tsc --noEmit, npm install, or other non-server commands.

## Documentation Updates
After creating new directories or significant features, update the relevant CLAUDE.md file so future sessions have context.

## Your Task
Implement the requested feature following these standards:
1. First, read relevant CLAUDE.md files for context
2. Explore the codebase to understand existing patterns
3. Plan your implementation approach
4. Implement the feature with proper TypeScript types
5. Ensure the code follows existing patterns
6. Run type check: npx tsc --noEmit`;

async function main(): Promise<void> {
  console.log("\n🚀 Starting Feature Implementation Agent");
  console.log("━".repeat(50));
  console.log(`📋 Feature Request: ${featureRequest}`);
  console.log("━".repeat(50) + "\n");

  const startTime = Date.now();
  let sessionId: string | undefined;

  try {
    for await (const message of query({
      prompt: `${systemPrompt}\n\n## Feature to Implement\n${featureRequest}`,
      options: {
        model: "opus",
        allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        maxTurns: 100,
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
