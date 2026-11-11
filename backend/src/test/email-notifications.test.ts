import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db.js";
import { config } from "../config.js";
import {
  escapeHtml,
  renderTaskOfferEmail,
  sendEmail,
  sendTaskOfferEmail,
  setEmailTransportOverride,
  type EmailPayload,
} from "../services/notifications/email.js";
import { seedVerifiedSkillLevel } from "../services/skills/assessmentEngine.js";
import { dispatchTopOffers } from "../services/matching/offerDispatcher.js";
import { createUser, resetDatabase } from "./helpers.js";

describe("Phase 3 — Outbound Reviewer Email Notifications (Resend Adapter)", () => {
  beforeEach(async () => {
    await resetDatabase();
    setEmailTransportOverride(null);
  });

  afterEach(() => {
    setEmailTransportOverride(null);
  });

  describe("1. Template Rendering & Security Sanitization", () => {
    it("sanitizes dangerous HTML characters to prevent template injection", () => {
      const dangerous = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
      const safe = escapeHtml(dangerous);
      expect(safe).not.toContain("<script>");
      expect(safe).toContain("&lt;script&gt;");
      expect(safe).toContain("&amp;");
      expect(safe).toContain("&quot;");
      expect(safe).toContain("&#039;");
    });

    it("renders warm ivory/cream branded HTML and plain-text fallback", () => {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const { html, text } = renderTaskOfferEmail({
        specialistName: "Alice Specialist",
        taskTitle: "Audit Auth Token Rotation & Signatures",
        taskId: "task-test-123",
        rank: 1,
        score: 95,
        expiresAt,
        rewardFormatted: "$250.00 USD",
      });

      // Assert HTML formatting and design system tokens
      expect(html).toContain("Trust<span style=\"color: #365FEA;\">To</span>Pay");
      expect(html).toContain("Alice Specialist");
      expect(html).toContain("Audit Auth Token Rotation &amp; Signatures");
      expect(html).toContain("Top Match · Rank #1");
      expect(html).toContain("$250.00 USD");
      expect(html).toContain("95/100");
      expect(html).toContain("/app/tasks/task-test-123");
      expect(html).toContain("#F7F5EF"); // Warm ivory background
      expect(html).toContain("#365FEA"); // Brand cobalt

      // Assert plain text fallback
      expect(text).toContain("TrustToPay — New Specialist Review Offer");
      expect(text).toContain("Hello Alice Specialist");
      expect(text).toContain("ranked #1 (Match Score: 95)");
      expect(text).toContain("/app/tasks/task-test-123");
    });
  });

  describe("2. Transport Adapter & Idempotency", () => {
    it("simulates email delivery cleanly when RESEND_API_KEY is not configured", async () => {
      const prevKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      try {
        const result = await sendEmail({
          to: "specialist@example.com",
          subject: "Test Offer",
          html: "<p>Hello</p>",
        });

        expect(result.success).toBe(true);
        expect(result.simulated).toBe(true);
        expect(result.id).toMatch(/^sim_/);
      } finally {
        if (prevKey !== undefined) process.env.RESEND_API_KEY = prevKey;
      }
    });

    it("invokes transport override and returns delivery confirmation", async () => {
      const dispatched: EmailPayload[] = [];
      setEmailTransportOverride(async (payload) => {
        dispatched.push(payload);
        return { success: true, id: "msg_resend_mock_123" };
      });

      const result = await sendEmail({
        to: "specialist@example.com",
        subject: "Review Offer",
        html: "<p>Offer Details</p>",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("msg_resend_mock_123");
      expect(dispatched).toHaveLength(1);
      expect(dispatched[0].to).toBe("specialist@example.com");
      expect(dispatched[0].subject).toBe("Review Offer");
    });

    it("enforces idempotency and suppresses duplicate sends for the same key", async () => {
      let callCount = 0;
      setEmailTransportOverride(async () => {
        callCount++;
        return { success: true, id: `msg_${callCount}` };
      });

      const payload: EmailPayload = {
        to: "duplicate-check@example.com",
        subject: "Idempotency Test",
        html: "<p>Content</p>",
        idempotencyKey: "unique-offer-key-999",
      };

      const firstSend = await sendEmail(payload);
      expect(firstSend.success).toBe(true);
      expect(firstSend.duplicateSuppressed).toBeUndefined();
      expect(callCount).toBe(1);

      // Repeat with same idempotency key
      const secondSend = await sendEmail(payload);
      expect(secondSend.success).toBe(true);
      expect(secondSend.duplicateSuppressed).toBe(true);
      expect(callCount).toBe(1); // Network transport was not called a second time
    });

    it("isolates failure when transport throws, without crashing or bubbling exceptions", async () => {
      setEmailTransportOverride(async () => {
        throw new Error("Resend 500 Internal Server Error: Gateway timeout");
      });

      const result = await sendTaskOfferEmail({
        specialistEmail: "resilience-test@example.com",
        specialistName: "Bob",
        taskTitle: "Resilience Task",
        taskId: "task-resilience",
        rank: 1,
        score: 88,
        expiresAt: new Date(),
      });

      // Failure must be caught and reported gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain("Resend 500");
    });
  });

  describe("3. End-to-End Offer Dispatch Integration", () => {
    it("dispatches outbound email alerts alongside in-app notifications when offers are generated", async () => {
      // 1. Setup mock email transport listener
      const dispatchedEmails: EmailPayload[] = [];
      setEmailTransportOverride(async (payload) => {
        dispatchedEmails.push(payload);
        return { success: true, id: `mock_${dispatchedEmails.length}` };
      });

      // 2. Create requester, session and task
      const requester = await createUser("REQUESTER", { email: "requester-email@test.dev" });
      const session = await prisma.agentSession.create({
        data: {
          userId: requester.id,
          title: "Verify Rust Microservice Concurrency",
          question: "Is the Tokio actor implementation free of channel deadlocks?",
        },
      });
      const task = await prisma.reviewTask.create({
        data: {
          sessionId: session.id,
          requesterId: requester.id,
          title: "Verify Rust Microservice Concurrency",
          question: "Is the Tokio actor implementation free of channel deadlocks?",
          acceptanceCriteria: "Verify all Tokio actor patterns and ensure no channel deadlocks.",
          category: "SYSTEMS",
          status: "FUNDED",
          rewardMinor: 15000,
          currency: "USD",
          requiredSkillId: "rust",
          minimumSkillLevel: 2,
          reward: {
            create: {
              amountMinor: 15000,
              currency: "USD",
              status: "FUNDED",
            },
          },
        },
      });

      // 3. Create two verified Rust specialists
      const specialist1 = await createUser("REVIEWER", {
        name: "Rust Lead Alice",
        email: "alice.rust@specialist.dev",
      });
      await seedVerifiedSkillLevel(prisma, {
        userId: specialist1.id,
        skillSlug: "rust",
        targetLevel: 2,
        score: 95,
      });

      const specialist2 = await createUser("REVIEWER", {
        name: "Rust Senior Bob",
        email: "bob.rust@specialist.dev",
      });
      await seedVerifiedSkillLevel(prisma, {
        userId: specialist2.id,
        skillSlug: "rust",
        targetLevel: 3,
        score: 100,
      });

      // 4. Dispatch offers
      const dispatchResult = await dispatchTopOffers(prisma, task.id);
      expect(dispatchResult.offers).toHaveLength(2);

      // Allow background microtask / promise resolution
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 5. Verify outbound emails were dispatched
      expect(dispatchedEmails.length).toBe(2);

      const recipientEmails = dispatchedEmails.map((e) => (Array.isArray(e.to) ? e.to[0] : e.to));
      expect(recipientEmails).toContain("alice.rust@specialist.dev");
      expect(recipientEmails).toContain("bob.rust@specialist.dev");

      const aliceEmail = dispatchedEmails.find((e) =>
        Array.isArray(e.to) ? e.to.includes("alice.rust@specialist.dev") : e.to === "alice.rust@specialist.dev",
      );
      expect(aliceEmail).toBeDefined();
      expect(aliceEmail?.subject).toContain("Verify Rust Microservice Concurrency");
      expect(aliceEmail?.html).toContain("$150.00 USD");
      expect(aliceEmail?.html).toContain(`/app/tasks/${task.id}`);

      // 6. Verify in-app notifications were simultaneously recorded in Prisma
      const inAppNotifications = await prisma.notification.findMany({
        where: {
          userId: { in: [specialist1.id, specialist2.id] },
        },
      });
      expect(inAppNotifications).toHaveLength(2);
      expect(inAppNotifications[0].title).toBe("New specialist review offer");
      expect(inAppNotifications[0].link).toBe(`/app/tasks/${task.id}`);
    });

    it("sanitizes quoted RESEND_API_KEY and keeps offer dispatch resilient if email fails with HTTP 401/403", async () => {
      const prevKey = process.env.RESEND_API_KEY;
      const prevFrom = process.env.RESEND_FROM_EMAIL;
      process.env.RESEND_API_KEY = '  "re_test_sanitized_key_123456" \n';
      delete process.env.RESEND_FROM_EMAIL;

      try {
        expect(config.resendApiKey).toBe("re_test_sanitized_key_123456");
        expect(config.resendFromEmail).toBe("TrustToPay <onboarding@resend.dev>");

        setEmailTransportOverride(async () => ({
          success: false,
          error: "Resend HTTP 403: Domain not verified; use onboarding@resend.dev or verify domain",
        }));

        const requester = await createUser("REQUESTER", { email: "req-resilient@test.dev" });
        const session = await prisma.agentSession.create({
          data: {
            userId: requester.id,
            title: "Resilient Email Offer Dispatch",
            question: "Should task offers succeed when email provider returns 403?",
          },
        });
        const task = await prisma.reviewTask.create({
          data: {
            sessionId: session.id,
            requesterId: requester.id,
            title: "Resilient Email Offer Dispatch",
            question: "Should task offers succeed when email provider returns 403?",
            acceptanceCriteria: "Keep offer dispatch and in-app notifications operational.",
            category: "SYSTEMS",
            status: "FUNDED",
            rewardMinor: 5000,
            currency: "USD",
            requiredSkillId: "rust",
            minimumSkillLevel: 1,
            reward: {
              create: {
                amountMinor: 5000,
                currency: "USD",
                status: "FUNDED",
              },
            },
          },
        });

        const specialist = await createUser("REVIEWER", {
          name: "Specialist Charlie",
          email: "charlie@specialist.dev",
        });
        await seedVerifiedSkillLevel(prisma, {
          userId: specialist.id,
          skillSlug: "rust",
          targetLevel: 2,
          score: 90,
        });

        const dispatchResult = await dispatchTopOffers(prisma, task.id);
        expect(dispatchResult.offers).toHaveLength(1);

        const inApp = await prisma.notification.findMany({ where: { userId: specialist.id } });
        expect(inApp).toHaveLength(1);
      } finally {
        if (prevKey === undefined) delete process.env.RESEND_API_KEY;
        else process.env.RESEND_API_KEY = prevKey;
        if (prevFrom === undefined) delete process.env.RESEND_FROM_EMAIL;
        else process.env.RESEND_FROM_EMAIL = prevFrom;
      }
    });
  });
});
