# TrustToPay Result Validation & Security Gates Reference

An autonomous AI agent must **never** blindly execute or merge human-submitted code. Every deliverable returned by `trusttopay_get_verified_result` is governed by a three-stage verification gate and cryptographic SHA-256 binding.

---

## 1. Mandatory Three-Stage Verification Gate

Both the TrustToPay backend (`/api/v1/tasks/:id/handback`) and `@trusttopay/mcp-server` (`trusttopay_get_verified_result`) enforce all three invariants before releasing an artifact:

1. **Deterministic & Structural Verification (`verification.status === "PASSED"`)**:
   - Path traversal checks (`..`, leading `/`, Windows drive letters, null bytes) passed.
   - Forbidden binary/executable extensions (`.exe`, `.dll`, `.so`, `.dylib`, `.sh`, `.bat`, `.cmd`, `.ps1`) blocked.
   - Deterministic secret scanner confirmed zero hardcoded credentials in the specialist's submission.
2. **Layered Gemini Security Gate (`safetyReview.verdict === "PASS"`)**:
   - Reviewed by `@google/genai` with fail-closed policy (`CODE_REVIEW_FAIL_CLOSED=true`).
   - Submissions with `verdict: "BLOCK"` or `verdict: "NEEDS_HUMAN_REVIEW"` are strictly blocked from agent handoff.
3. **Isolated Test Execution (`testRunSummary.passed === true` and `exitCode === 0`)**:
   - Verification checks executed inside an isolated runner boundary (or explicitly labelled fixture runner in non-container environments) with exit code `0`.

---

## 2. Cryptographic Digest Binding (`SHA-256`)

When an agent receives the output of `trusttopay_get_verified_result`, it must assert exact equality across all four digest fields:

```text
artifact.sha256Digest
  === verification.artifactSha256
  === safetyReview.artifactSha256
  === testRunSummary.artifactSha256
```

If any digest is missing or mismatched, the MCP server throws a `DIGEST_MISMATCH` error and refuses to return the artifact. If a specialist submits a revised version (`v2`), all prior `v1` verification and security runs are immediately invalidated (`invalidatedAt != null`), and `v2` must pass all three gates anew.

---

## 3. Handling Blocked or Pending States

| Error Code / State | Meaning | Required Agent Action |
| :--- | :--- | :--- |
| `HANDBACK_NOT_READY` | Specialist has not submitted yet, or verification is still running (`VERIFICATION_PENDING`). | Continue polling `trusttopay_get_task_status` until `isReadyForHandback: true` or deadline expires. |
| `HANDBACK_SECURITY_GATE_REQUIRED` | Submission received `BLOCK` or `NEEDS_HUMAN_REVIEW` from the security gate. | **Do not consume artifact.** Wait for specialist resubmission (`NEEDS_REVISION`) or admin review (`NEEDS_MANUAL_REVIEW`), or cancel/escalate to operator. |
| `HANDBACK_EXECUTION_GATE_REQUIRED` | Isolated test runner failed (`exitCode !== 0` or `passed !== true`). | **Do not consume artifact.** Wait for specialist to submit a corrected version that passes tests. |
| `FORBIDDEN` | Authenticated agent API key does not own `taskId`. | Verify `taskId` belongs to the current agent session; never probe other requesters' tasks. |

---

## 4. Safe Workspace Reintegration

Once all checks above pass:
1. Validate that every `changedFiles[i].path` is within the expected project subdirectory and does not modify agent configuration files (`.mcp.json`, `.env`, `.git/hooks/*`, CI secrets).
2. Write the verified changes to the working tree.
3. Run the local test/typecheck command (`npm test` / `pytest` / `tsc --noEmit`) to confirm clean integration in the target repository.
4. Record `handoffIdempotencyKey` and `artifact.sha256Digest` in the agent's completion summary.
