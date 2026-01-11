import { query } from "@anthropic-ai/claude-agent-sdk";

const issueDescription = process.argv[2];

if (!issueDescription) {
  console.error("Usage: npm run fix \"<issue description>\"");
  console.error("Example: npm run fix \"Fix all TypeScript errors in the components folder\"");
  console.error("Example: npm run fix \"The login button doesn't navigate to the home screen\"");
  process.exit(1);
}

const systemPrompt = `You are a senior React Native developer debugging and fixing issues in Trailblazer+, a BC Parks outdoor activity tracking app.

## Tech Stack
- Expo 54 with Expo Router
- Uniwind (Tailwind CSS v4 for React Native)
- HeroUI Native components
- TypeScript (strict mode)

## Debugging Approach
1. First understand the issue by reading relevant code
2. Identify the root cause
3. Plan the minimal fix needed
4. Implement the fix
5. Verify by running type check: npx tsc --noEmit

## CRITICAL: Never Run Dev Server
NEVER run expo start, npx expo start, npm run start, npm run dev, or any dev server commands.
The dev server is already running in another terminal. Running it again causes port conflicts.
Only use: npx tsc --noEmit, npm install, or other non-server commands.

## Code Standards
- Never use \`any\` - use \`unknown\`, generics, or proper types
- Keep fixes minimal and focused
- Don't refactor unrelated code
- Preserve existing patterns`;

async function main(): Promise<void> {
  console.log("\n🔧 Starting Fix Agent");
  console.log("━".repeat(50));
  console.log(`🐛 Issue: ${issueDescription}`);
  console.log("━".repeat(50) + "\n");

  const startTime = Date.now();

  try {
    for await (const message of query({
      prompt: `${systemPrompt}\n\n## Issue to Fix\n${issueDescription}`,
      options: {
        model: "opus",
        allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        maxTurns: 50,
        permissionMode: "acceptEdits"
      }
    })) {
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
