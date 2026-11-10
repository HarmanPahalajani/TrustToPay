import type { Readable, Writable } from "node:stream";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createTrustToPayMcpServer,
  type CreateTrustToPayMcpServerOptions,
  type TrustToPayMcpServerInstance,
} from "../server.js";
import { validateAgentApiKeyFormat } from "../services/auth.js";

export interface StartStdioTransportOptions extends CreateTrustToPayMcpServerOptions {
  stdin?: Readable;
  stdout?: Writable;
  requireApiKeyAtStartup?: boolean;
}

/**
 * Starts the TrustToPay MCP server over STDIO transport.
 *
 * CRITICAL: Never writes diagnostic or audit logs to stdout. All operational
 * telemetry is written strictly to stderr so the JSON-RPC stream on stdout remains pure.
 */
export async function startStdioMcpServer(
  options: StartStdioTransportOptions = {},
): Promise<{
  instance: TrustToPayMcpServerInstance;
  transport: StdioServerTransport;
  close: () => Promise<void>;
}> {
  const instance = createTrustToPayMcpServer(options);

  if (options.requireApiKeyAtStartup !== false) {
    validateAgentApiKeyFormat(instance.authConfig.defaultAgentApiKey);
  }

  const transport = new StdioServerTransport(options.stdin, options.stdout);
  transport.onerror = (error) => {
    process.stderr.write(
      `${JSON.stringify({
        service: "trusttopay-mcp",
        transport: "stdio",
        level: "error",
        message: error.message,
      })}\n`,
    );
  };

  await instance.mcpServer.connect(transport);

  return {
    instance,
    transport,
    close: async () => {
      await instance.mcpServer.close();
      await transport.close();
    },
  };
}
