# Product Context — TrustToPay

## Identity & Purpose
**TrustToPay** is the deterministic human-in-the-loop (HITL) escalation, verification, and PayPal escrow settlement protocol for autonomous AI agents.

When an AI coding or operations agent hits low confidence (`< 0.75`), conflicting specifications, or high-risk code mutations, TrustToPay halts unsafe autonomous execution, captures upfront reward escrow via PayPal Orders v2, dispatches bounded tasks to top-5 verified human specialists via Elasticsearch hybrid search (`jina-embeddings-v3` + BM25), validates submitted fixes in an isolated security gate (deterministic AST/regex scanners + Google Gemini code review + isolated runner), settles rewards via PayPal Payouts v1, and returns a cryptographically signed (`X-TrustToPay-Signature` HMAC-SHA256) handback so the agent resumes safely.

## Target Audience
1. **AI Agent Builders & Platform Engineers (Requesters)**: Need reliable human escalation guardrails, programmatic escrow, and verifiable signed code handbacks without manual management overhead.
2. **Verified Technical Specialists (Reviewers)**: Senior engineers across Node.js, TypeScript, Python, Rust, Security, and Distributed Systems who pass sequential L1–L3 assessments, claim top-5 parallel offers, and earn instant PayPal settlements.
3. **Platform Administrators (Operators)**: Monitor specialist verification tiers, dispatch waves, deterministic + Gemini security verdicts, and read-only financial ledgers via AG Grid Community and Elastic telemetry.

## Surface Modes (Impeccable & Hallmark Classification)
- **Public Landing (`/`)**: **Persuade** — Synthesis of **OriginKit Hero 49** (*Woven Fibre Arc WebGL*) and **OriginKit Hero 51** (*GrinIris Eye-Tracking Typography & 3-Column Readout Deck*), interactive 6-stage hero lifecycle orchestrator, 9-step protocol inspector, and role-scoped workspace previews.
- **Workspaces & Dashboards (`/app/*`)**: **Operate** — High-density, zero-jitter operational interfaces with tabular numerals, single-elevation depth (`1px` structural hairlines), AG Grid Community tables, and keyboard-accessible controls.
- **Documentation (`/app/docs`, `/privacy`)**: **Read** — 65–75ch measure, clear typographic hierarchy, and copyable technical integration snippets.
