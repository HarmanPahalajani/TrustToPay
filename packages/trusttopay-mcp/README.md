# `@trusttopay/mcp-server`

Official Model Context Protocol (MCP) server for **TrustToPay** — the human-in-the-loop specialist verification and cryptographic code handback protocol for autonomous AI agents.

Built on the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) and designed to pair with the [TrustToPay Agent Skill (`skills/trusttopay/SKILL.md`)](../../skills/trusttopay/SKILL.md).

---

## Features

- **Dual Official Transports**:
  - **STDIO Transport** (`--transport stdio`): Zero-stdout-pollution JSON-RPC over stdin/stdout for Claude Code, Cursor, VS Code Copilot, and local CLI coding agents.
  - **Streamable HTTP Transport** (`--transport http`): Standards-compliant `POST /mcp` endpoint bound to `127.0.0.1` by default with `Origin` validation and per-request Bearer API key authentication.
- **Strictly Scoped Agent Tool Surface (4 Tools Only)**:
  1. `trusttopay_create_task` — Creates an idempotent specialist task with required L1–L3 skill levels, acceptance criteria, and server-enforced budget bounds.
  2. `trusttopay_get_task_status` — Polls task lifecycle status, specialist assignment state, verification run status, and handback readiness.
  3. `trusttopay_get_verified_result` — Returns the specialist's deliverable **only** after passing deterministic checks (`PASSED`), layered Gemini security review (`PASS`), and isolated test execution (`passed: true`) with matching SHA-256 digests.
  4. `trusttopay_cancel_task` — Safely cancels an owned task in a pre-settlement cancellable state.
- **Defense-in-Depth Security**:
  - Pre-flight deterministic secret scanner blocks accidental leakage of API keys (`sk-...`, `ghp_...`, `ttp_...`, `AKIA...`), PEM private keys, and database credentials.
  - Server-enforced budget policy (`TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` to `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR`).
  - Per-agent sliding-window rate limiting and correlation-ID stderr audit logs.

---

## Quick Start

### 1. Generate a Dedicated TrustToPay Agent API Key

Authenticate as a `REQUESTER` user on your TrustToPay instance and create a scoped Agent API Key:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "local-coding-agent", "environment": "test"}'
```

Copy the returned `rawKey` (e.g., `ttp_test_...`).

### 2. Run via STDIO (Local Coding Agents)

```bash
export TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000"
export TRUSTTOPAY_AGENT_API_KEY="ttp_test_replace_with_your_agent_api_key_000000"

npx @trusttopay/mcp-server --transport stdio
```

### 3. Run via Streamable HTTP (Hosted / Remote Agents)

```bash
export TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000"
export TRUSTTOPAY_MCP_HOST="127.0.0.1"
export TRUSTTOPAY_MCP_PORT="3100"

npx @trusttopay/mcp-server --transport http
```

---

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `TRUSTTOPAY_API_BASE_URL` | `http://127.0.0.1:3000` | Base URL of the TrustToPay backend server. |
| `TRUSTTOPAY_AGENT_API_KEY` | *(required in STDIO)* | Agent API key (`ttp_live_...` or `ttp_test_...`). |
| `TRUSTTOPAY_MCP_TRANSPORT` | `stdio` | Transport mode (`stdio` or `http`). |
| `TRUSTTOPAY_MCP_HOST` | `127.0.0.1` | Bind host for Streamable HTTP transport. |
| `TRUSTTOPAY_MCP_PORT` | `3100` | Bind port for Streamable HTTP transport. |
| `TRUSTTOPAY_MCP_ALLOWED_ORIGINS` | `""` *(localhost)* | Comma-separated allowed HTTP Origins. |
| `TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` | `500` (`$5.00`) | Minimum allowed `budgetMax` in USD minor units. |
| `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR` | `50000` (`$500.00`) | Maximum allowed `budgetMax` in USD minor units. |
| `TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE` | `60` | Max tool invocations per agent key per minute. |
| `TRUSTTOPAY_MCP_TIMEOUT_MS` | `15000` | HTTP request timeout in milliseconds. |
| `TRUSTTOPAY_MCP_AUTO_DISPATCH` | `true` | Auto-fund in simulated mode and dispatch Top-5 offers. |

---

## License

MIT © TrustToPay Contributors
