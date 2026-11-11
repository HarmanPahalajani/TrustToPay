# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **AI Builders & Requesters (`REQUESTER`)**: Engineering teams, product operators, and autonomous AI agents running via MCP or REST API who hit technical, security, analytical, or verification blockers and need vetted human expertise with verified output before resuming execution.
- **Verified Human Specialists (`REVIEWER`)**: Software engineers, security reviewers, and domain specialists who certify proficiency through multi-level proctored assessments (L1 Foundation to L3 Advanced), accept bounded paid tasks matching their verified skills, and submit structured fixes, patches, and explanations.

## Product Purpose

TrustToPay provides a trusted execution bridge between AI workflows and qualified human specialists. When an AI workflow encounters uncertainty, conflicting evidence, or high-risk decisions, it creates a bounded task with clear acceptance criteria and funding. TrustToPay matches the task to qualified specialists, validates submitted deliverables through automated safety scans, AI policy review, and verification checks, and returns a signed, trustworthy result back to the requesting agent or operator.

## Positioning

Unlike open-market freelancer boards built around manual bidding and unverified star ratings, TrustToPay combines semantic and keyword specialist matching with sequential proctored skill verification, pre-funded task escrow, and multi-stage deliverable inspection before any human output reaches an autonomous AI workflow.

## Operating Context

- **Public marketing & trust experience**: `/` (also `/how-it-works`, `/developers`), `/privacy`, `/contact`.
- **Authentication & recovery**: `/login`, `/register` using Supabase Auth identity and HttpOnly session cookies, with safe demo guidance separating account roles without exposing credentials in frontend source or client storage.
- **Requester console**: `/app` overview, `/app/workspace` blocker triage, `/app/sessions/:id` AI confidence analysis and escalation creation, `/app/requests` task list, `/app/tasks/:id` task progress, specialist matching, PayPal funding checkout, and result inspection, `/app/tasks/:id/verification` verification certificate, `/app/payments` funding ledger.
- **Specialist workbench**: `/app/marketplace` funded opportunities and targeted offers, `/app/reviews` claimed tasks and deliverable/artifact upload, `/app/onboarding/skills` skill catalogue selection, `/app/assessment/:skillSlug/:level` sequential proctored testing, `/app/earnings` reward history and payout profile setup, `/app/profile` specialist settings and consent.
- **Developer integration documentation**: `/app/docs` documenting the REST API, Agent Skill, and the 4 MCP tools (`trusttopay_create_task`, `trusttopay_get_task_status`, `trusttopay_get_verified_result`, `trusttopay_cancel_task`).

## Capabilities and Constraints

- **Strict Role Separation**: Frontend must never expose an ADMIN role selector, internal moderation flags, server environment variables (`DEMO_MODE`, `PAYPAL_CLIENT_ID`), or developer configuration checklists inside normal user flows.
- **Transparent Payment Status**: PayPal Sandbox orders settle checkout cleanly with clear `"Test payment — no real money will be charged."` notices. Specialist payouts depend on server merchant capabilities; when payouts are disabled on an account or environment, UI must honestly reflect availability and never promise immediate withdrawable payouts.
- **Human-Friendly Status Terminology**: Backend API enum names (`AWAITING_FUNDING`, `PAYMENT_READY`, `REVIEWER_ASSIGNED`, `VERIFICATION_PENDING`, `NEEDS_HUMAN_REVIEW`, `SAFETY_REJECTED`, `VERIFIED`) remain unchanged on the wire and are mapped cleanly in UI copy (e.g. `Payment ready`, `Automatic checks`, `Security checks`, `Additional security review`, `Waiting for further review`, `Submission rejected`, `Task progress`, `File integrity check`, `Secure digital signature`, `Find suitable specialists`).
- **Partner Infrastructure Commitments**: PayPal (Orders v2 checkout), Elastic (specialist indexing and hybrid retrieval), Render (cloud hosting and PostgreSQL), Jina AI (semantic embeddings), Google Gemini (security inspection gate), and Supabase (authentication).

## Brand Commitments

- **Product Name**: TrustToPay
- **Core Headline**: "When AI gets stuck, human expertise moves it forward."
- **Top Partner Visibility**: Official **PayPal**, **Elastic**, and **Render** logos in authentic brand colors and balanced proportions inside a dedicated `POWERED BY` strip directly below the public header and above the hero.
- **Visual Guardrails**: Solid cobalt CTA hierarchy (`#4263EB`), high-contrast deep navy hero/surfaces (`#10172A`), crisp light canvas (`#F5F7FC`, `#FFFFFF`), emerald verification states (`#12A875`), amber pending states (`#F5A623`). Strictly zero blue-to-purple gradients, glowing blobs, or `Space Grotesk` / `Roboto` type.

## Evidence on Hand

- Verified backend API v1 endpoints, Prisma task/session/verification/payment schemas, `@trusttopay/mcp-server` package exposing the 4 production MCP tools, and frontend Vitest + Testing Library unit suite.
