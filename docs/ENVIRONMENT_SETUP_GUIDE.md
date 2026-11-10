# TrustToPay — Complete Environment Variables & API Credentials Guide

This document is the authoritative reference for configuring environment variables, external provider credentials, security tokens, and deployment settings across the TrustToPay monorepo (`backend`, `frontend`, and `packages/trusttopay-mcp`).

---

## 1. Environment Architecture & Monorepo Hierarchy

TrustToPay uses a layered configuration loading strategy:

```
TrustToPay/
├── .env                       # Root environment file (loaded by backend, prisma, scripts)
├── .env.example               # Reference template with empty/safe defaults (tracked in git)
├── backend/
│   └── .env                   # Optional backend-specific overrides (gitignored)
├── frontend/
│   └── .env                   # Optional frontend browser configuration (gitignored)
└── packages/trusttopay-mcp/   # Reads process.env from parent or process execution context
```

### Critical Security Boundaries
1. **Frontend Isolation**: Vite only exposes variables prefixed with `VITE_` to the browser (`import.meta.env.VITE_*`).
2. **Never expose secrets to Vite**: Never prefix `PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`, `SESSION_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`.
3. **Only two variables belong in the browser**:
   - `VITE_SUPABASE_URL`: Public project URL.
   - `VITE_SUPABASE_ANON_KEY`: Public anonymous API key guarded by Supabase Row Level Security (RLS).

---

## 2. Complete Environment Variable Inventory

