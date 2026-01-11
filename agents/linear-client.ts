import "dotenv/config";
import { LinearClient, IssueConnection } from "@linear/sdk";

const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY || ""
});

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | undefined;
  branchName: string;
  url: string;
  labels: string[];
}

export async function getInProgressIssuesWithAgentLabel(): Promise<LinearIssue[]> {
  const issues: IssueConnection = await linearClient.issues({
    first: 50,
    filter: {
      state: { name: { eq: "In Progress" } },
      labels: { some: { name: { eqIgnoreCase: "agent" } } }
    }
  });

  const result: LinearIssue[] = [];

  for (const issue of issues.nodes) {
    const labels = await issue.labels();
    const labelNames = labels.nodes.map(l => l.name.toLowerCase());

    result.push({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      branchName: issue.branchName,
      url: issue.url,
      labels: labelNames
    });
  }

  return result;
}

export async function markAsProcessing(issueId: string): Promise<void> {
  await linearClient.createComment({
    issueId,
    body: "🤖 **Agent working on this...**\n\nAn AI agent is now implementing this issue. Progress is being logged."
  });
}

export async function markAsComplete(issueId: string, prUrl: string): Promise<void> {
  await linearClient.createComment({
    issueId,
    body: `✅ **Implementation complete!**\n\nPull request created: ${prUrl}\n\nPlease review the changes.`
  });

  const issue = await linearClient.issue(issueId);
  const team = await issue.team;

  if (team) {
    const states = await team.states();
    const inReviewState = states.nodes.find(
      s => s.name.toLowerCase() === "in review"
    );

    if (inReviewState) {
      await linearClient.updateIssue(issueId, {
        stateId: inReviewState.id
      });
    }
  }
}

export async function markAsFailed(issueId: string, error: string): Promise<void> {
  await linearClient.createComment({
    issueId,
    body: `❌ **Agent failed**\n\n\`\`\`\n${error}\n\`\`\`\n\nPlease check the logs and try again manually.`
  });
}

export function getAgentType(labels: string[]): "feature" | "fix" {
  if (labels.includes("bug") || labels.includes("fix")) {
    return "fix";
  }
  return "feature";
}
