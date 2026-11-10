# TrustToPay Agent API & MCP Tool Reference

This document provides the complete technical specification for the TrustToPay Agent REST endpoints and the four official MCP tools exposed by `@trusttopay/mcp-server`.

---

## 1. Authentication

All programmatic agent requests authenticate using a dedicated Bearer API key:

```http
Authorization: Bearer ttp_test_<your_key>
```

- Keys match the format `^ttp_(?:live|test)_[A-Za-z0-9_-]{16,128}$`.
- Manage keys via:
  - `GET /api/v1/auth/api-keys` — List active and revoked keys for the authenticated requester.
  - `POST /api/v1/auth/api-keys` — Generate a new key (returns `rawKey` once).
  - `DELETE /api/v1/auth/api-keys/:keyId` — Revoke a key immediately.

---

## 2. Official MCP Tools (`@trusttopay/mcp-server`)

The MCP server exposes **strictly four tools** for external AI agents. Specialist, admin, internal Gemini review, and PayPal payout endpoints are never exposed to external agents.

### 2.1 `trusttopay_create_task`
- **Underlying REST Endpoints**:
  - `POST /api/v1/tasks` (with `Idempotency-Key` header)
  - `POST /api/v1/payments/paypal/orders` & `/capture` (when `TRUSTTOPAY_MCP_AUTO_DISPATCH=true` in simulated mode)
  - `POST /api/v1/tasks/:id/offers/dispatch`
- **Required Arguments**:
  - `title` (`string`, 5–200 chars)
  - `description` (`string`, 20–8000 chars)
  - `category` (`string`)
  - `requiredSkills` (`string[]`, 1–10 skills)
  - `minimumSkillLevel` (`"L1" | "L2" | "L3"` or `1 | 2 | 3`)
  - `acceptanceCriteria` (`string[]` or `string`)
  - `expectedOutputType` (`"patch" | "files" | "structured_analysis" | "verification_verdict"`)
  - `urgency` (`"low" | "normal" | "high" | "critical"`)
  - `deadlineMinutes` (`number`, 5–10080)
  - `budgetMax` (`number`, integer in minor units, validated against server budget policy)
  - `idempotencyKey` (`string`, 8–120 chars)
- **Optional Arguments**:
  - `contextFiles` (`Array<{ path: string, content?: string, sha256?: string }>`, max 20 relative paths)

### 2.2 `trusttopay_get_task_status`
- **Underlying REST Endpoint**: `GET /api/v1/tasks/:id`
- **Arguments**: `{ "taskId": "<string>" }`
- **Returns**:
  - `taskId`, `status`, `assigned`, `assignedSpecialist` (sanitized without specialist email), `verificationStatus`, `securityVerdict`, `isReadyForHandback`, `updatedAt`, `correlationId`.

### 2.3 `trusttopay_get_verified_result`
- **Underlying REST Endpoint**: `GET /api/v1/tasks/:id/handback`
- **Arguments**: `{ "taskId": "<string>" }`
- **Security Gate Invariants**:
  1. `verification.status === "PASSED"`
  2. `safetyReview.verdict === "PASS"` (blocks `"BLOCK"` and `"NEEDS_HUMAN_REVIEW"`)
  3. `testRunSummary.passed === true` and `testRunSummary.exitCode === 0`
  4. `artifact.sha256Digest === verification.artifactSha256 === safetyReview.artifactSha256 === testRunSummary.artifactSha256`

### 2.4 `trusttopay_cancel_task`
- **Underlying REST Endpoint**: `POST /api/v1/tasks/:id/cancel`
- **Arguments**: `{ "taskId": "<string>", "reason": "<string>" }`
- **Cancellable States**: `DRAFT`, `QUEUED`, `MATCHING`, `OFFERED`, `OFFER_EXPIRED`, `NO_MATCH`, `AWAITING_FUNDING`, `FUNDING_FAILED`, `FUNDED`, `ASSIGNED`, `REVIEWER_ASSIGNED`, `IN_PROGRESS`, `SUBMITTED`, `SUBMISSION_RECEIVED`, `VERIFICATION_REJECTED`, `VERIFICATION_FAILED`, `NEEDS_REVISION`, `SAFETY_BLOCKED`, `SAFETY_REVIEW_FAILED`.
- **Non-Cancellable States**: `PAYMENT_PROCESSING`, `PAYMENT_PAID`, `COMPLETED`, `CANCELLED`, `DISPUTED`.

---

## 3. Signed Webhook Callbacks (`X-TrustToPay-Signature`)

When a task is configured with a `callbackUrl` and `callbackSecret`, `POST /api/v1/tasks/:id/handback/callback` delivers the verified handback payload signed with `HMAC-SHA256`:

- **Headers**:
  - `X-TrustToPay-Signature: sha256=<hex_hmac>`
  - `X-TrustToPay-Timestamp: <unix_epoch_seconds>`
  - `X-TrustToPay-Artifact-Sha256: <64_char_sha256>`
  - `Idempotency-Key: handback:<taskId>:v<version>:<sha256>`
- **Signature Computation**:
  ```text
  HMAC_SHA256(callbackSecret, "${timestamp}.${rawJsonBody}")
  ```
