import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * TrustToPay Autonomous Agent Escalation Example (TypeScript + Official MCP SDK)
 *
 * Demonstrates the complete 7-step lifecycle defined in `skills/trusttopay/SKILL.md`:
 *   1. Detect confidence below threshold (<0.70) or repeated test failure
 *   2. Redact secrets and prepare sanitized contextFiles + acceptanceCriteria
 *   3. Call `trusttopay_create_task`
 *   4. Poll `trusttopay_get_task_status`
 *   5. Call `trusttopay_get_verified_result`
 *   6. Validate SHA-256 digest, PASSED verification, PASS security gate, and passing test execution
 *   7. Resume agent execution
 */
export async function runAgentEscalationExample(options?: {
  mcpServerUrl?: string;
  agentApiKey?: string;
  pollMaxAttempts?: number;
  pollIntervalMs?: number;
}) {
  const mcpServerUrl =
    options?.mcpServerUrl ?? process.env.TRUSTTOPAY_MCP_URL ?? "http://127.0.0.1:3100/mcp";
  const agentApiKey =
    options?.agentApiKey ??
    process.env.TRUSTTOPAY_AGENT_API_KEY ??
    "ttp_test_replace_with_your_agent_api_key_000000";

  const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${agentApiKey}`,
      },
    },
  });

  const client = new Client({
    name: "trusttopay-typescript-example-agent",
    version: "1.0.0",
  });

  await client.connect(transport);

  try {
    // Verify discovered MCP tools
    const { tools } = await client.listTools();
    const toolNames = tools.map((t) => t.name);
    console.log("Discovered TrustToPay MCP tools:", toolNames);

    // Step 3: Create idempotent specialist task
    const createResult = await client.callTool({
      name: "trusttopay_create_task",
      arguments: {
        title: "Verify atomic compare-and-swap locking in offer acceptance service",
        description:
          "Autonomous test suite failed twice under 5-way concurrent specialist acceptance contention. Please audit and patch the CAS lock so only 1 specialist wins assignment and 4 receive HTTP 409.",
        category: "code_verification",
        requiredSkills: ["typescript", "system-architecture"],
        minimumSkillLevel: "L2",
        acceptanceCriteria: [
          "5 concurrent accept requests must produce exactly 1 winner (HTTP 200) and 4 conflicts (HTTP 409)",
          "Competing pending offers in the batch must transition to EXPIRED atomically",
        ],
        contextFiles: [
          {
            path: "src/services/matching/offerDispatcher.ts",
            content: "// Sanitized excerpt of acceptTaskOfferAtomically...",
          },
        ],
        expectedOutputType: "patch",
        urgency: "high",
        deadlineMinutes: 60,
        budgetMax: 2500,
        idempotencyKey: `ts-example-escalation-${Date.now()}`,
      },
    });

    const createdPayload = JSON.parse(
      (createResult.content as Array<{ type: string; text: string }>)[0].text,
    );
    const taskId: string = createdPayload.taskId;
    console.log("Created TrustToPay task:", taskId, "status:", createdPayload.status);

    // Step 4: Poll status
    const maxAttempts = options?.pollMaxAttempts ?? 1;
    const pollIntervalMs = options?.pollIntervalMs ?? 2000;
    let latestStatus = createdPayload;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const statusResult = await client.callTool({
        name: "trusttopay_get_task_status",
        arguments: { taskId },
      });
      latestStatus = JSON.parse(
        (statusResult.content as Array<{ type: string; text: string }>)[0].text,
      );
      console.log(
        `[Poll ${attempt}/${maxAttempts}] status=${latestStatus.status} readyForHandback=${String(latestStatus.isReadyForHandback)}`,
      );

      if (latestStatus.isReadyForHandback) {
        // Step 5: Retrieve verified result
        const verifiedResult = await client.callTool({
          name: "trusttopay_get_verified_result",
          arguments: { taskId },
        });
        const handback = JSON.parse(
          (verifiedResult.content as Array<{ type: string; text: string }>)[0].text,
        );

        // Step 6: Cryptographic & gate validation before resuming
        const sha = handback.artifact?.sha256Digest;
        if (
          handback.verification?.status !== "PASSED" ||
          handback.safetyReview?.verdict !== "PASS" ||
          handback.testRunSummary?.passed !== true ||
          sha !== handback.verification?.artifactSha256 ||
          sha !== handback.safetyReview?.artifactSha256 ||
          sha !== handback.testRunSummary?.artifactSha256
        ) {
          throw new Error("Handback failed client-side verification gate or SHA-256 digest binding.");
        }

        console.log("Verified deliverable ready! SHA-256:", sha);
        return { createdPayload, latestStatus, handback };
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }
    }

    return { createdPayload, latestStatus, handback: null };
  } finally {
    await client.close();
  }
}
