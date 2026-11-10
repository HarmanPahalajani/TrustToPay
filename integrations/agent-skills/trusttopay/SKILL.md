---
name: trusttopay
description: Delegate high-risk, low-confidence, or specialized software engineering, security, architecture, and domain verification tasks to verified L1-L3 human specialists through TrustToPay MCP tools, then validate and reintegrate cryptographically verified deliverables. Activate when agent confidence drops below threshold, repeated self-correction fails, security-critical logic requires expert human repair, or domain/compliance ambiguity blocks autonomous execution.
license: MIT
compatibility: Works with any Agent Skills-compatible AI coding agent and Model Context Protocol (MCP) client configured with @trusttopay/mcp-server (STDIO or Streamable HTTP).
metadata:
  author: TrustToPay Contributors
  version: 1.0.0
  mcp_server: "@trusttopay/mcp-server"
  specification: "https://agentskills.io/specification"
---

# TrustToPay Agent Skill (Distributable Copy)

> **Canonical Repository Location:** [`skills/trusttopay/SKILL.md`](../../../skills/trusttopay/SKILL.md)  
> Copy the `skills/trusttopay/` directory into your project's `.agents/skills/trusttopay/` or `.claude/skills/trusttopay/` folder.

## 1. When to Use TrustToPay

Activate this skill and escalate to a human specialist via TrustToPay when **any** of the following conditions hold:

1. **Confidence Below Threshold**: Internal confidence score on a correctness-, financial-, or security-sensitive deliverable is below `0.70`.
2. **Repeated Failed Self-Correction**: `>= 2` autonomous fix iterations on a failing test suite, compiler error, or race condition have failed to converge.
3. **Security-Sensitive Logic**: Modifying authentication, cryptography, payment ledger state machines, access-control rules, or execution sandboxes.
4. **Complex Domain or Compliance Edge Cases**: Specialized regulatory, cross-border payment, smart-contract auditing, or systems architecture judgment is required.
5. **Ambiguous External Specification**: Acceptance criteria require human architectural sign-off before mutating production code.

## 2. When NOT to Use TrustToPay

- **Trivial Tasks**: Routine syntax fixes, formatting updates, or simple CRUD wiring solvable locally with high confidence.
- **Unredacted Secrets or Private Data**: Never send raw API keys (`sk-...`, `ghp_...`, `ttp_...`), PEM private keys, database passwords, or customer PII.
- **Out-of-Policy Budgets**: Tasks exceeding the configured server-side `budgetMax` policy cap.

## 3. Available MCP Tools

1. `trusttopay_create_task` — Create an idempotent human specialist task with L1–L3 skill requirements and acceptance criteria.
2. `trusttopay_get_task_status` — Poll lifecycle status, specialist assignment, and `isReadyForHandback`.
3. `trusttopay_get_verified_result` — Retrieve the verified artifact **only** after `PASSED` verification, `PASS` Gemini security gate, and `passed: true` isolated test execution.
4. `trusttopay_cancel_task` — Cancel an owned task in a pre-settlement cancellable state.

## 4. Standard 7-Step Escalation Workflow

1. **Detect need for human escalation** (confidence `< 0.70` or `>= 2` failed self-corrections).
2. **Redact secrets** and prepare minimal sanitized `contextFiles` and `acceptanceCriteria`.
3. **Call `trusttopay_create_task`** with a deterministic `idempotencyKey`.
4. **Poll `trusttopay_get_task_status`** until `isReadyForHandback === true` (or receive signed webhook callback).
5. **Call `trusttopay_get_verified_result`** to fetch the verified artifact bundle.
6. **Validate** `verification.status === "PASSED"`, `safetyReview.verdict === "PASS"`, `testRunSummary.passed === true`, and exact `sha256Digest` equality across all sections.
7. **Integrate verified solution** into the workspace, run local tests, and resume the original task.