| Variable Name | Provider | Classification | Required / Optional | Used By | Default Behavior if Missing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime | Public | Optional | Backend | Defaults to `development`. In `production`, enforces secure cookies and forbids demo mode. |
| `PORT` | Local | Public | Optional | Backend | Defaults to `3000`. |
| `DATABASE_URL` | Prisma / SQLite / Postgres | Sensitive | **Mandatory** | Backend, Prisma | Defaults to `"file:./dev.db"`. In production, set to PostgreSQL connection URI. |
| `SESSION_SECRET` | Local (Generated) | **Secret** | **Mandatory (Prod)** | Backend | Generates an ephemeral random secret in dev (sessions reset on server restart). In production, server crashes if missing. |
| `FRONTEND_URL` | Local | Public | Optional | Backend (CORS) | Defaults to `http://localhost:5173`. In production, set to public web domain. |
| `API_BASE_URL` | Local | Public | Optional | Backend, MCP | Defaults to `http://localhost:3000`. Used for callback and link generation. |
| `DEMO_MODE` | TrustToPay | Public | Optional | Backend | Defaults to `true`. Enables simulated PayPal escrow, demo specialist login, and sandbox tests. |
| `DEMO_USERS_ENABLED` | TrustToPay | Public | Optional | Backend | Defaults to `true` when `DEMO_MODE=true`. Provisions default test reviewer & agent accounts. |
| `APP_URL` | Local / Cloud | Public | Optional | Backend (CORS) | Extra allowed origin for deployment preview URLs (e.g. Cloud Run). |
| `SHARED_APP_URL` | Local / Cloud | Public | Optional | Backend (CORS) | Secondary allowed origin for shared staging environments. |
| `REWARD_MIN_MINOR` | TrustToPay | Public | Optional | Backend | Defaults to `500` ($5.00 minimum task reward). |
| `REWARD_MAX_MINOR` | TrustToPay | Public | Optional | Backend | Defaults to `10000` ($100.00 maximum task reward). |
| `AI_PROVIDER` | OpenAI / Custom | Public | Optional | Backend | Defaults to `"demo"`. Set to `"openai"` to enable live LLM confidence evaluation. |
| `AI_API_KEY` | OpenAI / Compatible | **Secret** | Optional | Backend | Required only if `AI_PROVIDER` is not `"demo"`. |
| `AI_BASE_URL` | OpenAI / Compatible | Public | Optional | Backend | Defaults to `https://api.openai.com/v1`. |
| `AI_MODEL` | OpenAI / Compatible | Public | Optional | Backend | E.g. `gpt-4o-mini`. |
| `AI_ESCALATION_THRESHOLD` | TrustToPay | Public | Optional | Backend | Defaults to `0.75`. Tasks below this confidence score trigger human escalation. |
| `GEMINI_API_KEY` | Google AI Studio | **Secret** | Optional | Backend | Required for live Gemini code inspection gate. Falls back to deterministic AST scanner if empty. |
| `GEMINI_MODEL` | Google | Public | Optional | Backend | Defaults to `gemini-2.5-flash` (or `gemini-3.8-flash`). |
| `CODE_REVIEW_ENABLED` | TrustToPay | Public | Optional | Backend | Defaults to `true`. Runs security scan on specialist code submissions. |
| `CODE_REVIEW_FAIL_CLOSED` | TrustToPay | Public | Optional | Backend | Defaults to `true`. Blocks deliverables if Gemini API errors or times out. |
| `CODE_REVIEW_TIMEOUT_MS` | TrustToPay | Public | Optional | Backend | Defaults to `30000` (30 seconds). |
| `SUPABASE_URL` | Supabase | Public | Optional | Backend | Backend reference for Supabase project URL. |
| `SUPABASE_ANON_KEY` | Supabase | Public | Optional | Backend | Public anonymous key for client validation. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | **Secret** | Optional | Backend | Admin service role key (never expose to client). |
| `SUPABASE_JWT_SECRET` | Supabase | **Secret** | Optional | Backend | Used to cryptographically verify Supabase JWTs offline. |
| `VITE_SUPABASE_URL` | Supabase | Public | Optional | Frontend | Public project URL for `@supabase/supabase-js` browser client. |
| `VITE_SUPABASE_ANON_KEY` | Supabase | Public | Optional | Frontend | Public anon key for browser PKCE authentication. |
| `PAYPAL_ENV` | PayPal | Public | Optional | Backend | Defaults to `sandbox`. Only `sandbox` is permitted in current build. |
| `PAYPAL_CLIENT_ID` | PayPal | Public / Sensitive | Optional | Backend | Client ID from PayPal Developer Dashboard. Required when `DEMO_MODE=false`. |
| `PAYPAL_CLIENT_SECRET` | PayPal | **Secret** | Optional | Backend | Client Secret from PayPal Developer Dashboard. Required when `DEMO_MODE=false`. |
| `PAYPAL_WEBHOOK_ID` | PayPal | Sensitive | Optional | Backend | Webhook ID for signature verification on `POST /api/v1/paypal/webhook`. |
| `PAYPAL_CURRENCY` | PayPal | Public | Optional | Backend | Defaults to `USD`. |
| `PAYPAL_PAYOUTS_ENABLED` | PayPal | Public | Optional | Backend | Defaults to `false`. Set to `true` to enable automatic specialist payouts via PayPal Payouts v1. |
| `ELASTIC_ENABLED` | Elastic | Public | Optional | Backend | Defaults to `false`. Set to `true` to enable Elasticsearch specialist discovery. |
| `ELASTICSEARCH_URL` | Elastic | Public | Optional | Backend | E.g. `https://my-elastic.es.io:9243` or `http://localhost:9200`. |
| `ELASTICSEARCH_API_KEY` | Elastic | **Secret** | Optional | Backend | API key generated in Kibana / Elastic Cloud. |
| `ELASTIC_INDEX_SPECIALISTS` | Elastic | Public | Optional | Backend | Defaults to `trusttopay-specialists-v1`. |
| `ELASTIC_TIMEOUT_MS` | Elastic | Public | Optional | Backend | Defaults to `2500` (2.5 seconds timeout before relational fallback). |
| `JINA_API_KEY` | Jina AI | **Secret** | Optional | Backend | API key for `jina-embeddings-v3` vector search. Falls back to BM25 if missing. |
| `JINA_EMBEDDING_MODEL` | Jina AI | Public | Optional | Backend | Defaults to `jina-embeddings-v3`. |
| `TRUSTTOPAY_API_BASE_URL` | TrustToPay | Public | Optional | MCP Server | Target TrustToPay API URL (default: `http://localhost:3000`). |
| `TRUSTTOPAY_AGENT_API_KEY` | TrustToPay | **Secret** | Optional | MCP Server, Agent | Bearer token (`ttp_live_*` or `ttp_test_*`) for programmatic task escalation. |
| `TRUSTTOPAY_MCP_TRANSPORT` | MCP | Public | Optional | MCP Server | `stdio` (default) or `http`. |
| `TRUSTTOPAY_MCP_HOST` | MCP | Public | Optional | MCP Server | Bind host for HTTP transport (default: `127.0.0.1`). |
| `TRUSTTOPAY_MCP_PORT` | MCP | Public | Optional | MCP Server | Bind port for HTTP transport (default: `3100`). |
| `TRUSTTOPAY_MCP_ALLOWED_ORIGINS` | MCP | Public | Optional | MCP Server | Comma-separated CORS allowed origins for HTTP transport. |
| `TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` | MCP | Public | Optional | MCP Server | Minimum task budget guard (default: `500` = $5.00). |
| `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR` | MCP | Public | Optional | MCP Server | Maximum task budget guard (default: `50000` = $500.00). |
| `TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE` | MCP | Public | Optional | MCP Server | Rate limit per agent key (default: `60`). |
| `TRUSTTOPAY_MCP_TIMEOUT_MS` | MCP | Public | Optional | MCP Server | Timeout for API requests (default: `15000`). |
| `TRUSTTOPAY_MCP_AUTO_DISPATCH` | MCP | Public | Optional | MCP Server | Automatically broadcast offers on task creation (default: `true`). |

