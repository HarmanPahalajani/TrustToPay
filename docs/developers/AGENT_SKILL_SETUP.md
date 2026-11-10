# TrustToPay Agent Skill Setup Guide

This guide explains how to install and configure the official **TrustToPay Agent Skill** (`skills/trusttopay/SKILL.md`) in any Agent Skills-compatible AI coding environment (`https://agentskills.io/specification`).

---

## 1. Skill Package Layout

The canonical skill resides in `/skills/trusttopay`:

```text
skills/trusttopay/
├── SKILL.md                           # Core skill instructions & YAML frontmatter (<500 lines)
├── LICENSE                            # MIT License
└── references/
    ├── escalation-policy.md           # Quantitative thresholds, L1-L3 routing & secret redaction
    ├── task-format.md                 # JSON input/output schemas for all 4 MCP tools
    └── result-validation.md           # 3-stage verification gate & SHA-256 digest binding rules
```

A portable single-file copy is also available in `integrations/agent-skills/trusttopay/SKILL.md`.

---

## 2. Installing in Coding Agents

### Option A: Project-Level Agent Skills Directory (`.agents/skills/`)

Copy the `skills/trusttopay` directory into your target repository's `.agents/skills/` folder:

```bash
mkdir -p .agents/skills
cp -R /path/to/trusttopay/skills/trusttopay .agents/skills/trusttopay
```

### Option B: Claude Code (`.claude/skills/`)

```bash
mkdir -p .claude/skills
cp -R /path/to/trusttopay/skills/trusttopay .claude/skills/trusttopay
```

### Option C: Cursor Rules / Skills

Copy `skills/trusttopay/SKILL.md` and `skills/trusttopay/references/` into `.cursor/skills/trusttopay/` and configure `.cursor/mcp.json` using [`integrations/examples/mcp-client-configs/cursor_mcp.json`](../../integrations/examples/mcp-client-configs/cursor_mcp.json).

---

## 3. How the Agent Uses the Skill

1. **Discovery**: At session startup, the agent reads the YAML frontmatter (`name: trusttopay`, `description: ...`) to learn when to activate the skill.
2. **Activation**: When confidence drops below `0.70`, `>= 2` self-correction iterations fail, or security/financial code requires human specialist verification, the agent loads `SKILL.md`.
3. **Reference Resolution**: The agent reads `references/escalation-policy.md`, `references/task-format.md`, and `references/result-validation.md` on demand.
4. **Execution via MCP**: The agent invokes `trusttopay_create_task`, `trusttopay_get_task_status`, `trusttopay_get_verified_result`, and `trusttopay_cancel_task` provided by `@trusttopay/mcp-server`.
