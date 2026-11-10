# TrustToPay — Environment & Configuration Status Report

**Audit Date:** 2026-11-10  
**Monorepo Packages:** `backend`, `frontend`, `packages/trusttopay-mcp`  
**Authoritative Guide:** [`docs/ENVIRONMENT_SETUP_GUIDE.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/ENVIRONMENT_SETUP_GUIDE.md)  
**Configuration Template:** [`.env.example`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/.env.example)

---

## 1. Environment Architecture & Security Boundaries

```
TrustToPay/
├── .env                       # Root environment file (backend runtime, Prisma, seed scripts)
├── .env.example               # Checked-in template with safe documentation defaults
├── backend/
│   └── .env                   # Optional backend-specific local overrides (gitignored)
├── frontend/
│   ├── .env                   # Optional frontend build configuration (gitignored)
│   └── src/vite-env.d.ts      # Strict TypeScript contract for browser variables
└── packages/trusttopay-mcp/   # Reads process.env or execution arguments
```

### Security Boundary Verification
1. **Frontend Isolation**: Vite strictly limits browser exposure to variables prefixed with `VITE_`.
2. **Exclusively Two Browser Variables**:
   - `VITE_SUPABASE_URL`: Public project URL.
   - `VITE_SUPABASE_ANON_KEY`: Public anonymous API key protected by Supabase Row Level Security (RLS).
3. **Zero Secret Leakage in Bundles**:
   - Verified in `frontend/src/vite-env.d.ts`: No sensitive keys (`PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`, `SESSION_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY`) are accessible from the frontend bundle.

---

## 2. Configuration Status by Integration Provider

### A. Local Core Startup (Zero-Config Development)
- **Status:** **CONFIGURED & OPERATIONAL**
- **Variables:** `DATABASE_URL="file:./dev.db"`, `SESSION_SECRET="<local-random-hex>"`
- **Operational Mode:** `DEMO_MODE=true`
- **Features Active:**
  - Full relational database on SQLite.
  - Deterministic simulated PayPal escrow funding and reviewer payouts.
  - Local encrypted cookie authentication sessions.
  - Deterministic AST and regex code safety scanning without external API quota.
  - Relational SQL specialist candidate ranking.

### B. Google Gemini API (`@google/genai`)
- **Status:** **CONFIGURED FOR LOCAL FALLBACK** (Live Key Optional)
- **Variables:** `GEMINI_API_KEY`, `GEMINI_MODEL="gemini-2.5-flash"`
- **Runtime Behavior:** When `GEMINI_API_KEY` is not present, `geminiReviewService.ts` executes the deterministic local code scanner. When a live key is supplied, executes `@google/genai` structured review with `CODE_REVIEW_FAIL_CLOSED=true`.

### C. Supabase Authentication & PostgreSQL
- **Status:** **CONFIGURED FOR LOCAL SESSION FALLBACK** (Live Key Optional)
- **Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
- **Runtime Behavior:** When Supabase keys are empty, the application seamlessly operates via local encrypted HTTP-only cookie sessions. Providing live Supabase keys activates external PKCE magic links, email verification, and Supabase JWT signature validation.

### D. PayPal Sandbox Payment Gateway
- **Status:** **CONFIGURED FOR DEMO SIMULATION** (Sandbox Ready)
- **Variables:** `PAYPAL_ENV="sandbox"`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PAYOUTS_ENABLED`
- **Runtime Behavior:** In `DEMO_MODE=true`, payments are clearly marked as `DEMO_SIMULATED` and settle locally without calling PayPal servers. Setting `DEMO_MODE=false` activates real PayPal Sandbox Orders v2 capture and Payouts v1.

### E. Elasticsearch & Jina AI Embeddings
- **Status:** **CONFIGURED FOR RELATIONAL FALLBACK**
- **Variables:** `ELASTIC_ENABLED="false"`, `ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY`, `ELASTIC_TIMEOUT_MS="2500"`, `JINA_API_KEY`
- **Runtime Behavior:** Defaults to `ELASTIC_ENABLED=false` to avoid requiring a running Docker or cloud Elasticsearch cluster during local development. When enabled, searches specialist indices with a 2500ms timeout circuit breaker, falling back to SQL queries if unreachable.

### F. Official MCP Server (`@trusttopay/mcp-server`)
- **Status:** **CONFIGURED & TESTED**
- **Variables:** `TRUSTTOPAY_API_BASE_URL="http://localhost:3000"`, `TRUSTTOPAY_AGENT_API_KEY="ttp_test_..."`, `TRUSTTOPAY_MCP_TRANSPORT="stdio"`
- **Runtime Behavior:** Tested over both STDIO and Streamable HTTP transports. Fully enforces rate limits, budget boundaries ($5–$500), and bearer token authentication.

---

## 3. Discovered Environment Variables Master Summary

A total of **51 unique environment variables** were discovered across the codebase:

1. `NODE_ENV` (Runtime mode)
2. `PORT` (Server bind port)
3. `DATABASE_URL` (SQLite or PostgreSQL connection URI)
4. `SESSION_SECRET` (Locally generated session cookie encryption key)
5. `FRONTEND_URL` (CORS origin)
6. `API_BASE_URL` (Backend base URL)
7. `DEMO_MODE` (Toggle for simulated payments & offline gates)
8. `DEMO_USERS_ENABLED` (Auto-seed demo accounts)
9. `APP_URL` (Secondary CORS origin)
10. `SHARED_APP_URL` (Tertiary CORS origin)
11. `REWARD_MIN_MINOR` (Minimum task budget: 500 = $5.00)
12. `REWARD_MAX_MINOR` (Maximum task budget: 10000 = $100.00)
13. `AI_PROVIDER` (`demo` or `openai`)
14. `AI_API_KEY` (OpenAI / custom LLM secret)
15. `AI_BASE_URL` (AI API endpoint)
16. `AI_MODEL` (AI model identifier)
17. `AI_ESCALATION_THRESHOLD` (Escalation trigger: default 0.75)
18. `GEMINI_API_KEY` (Google AI Studio secret)
19. `GEMINI_MODEL` (Default `gemini-2.5-flash`)
20. `CODE_REVIEW_ENABLED` (Enable automated security gate)
21. `CODE_REVIEW_FAIL_CLOSED` (Enforce BLOCK on timeout/outage)
22. `CODE_REVIEW_TIMEOUT_MS` (Timeout for review: default 30000ms)
23. `SUPABASE_URL` (Supabase project URL)
24. `SUPABASE_ANON_KEY` (Supabase public anon key)
25. `SUPABASE_SERVICE_ROLE_KEY` (Supabase backend admin key)
26. `SUPABASE_JWT_SECRET` (Supabase offline token verification)
27. `VITE_SUPABASE_URL` (Frontend browser Supabase URL)
28. `VITE_SUPABASE_ANON_KEY` (Frontend browser anon key)
29. `PAYPAL_ENV` (Enforced to `sandbox`)
30. `PAYPAL_CLIENT_ID` (PayPal Developer Client ID)
31. `PAYPAL_CLIENT_SECRET` (PayPal Developer Secret)
32. `PAYPAL_WEBHOOK_ID` (PayPal webhook signature verification)
33. `PAYPAL_CURRENCY` (Default `USD`)
34. `PAYPAL_PAYOUTS_ENABLED` (Toggle for reviewer payouts)
35. `ELASTIC_ENABLED` (Toggle for Elasticsearch retrieval)
36. `ELASTICSEARCH_URL` (Elastic cluster endpoint)
37. `ELASTICSEARCH_API_KEY` (Elastic API key)
38. `ELASTIC_INDEX_SPECIALISTS` (Index name: default `trusttopay-specialists-v1`)
39. `ELASTIC_TIMEOUT_MS` (Circuit breaker timeout: default 2500ms)
40. `JINA_API_KEY` (Jina AI embedding API key)
41. `JINA_EMBEDDING_MODEL` (Default `jina-embeddings-v3`)
42. `TRUSTTOPAY_API_BASE_URL` (MCP client base target)
43. `TRUSTTOPAY_AGENT_API_KEY` (MCP bearer key `ttp_*`)
44. `TRUSTTOPAY_MCP_TRANSPORT` (`stdio` or `http`)
45. `TRUSTTOPAY_MCP_HOST` (HTTP bind address: default `127.0.0.1`)
46. `TRUSTTOPAY_MCP_PORT` (HTTP bind port: default `3100`)
47. `TRUSTTOPAY_MCP_ALLOWED_ORIGINS` (HTTP CORS origins)
48. `TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` (MCP minimum budget guard: 500)
49. `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR` (MCP maximum budget guard: 50000)
50. `TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE` (MCP rate limit: 60)
51. `TRUSTTOPAY_MCP_TIMEOUT_MS` (MCP request timeout: 15000)

---

## 4. Security Audit Verification

1. **Git Secret Scan**: Checked `.gitignore` — `.env`, `dev.db`, and build outputs are correctly excluded. No `.env` files are tracked in git.
2. **Hardcoded Secrets**: Zero production API keys or tokens found in codebase. Unit test files only contain RFC dummy mock tokens (`sk-proj-12345678901234567890...`).
3. **Serialization Protection**: `GET /api/v1/integrations/status` never serializes secret credentials; only reports Boolean status flags (`configured: true/false`).
4. **Weak Production Defaults**: `SESSION_SECRET` requires explicit high-entropy definition when `NODE_ENV=production`; the server throws a fatal startup error if omitted in production.