---

## 3. Categorization & Execution Tiers

### Tier 1: Mandatory for Local Startup
Only **two** items are required to start the entire stack locally:
1. `DATABASE_URL="file:./dev.db"` (handled automatically by `npm run setup`)
2. `SESSION_SECRET` (generated automatically by `npm run setup` if missing)

With these defaults, the server starts in **Demo Mode**:
- Payments are clearly marked and safely simulated.
- Auth falls back to secure local sessions if Supabase is unconfigured.
- Code review runs local deterministic AST/regex scanners.
- Specialist discovery uses relational database queries.

### Tier 2: Mandatory for Production Deployment
1. `NODE_ENV=production`
2. `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/trusttopay?sslmode=require`).
3. `SESSION_SECRET`: Cryptographically strong random string ($\ge 32$ characters).
4. `FRONTEND_URL`: Public HTTPS URL of the web interface (e.g., `https://trusttopay.com`).
5. `API_BASE_URL`: Public HTTPS URL of the API (e.g., `https://api.trusttopay.com`).
6. `DEMO_MODE=false` (strictly enforced by server health checks).

### Tier 3: External Integration Keys (Obtained from Providers)
- **Google Gemini**: `GEMINI_API_KEY` (Layer 2 LLM code gate).
- **Supabase Auth**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **PayPal Sandbox**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`.
- **Elasticsearch**: `ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY`.
- **Jina AI**: `JINA_API_KEY`.

---

## 4. Provider Credential Acquisition Guide

### A. Google Gemini API (`GEMINI_API_KEY`)
TrustToPay uses the official `@google/genai` SDK for Layer 2 automated security audits of code submissions.

1. **Provider Console**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Steps**:
   - Sign in with your Google account.
   - In the left sidebar, click **"Get API key"** (key icon).
   - Click **"Create API key"**.
   - Select an existing Google Cloud project or create a new one.
   - Copy the generated API key (format: `AIzaSy...`).
3. **Configuration**:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeneratedGeminiKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   CODE_REVIEW_ENABLED=true
   CODE_REVIEW_FAIL_CLOSED=true
   ```
4. **Verification**:
   Submit any deliverable in the review workspace or run:
   ```powershell
   npm --workspace backend run test -- src/test/security-gate.test.ts
   ```

---

### B. Supabase Authentication
TrustToPay integrates Supabase for user registration, PKCE authentication, email verification, and password resets.

1. **Provider Console**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Project Setup**:
   - Click **"New Project"**, select your organization, name the project (e.g. `trusttopay-prod`), and set a strong database password.
3. **Retrieve Credentials**:
   - Click **Project Settings** (gear icon) $\rightarrow$ **API**.
   - **Project URL**: Copy the URL $\rightarrow$ set `SUPABASE_URL` and `VITE_SUPABASE_URL`.
   - **Project API Keys**:
     - Copy `anon` `public` $\rightarrow$ set `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`.
     - Click **Reveal** on `service_role` $\rightarrow$ set `SUPABASE_SERVICE_ROLE_KEY` (**Backend only!**).
   - **JWT Settings**:
     - Copy **JWT Secret** $\rightarrow$ set `SUPABASE_JWT_SECRET` (**Backend only!**).
