# TrustToPay — Deployment Readiness & Environment Transition Plan

**Document Type:** DevOps & Deployment Readiness Architecture  
**Associated Guide:** [`docs/ENVIRONMENT_SETUP_GUIDE.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/ENVIRONMENT_SETUP_GUIDE.md)  
**Associated Roadmap:** [`docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/audit/MASTER_IMPLEMENTATION_ROADMAP.md)  
**Creation Date:** 2026-11-10  

---

## 1. Deployment Tiers Architecture

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│     DEVELOPMENT        │      │        STAGING         │      │       PRODUCTION       │
│  (Zero-Config Local)   │      │  (Sandbox Verification)│      │   (Production Release) │
├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
│ • SQLite (dev.db)      │ ───> │ • Managed PostgreSQL   │ ───> │ • High-Availability PG │
│ • Demo Payment Mode    │      │ • PayPal Sandbox       │      │ • PayPal Sandbox / Live│
│ • Local Sessions       │      │ • Supabase Test Auth   │      │ • Supabase Production  │
│ • Deterministic Gate   │      │ • Live Gemini API      │      │ • Gemini Production    │
│ • Relational Matching  │      │ • Elastic Test Cluster │      │ • Relational / Elastic │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

---

## 2. Smallest Safe Set for Initial Production Deployment

To minimize infrastructure complexity and points of failure, TrustToPay is architected so that **not every third-party integration is required on day one**.

### Tier 1: Minimum Viable Production Set (MVPS)
Only the following components are mandatory for a safe, operational production release:

