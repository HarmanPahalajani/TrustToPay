# TrustToPay Task Format & Tool Input Reference

This reference defines the exact input and output structures for the four official TrustToPay MCP tools.

---

## 1. `trusttopay_create_task`

Creates a verified human specialist task, enforces server-side budget and secret-redaction checks, funds/dispatches offers when configured, and returns the created task descriptor.

### Input Schema

```json
{
  "title": "Fix race condition in concurrent offer acceptance transaction",
  "description": "When 5 specialists accept a task offer simultaneously, our transaction occasionally allows duplicate assignments under high contention. Implement atomic compare-and-swap locking and return 409 on losing requests.",
  "category": "code_verification",
  "requiredSkills": ["typescript", "system-architecture"],
  "minimumSkillLevel": "L2",
  "acceptanceCriteria": [
    "5 concurrent accept requests must yield exactly 1 HTTP 200 winner and 4 HTTP 409 responses",
    "All non-winning pending offers for the task must transition to EXPIRED atomically",
    "Include a deterministic concurrency unit test covering the 5-way race"
  ],
  "contextFiles": [
    {
      "path": "src/services/matching/offerDispatcher.ts",
      "content": "// Sanitized relevant excerpt of offer acceptance logic...",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ],
  "expectedOutputType": "patch",
  "urgency": "high",
  "deadlineMinutes": 60,
  "budgetMax": 2500,
  "idempotencyKey": "agent-run-2026-11-08-race-fix-01"
}
```

### Field Rules
- `title` (`string`, 5–200 chars, required): Concise summary of the engineering or verification problem.
- `description` (`string`, 20–8000 chars, required): Detailed problem context, observed failure behaviour, and constraints. Must not contain unredacted secrets.
- `category` (`string`, required): One of `"code_verification"`, `"security_remediation"`, `"system_architecture"`, `"factual"`, `"compliance"`, `"contract_ interpretation"`, `"technical_ incident"`, `"financial_analysis"`, `"general_high_stakes"`.
- `requiredSkills` (`string[]`, 1–10 items, required): Skill slugs or names required to solve the task.
- `minimumSkillLevel` (`"L1" | "L2" | "L3"` or `1 | 2 | 3`, required): Minimum verified specialist level.
- `acceptanceCriteria` (`string[]` or `string`, required): Concrete, verifiable requirements that the specialist's submission will be tested against.
- `contextFiles` (`Array<{ path: string, content?: string, sha256?: string }>`, max 20 files, optional): Sanitized context files. Paths must be relative and free of `..` traversal.
- `expectedOutputType` (`"patch" | "files" | "structured_analysis" | "verification_verdict"`, required): Expected deliverable format.
- `urgency` (`"low" | "normal" | "high" | "critical"`, default `"normal"`): Maps to task risk/priority routing.
- `deadlineMinutes` (`number`, integer `5`–`10080`, default `60`): Target turnaround window in minutes.
- `budgetMax` (`number`, integer in minor units e.g. `2500` = `$25.00 USD`, required): Maximum reward budget in USD minor units (cents). Enforced against server-side policy limits (`REWARD_MIN_MINOR` to `REWARD_MAX_MINOR` and `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR`).
- `idempotencyKey` (`string`, 8–120 chars, required): Unique key preventing duplicate task creation across retries.

### Output Schema

```json
{
  "taskId": "cmmxyz123456",
  "status": "OFFERED",
  "createdAt": "2026-11-08T23:00:00.000Z",
  "minimumSkillLevel": 2,
  "requiredSkills": ["typescript", "system-architecture"],
  "rewardMinor": 2500,
  "currency": "USD",
  "offersDispatched": 5,
  "idempotentReplay": false,
  "correlationId": "ttp-mcp-9f8a7b6c"
}
```

---

## 2. `trusttopay_get_task_status`

Polls the current status of an existing task owned by the authenticated agent.

### Input Schema

```json
{
  "taskId": "cmmxyz123456"
}
```

### Output Schema

```json
{
  "taskId": "cmmxyz123456",
  "status": "VERIFIED",
  "assigned": true,
  "assignedSpecialist": {
    "assignedAt": "2026-11-08T23:04:12.000Z",
    "status": "ACTIVE"
  },
  "verificationStatus": "PASSED",
  "securityVerdict": "PASS",
  "isReadyForHandback": true,
  "updatedAt": "2026-11-08T23:12:45.000Z",
  "correlationId": "ttp-mcp-4d3e2f1a"
}
```

---

## 3. `trusttopay_get_verified_result`

Retrieves the verified artifact, security review summary, and isolated test run summary once `isReadyForHandback` is `true`.

### Input Schema

```json
{
  "taskId": "cmmxyz123456"
}
```

### Output Schema

```json
{
  "taskId": "cmmxyz123456",
  "taskStatus": "HANDED_OFF",
  "verifiedAt": "2026-11-08T23:12:45.000Z",
  "handoffIdempotencyKey": "handback:cmmxyz123456:v1:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  "artifact": {
    "id": "art_01",
    "version": 1,
    "sha256Digest": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    "totalSizeBytes": 1420,
    "fileCount": 1,
    "fileManifest": [
      {
        "path": "src/services/matching/offerDispatcher.ts",
        "sizeBytes": 1420,
        "sha256": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
      }
    ],
    "changedFiles": [
      {
        "path": "src/services/matching/offerDispatcher.ts",
        "content": "export async function acceptTaskOfferAtomically(...) { ... }"
      }
    ],
    "patchText": null,
    "archiveUrl": null
  },
  "verification": {
    "verificationRunId": "vrun_01",
    "status": "PASSED",
    "decisionReason": "All deterministic, Gemini security, and isolated execution checks passed.",
    "artifactVersion": 1,
    "artifactSha256": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
  },
  "safetyReview": {
    "safetyReviewId": "sr_vrun_01",
    "verdict": "PASS",
    "riskLevel": "LOW",
    "engine": "GEMINI_LAYERED_GATE",
    "artifactSha256": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    "reviewedAt": "2026-11-08T23:12:44.000Z"
  },
  "testRunSummary": {
    "runnerMode": "FIXTURE_LABELLED",
    "runnerImageVersion": "trusttopay-runner:1.0.0",
    "command": "npm test",
    "exitCode": 0,
    "passed": true,
    "durationMs": 410,
    "stdout": "PASS src/services/matching/offerDispatcher.ts",
    "artifactSha256": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
  },
  "signature": {
    "header": "sha256=...",
    "timestamp": "1762643565",
    "algorithm": "HMAC-SHA256"
  }
}
```

---

## 4. `trusttopay_cancel_task`

Cancels an active task that has not yet entered non-cancellable settlement or completion states.

### Input Schema

```json
{
  "taskId": "cmmxyz123456",
  "reason": "Parent workflow aborted by user before specialist assignment."
}
```

### Output Schema

```json
{
  "taskId": "cmmxyz123456",
  "status": "CANCELLED",
  "cancelledAt": "2026-11-08T23:15:00.000Z",
  "reason": "Parent workflow aborted by user before specialist assignment.",
  "correlationId": "ttp-mcp-1a2b3c4d"
}
```
