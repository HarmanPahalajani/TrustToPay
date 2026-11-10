import { z } from "zod";
import { McpSecurityError } from "./auth.js";

export const MAX_CONTEXT_FILES = 20;
export const MAX_CONTEXT_FILE_BYTES = 120_000;
export const MAX_TOTAL_PAYLOAD_BYTES = 512_000;

interface SecretPattern {
  id: string;
  label: string;
  regex: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: "PRIVATE_KEY_BLOCK",
    label: "PEM Private Key Block",
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/i,
  },
  {
    id: "OPENAI_KEY",
    label: "OpenAI API Key",
    regex: /\bsk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    id: "GITHUB_TOKEN",
    label: "GitHub Personal Access Token",
    regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{24,}\b|\bgithub_pat_[A-Za-z0-9_]{24,}\b/,
  },
  {
    id: "AWS_ACCESS_KEY",
    label: "AWS Access Key ID",
    regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    id: "GOOGLE_API_KEY",
    label: "Google Cloud / Gemini API Key",
    regex: /\bAIza[0-9A-Za-z_-]{32,40}\b/,
  },
  {
    id: "SLACK_TOKEN",
    label: "Slack Token",
    regex: /\bxox[baprs]-[0-9A-Za-z-]{16,}\b/,
  },
  {
    id: "TRUSTTOPAY_AGENT_KEY",
    label: "TrustToPay Agent API Key",
    regex: /\bttp_(?:live|test)_[A-Za-z0-9_-]{16,128}\b/,
  },
  {
    id: "DATABASE_CREDENTIALS_URI",
    label: "Database Connection URI with Credentials",
    regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^/\s:@]+:[^@\s/<>{}]+@[^\s]+/i,
  },
];

export interface SecretScanFinding {
  patternId: string;
  label: string;
  field: string;
}

/**
 * Scans arbitrary text fields for leaked credentials before any task payload leaves the MCP server.
 */
export function scanTextForSecrets(text: string, fieldName: string): SecretScanFinding[] {
  if (!text) return [];
  const findings: SecretScanFinding[] = [];
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(text)) {
      findings.push({
        patternId: pattern.id,
        label: pattern.label,
        field: fieldName,
      });
    }
  }
  return findings;
}

/**
 * Redacts any detected secrets from strings (used for error messages and logs).
 */
export function redactSecretsInText(text: string): string {
  if (!text) return text;
  let sanitized = text;
  for (const pattern of SECRET_PATTERNS) {
    const globalRegex = new RegExp(pattern.regex.source, pattern.regex.flags.includes("g") ? pattern.regex.flags : `${pattern.regex.flags}g`);
    sanitized = sanitized.replace(globalRegex, `[REDACTED:${pattern.id}]`);
  }
  return sanitized;
}

export function validateSafeRelativeFilePath(filePath: string): string {
  const trimmed = filePath.trim();
  if (!trimmed || trimmed.length > 300) {
    throw new McpSecurityError("INVALID_CONTEXT_FILE_PATH", "Context file path must be 1..300 characters.", 400);
  }
  if (trimmed.includes("\0")) {
    throw new McpSecurityError("INVALID_CONTEXT_FILE_PATH", "Context file path must not contain null bytes.", 400);
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("\\") || /^[A-Za-z]:/.test(trimmed)) {
    throw new McpSecurityError(
      "INVALID_CONTEXT_FILE_PATH",
      `Context file path '${trimmed}' must be relative, not absolute.`,
      400,
    );
  }
  const segments = trimmed.split(/[/\\]+/);
  if (segments.some((seg) => seg === "..")) {
    throw new McpSecurityError(
      "PATH_TRAVERSAL_BLOCKED",
      `Context file path '${trimmed}' contains forbidden '..' traversal segments.`,
      400,
    );
  }
  return segments.filter(Boolean).join("/");
}

export const contextFileSchema = z.object({
  path: z.string().trim().min(1).max(300),
  content: z.string().max(MAX_CONTEXT_FILE_BYTES).optional(),
  sha256: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/, "sha256 must be a 64-character hex digest")
    .optional(),
});

export const skillLevelInputSchema = z.union([
  z.enum(["L1", "L2", "L3", "1", "2", "3"]),
  z.number().int().min(1).max(3),
]);

export function normalizeSkillLevel(input: z.infer<typeof skillLevelInputSchema>): 1 | 2 | 3 {
  if (typeof input === "number") {
    return input as 1 | 2 | 3;
  }
  const normalized = input.trim().toUpperCase();
  if (normalized === "L1" || normalized === "1") return 1;
  if (normalized === "L2" || normalized === "2") return 2;
  if (normalized === "L3" || normalized === "3") return 3;
  throw new McpSecurityError("INVALID_SKILL_LEVEL", `Unsupported minimumSkillLevel: ${String(input)}`, 400);
}

