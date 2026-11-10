# TrustToPay Developer Integration Kit

Welcome to the official **TrustToPay Developer Integration Kit**. This directory contains everything needed to equip external AI coding agents, autonomous orchestrators, and IDE assistants with human-in-the-loop L1–L3 specialist verification and cryptographic code handback.

---

## Directory Structure

```text
integrations/
├── README.md                                  # Overview & integration architecture
├── agent-skills/
│   └── trusttopay/
│       └── SKILL.md                           # Distributable Agent Skills specification file
├── mcp-server/
│   └── README.md                              # Deployment & transport guide for @trusttopay/mcp-server
└── examples/
    ├── mcp-client-configs/
    │   ├── claude_desktop_config.json         # Claude Desktop / Claude Code STDIO config
    │   ├── cursor_mcp.json                    # Cursor IDE (.cursor/mcp.json) STDIO config
    │   ├── vscode_mcp.json                    # VS Code (.vscode/mcp.json) config
    │   └── streamable_http_client.json        # Remote Streamable HTTP client config
    ├── typescript/
    │   ├── README.md
    │   └── agent-escalation-example.ts        # Full TypeScript MCP Client SDK integration example
    └── python/
        ├── README.md
        └── agent_escalation_example.py        # Full Python agent escalation & handback workflow
```

---

## End-to-End Agent Escalation Architecture

```mermaid
sequenceDiagram
    autonumber
    participant Agent as External AI Agent (MCP Client)
    participant Skill as TrustToPay Agent Skill (SKILL.md)
    participant MCP as @trusttopay/mcp-server (STDIO / HTTP)
    participant API as TrustToPay Backend API
    participant Spec as Verified L1-L3 Specialist

    Agent->>Skill: 1. Detect low confidence (<0.70) or repeated test failure
    Skill-->>Agent: 2. Escalate policy, secret redaction & tool schema rules
    Agent->>MCP: 3. Call trusttopay_create_task (idempotencyKey, requiredSkills, budgetMax)
    MCP->>API: 4. POST /api/v1/tasks + dispatch top-5 ranked L1-L3 offers
    API-->>Spec: 5. Parallel 15-min expiring offer broadcast
    Spec->>API: 6. Atomic accept + submit code artifact (SHA-256)
    API->>API: 7. Run Deterministic Scanner + Gemini Security Gate + Isolated Runner
    Agent->>MCP: 8. Poll trusttopay_get_task_status -> isReadyForHandback: true
    Agent->>MCP: 9. Call trusttopay_get_verified_result
    MCP->>API: 10. GET /api/v1/tasks/:id/handback
    API-->>MCP: 11. Signed handback payload (PASSED + PASS + SHA-256 match)
    MCP-->>Agent: 12. Return verified changedFiles / patchText + digests
    Agent->>Agent: 13. Validate SHA-256 digest & resume original workflow
```

---

## Quick Links

- **Canonical Agent Skill Package**: [`/skills/trusttopay/SKILL.md`](../skills/trusttopay/SKILL.md)
- **Official MCP Server Package**: [`/packages/trusttopay-mcp`](../packages/trusttopay-mcp)
- **Developer Guides**:
  - [Agent Skill Setup Guide](../docs/developers/AGENT_SKILL_SETUP.md)
  - [MCP Server Setup Guide](../docs/developers/MCP_SETUP.md)
  - [Agent API & Tool Reference](../docs/developers/AGENT_API_REFERENCE.md)
