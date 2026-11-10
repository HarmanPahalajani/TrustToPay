# TrustToPay MCP Server Setup Guide

This guide covers building, configuring, and connecting `@trusttopay/mcp-server` over both **STDIO** and **Streamable HTTP** transports.

---

## 1. Prerequisites & Building

From the repository root:

```bash
# Install dependencies and build the MCP server package
npm --workspace @trusttopay/mcp-server run build
```

---

## 2. Provisioning an Agent API Key

Every MCP request authenticates with a dedicated TrustToPay Agent API key (`ttp_test_...` or `ttp_live_...`).

1. Sign in to TrustToPay as a `REQUESTER` user (or use `POST /api/v1/auth/login`).
2. Create an Agent API key via the Developer Portal (`/developers`) or REST API:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "cursor-mcp-agent", "environment": "test"}'
```

3. Store the returned `rawKey` securely as `TRUSTTOPAY_AGENT_API_KEY`. The server stores only the SHA-256 hash of the key and never displays `rawKey` again.

---

## 3. Transport Modes

### Mode A: STDIO Transport (Recommended for Local IDE & CLI Agents)

STDIO transport communicates over standard input (`stdin`) and standard output (`stdout`).
- All audit and error logs are written strictly to `stderr` so the JSON-RPC stream on `stdout` is never polluted.

```bash
export TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000"
export TRUSTTOPAY_AGENT_API_KEY="ttp_test_replace_with_your_agent_api_key_000000"

node packages/trusttopay-mcp/dist/index.js --transport stdio
```

### Mode B: Streamable HTTP Transport (Recommended for Remote / Hosted Agents)

Streamable HTTP starts an HTTP server exposing `POST /mcp`, `GET /mcp`, `DELETE /mcp`, and `GET /health`.
- Binds to `127.0.0.1:3100` by default.
- Validates the `Origin` header against localhost or `TRUSTTOPAY_MCP_ALLOWED_ORIGINS`.
- Requires `Authorization: Bearer <agent_api_key>` (or `X-TrustToPay-Agent-Key`) on every `/mcp` request.

```bash
export TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000"
export TRUSTTOPAY_MCP_HOST="127.0.0.1"
export TRUSTTOPAY_MCP_PORT="3100"

node packages/trusttopay-mcp/dist/index.js --transport http
```

Verify health:

```bash
curl http://127.0.0.1:3100/health
```

---

## 4. Client Configurations

Ready-to-use configuration templates are provided in [`integrations/examples/mcp-client-configs/`](../../integrations/examples/mcp-client-configs/):

- **Claude Desktop / Claude Code**: [`claude_desktop_config.json`](../../integrations/examples/mcp-client-configs/claude_desktop_config.json)
- **Cursor IDE**: [`cursor_mcp.json`](../../integrations/examples/mcp-client-configs/cursor_mcp.json)
- **VS Code Copilot**: [`vscode_mcp.json`](../../integrations/examples/mcp-client-configs/vscode_mcp.json)
- **Streamable HTTP Client**: [`streamable_http_client.json`](../../integrations/examples/mcp-client-configs/streamable_http_client.json)

---

## 5. Security & Policy Controls

- **Budget Enforcement**: Set `TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` (default `500` = `$5.00`) and `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR` (default `50000` = `$500.00`). Any tool call outside these bounds fails immediately with `BUDGET_POLICY_VIOLATION`.
- **Pre-Flight Secret Scanning**: `trusttopay_create_task` scans `title`, `description`, `acceptanceCriteria`, and `contextFiles` for API keys, tokens, PEM private keys, and DB credentials, rejecting leaked secrets with `SECRET_DETECTED_IN_TASK_PAYLOAD`.
- **Rate Limiting**: Configure `TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE` (default `60` calls/minute per agent key fingerprint).
