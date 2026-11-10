# Python Agent Escalation Example

This zero-dependency Python 3 example demonstrates how an external Python agent (LangGraph, CrewAI, AutoGen, or custom orchestrator) calls `@trusttopay/mcp-server` over Streamable HTTP (`POST /mcp`) and enforces the three-stage verification gate and SHA-256 digest validation before consuming specialist deliverables.

## Running the Example

```bash
export TRUSTTOPAY_MCP_URL="http://127.0.0.1:3100/mcp"
export TRUSTTOPAY_AGENT_API_KEY="ttp_test_replace_with_your_agent_api_key_000000"

python3 integrations/examples/python/agent_escalation_example.py
```
