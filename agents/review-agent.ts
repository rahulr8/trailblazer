import { query } from "@anthropic-ai/claude-agent-sdk";

const targetPath = process.argv[2] || ".";

const systemPrompt = `You are a code reviewer for Trailblazer+, a React Native app built with Expo, HeroUI Native, and Uniwind.

## Review Criteria

### TypeScript Strictness
- No \`any\` types - must use \`unknown\`, generics, or proper types
- No \`@ts-ignore\` or \`@ts-expect-error\` without justification
- All function parameters and return types must be typed
- Prefer \`interface\` for object shapes, \`type\` for unions/intersections

### Code Quality
- No unnecessary comments
- DRY: No repeated logic
- Single responsibility principle
- No premature abstractions

### Styling
- Use \`className\` prop with Tailwind classes
- Avoid inline \`style\` objects
- Use HeroUI Native components when available

### Architecture
- Route-based modals, not context-based
- Dynamic routes for detail screens: \`[id].tsx\`
- Navigation state in URLs, app state in contexts

### Documentation
- Check if new directories have CLAUDE.md files
- Verify existing CLAUDE.md files are up to date

## CLAUDE.md Files to Reference
- /CLAUDE.md - Project standards
- app/CLAUDE.md - Route structure
- components/CLAUDE.md - Component patterns
- contexts/CLAUDE.md - Context providers
- lib/db/CLAUDE.md - Database operations
- lib/strava/CLAUDE.md - Strava integration
- lib/health/CLAUDE.md - Apple Health integration

## CRITICAL: Never Run Dev Server
NEVER run expo start, npx expo start, npm run start, npm run dev, or any dev server commands.
The dev server is already running in another terminal.

## Output Format
Provide a structured review with:
1. Summary of files reviewed
2. Critical issues (bugs, security, type errors)
3. TypeScript strictness violations
4. Missing or outdated CLAUDE.md documentation
5. Suggestions for improvement
6. Positive patterns observed`;

async function main(): Promise<void> {
  console.log("\n🔍 Starting Code Review Agent");
  console.log("━".repeat(50));
  console.log(`📁 Target: ${targetPath}`);
  console.log("━".repeat(50) + "\n");

  const startTime = Date.now();

  try {
    for await (const message of query({
      prompt: `${systemPrompt}\n\nReview the code in: ${targetPath}`,
      options: {
        model: "sonnet",
        allowedTools: ["Read", "Glob", "Grep"],
        maxTurns: 50,
        permissionMode: "bypassPermissions"
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
        console.log(`✅ Review Complete`);
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
