# TypeScript Agent Escalation Example

This example demonstrates how a TypeScript AI agent uses the official `@modelcontextprotocol/sdk` client to connect to `@trusttopay/mcp-server`, escalate a complex engineering task, poll status, and cryptographically verify the returned artifact before resuming execution.

## Prerequisites

1. A running TrustToPay backend (`http://127.0.0.1:3000`).
2. A running `@trusttopay/mcp-server` over Streamable HTTP (`http://127.0.0.1:3100/mcp`).
3. A valid TrustToPay Agent API key (`TRUSTTOPAY_AGENT_API_KEY=ttp_test_...`).

## Running the Example

```bash
export TRUSTTOPAY_MCP_URL="http://127.0.0.1:3100/mcp"
export TRUSTTOPAY_AGENT_API_KEY="ttp_test_replace_with_your_agent_api_key_000000"

npx tsx integrations/examples/typescript/agent-escalation-example.ts
```
