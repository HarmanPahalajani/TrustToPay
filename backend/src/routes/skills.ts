import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../auth/middleware.js";
import { asyncHandler, AppError } from "../lib/errors.js";
import { audit } from "../lib/audit.js";
import {
  listSkillsForUser,
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from "../services/skills/assessmentEngine.js";
import { SKILL_CATEGORIES, SKILL_TAXONOMY } from "../services/skills/taxonomy.js";
import { syncSpecialistToElasticIndex } from "../services/elastic/specialistIndexService.js";

const router = Router();

const selectSkillsBodySchema = z.object({
  skillSlugs: z.array(z.string().trim().min(1).max(80)).max(50),
});

const startBodySchema = z.object({
  skillId: z.string().trim().min(1).max(80).optional(),
  level: z.coerce.number().int().min(1).max(3).optional(),
});

const submitBodySchema = z.object({
  attemptId: z.string().trim().min(1).max(80).optional(),
  answers: z.record(z.string(), z.string()).default({}),
});

router.get(
  "/taxonomy",
  asyncHandler(async (_req, res) => {
    res.json({
      categories: SKILL_CATEGORIES,
      taxonomy: SKILL_TAXONOMY,
    });
  }),
);

router.get(
  "/selected",
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.id },
      select: { selectedSkillsJson: true },
    });
    let selectedSkills: string[] = [];
    if (profile?.selectedSkillsJson) {
      try {
        const parsed = JSON.parse(profile.selectedSkillsJson);
        if (Array.isArray(parsed)) {
          selectedSkills = parsed.filter((s): s is string => typeof s === "string");
        }
      } catch {
        selectedSkills = [];
      }
    }
    res.json({ selectedSkills });
  }),
);

router.post(
  "/selected",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = selectSkillsBodySchema.parse(req.body ?? {});
    const validSlugsSet = new Set(SKILL_TAXONOMY.map((item) => item.slug));
    const normalizedSlugs = Array.from(
      new Set(body.skillSlugs.filter((s) => validSlugsSet.has(s))),
    );

    const jsonValue = JSON.stringify(normalizedSlugs);

    await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        selectedSkillsJson: jsonValue,
      },
      update: {
        selectedSkillsJson: jsonValue,
      },
    });

    await audit(prisma, req, {
      actorId: req.user!.id,
      action: "REVIEWER_SKILLS_SELECTED",
      entityType: "UserProfile",
      entityId: req.user!.id,
      metadata: {
        selectedSkills: normalizedSlugs,
        count: normalizedSlugs.length,
      },
    });

    res.json({
      success: true,
      selectedSkills: normalizedSlugs,
    });
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const skills = await listSkillsForUser(prisma, req.user?.id ?? null);
    res.json({ skills });
  }),
);

router.post(
  "/assessments/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = startBodySchema.parse(req.body ?? {});
    if (!body.skillId || !body.level) {
      throw new AppError(400, "VALIDATION_ERROR", "Both skillId and level (1, 2, or 3) are required.");
    }

    const result = await prisma.$transaction((db) =>
      startAssessmentAttempt(db, {
        userId: req.user!.id,
        skillIdOrSlug: body.skillId!,
        level: body.level!,
      }),
    );

    await audit(prisma, req, {
      actorId: req.user!.id,
      action: "SKILL_ASSESSMENT_STARTED",
      entityType: "SkillAssessmentAttempt",
      entityId: result.attempt.id,
      metadata: {
        skillId: result.attempt.skillId,
        skillName: result.attempt.skillName,
        level: result.attempt.level,
      },
    });

    res.status(201).json(result);
  }),
);

router.post(
  "/:skillId/assessments/:level/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const skillId = String(req.params.skillId ?? "").trim();
    const level = Number(req.params.level);
    if (!skillId || !Number.isInteger(level)) {
      throw new AppError(400, "VALIDATION_ERROR", "Valid skillId and level (1, 2, or 3) are required.");
    }

    const result = await prisma.$transaction((db) =>
      startAssessmentAttempt(db, {
        userId: req.user!.id,
        skillIdOrSlug: skillId,
        level,
      }),
    );

    await audit(prisma, req, {
      actorId: req.user!.id,
      action: "SKILL_ASSESSMENT_STARTED",
      entityType: "SkillAssessmentAttempt",
      entityId: result.attempt.id,
      metadata: {
        skillId: result.attempt.skillId,
        skillName: result.attempt.skillName,
        level: result.attempt.level,
      },
    });

    res.status(201).json(result);
  }),
);

