# TrustToPay MCP Server Integration Directory

The official `@trusttopay/mcp-server` source and build package live in [`/packages/trusttopay-mcp`](../../packages/trusttopay-mcp).

---

## Building & Running from the Monorepo

```bash
# Build the MCP server TypeScript package
npm --workspace @trusttopay/mcp-server run build

# Start over STDIO transport (default for local IDE / CLI agents)
TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000" \
TRUSTTOPAY_AGENT_API_KEY="ttp_test_replace_with_your_agent_api_key_000000" \
node packages/trusttopay-mcp/dist/index.js --transport stdio

# Start over Streamable HTTP transport (bound to 127.0.0.1:3100 by default)
TRUSTTOPAY_API_BASE_URL="http://127.0.0.1:3000" \
node packages/trusttopay-mcp/dist/index.js --transport http --host 127.0.0.1 --port 3100
```

---

## Exposed Tools

`@trusttopay/mcp-server` exposes strictly four tools for external AI agents:

1. `trusttopay_create_task`
2. `trusttopay_get_task_status`
3. `trusttopay_get_verified_result`
4. `trusttopay_cancel_task`

See [`docs/developers/MCP_SETUP.md`](../../docs/developers/MCP_SETUP.md) for client configuration instructions across Claude Desktop, Claude Code, Cursor, VS Code, and custom MCP SDK clients.
