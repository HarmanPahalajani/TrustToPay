# TrustToPay — Implementation Acceptance Criteria

**Document Type:** Engineering Acceptance Criteria & Quality Gates  
**Associated Roadmap:** [`docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md)  
**Creation Date:** 2026-11-10  

---

## 1. Overview & Verification Philosophy

To prevent premature declarations of completion, every task in the TrustToPay implementation roadmap must satisfy concrete, testable acceptance criteria before being marked complete. A UI component alone or a mock stub does not satisfy acceptance.

---

## 2. Workstream Quality Gates & Acceptance Criteria

### Gate 1: Privacy & Media Stream Security (Phase 1)
- [ ] **AC-1.1 (Zero Microphone Access):**
  - Opening `/app/assessment/:skillSlug/:level` triggers a browser permission prompt for **Camera only**. The browser's URL bar indicator confirms that microphone access is NOT requested or active.
  - `stream.getAudioTracks().length === 0`.
- [ ] **AC-1.2 (Compulsory Video & Screen Enforcement):**
  - The "Enter Proctored Assessment" button remains disabled with `opacity-50` until both camera and screen sharing streams have active tracks.
  - Disconnecting either stream triggers `isInterrupted: true`, immediately pauses the exam timer, and disables answer submission.
- [ ] **AC-1.3 (45-Second Grace Window):**
  - If a disconnected stream is restored within 45 seconds, the assessment resumes and logs `CAMERA_RESUMED` or `SCREEN_RESUMED`.
  - If 45 seconds elapse without reconnection, the attempt is invalidated with status `FAILED` and recorded in the audit log.

---

### Gate 2: UI & Design System Consistency (Phase 1)
- [ ] **AC-2.1 (Administrator Reference Elimination):**
  - No user-facing text, error message, or banner on `/app` or `/app/reviews` mentions the word "administrator" or "admin".
  - Reviewer accounts display clear status based on real profile attributes (e.g. verified credentials and payout profile readiness).
- [ ] **AC-2.2 (Ivory Design System Chart Theming):**
  - Recharts `CartesianGrid` stroke renders using `--border-subtle` (`#E5E1D7`).
  - Recharts `Tooltip` container renders with background `#FFFEFA`, border `#E5E1D7`, and ink text `#202722`. Zero instances of dark `#0E1522` or `#1E2B42` remain in chart DOM elements.
- [ ] **AC-2.3 (Dependency & Bundle Optimization):**
  - `frontend/package.json` contains zero references to `ag-grid-community` or `ag-grid-react`.
  - `frontend/src/index.css` contains zero `@import` rules referencing AG Grid.
  - `npm --workspace frontend run build` completes with exit code 0 and total gzip bundle size for CSS is verified under 30KB (reduced from 47.5KB).

---

### Gate 3: Skill Assessment Engine & Question Banks (Phase 2)
- [ ] **AC-3.1 (7 Priority Skills Coverage):**
  - `GET /api/v1/skills` returns valid definitions for all 11 assessed skills: TypeScript, Python, Smart Contracts, Distributed Systems, Go, Rust, React, Next.js, Docker, Kubernetes, and SQL.
  - Each of the 11 skills contains exactly 3 stages: Level 1 (Foundation), Level 2 (Practitioner), and Level 3 (Advanced).
- [ ] **AC-3.2 (Cryptographic Single-Question Selection):**
  - Calling `POST /api/v1/skills/assessments/start` returns an array of `questions` with `length === 1`.
  - The question is selected cryptographically via `crypto.randomInt`.
  - Consecutive attempts by the same user do not serve the exact same question ID if multiple candidates exist.
- [ ] **AC-3.3 (Secret Stripping & Option Shuffling):**
  - The API response payload for questions NEVER contains `correctOptionId`, `requiredSnippets`, `forbiddenSnippets`, or `explanation`.
  - Multiple-choice options are shuffled using Fisher-Yates with `crypto.randomInt`.
- [ ] **AC-3.4 (Sequential Unlocking & Passing Rules):**
  - Starting Level 2 without an existing passed Level 1 record returns HTTP `403 SEQUENTIAL_LEVEL_LOCKED`.
  - Starting Level 3 without an existing passed Level 2 record returns HTTP `403 SEQUENTIAL_LEVEL_LOCKED`.
  - Submitting an attempt scoring `>= 80%` marks the attempt `PASSED`, creates a `UserSkillLevel` row with the earned level, updates `ReviewerSkill`, and syncs Elasticsearch.
  - Submitting an attempt scoring `< 80%` marks the attempt `FAILED`, sets a 30–60 minute cooldown, and DOES NOT revoke any lower levels previously earned.
- [ ] **AC-3.5 (Matching Eligibility Binding):**
  - A task requiring Go Level 2 is only dispatched to specialists with `UserSkillLevel.level >= 2` for Go. Specialists with only Level 1 or unassessed skills are excluded with reason `INSUFFICIENT_SKILL_LEVEL`.

---

### Gate 4: Outbound Notification Delivery (Phase 3)
- [ ] **AC-4.1 (Offer Notification Dispatch):**
  - When `dispatchTopOffers()` dispatches parallel offers, an outbound email alert is sent to each specialist's registered email address with the task title, reward amount, expiration time, and direct workspace link.
- [ ] **AC-4.2 (Non-Blocking Error Isolation):**
  - If the external email service (Resend) returns an error (e.g. rate limit, network timeout, invalid key), the error is logged to stderr, but the database transaction commits cleanly, the task transitions to `OFFERED`, and in-app notifications are saved.
- [ ] **AC-4.3 (Graceful Fallback When Unconfigured):**
  - If `RESEND_API_KEY` is empty, email sending is skipped without errors or warnings.

---

### Gate 5: Staging External Integration Verification (Phase 4)
- [ ] **AC-5.1 (Supabase Auth PKCE):**
  - User signs up with email and password in the browser; receives Supabase confirmation email; clicking confirmation link redirects to `/auth/callback` and establishes an authenticated session.
  - Backend verifies the Supabase access token offline via `SUPABASE_JWT_SECRET` and maps user claims.
- [ ] **AC-5.2 (PayPal Sandbox Real Escrow):**
  - Requester creates a task and clicks "Fund Task with PayPal".
  - PayPal modal opens; user completes checkout in Sandbox; PayPal capture succeeds; reward transitions to `FUNDED`; transaction row records real `orderId` and `captureId`.
  - PayPal Sandbox Payout executes via Payouts v1 when `PAYPAL_PAYOUTS_ENABLED=true` and transitions reward to `PAID`.
- [ ] **AC-5.3 (Gemini Code Security Gate):**
  - Submitting a code deliverable invokes live `@google/genai` API using model `gemini-2.5-flash`.
  - Model returns structured JSON with `verdict`, `riskLevel`, and `findings`.
  - If the Gemini API call times out (>30s), the gate triggers fail-closed and returns `verdict: "BLOCK"`, `status: "SAFETY_REVIEW_FAILED"`. Deliverables are never approved by default.

---

### Gate 6: Production Build & Testing Integrity (All Phases)
- [ ] **AC-6.1 (Automated Test Suite):**
  - `npm test` executes all test files and passes with 0 failures and 0 skipped tests.
- [ ] **AC-6.2 (Backend Compilation):**
  - `npm --workspace backend run build` completes with exit code 0 and 0 TypeScript errors.
- [ ] **AC-6.3 (Frontend Compilation):**
  - `npm --workspace frontend run build` completes with exit code 0 and 0 TypeScript errors.
- [ ] **AC-6.4 (MCP Server Compilation):**
  - `npm --prefix packages/trusttopay-mcp run build` completes with exit code 0 and 0 TypeScript errors.
- [ ] **AC-6.5 (Prisma Validation):**
  - `npx prisma validate --schema backend/prisma/schema.prisma` confirms schema validity.