export const createTaskInputRawShape = {
  title: z
    .string()
    .trim()
    .min(5, "title must be at least 5 characters")
    .max(200, "title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .min(20, "description must be at least 20 characters")
    .max(8000, "description must be at most 8000 characters"),
  category: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .default("code_verification"),
  requiredSkills: z
    .array(z.string().trim().min(1).max(60))
    .min(1, "At least 1 requiredSkill must be specified")
    .max(10, "At most 10 requiredSkills may be specified"),
  minimumSkillLevel: skillLevelInputSchema,
  acceptanceCriteria: z.union([
    z
      .array(z.string().trim().min(3).max(1000))
      .min(1, "Provide at least 1 acceptance criterion")
      .max(20),
    z.string().trim().min(10, "acceptanceCriteria must be at least 10 characters").max(4000),
  ]),
  contextFiles: z.array(contextFileSchema).max(MAX_CONTEXT_FILES).optional().default([]),
  expectedOutputType: z
    .enum(["patch", "files", "structured_analysis", "verification_verdict"])
    .default("patch"),
  urgency: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  deadlineMinutes: z
    .number()
    .int()
    .min(5, "deadlineMinutes must be at least 5 minutes")
    .max(10080, "deadlineMinutes must not exceed 10080 minutes (7 days)")
    .default(60),
  budgetMax: z
    .number()
    .int()
    .min(1, "budgetMax must be a positive integer in USD minor units (cents)"),
  idempotencyKey: z
    .string()
    .trim()
    .min(8, "idempotencyKey must be at least 8 characters")
    .max(120, "idempotencyKey must be at most 120 characters"),
};

export const createTaskInputSchema = z.object(createTaskInputRawShape);
export type CreateTaskToolInput = z.infer<typeof createTaskInputSchema>;

export const getTaskStatusInputRawShape = {
  taskId: z.string().trim().min(3, "taskId is required").max(120),
};
export const getTaskStatusInputSchema = z.object(getTaskStatusInputRawShape);
export type GetTaskStatusToolInput = z.infer<typeof getTaskStatusInputSchema>;

export const getVerifiedResultInputRawShape = {
  taskId: z.string().trim().min(3, "taskId is required").max(120),
};
export const getVerifiedResultInputSchema = z.object(getVerifiedResultInputRawShape);
export type GetVerifiedResultToolInput = z.infer<typeof getVerifiedResultInputSchema>;

export const cancelTaskInputRawShape = {
  taskId: z.string().trim().min(3, "taskId is required").max(120),
  reason: z
    .string()
    .trim()
    .min(5, "Cancellation reason must be at least 5 characters")
    .max(1000, "Cancellation reason must be at most 1000 characters"),
};
export const cancelTaskInputSchema = z.object(cancelTaskInputRawShape);
export type CancelTaskToolInput = z.infer<typeof cancelTaskInputSchema>;

/**
 * Performs comprehensive security, size, path, and secret validation on a `trusttopay_create_task` payload.
 */
export function validateAndSanitizeCreateTaskInput(rawInput: unknown): CreateTaskToolInput & {
  normalizedSkillLevel: 1 | 2 | 3;
  formattedAcceptanceCriteria: string;
} {
  const parsed = createTaskInputSchema.parse(rawInput);
  const normalizedSkillLevel = normalizeSkillLevel(parsed.minimumSkillLevel);

  const formattedAcceptanceCriteria = Array.isArray(parsed.acceptanceCriteria)
    ? parsed.acceptanceCriteria.map((item, idx) => `${idx + 1}. ${item.trim()}`).join("\n")
    : parsed.acceptanceCriteria.trim();

  if (formattedAcceptanceCriteria.length < 20) {
    throw new McpSecurityError(
      "INVALID_ACCEPTANCE_CRITERIA",
      "acceptanceCriteria must total at least 20 characters.",
      400,
    );
  }

  // Scan all text fields for accidental secret leakage
  const findings: SecretScanFinding[] = [
    ...scanTextForSecrets(parsed.title, "title"),
    ...scanTextForSecrets(parsed.description, "description"),
    ...scanTextForSecrets(formattedAcceptanceCriteria, "acceptanceCriteria"),
  ];

  let totalBytes =
    Buffer.byteLength(parsed.title, "utf8") +
    Buffer.byteLength(parsed.description, "utf8") +
    Buffer.byteLength(formattedAcceptanceCriteria, "utf8");

  const sanitizedFiles = (parsed.contextFiles ?? []).map((file, idx) => {
    const safePath = validateSafeRelativeFilePath(file.path);
    if (file.content) {
      const contentBytes = Buffer.byteLength(file.content, "utf8");
      if (contentBytes > MAX_CONTEXT_FILE_BYTES) {
        throw new McpSecurityError(
          "CONTEXT_FILE_TOO_LARGE",
          `Context file '${safePath}' exceeds maximum allowed size (${MAX_CONTEXT_FILE_BYTES} bytes).`,
          400,
        );
      }
      totalBytes += contentBytes;
      findings.push(...scanTextForSecrets(file.content, `contextFiles[${idx}].content (${safePath})`));
    }
    return {
      ...file,
      path: safePath,
    };
  });

  if (totalBytes > MAX_TOTAL_PAYLOAD_BYTES) {
    throw new McpSecurityError(
      "PAYLOAD_TOO_LARGE",
      `Total task payload size (${totalBytes} bytes) exceeds maximum limit (${MAX_TOTAL_PAYLOAD_BYTES} bytes).`,
      400,
    );
  }

  if (findings.length > 0) {
    const details = findings.map((f) => `${f.label} in ${f.field}`).join("; ");
    throw new McpSecurityError(
      "SECRET_DETECTED_IN_TASK_PAYLOAD",
      `Task creation blocked: unredacted secret or credential detected (${details}). Redact all secrets before calling trusttopay_create_task.`,
      400,
    );
  }

  return {
    ...parsed,
    contextFiles: sanitizedFiles,
    normalizedSkillLevel,
    formattedAcceptanceCriteria,
  };
}
