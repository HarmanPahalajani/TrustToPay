import crypto from "node:crypto";
import { config } from "../../config.js";

export type EmailRecipient = {
  email: string;
  name?: string;
};

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
  duplicateSuppressed?: boolean;
};

// In-memory idempotency deduplication cache (holds keys for 1 hour)
const processedIdempotencyKeys = new Map<string, { timestamp: number; result: SendEmailResult }>();
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000;

function cleanExpiredIdempotencyKeys(now = Date.now()): void {
  for (const [key, entry] of processedIdempotencyKeys.entries()) {
    if (now - entry.timestamp > IDEMPOTENCY_TTL_MS) {
      processedIdempotencyKeys.delete(key);
    }
  }
}

// Transport override for unit tests
type TransportFn = (payload: EmailPayload) => Promise<SendEmailResult>;
let transportOverride: TransportFn | null = null;

export function setEmailTransportOverride(fn: TransportFn | null): void {
  transportOverride = fn;
}

/**
 * Escapes unsafe HTML characters to prevent template injection in emails.
 */
export function escapeHtml(unsafe: string): string {
  return String(unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates an accessible, responsive HTML email matching the TrustToPay ivory/cream design system.
 */
export function renderTaskOfferEmail(args: {
  specialistName: string;
  taskTitle: string;
  taskId: string;
  rank: number;
  score: number;
  expiresAt: Date;
  rewardFormatted?: string;
  frontendUrl?: string;
}): { html: string; text: string } {
  const baseUrl = (args.frontendUrl ?? config.frontendUrl).replace(/\/$/, "");
  const taskUrl = `${baseUrl}/app/tasks/${encodeURIComponent(args.taskId)}`;
  const safeName = escapeHtml(args.specialistName || "Specialist");
  const safeTitle = escapeHtml(args.taskTitle);
  const safeReward = escapeHtml(args.rewardFormatted || "$100.00 USD");
  const expiresIso = args.expiresAt.toISOString();

  const text = `
TrustToPay — New Specialist Review Offer

Hello ${args.specialistName || "Specialist"},

You have been ranked #${args.rank} (Match Score: ${args.score}) for a new verification task:

Task: "${args.taskTitle}"
Reward: ${args.rewardFormatted || "$100.00 USD"}
Expires: ${expiresIso}

View and accept the offer here:
${taskUrl}

This offer was dispatched because your verified technical skills match the requirements of this task.
TrustToPay · Decentralized Human-in-the-Loop Agent Verification
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Specialist Review Offer</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202722;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F5EF; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFEFA; border: 1px solid #E5E1D7; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #E5E1D7; background-color: #FFFEFA;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-weight: 800; font-size: 18px; letter-spacing: -0.02em; color: #202722;">Trust<span style="color: #365FEA;">To</span>Pay</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #EBF0FF; border: 1px solid #C7D7FE; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #365FEA; text-transform: uppercase; letter-spacing: 0.05em;">
                      Top Match · Rank #${args.rank}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; line-height: 1.3; color: #202722;">
                New verification offer for you
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #69736D;">
                Hello <strong>${safeName}</strong>, your verified technical assessment credentials match the requirements for an incoming autonomous agent escalation.
              </p>

              <!-- Task Card -->
              <table role="presentation" width="100%" style="margin-bottom: 24px; background-color: #F7F5EF; border: 1px solid #E5E1D7; border-radius: 8px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #69736D; margin-bottom: 4px;">Review Task</div>
                    <div style="font-size: 15px; font-weight: 700; color: #202722; margin-bottom: 12px;">${safeTitle}</div>
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #69736D;">
                          Reward: <strong style="color: #438866;">${safeReward}</strong>
                        </td>
                        <td align="right" style="font-size: 13px; color: #69736D;">
                          Match Score: <strong style="color: #202722;">${args.score}/100</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${taskUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background-color: #365FEA; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
                      Review & Accept Offer &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8F9992; text-align: center;">
                This parallel offer expires automatically at <code style="font-family: monospace; font-size: 11px; background-color: #F0EEE7; padding: 2px 4px; border-radius: 4px;">${expiresIso}</code>. Offers are accepted on a first-response basis.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F0EEE7; border-top: 1px solid #E5E1D7; text-align: center; font-size: 11px; color: #69736D;">
              TrustToPay &middot; Verified Specialist Matching Network<br>
              Decentralized Human-in-the-Loop Safeguards for Autonomous Systems
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { html, text };
}

/**
 * Dispatches an outbound email via Resend API with non-blocking failure isolation.
 * If RESEND_API_KEY is not configured or in test mode, safely simulates delivery.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  cleanExpiredIdempotencyKeys();

  // Check idempotency key to prevent accidental duplicate dispatch
  if (payload.idempotencyKey) {
    const existing = processedIdempotencyKeys.get(payload.idempotencyKey);
    if (existing) {
      return {
        ...existing.result,
        duplicateSuppressed: true,
      };
    }
  }

  // Use test override if registered
  if (transportOverride) {
    try {
      const res = await transportOverride(payload);
      if (payload.idempotencyKey) {
        processedIdempotencyKeys.set(payload.idempotencyKey, { timestamp: Date.now(), result: res });
      }
      return res;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[notifications/email] Transport override error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  // Simulated delivery mode if Resend is not configured or in dev/test without key
  if (!config.resendConfigured) {
    const simulatedId = `sim_${crypto.randomUUID()}`;
    const recipients = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to;
    if (config.isTest) {
      // Quiet in tests
    } else {
      console.info(
        `[notifications/email] RESEND_API_KEY not configured; simulated email to <${recipients}>: "${payload.subject}" (ID: ${simulatedId})`,
      );
    }
    const result: SendEmailResult = {
      success: true,
      simulated: true,
      id: simulatedId,
    };
    if (payload.idempotencyKey) {
      processedIdempotencyKeys.set(payload.idempotencyKey, { timestamp: Date.now(), result });
    }
    return result;
  }

  // Real outbound HTTP dispatch to Resend API
  try {
    const toList = Array.isArray(payload.to) ? payload.to : [payload.to];
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.resendApiKey}`,
      },
      body: JSON.stringify({
        from: config.resendFromEmail,
        to: toList,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        tags: payload.tags,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[notifications/email] Resend API error (${res.status}): ${errText}`);
      return {
        success: false,
        error: `Resend HTTP ${res.status}: ${errText}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    const result: SendEmailResult = {
      success: true,
      id: data.id ?? `res_${crypto.randomUUID()}`,
      simulated: false,
    };

    if (payload.idempotencyKey) {
      processedIdempotencyKeys.set(payload.idempotencyKey, { timestamp: Date.now(), result });
    }

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[notifications/email] Network exception sending email: ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * High-level helper for dispatching a task offer notification to a specialist.
 * Completely non-blocking and failure-isolated; errors are logged but never thrown.
 */
export async function sendTaskOfferEmail(args: {
  specialistEmail: string;
  specialistName: string;
  taskTitle: string;
  taskId: string;
  rank: number;
  score: number;
  expiresAt: Date;
  rewardFormatted?: string;
  frontendUrl?: string;
}): Promise<SendEmailResult> {
  const { html, text } = renderTaskOfferEmail(args);
  const idempotencyKey = `task-offer-${args.taskId}-${args.specialistEmail}-${args.rank}`;

  try {
    return await sendEmail({
      to: args.specialistEmail,
      subject: `[TrustToPay] Review offer for "${args.taskTitle}" (Rank #${args.rank})`,
      html,
      text,
      idempotencyKey,
      tags: [
        { name: "category", value: "task_offer" },
        { name: "taskId", value: args.taskId },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[notifications/email] Non-blocking sendTaskOfferEmail caught error: ${msg}`);
    return { success: false, error: msg };
  }
}
