# TrustToPay — Implementation Task Tracker

**Document Type:** Engineering Task Tracker & Progress Checklist  
**Associated Roadmap:** [`docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md)  
**Creation Date:** 2026-11-10  

---

## 1. Master Task Inventory

| Task ID | Workstream / Phase | Priority | Status | Description | Affected Files | Dependencies | Verification Command |
| :---: | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **TASK-1.1** | Phase 1 (Privacy) | **CRITICAL** | **READY TO IMPLEMENT** | Remove `audio: true` from proctoring camera stream initialization. | `frontend/src/pages/skill-assessment.tsx` | None | `npm test` & browser media inspection |
| **TASK-1.2** | Phase 1 (UI) | **HIGH** | **READY TO IMPLEMENT** | Remove obsolete administrator approval alert banner from reviewer dashboard. | `frontend/src/pages/dashboard.tsx` | None | `npm test` & visual dashboard check |
| **TASK-1.3** | Phase 1 (UI) | **MEDIUM** | **READY TO IMPLEMENT** | Update dashboard Recharts Tooltip and CartesianGrid colors to warm ivory design tokens. | `frontend/src/pages/dashboard.tsx` | None | Visual check of `/app` chart tooltips |
| **TASK-1.4** | Phase 1 (Build) | **MEDIUM** | **READY TO IMPLEMENT** | Uninstall unused `ag-grid-community` & `ag-grid-react` packages and remove CSS `@import`s. | `frontend/package.json`, `frontend/src/index.css` | None | `npm --workspace frontend run build` |
| **TASK-2.1** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **Go** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.2** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **Rust** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.3** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **React** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.4** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **Next.js** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.5** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **Docker** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.6** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **Kubernetes** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.7** | Phase 2 (Skills) | **HIGH** | **READY TO IMPLEMENT** | Author and seed Level 1–3 question banks for **SQL** (6 questions: 3 MC + 3 Code Tasks). | `backend/src/services/skills/assessmentEngine.ts` | Phase 1 | `npm test` (Vitest `skills.test.ts`) |
| **TASK-2.8** | Phase 2 (Taxonomy) | **HIGH** | **READY TO IMPLEMENT** | Update `isAssessed: true` in `taxonomy.ts` for the 7 expanded skills and verify database seeding. | `backend/src/services/skills/taxonomy.ts` | TASK-2.1 to 2.7 | `npx prisma db push && npm run seed` |
| **TASK-3.1** | Phase 3 (Notify) | **MEDIUM** | **READY TO IMPLEMENT** | Implement outbound Resend email transport service with template rendering and retry handling. | `backend/src/services/notifications/email.ts` | None | Unit test with mock fetch |
| **TASK-3.2** | Phase 3 (Notify) | **MEDIUM** | **READY TO IMPLEMENT** | Wire outbound email trigger into `notify()` in `lib/audit.ts` for `TASK_OFFER_DISPATCHED` events. | `backend/src/lib/audit.ts`, `backend/src/config.ts` | TASK-3.1 | Vitest offer dispatch test |
| **TASK-4.1** | Phase 4 (Staging) | **HIGH** | **BLOCKED (Keys)** | Configure test Supabase project and verify browser PKCE authentication and JWT claim validation. | `.env`, Staging host | Phase 1 & 2 | End-to-end auth test suite |
| **TASK-4.2** | Phase 4 (Staging) | **HIGH** | **BLOCKED (Keys)** | Configure PayPal Sandbox credentials with Payouts; verify real Order v2 capture and Sandbox payout. | `.env`, Staging host | Phase 1 & 2 | Live PayPal sandbox test runner |
| **TASK-4.3** | Phase 4 (Staging) | **HIGH** | **BLOCKED (Keys)** | Configure `GEMINI_API_KEY`; verify live `@google/genai` code security scans and fail-closed timeout. | `.env`, Staging host | Phase 1 & 2 | Live Gemini test runner |
| **TASK-5.1** | Phase 5 (Deploy) | **HIGH** | **BLOCKED (Staging)**| Provision managed PostgreSQL database and deploy production Prisma migrations. | `backend/prisma/` | Phase 4 | `npx prisma migrate status` |
| **TASK-5.2** | Phase 5 (Deploy) | **HIGH** | **BLOCKED (Staging)**| Deploy backend container to Cloud Run / VPS with production `SESSION_SECRET` and CORS origins. | Cloud infrastructure | TASK-5.1 | `curl https://api.trusttopay.com/health` |
| **TASK-5.3** | Phase 5 (Deploy) | **HIGH** | **BLOCKED (Staging)**| Deploy Vite static assets to CDN / edge host with production `VITE_` variables. | Edge host | TASK-5.2 | Browser smoke test |
| **TASK-5.4** | Phase 5 (Deploy) | **HIGH** | **BLOCKED (Staging)**| Register production PayPal webhook endpoint and verify signature verification. | PayPal Developer Console | TASK-5.2 | Simulated test webhook dispatch |
| **TASK-6.1** | Phase 6 (Future) | **LOW** | **OPTIONAL** | Implement Shannon entropy scanner (>4.5) in `deterministicScanner.ts` for unclassified secrets. | `backend/src/services/security/deterministicScanner.ts` | Phase 1 | Unit test with high-entropy tokens |
| **TASK-6.2** | Phase 6 (Future) | **LOW** | **OPTIONAL** | Connect student assessment code tasks to isolated sandbox runner for dynamic evaluation. | `backend/src/services/skills/assessmentEngine.ts` | Phase 2 | Runner execution unit test |

---

## 2. Phase-by-Phase Task Checklist

### Phase 1: Privacy, Security & UI Cleanup
- [ ] **TASK-1.1**: Set `audio: false` in `frontend/src/pages/skill-assessment.tsx`.
- [ ] **TASK-1.2**: Remove obsolete administrator approval alert banner in `frontend/src/pages/dashboard.tsx`.
- [ ] **TASK-1.3**: Update Recharts Tooltip and CartesianGrid colors to `#FFFEFA` / `#E5E1D7` in `frontend/src/pages/dashboard.tsx`.
- [ ] **TASK-1.4**: Uninstall `ag-grid-community` & `ag-grid-react` and delete `@import` statements in `frontend/src/index.css`.
- [ ] **Verification**: Run `npm test` (all 143 tests pass).
- [ ] **Verification**: Run `npm --workspace frontend run build` (zero errors, bundle size verified).

### Phase 2: Assessment Question Bank Expansion
- [ ] **TASK-2.1**: Author Go question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.2**: Author Rust question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.3**: Author React question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.4**: Author Next.js question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.5**: Author Docker question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.6**: Author Kubernetes question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.7**: Author SQL question bank (Foundation, Practitioner, Advanced).
- [ ] **TASK-2.8**: Set `isAssessed: true` in `taxonomy.ts` for all 7 skills.
- [ ] **Verification**: Seed database (`npm run seed`) and run Vitest `skills.test.ts`.

### Phase 3: Outbound Reviewer Notifications
- [ ] **TASK-3.1**: Create `backend/src/services/notifications/email.ts` with Resend transport.
- [ ] **TASK-3.2**: Connect email dispatch to `notify()` in `backend/src/lib/audit.ts`.
- [ ] **Verification**: Run notification unit test with mock HTTP transport.

### Phase 4: Staging Integration Verification
- [ ] **TASK-4.1**: Verify Supabase PKCE login, email verification, and JWT validation.
- [ ] **TASK-4.2**: Verify real PayPal Sandbox Order v2 capture and Sandbox Payouts.
- [ ] **TASK-4.3**: Verify live Google Gemini code review and fail-closed timeout handling.

### Phase 5: Production Deployment & Release
- [ ] **TASK-5.1**: Deploy PostgreSQL database and run migrations.
- [ ] **TASK-5.2**: Deploy production backend container.
- [ ] **TASK-5.3**: Deploy static frontend assets.
- [ ] **TASK-5.4**: Configure live PayPal webhook.
