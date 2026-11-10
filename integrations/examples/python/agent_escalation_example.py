#!/usr/bin/env python3
"""
TrustToPay Autonomous Agent Escalation Example (Python + Streamable HTTP MCP / REST)

Demonstrates how a Python AI agent invokes `@trusttopay/mcp-server` over JSON-RPC
Streamable HTTP (`POST /mcp`) and validates the 3-stage verification gate + SHA-256
digest before applying specialist code deliverables.

Uses only the Python standard library (`urllib.request`, `json`, `os`, `time`).
"""

from __future__ import annotations

import json
import os
import time
import urllib.request
from typing import Any, Dict, Optional


class TrustToPayMcpHttpClient:
    """Minimal JSON-RPC 2.0 client for @trusttopay/mcp-server Streamable HTTP."""

    def __init__(self, mcp_url: str, agent_api_key: str, timeout_seconds: int = 15) -> None:
        self.mcp_url = mcp_url.rstrip("/")
        self.agent_api_key = agent_api_key.strip()
        self.timeout_seconds = timeout_seconds
        self._req_id = 0

    def _next_id(self) -> int:
        self._req_id += 1
        return self._req_id

    def rpc(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        payload = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": method,
            "params": params or {},
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self.mcp_url,
            data=data,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "Authorization": f"Bearer {self.agent_api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
            raw = resp.read().decode("utf-8").strip()
            # Handle either direct JSON or SSE data lines
            if raw.startswith("event:") or "data: " in raw:
                for line in reversed(raw.splitlines()):
                    if line.startswith("data: "):
                        return json.loads(line[len("data: ") :])
            return json.loads(raw)

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        response = self.rpc("tools/call", {"name": name, "arguments": arguments})
        if "error" in response:
            raise RuntimeError(f"MCP RPC error: {response['error']}")
        result = response.get("result", {})
        content = result.get("content", [])
        parsed = json.loads(content[0]["text"]) if content else {}
        if result.get("isError"):
            raise RuntimeError(f"Tool error from {name}: {json.dumps(parsed)}")
        return parsed


def validate_verified_handback(handback: Dict[str, Any]) -> str:
    """Enforce the mandatory 3-stage verification gate and SHA-256 equality."""
    artifact_sha = handback.get("artifact", {}).get("sha256Digest", "")
    verification = handback.get("verification", {})
    safety = handback.get("safetyReview", {})
    test_run = handback.get("testRunSummary", {})

    if verification.get("status") != "PASSED":
        raise ValueError(f"Verification gate failed: {verification.get('status')}")
    if safety.get("verdict") != "PASS":
        raise ValueError(f"Gemini security gate blocked handback: {safety.get('verdict')}")
    if not test_run.get("passed") or test_run.get("exitCode") != 0:
        raise ValueError("Isolated test execution gate did not pass.")

    if not artifact_sha or len(artifact_sha) != 64:
        raise ValueError("Invalid artifact SHA-256 digest.")

    if not (
        artifact_sha
        == verification.get("artifactSha256")
        == safety.get("artifactSha256")
        == test_run.get("artifactSha256")
    ):
        raise ValueError("Cryptographic SHA-256 mismatch across handback verification sections.")

    return artifact_sha


def run_demo() -> None:
    mcp_url = os.environ.get("TRUSTTOPAY_MCP_URL", "http://127.0.0.1:3100/mcp")
    api_key = os.environ.get(
        "TRUSTTOPAY_AGENT_API_KEY",
        "ttp_test_replace_with_your_agent_api_key_000000",
    )

    client = TrustToPayMcpHttpClient(mcp_url=mcp_url, agent_api_key=api_key)

    created = client.call_tool(
        "trusttopay_create_task",
        {
            "title": "Audit Python async webhook signature verification for timing safety",
            "description": "Our webhook verifier compares HMAC digests using '==' instead of hmac.compare_digest. Provide a timing-safe patch and unit test.",
            "category": "security_remediation",
            "requiredSkills": ["python", "system-architecture"],
            "minimumSkillLevel": "L2",
            "acceptanceCriteria": [
                "Use hmac.compare_digest for constant-time comparison",
                "Reject timestamps older than 300 seconds to prevent replay attacks",
            ],
            "contextFiles": [
                {
                    "path": "app/security/webhook.py",
                    "content": "def verify_sig(expected: str, actual: str) -> bool:\n    return expected == actual\n",
                }
            ],
            "expectedOutputType": "patch",
            "urgency": "high",
            "deadlineMinutes": 45,
            "budgetMax": 2000,
            "idempotencyKey": f"py-agent-webhook-audit-{int(time.time())}",
        },
    )
    task_id = created["taskId"]
    print(f"Created task {task_id} (status={created['status']})")

    status = client.call_tool("trusttopay_get_task_status", {"taskId": task_id})
    print(f"Task status: {status['status']} (ready={status['isReadyForHandback']})")


if __name__ == "__main__":
    run_demo()
