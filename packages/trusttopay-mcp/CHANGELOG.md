# Changelog

All notable changes to `@trusttopay/mcp-server` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-08

### Added
- Initial stable release of `@trusttopay/mcp-server` built on `@modelcontextprotocol/sdk`.
- Support for **STDIO** (`StdioServerTransport`) and **Streamable HTTP** (`StreamableHTTPServerTransport`) transports.
- Four strict, schema-validated MCP tools:
  - `trusttopay_create_task`
  - `trusttopay_get_task_status`
  - `trusttopay_get_verified_result`
  - `trusttopay_cancel_task`
- Pre-flight deterministic secret scanner and redaction guard preventing accidental leakage of API keys, private keys, or credentials in agent task payloads.
- Server-enforced budget policy bounds (`TRUSTTOPAY_MCP_MIN_BUDGET_MINOR` to `TRUSTTOPAY_MCP_MAX_BUDGET_MINOR`), per-agent rate limiting, and correlation ID audit logging.
- Cryptographic SHA-256 verification and three-stage gate enforcement (`PASSED` verification run, `PASS` Gemini security verdict, and `passed: true` isolated test execution) before any artifact is returned to an agent.