4. **Configure Auth Redirects in Supabase Console**:
   - Navigate to **Authentication** $\rightarrow$ **URL Configuration**.
   - **Site URL**:
     - Development: `http://localhost:5173`
     - Production: `https://yourdomain.com`
   - **Redirect URLs**:
     - `http://localhost:5173/**`
     - `http://localhost:5173/login`
     - `http://localhost:5173/register`
     - `https://yourdomain.com/**`
5. **Configuration**:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### C. PayPal Sandbox Escrow & Webhooks
TrustToPay locks task bounties into escrow via PayPal Orders v2 and dispatches payouts via PayPal Payouts v1.

1. **Provider Console**: [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. **Steps**:
   - Sign in and toggle the top switch to **Sandbox**.
   - Go to **"Apps & Credentials"** $\rightarrow$ click **"Create App"**.
   - App Name: `TrustToPay Escrow Engine`. App Type: **Merchant**.
   - Click **Create App**.
   - Copy **Client ID** $\rightarrow$ `PAYPAL_CLIENT_ID`.
   - Click **Show** under Secret $\rightarrow$ copy **Secret** $\rightarrow$ `PAYPAL_CLIENT_SECRET`.
3. **Webhook Configuration**:
   - On the same app page, scroll down to **Webhooks** $\rightarrow$ click **Add Webhook**.
   - **Webhook URL**:
     - Production: `https://api.yourdomain.com/api/v1/paypal/webhook`
     - Local Dev (via ngrok/tunnel): `https://<tunnel-id>.ngrok-free.app/api/v1/paypal/webhook`
   - **Select Events**:
     - `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
     - `Payment capture denied` (`PAYMENT.CAPTURE.DENIED`)
     - `Payouts batch success` (`PAYMENT.PAYOUTSBATCH.SUCCESS`)
     - `Payouts batch denied` (`PAYMENT.PAYOUTSBATCH.DENIED`)
     - `Payouts item succeeded` (`PAYMENT.PAYOUTS-ITEM.SUCCEEDED`)
     - `Payouts item failed` (`PAYMENT.PAYOUTS-ITEM.FAILED`)
   - Click **Save** and copy the generated **Webhook ID** $\rightarrow$ `PAYPAL_WEBHOOK_ID`.
4. **Configuration**:
   ```env
   DEMO_MODE=false
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID=AXXXXXXXXXX...
   PAYPAL_CLIENT_SECRET=EYYYYYYYYYY...
   PAYPAL_WEBHOOK_ID=8ZZZZZZZZZZ...
   PAYPAL_CURRENCY=USD
   PAYPAL_PAYOUTS_ENABLED=true
   ```

---

### D. Elasticsearch Discovery (`ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY`)
TrustToPay indexes verified specialist credentials and historical task outcomes for hybrid vector/keyword candidate retrieval.

1. **Provider Console**: [Elastic Cloud](https://cloud.elastic.co/) or local Docker container.
2. **Elastic Cloud Setup**:
   - Create a deployment in Elastic Cloud.
   - Copy the **Elasticsearch endpoint URL** $\rightarrow$ `ELASTICSEARCH_URL`.
   - Open Kibana $\rightarrow$ **Stack Management** $\rightarrow$ **API Keys** $\rightarrow$ **Create API Key**.
   - Copy the encoded API key $\rightarrow$ `ELASTICSEARCH_API_KEY`.
3. **Local Docker Option** (No cloud account required):
   ```bash
   docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.15.0
   ```
4. **Configuration**:
   ```env
   ELASTIC_ENABLED=true
   ELASTICSEARCH_URL=http://localhost:9200
   ELASTICSEARCH_API_KEY=your-api-key-here
   ELASTIC_INDEX_SPECIALISTS=trusttopay-specialists-v1
   ELASTIC_TIMEOUT_MS=2500
   ```

---

### E. Jina AI Embeddings (`JINA_API_KEY`)
Computes semantic 1024-dimensional embeddings for specialist profiles and task requirements (`jina-embeddings-v3`).

1. **Provider Console**: [Jina AI Cloud](https://cloud.jina.ai/)
2. **Steps**:
   - Sign in with GitHub or Google.
   - Navigate to **API Keys** and generate a new key.
   - Copy key string (`jina_...`).
3. **Configuration**:
   ```env
   JINA_API_KEY=jina_xxxxxxxxxxxxxxxx
   JINA_EMBEDDING_MODEL=jina-embeddings-v3
   ```
4. **Graceful Fallback**: If `JINA_API_KEY` is not provided, Elasticsearch automatically falls back to BM25 keyword matching (`KEYWORD_ELASTIC`).

---

## 5. Locally Generated Cryptographic Secrets

These variables must be generated locally using cryptographically secure pseudorandom number generators. **Never obtain these from an external website or use default passwords.**

### 1. `SESSION_SECRET`
- **Purpose**: Signs and validates session cookies and fallback HMAC handback tokens.
- **Requirement**: Minimum 32 random characters (256-bit or 384-bit entropy recommended).
- **Generation Commands**:
  - **PowerShell (Windows)**:
    ```powershell
    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
    ```
  - **Bash (Linux/macOS)**:
    ```bash
    openssl rand -hex 48
    ```

### 2. `TRUSTTOPAY_AGENT_API_KEY`
- **Purpose**: Autonomous AI agent bearer authentication key for MCP server or direct REST API requests.
- **Format**: `ttp_live_[a-f0-9]{48}` or `ttp_test_[a-f0-9]{48}`.
- **Generation Commands**:
  - Generated automatically via UI at `/app/workspace` (Developer Settings $\rightarrow$ Create Agent Key).
  - Or generated manually via CLI:
    ```powershell
    node -e "console.log('ttp_live_' + require('crypto').randomBytes(24).toString('hex'))"
    ```

### 3. Agent Task Callback Secret (`callbackSecret`)
- **Purpose**: Shared HMAC-SHA256 secret between the agent and TrustToPay for verifying handback delivery webhooks (`X-TrustToPay-Signature`).
- **Generation Command**:
  ```bash
  openssl rand -hex 32
  ```

---

## 6. Official Routes & URL Reference

| Route / Destination | Local Development URL | Production URL Pattern | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | `https://trusttopay.com` | Vite single-page application |
| **Backend REST API** | `http://localhost:3000` | `https://api.trusttopay.com` | Express API server |
| **API Documentation** | `http://localhost:3000/api-docs` | `https://api.trusttopay.com/api-docs` | OpenAPI / Swagger UI |
| **Health Check** | `http://localhost:3000/health` | `https://api.trusttopay.com/health` | Readiness & integration status |
| **PayPal Webhook** | `http://localhost:3000/api/v1/paypal/webhook` | `https://api.trusttopay.com/api/v1/paypal/webhook` | Receives capture & payout events |
| **Supabase Auth Callback** | `http://localhost:5173/login` | `https://trusttopay.com/login` | Handles PKCE token exchange |
| **MCP Server (HTTP)** | `http://127.0.0.1:3100/mcp` | `https://mcp.trusttopay.com/mcp` | Streamable HTTP transport |
| **Agent Handback Callback** | Configured per task | Client agent webhook | Receives signed artifact delivery |

---

## 7. Security Audit & Best Practices Checklist

- [x] **No hardcoded secrets**: All API keys, secrets, and private credentials are read dynamically from `process.env` or `import.meta.env`.
- [x] **No private keys in frontend bundles**: Verified via build inspection (`dist/` contains zero references to PayPal secret, Gemini key, or Supabase service-role key).
- [x] **CORS Origin Whitelist**: Enforces strict origin matching via `backend/src/middleware/security.ts`.
- [x] **Safe Git Tracking**: `.gitignore` strictly excludes `.env`, `.env.*`, `backend/.env`, and `frontend/.env`.
- [x] **Safe Serialization**: `publicIntegrationStatus` serializes client status without revealing secret keys or tokens.
- [x] **Timing-Safe Operations**: HMAC-SHA256 signatures are verified using constant-time comparisons.