1. **Backend Server:** Node.js v20+ runtime (e.g. Google Cloud Run, AWS ECS, or DigitalOcean App Platform).
2. **PostgreSQL Database:** Managed PostgreSQL database with connection pooling enabled (e.g. Supabase Postgres, AWS RDS Aurora, or Neon).
3. **Session Encryption Secret:** A high-entropy 64-character hex secret (`SESSION_SECRET`).
4. **Google Gemini API Key:** An active Google AI Studio key (`GEMINI_API_KEY`) for live code security reviews.
5. **PayPal Sandbox Payment Credentials:** Client ID and Secret (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`) configured with `PAYPAL_ENV=sandbox`.
6. **Frontend Static Distribution:** Compiled Vite bundle served via CDN (Vercel, Cloudflare Pages, or Nginx).

### Tier 2: Optional Components (Can be Deferred to Later Milestones)
- **Elasticsearch 8.x Cluster:** The relational database matching engine in `rankingService.ts` evaluates skills, historical verification success, and active workloads with identical 50/30/20 weights. Elasticsearch is optional and can be introduced when specialist volume exceeds 1,000 active users.
- **Jina AI Embeddings:** Optional vector enhancement. Relational queries and BM25 handle keyword matching seamlessly when omitted.
- **OpenAI Escalation Key:** Optional heuristic evaluator. TrustToPay's rule-based decision engine operates completely self-contained without it.

---

## 3. Step-by-Step Environment Transition Procedure

### Step 1: Local Development Setup (Current State)
1. Copy template: `Copy-Item .env.example .env`
2. Generate session secret:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Initialize local SQLite database and seed initial catalogue:
   ```powershell
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
4. Start dev servers:
   ```powershell
   npm run dev
   ```
   - Backend available at `http://localhost:3000`
   - Frontend available at `http://localhost:5173`

---

### Step 2: Staging Sandbox Deployment (Phase 4 of Roadmap)
1. **Provision Staging Database:** Create a staging database on Supabase or Neon.
2. **Apply Migrations:**
   ```bash
   DATABASE_URL="postgresql://user:pass@staging-db.host:5432/postgres" npx prisma db push
   ```
3. **Configure Staging Environment Variables:**
   ```dotenv
   NODE_ENV=staging
   PORT=8080
   DATABASE_URL="postgresql://..."
   SESSION_SECRET="<64-hex-secret>"
   FRONTEND_URL="https://staging.trusttopay.com"
   API_BASE_URL="https://api-staging.trusttopay.com"
   DEMO_MODE=false
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID="<sandbox-client-id>"
   PAYPAL_CLIENT_SECRET="<sandbox-client-secret>"
   GEMINI_API_KEY="<staging-gemini-key>"
   CODE_REVIEW_FAIL_CLOSED=true
   ```
4. **Register Staging PayPal Webhook:**
   - In PayPal Developer Dashboard -> Sandbox App -> Add Webhook:
     - URL: `https://api-staging.trusttopay.com/api/v1/paypal/webhook`
     - Subscribed Events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.PAYOUTS-ITEM.SUCCEEDED`, `PAYMENT.PAYOUTS-ITEM.FAILED`.
     - Set `PAYPAL_WEBHOOK_ID="<staging-webhook-id>"` in backend environment.
5. **Execute Staging Acceptance Testing:**
   - Run end-to-end user registration with real email verification.
   - Create a task, fund $15.00 via Sandbox PayPal checkout, verify capture in ledger.
   - Accept task as reviewer, submit deliverable, verify live Gemini evaluation.
   - Trigger verified agent handback via MCP client and check signed headers.

---

### Step 3: Production Deployment (Phase 5 of Roadmap)
1. **Prisma Migration Safety:**
   - Switch Prisma schema datasource to PostgreSQL:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Run `npx prisma migrate deploy` to apply versioned migration scripts without data loss.
2. **Production Environment Hardening:**
   ```dotenv
   NODE_ENV=production
   PORT=8080
   DATABASE_URL="postgresql://prod_user:prod_pass@pooler.host:6543/postgres?pgbouncer=true"
   SESSION_SECRET="<cryptographically-secure-64-hex-secret>"
   FRONTEND_URL="https://app.trusttopay.com"
   API_BASE_URL="https://api.trusttopay.com"
   DEMO_MODE=false
   DEMO_USERS_ENABLED=false
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID="<production-sandbox-or-live-id>"
   PAYPAL_CLIENT_SECRET="<production-sandbox-or-live-secret>"
   PAYPAL_WEBHOOK_ID="<production-webhook-id>"
   GEMINI_API_KEY="<production-gemini-key>"
   CODE_REVIEW_FAIL_CLOSED=true
   ```
3. **CORS & Domain Whitelist Validation:**
   - Verified in `backend/src/middleware/security.ts`: `FRONTEND_URL` and `APP_URL` are strictly whitelisted. Wildcard CORS `*` is forbidden with credentials.
   - Cookies automatically enforce `secure: true` and `sameSite: "lax"`.
4. **Health Check & Monitoring:**
   - Uptime monitor pinging `GET https://api.trusttopay.com/health` (returns `{"status":"ok"}`).
   - Audit log review on `AuditLog` table for security events.

---

## 4. Rollback & Disaster Recovery Strategy

| Scenario | Detection Trigger | Recovery Procedure |
| :--- | :--- | :--- |
| **PostgreSQL Connection Pool Exhaustion** | 500 errors on database operations; timeout logs. | Switch connection string to Supabase transaction pooler port `6543` with `?pgbouncer=true`. |
| **Gemini API Outage / Quota Exceeded** | Deliverables blocked with `SAFETY_REVIEW_FAILED` (fail-closed active). | Reviewers' deliverables are safely paused in `SUBMITTED` state; temporary human review fallback can be activated by setting `CODE_REVIEW_FAIL_CLOSED=false` if authorized by engineering lead. |
| **PayPal Webhook Outage** | Payments remain in `PROCESSING` status. | Run automatic reconciler: `POST /api/v1/payments/:id/reconcile` polls PayPal Orders v2 API directly and synchronizes local ledger. |
| **Failed Frontend Deployment** | Edge CDN reports 404 on assets or build errors. | Roll back CDN deployment to previous release tag instantly via hosting provider dashboard. |
