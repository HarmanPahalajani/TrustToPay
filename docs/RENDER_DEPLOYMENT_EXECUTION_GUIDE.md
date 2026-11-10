# TrustToPay — Hosted Render Deployment & Operations Guide

This guide details the complete deployment architecture for TrustToPay on Render using the GitHub repository [`HarmanPahalajani/TTP_H`](https://github.com/HarmanPahalajani/TTP_H) on branch `Harman`.

---

## 1. Database Status & Verification

* **Host**: Render PostgreSQL (`trusttopay-db` in Oregon)
* **Status**: **Fully Migrated and Seeded**
* **Tables**: 25 public tables (24 application models + `_prisma_migrations`)
* **Taxonomy**: 115 skills seeded (83 assessed with 249 questions, 32 unassessed)
* **Judge Accounts**:
  * **Requester**: `agent@demo.trusttopay.dev` $\rightarrow$ Supabase UUID `14a5d709-b46f-4e02-ba08-65cfd4be46ae` (Role: `REQUESTER`)
  * **Reviewer**: `reviewer@demo.trusttopay.dev` $\rightarrow$ Supabase UUID `0dd74430-c8c1-4e5a-b138-206681970258` (Role: `REVIEWER`, `isReviewerApproved: true`, 13 verified skills)
* **Specialist Search Index**: Jina v3 (1024-dim dense vectors) + Elasticsearch index `trusttopay-specialists-v1` synchronized with eligible specialists.

---

## 2. Deploying via Render Dashboard (Blueprint or Manual)

### Method A: Render Blueprint (Recommended — 1 Click)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect repository `HarmanPahalajani/TTP_H` and select branch `Harman`.
4. Render will read `render.yaml` and provision:
   * **`trusttopay-backend`** (Web Service, Node.js, Oregon, Free)
   * **`trusttopay-frontend`** (Static Site, Oregon, Free)

### Method B: Manual Service Creation

#### 1. Backend Web Service
* **Name**: `trusttopay-backend`
* **Region**: `Oregon`
* **Branch**: `Harman`
* **Root Directory**: `./`
* **Runtime**: `Node`
* **Build Command**: `npm install && npm --workspace backend run build`
* **Start Command**: `npm --workspace backend run start`
* **Health Check Path**: `/health`
* **Environment Variables**:
  * `NODE_ENV`: `production`
  * `PORT`: `10000`
  * `DATABASE_URL`: `[Internal Database URL from trusttopay-db]`
  * `FRONTEND_URL`: `https://trusttopay-frontend.onrender.com` *(or your custom static site URL)*
  * `API_BASE_URL`: `https://trusttopay-backend.onrender.com`
  * `SESSION_SECRET`: `[Random 32+ character hex string]`
  * `DEMO_MODE`: `false`
  * `DEMO_USERS_ENABLED`: `true`
  * `AI_PROVIDER`: `gemini`
  * `GEMINI_API_KEY`: `[Your Gemini API Key]`
  * `GEMINI_MODEL`: `gemini-3.8-flash`
  * `CODE_REVIEW_ENABLED`: `true`
  * `CODE_REVIEW_FAIL_CLOSED`: `true`
  * `ELASTIC_ENABLED`: `true`
  * `ELASTICSEARCH_URL`: `[Your Elasticsearch URL]`
  * `ELASTICSEARCH_API_KEY`: `[Your Elasticsearch API Key]`
  * `ELASTIC_INDEX_SPECIALISTS`: `trusttopay-specialists-v1`
  * `JINA_API_KEY`: `[Your Jina AI Key]`
  * `JINA_EMBEDDING_MODEL`: `jina-embeddings-v3`
  * `PAYPAL_ENV`: `sandbox`
  * `PAYPAL_CLIENT_ID`: `[Your PayPal Sandbox Client ID]`
  * `PAYPAL_CLIENT_SECRET`: `[Your PayPal Sandbox Secret]`
  * `PAYPAL_PAYOUTS_ENABLED`: `false`
  * `SUPABASE_URL`: `[Your Supabase URL]`
  * `SUPABASE_ANON_KEY`: `[Your Supabase Anon Key]`
  * `SUPABASE_SERVICE_ROLE_KEY`: `[Your Supabase Service Role Key]`
  * `RESEND_API_KEY`: `[Your Resend API Key]`

#### 2. Frontend Static Site
* **Name**: `trusttopay-frontend`
* **Region**: `Oregon`
* **Branch**: `Harman`
* **Root Directory**: `./`
* **Build Command**: `npm install && npm --workspace frontend run build`
* **Publish Directory**: `frontend/dist`
* **Rewrite Rules**:
  * Source: `/*` $\rightarrow$ Destination: `/index.html` (Rewrite, 200)
* **Environment Variables**:
  * `VITE_API_BASE_URL`: `https://trusttopay-backend.onrender.com`
  * `VITE_SUPABASE_URL`: `[Your Supabase URL]`
  * `VITE_SUPABASE_ANON_KEY`: `[Your Supabase Anon Key]`
  * `VITE_PAYPAL_CLIENT_ID`: `[Your PayPal Sandbox Client ID]`

---

## 3. Post-Deployment Configuration

### Supabase Auth URL Configuration
In the [Supabase Dashboard](https://supabase.com/dashboard) under **Authentication** $\rightarrow$ **URL Configuration**:
1. Set **Site URL** to your frontend Render URL: `https://trusttopay-frontend.onrender.com`.
2. In **Redirect URLs**, add:
   * `https://trusttopay-frontend.onrender.com/**`
   * `https://trusttopay-frontend.onrender.com/auth`
   * `https://trusttopay-frontend.onrender.com/dashboard`
   * `http://localhost:5173/**` *(for local development preservation)*

### PayPal Sandbox Webhook Setup
Once the backend is live at `https://trusttopay-backend.onrender.com`:
1. In [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox), select your App.
2. Under **Webhooks**, click **Add Webhook**.
3. Webhook URL: `https://trusttopay-backend.onrender.com/api/webhooks/paypal`
4. Event types:
   * `CHECKOUT.ORDER.APPROVED`
   * `PAYMENT.CAPTURE.COMPLETED`
   * `PAYMENT.CAPTURE.DENIED`
   * `PAYMENT.CAPTURE.REFUNDED`
5. Copy the generated **Webhook ID** and set `PAYPAL_WEBHOOK_ID` in your Render backend service environment variables.
