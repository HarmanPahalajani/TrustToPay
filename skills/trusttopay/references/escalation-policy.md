# TrustToPay Escalation Policy Reference

This reference defines the quantitative and qualitative rules an autonomous AI agent must apply when deciding whether to escalate a task to a human specialist via TrustToPay.

---

## 1. Escalation Decision Matrix

| Signal / Condition | Threshold | Action | Required Minimum Skill Level |
| :--- | :--- | :--- | :--- |
| Model / Agent Confidence Score | `< 0.70` on critical path | **Escalate** via `trusttopay_create_task` | `L2` (Practitioner) |
| Consecutive Autonomous Fix Failures | `>= 2` failed test/build iterations | **Escalate** with failing test output & diff | `L2` (Practitioner) |
| Security / Auth / Cryptography Changes | Any non-trivial mutation | **Escalate** for verified specialist implementation/review | `L3` (Advanced) |
| Financial / Payment Ledger Logic | Any mutation to capture, payout, or reconciliation | **Escalate** with strict acceptance invariants | `L3` (Advanced) |
| Concurrency / Distributed Locking | Race conditions, atomic CAS, idempotency | **Escalate** with concurrency reproduction case | `L2` or `L3` |
| Standard Boilerplate / Formatting / Docs | Confidence `>= 0.85`, local tests pass | **Do NOT escalate** (solve locally) | N/A |

---

## 2. Selecting Required Skills and Minimum Skill Level (`L1`–`L3`)

TrustToPay specialists earn verified levels sequentially (`L1 -> L2 -> L3`) through graded technical assessments:

- **Level 1 (`L1` — Foundation)**:
  - Suitable for structured bug reproduction, unit test authoring, API payload validation, and well-scoped module fixes.
  - Recommended `urgency`: `"normal"` or `"low"`.
- **Level 2 (`L2` — Practitioner)**:
  - Suitable for full-stack TypeScript/Python implementation, database query optimization, state-machine enforcement, and multi-file refactoring.
  - Recommended `urgency`: `"normal"` or `"high"`.
- **Level 3 (`L3` — Advanced)**:
  - Required for security-critical architecture, cryptographic verification pipelines, payment gateway edge cases, smart contract auditing, and complex distributed concurrency bugs.
  - Recommended `urgency`: `"high"` or `"critical"`.

### Canonical Skill Identifiers
When populating `requiredSkills` in `trusttopay_create_task`, prefer canonical skill slugs or names supported by the TrustToPay skill catalog:
- `typescript` (`TypeScript & Node.js Architecture`)
- `python` (`Python & Async Systems`)
- `smart-contracts` (`Smart Contracts & Web3 Security`)
- `system-architecture` (`Distributed Systems & Security Architecture`)

---

## 3. Pre-Escalation Redaction Checklist

Before calling `trusttopay_create_task`, the agent **must** sanitize all text fields (`title`, `description`, `acceptanceCriteria`, `contextFiles`):

1. **Credentials & Tokens**: Replace any occurrences of `sk-...`, `ghp_...`, `github_pat_...`, `ttp_live_...`, `ttp_test_...`, `AKIA...`, `AIza...`, `xoxb-...`, or Bearer tokens with `<REDACTED_SECRET>`.
2. **Private Keys**: Never include `-----BEGIN PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----` blocks.
3. **Connection Strings**: Replace database URLs containing credentials (e.g., `postgresql://user:password@host/db`) with `postgresql://<REDACTED>@localhost:5432/app`.
4. **Customer PII**: Anonymize real user emails, phone numbers, financial account identifiers, and street addresses using synthetic RFC 2606 domains (`example.com`).

---

## 4. Cancellation Policy

An agent may call `trusttopay_cancel_task` only when:
- The parent user explicitly aborts the operation or changes requirements before specialist work is finalized.
- The task is still in a pre-settlement cancellable state (`DRAFT`, `QUEUED`, `MATCHING`, `OFFERED`, `AWAITING_FUNDING`, `FUNDED`).
- Once a task enters `PAYMENT_PROCESSING`, `PAYMENT_PAID`, `COMPLETED`, or `DISPUTED`, cancellation is blocked by the state machine.