router.post(
  "/attempts/:attemptId/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const attemptId = String(req.params.attemptId ?? "").trim();
    const body = submitBodySchema.parse(req.body ?? {});

    const result = await prisma.$transaction((db) =>
      submitAssessmentAttempt(db, {
        userId: req.user!.id,
        attemptId,
        answers: body.answers,
      }),
    );

    if (result.attempt.passed) {
      await syncSpecialistToElasticIndex(prisma, req.user!.id);
    }

    await audit(prisma, req, {
      actorId: req.user!.id,
      action: result.attempt.passed ? "SKILL_ASSESSMENT_PASSED" : "SKILL_ASSESSMENT_FAILED",
      entityType: "SkillAssessmentAttempt",
      entityId: result.attempt.id,
      metadata: {
        skillId: result.attempt.skillId,
        skillName: result.attempt.skillName,
        level: result.attempt.level,
        score: result.attempt.score,
        passed: result.attempt.passed,
        verifiedLevel: result.attempt.verifiedLevel,
      },
    });

    res.json(result);
  }),
);

router.post(
  "/:skillId/assessments/:level/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const skillId = String(req.params.skillId ?? "").trim();
    const level = Number(req.params.level);
    const body = submitBodySchema.parse(req.body ?? {});

    const result = await prisma.$transaction(async (db) => {
      let attemptId = body.attemptId;
      if (!attemptId) {
        const started = await startAssessmentAttempt(db, {
          userId: req.user!.id,
          skillIdOrSlug: skillId,
          level,
        });
        attemptId = started.attempt.id;
      }
      return submitAssessmentAttempt(db, {
        userId: req.user!.id,
        attemptId,
        answers: body.answers,
      });
    });

    if (result.attempt.passed) {
      await syncSpecialistToElasticIndex(prisma, req.user!.id);
    }

    await audit(prisma, req, {
      actorId: req.user!.id,
      action: result.attempt.passed ? "SKILL_ASSESSMENT_PASSED" : "SKILL_ASSESSMENT_FAILED",
      entityType: "SkillAssessmentAttempt",
      entityId: result.attempt.id,
      metadata: {
        skillId: result.attempt.skillId,
        skillName: result.attempt.skillName,
        level: result.attempt.level,
        score: result.attempt.score,
        passed: result.attempt.passed,
        verifiedLevel: result.attempt.verifiedLevel,
      },
    });

    res.json(result);
  }),
);

const proctoringEventSchema = z.object({
  type: z.enum([
    "CAMERA_PAUSED",
    "CAMERA_RESUMED",
    "SCREEN_PAUSED",
    "SCREEN_RESUMED",
    "TAB_BLUR",
    "TAB_FOCUS",
    "FULLSCREEN_EXIT",
  ]),
  timestamp: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

router.post(
  "/attempts/:attemptId/proctoring",
  requireAuth,
  asyncHandler(async (req, res) => {
    const attemptId = String(req.params.attemptId ?? "").trim();
    const event = proctoringEventSchema.parse(req.body ?? {});

    const attempt = await prisma.skillAssessmentAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt || attempt.userId !== req.user!.id) {
      throw new AppError(404, "NOT_FOUND", "Attempt not found.");
    }

    let events: unknown[] = [];
    try {
      events = JSON.parse(attempt.proctoringEventsJson);
      if (!Array.isArray(events)) events = [];
    } catch {
      events = [];
    }

    events.push({
      ...event,
      serverTime: new Date().toISOString(),
    });

    await prisma.skillAssessmentAttempt.update({
      where: { id: attemptId },
      data: {
        proctoringEventsJson: JSON.stringify(events),
      },
    });

    res.json({ success: true, count: events.length });
  }),
);

export default router;
