# TrustToPay — Hackathon Judge Access Guide

This guide describes how evaluation judges can access and test TrustToPay staging with full third-party integrations active.

---

## Intended Staging Configuration
- `DEMO_MODE=false`: All simulated payments and mock authentication bypasses are disabled.
- `DEMO_USERS_ENABLED=true`: Enables the two pre-seeded demonstration accounts below.
- Authentication is governed by **Supabase Auth** with server-side JWT verification.
- Payments use **PayPal Sandbox** (no real money moves).

---

## 1. Demonstration Accounts for Judges

TrustToPay provisions **exactly two** non-administrative roles for evaluation:

### Account A: Requester Demo (Agent Operator)
- **Role**: `REQUESTER`
- **Email**: `agent@demo.trusttopay.dev`
- **Password**: Configured in environment via `JUDGE_DEMO_PASSWORD` (Default: `TrustToPay2026!Judge`)
- **Key Capabilities**:
  - Creates agent escalation sessions.
  - Reviews AI confidence evaluation scores and evidence sources.
  - Funds task rewards in PayPal Sandbox.
  - Approves deliverables or disputes unverified submissions.
  - Downloads verified deliverables via HMAC-SHA256 signed handback.

### Account B: Reviewer Demo (Verified Specialist)
- **Role**: `REVIEWER`
- **Email**: `reviewer@demo.trusttopay.dev`
- **Password**: Configured in environment via `JUDGE_DEMO_PASSWORD` (Default: `TrustToPay2026!Judge`)
- **Pre-Verified Skill Qualifications**:
  - **TypeScript**: Level 3 (Advanced, 96/100)
  - **Smart Contracts**: Level 3 (Advanced, 95/100)
  - **USB-C Hardware**: Level 3 (Advanced, 95/100)
  - **Distributed Systems**: Level 2 (Practitioner, 88/100)
  - **Python**: Level 2 (Practitioner, 85/100)
- **Key Capabilities**:
  - Receives targeted task offers based on Elasticsearch hybrid retrieval.
  - Submits structured code solutions and evidence citations.
  - Triggers the Gemini automated deliverable security review and deterministic verification engine.
  - Views verification outcomes and task completion metrics.

---

## 2. Authentication Flow

1. Navigate to the application sign-in page: `http://localhost:5173/login`.
2. Enter the credentials for either **Requester Demo** or **Reviewer Demo**.
3. The frontend authenticates directly against **Supabase Auth** via PKCE.
4. On success, the backend syncs the Supabase identity (`/api/v1/auth/supabase-sync`), verifies the token signature, and issues an authenticated session cookie.
5. All public demo bypass buttons are hidden in non-demo mode.

---

## 3. Recommended Evaluation Scenarios

| Scenario ID | Task Title | State | What Judges Can Test |
| :--- | :--- | :--- | :--- |
| **Scenario A** | AeroBook 14 Charger Compatibility | `AWAITING_FUNDING` | Log in as Requester (`agent@demo.trusttopay.dev`), fund the task using PayPal Sandbox, and observe offer dispatch. |
| **Scenario B** | PowerDock TB4-96 Passthrough Power | `FUNDED` (Marketplace) | Log in as Reviewer (`reviewer@demo.trusttopay.dev`), review requirements, accept offer, and submit an evidence-grounded answer. |
| **Scenario C** | USB-C 45W Charger Compatibility | `REJECTED` | Inspect deterministic verification failure for unsupported/uncited answer. |
| **Scenario G** | Precision Power Supply Benchmark | `COMPLETED` | Review immutable artifact history, verification score (96/100), and completed audit trail. |

---

## 4. Resetting Demonstration State

To reset the database to a clean baseline state:
```bash
npm --workspace backend run seed
node scripts/provision_supabase_judge_accounts.mjs
```
This preserves all skill assessments and seeds fresh task scenarios without requiring new Supabase account creation.
