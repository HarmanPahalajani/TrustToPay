import { DEMO_QUESTION_BANKS } from "./questionBanks.js";
import { SKILL_TAXONOMY } from "./taxonomy.js";
import crypto from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { parseJson } from "../../lib/json.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type SkillLevelNumber = 1 | 2 | 3;

export const SKILL_LEVEL_NAMES: Record<SkillLevelNumber, string> = {
  1: "Foundation",
  2: "Practitioner",
  3: "Advanced",
};

export function isValidSkillLevel(level: number): level is SkillLevelNumber {
  return level === 1 || level === 2 || level === 3;
}

export function getSkillLevelName(level: number): string {
  if (level <= 1) return SKILL_LEVEL_NAMES[1];
  if (level === 2) return SKILL_LEVEL_NAMES[2];
  return SKILL_LEVEL_NAMES[3];
}

export type AssessmentQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "CODE_TASK";
  prompt: string;
  starterCode?: string;
  options?: { id: string; text: string }[];
  weight: number;
  // Internal grading keys (stripped before sending questions to client)
  correctOptionId?: string;
  requiredSnippets?: string[];
  forbiddenSnippets?: string[];
  explanation: string;
};

export type PublicAssessmentQuestion = Omit<
  AssessmentQuestion,
  "correctOptionId" | "requiredSnippets" | "forbiddenSnippets" | "explanation"
>;

export type SeedStageDefinition = {
  level: SkillLevelNumber;
  title: string;
  description: string;
  passingScore: number;
  cooldownMinutes: number;
  maxAttemptsPerDay: number;
  questions: AssessmentQuestion[];
};

export type SeedSkillDefinition = {
  slug: string;
  name: string;
  category: string;
  description: string;
  version: string;
  stages: SeedStageDefinition[];
};

const assessedBySlug = new Map(DEMO_QUESTION_BANKS.map((d) => [d.slug, d]));

export const DEFAULT_SKILLS_CATALOG: SeedSkillDefinition[] = SKILL_TAXONOMY.map((item) => {
  const assessed = assessedBySlug.get(item.slug);
  if (assessed) {
    return assessed;
  }
  return {
    slug: item.slug,
    name: item.name,
    category: item.categoryId.toUpperCase().replace(/-/g, "_"),
    description: item.description,
    version: "1.0.0",
    stages: [],
  };
});

export function shuffleOptions(options?: { id: string; text: string }[]): { id: string; text: string }[] | undefined {
  if (!options || options.length <= 1) return options;
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

export function stripQuestionSecrets(questions: AssessmentQuestion[]): PublicAssessmentQuestion[] {
  return questions.map(({ correctOptionId: _c, requiredSnippets: _r, forbiddenSnippets: _f, explanation: _e, ...pub }) => pub);
}

export async function ensureDefaultSkillsSeeded(db: DbClient): Promise<void> {
  const existingCount = await db.skill.count();
  if (existingCount >= DEFAULT_SKILLS_CATALOG.length) {
    return;
  }

  for (const def of DEFAULT_SKILLS_CATALOG) {
    const skill = await db.skill.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        category: def.category,
        description: def.description,
        version: def.version,
        isActive: true,
      },
      create: {
        slug: def.slug,
        name: def.name,
        category: def.category,
        description: def.description,
        version: def.version,
        isActive: true,
      },
    });

    for (const stage of def.stages) {
      await db.assessmentStage.upsert({
        where: {
          skillId_level: {
            skillId: skill.id,
            level: stage.level,
          },
        },
        update: {
          title: stage.title,
          description: stage.description,
          version: def.version,
          passingScore: stage.passingScore,
          cooldownMinutes: stage.cooldownMinutes,
          maxAttemptsPerDay: stage.maxAttemptsPerDay,
          questionsJson: JSON.stringify(stage.questions),
        },
        create: {
          skillId: skill.id,
          level: stage.level,
          title: stage.title,
          description: stage.description,
          version: def.version,
          passingScore: stage.passingScore,
          cooldownMinutes: stage.cooldownMinutes,
          maxAttemptsPerDay: stage.maxAttemptsPerDay,
          questionsJson: JSON.stringify(stage.questions),
        },
      });
    }
  }
}

async function resolveSkill(db: DbClient, skillIdOrSlug: string) {
  await ensureDefaultSkillsSeeded(db);
  const skill = await db.skill.findFirst({
    where: {
      OR: [{ id: skillIdOrSlug }, { slug: skillIdOrSlug }, { name: skillIdOrSlug }],
      isActive: true,
    },
    include: {
      stages: { orderBy: { level: "asc" } },
    },
  });
  if (!skill) {
    throw new AppError(404, "SKILL_NOT_FOUND", `Skill '${skillIdOrSlug}' was not found.`);
  }
  return skill;
}

export async function listSkillsForUser(db: DbClient, userId?: string | null, now = new Date()) {
  await ensureDefaultSkillsSeeded(db);

  const skills = await db.skill.findMany({
    where: { isActive: true },
    include: {
      stages: { orderBy: { level: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const userLevels = userId
    ? await db.userSkillLevel.findMany({
        where: { userId },
      })
    : [];

  const recentAttempts = userId
    ? await db.skillAssessmentAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
      })
    : [];

  const levelBySkillId = new Map(userLevels.map((ul) => [ul.skillId, ul]));

  return skills.map((skill) => {
    const userLevelRecord = levelBySkillId.get(skill.id) ?? null;
    const currentLevel = userLevelRecord?.level ?? 0;

    const stages = skill.stages.map((stage) => {
      const questions = parseJson<AssessmentQuestion[]>(stage.questionsJson, []);
      const stageAttempts = recentAttempts.filter((a) => a.stageId === stage.id);
      const latestAttempt = stageAttempts[0] ?? null;

      const isPassed = currentLevel >= stage.level;
      const isPrerequisiteMet = stage.level === 1 || currentLevel >= stage.level - 1;
      const activeCooldownUntil =
        latestAttempt?.cooldownUntil && latestAttempt.cooldownUntil.getTime() > now.getTime()
          ? latestAttempt.cooldownUntil
          : null;

      let status: "PASSED" | "AVAILABLE" | "COOLDOWN" | "LOCKED" = "LOCKED";
      if (isPassed) {
        status = "PASSED";
      } else if (!isPrerequisiteMet) {
        status = "LOCKED";
      } else if (activeCooldownUntil) {
        status = "COOLDOWN";
      } else {
        status = "AVAILABLE";
      }

      return {
        id: stage.id,
        level: stage.level,
        levelName: getSkillLevelName(stage.level),
        title: stage.title,
        description: stage.description,
        version: stage.version,
        passingScore: stage.passingScore,
        cooldownMinutes: stage.cooldownMinutes,
        questionCount: questions.length,
        status,
        unlocked: isPrerequisiteMet,
        passed: isPassed,
        cooldownUntil: activeCooldownUntil ? activeCooldownUntil.toISOString() : null,
        latestAttempt: latestAttempt
          ? {
              id: latestAttempt.id,
              status: latestAttempt.status,
              score: latestAttempt.score,
              startedAt: latestAttempt.startedAt.toISOString(),
              completedAt: latestAttempt.completedAt ? latestAttempt.completedAt.toISOString() : null,
            }
          : null,
      };
    });

    return {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      category: skill.category,
      description: skill.description,
      version: skill.version,
      verifiedLevel: currentLevel,
      verifiedLevelName: currentLevel > 0 ? getSkillLevelName(currentLevel) : null,
      verifiedAt: userLevelRecord ? userLevelRecord.verifiedAt.toISOString() : null,
      stages,
    };
  });
}

export async function startAssessmentAttempt(
  db: DbClient,
  args: {
    userId: string;
    skillIdOrSlug: string;
    level: number;
    now?: Date;
  },
) {
  const now = args.now ?? new Date();
  if (!isValidSkillLevel(args.level)) {
    throw new AppError(400, "INVALID_SKILL_LEVEL", "Skill assessment level must be 1 (Foundation), 2 (Practitioner), or 3 (Advanced).");
  }

  const skill = await resolveSkill(db, args.skillIdOrSlug);
  const stage = skill.stages.find((s) => s.level === args.level);
  if (!stage) {
    throw new AppError(404, "ASSESSMENT_STAGE_NOT_FOUND", `Level ${args.level} stage not found for ${skill.name}.`);
  }

  // Enforce sequential unlocking: L2 requires L1 passed; L3 requires L2 passed.
  const existingLevel = await db.userSkillLevel.findUnique({
    where: {
      userId_skillId: {
        userId: args.userId,
        skillId: skill.id,
      },
    },
  });

  const currentVerifiedLevel = existingLevel?.level ?? 0;
  if (args.level > 1 && currentVerifiedLevel < args.level - 1) {
    const requiredLevel = args.level - 1;
    throw new AppError(
      403,
      "SEQUENTIAL_LEVEL_LOCKED",
      `Cannot start Level ${args.level} (${getSkillLevelName(args.level)}) for ${skill.name} before passing Level ${requiredLevel} (${getSkillLevelName(requiredLevel)}).`,
      {
        skillId: skill.id,
        skillSlug: skill.slug,
        requestedLevel: args.level,
        requiredLevel,
        currentVerifiedLevel,
      },
    );
  }

  // Check active cooldown on this stage
  const lastFailedAttempt = await db.skillAssessmentAttempt.findFirst({
    where: {
      userId: args.userId,
      skillId: skill.id,
      level: args.level,
      status: "FAILED",
      cooldownUntil: { gt: now },
    },
    orderBy: { completedAt: "desc" },
  });

  if (lastFailedAttempt?.cooldownUntil) {
    throw new AppError(
      429,
      "ASSESSMENT_COOLDOWN_ACTIVE",
      `Assessment retry cooldown is active for ${skill.name} Level ${args.level} until ${lastFailedAttempt.cooldownUntil.toISOString()}.`,
      {
        cooldownUntil: lastFailedAttempt.cooldownUntil.toISOString(),
        attemptId: lastFailedAttempt.id,
      },
    );
  }

  const allQuestions = parseJson<AssessmentQuestion[]>(stage.questionsJson, []);
  if (allQuestions.length === 0) {
    throw new AppError(404, "QUESTIONS_NOT_FOUND", `No assessment questions configured for ${skill.name} Level ${args.level}.`);
  }

  // Prevent immediate repeat from the user's previous attempt if multiple questions exist
  const previousAttempt = await db.skillAssessmentAttempt.findFirst({
    where: {
      userId: args.userId,
      skillId: skill.id,
      level: args.level,
    },
    orderBy: { startedAt: "desc" },
    select: { selectedQuestionId: true },
  });

  let candidates = allQuestions;
  if (previousAttempt?.selectedQuestionId && allQuestions.length > 1) {
    const filtered = allQuestions.filter((q) => q.id !== previousAttempt.selectedQuestionId);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  // Cryptographically secure random selection of exactly ONE question per level
  const selectedIndex = crypto.randomInt(0, candidates.length);
  const chosenQuestion = candidates[selectedIndex];

  // Shuffle multiple-choice options before displaying to prevent spatial memorization
  const questionForClient: AssessmentQuestion = {
    ...chosenQuestion,
    options: shuffleOptions(chosenQuestion.options),
  };

  const attempt = await db.skillAssessmentAttempt.create({
    data: {
      userId: args.userId,
      skillId: skill.id,
      stageId: stage.id,
      level: stage.level,
      version: stage.version,
      status: "IN_PROGRESS",
      selectedQuestionId: chosenQuestion.id,
      startedAt: now,
    },
  });

  return {
    attempt: {
      id: attempt.id,
      skillId: skill.id,
      skillSlug: skill.slug,
      skillName: skill.name,
      stageId: stage.id,
      level: stage.level,
      levelName: getSkillLevelName(stage.level),
      version: attempt.version,
      status: attempt.status,
      passingScore: stage.passingScore,
      selectedQuestionId: chosenQuestion.id,
      startedAt: attempt.startedAt.toISOString(),
    },
    questions: stripQuestionSecrets([questionForClient]),
  };
}

export type QuestionEvaluation = {
  questionId: string;
  passed: boolean;
  earnedWeight: number;
  maxWeight: number;
  feedback: string;
};

export function gradeAssessmentQuestions(
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
): {
  score: number;
  evaluations: QuestionEvaluation[];
} {
  if (questions.length === 0) {
    return { score: 0, evaluations: [] };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  const evaluations: QuestionEvaluation[] = [];

  for (const q of questions) {
    const weight = q.weight > 0 ? q.weight : 1;
    totalWeight += weight;
    const rawAnswer = typeof answers[q.id] === "string" ? answers[q.id].trim() : "";

    if (q.type === "MULTIPLE_CHOICE") {
      const passed = Boolean(q.correctOptionId && rawAnswer === q.correctOptionId);
      const earned = passed ? weight : 0;
      earnedWeight += earned;
      evaluations.push({
        questionId: q.id,
        passed,
        earnedWeight: earned,
        maxWeight: weight,
        feedback: passed ? `Passed: ${q.explanation}` : `Incorrect option selected. ${q.explanation}`,
      });
    } else {
      // CODE_TASK: Deterministic static & pattern check (never execute untrusted code on main server)
      const required = q.requiredSnippets ?? [];
      const forbidden = q.forbiddenSnippets ?? [];

      const missingRequired = required.filter((snippet) => !rawAnswer.includes(snippet));
      const matchedForbidden = forbidden.filter((snippet) => rawAnswer.includes(snippet));
      const passed = rawAnswer.length > 0 && missingRequired.length === 0 && matchedForbidden.length === 0;
      const earned = passed ? weight : 0;
      earnedWeight += earned;

      let feedback = q.explanation;
      if (!passed) {
        const reasons: string[] = [];
        if (rawAnswer.length === 0) reasons.push("No code answer submitted.");
        if (missingRequired.length > 0) {
          reasons.push(`Missing required constructs: ${missingRequired.join(", ")}.`);
        }
        if (matchedForbidden.length > 0) {
          reasons.push(`Contains disallowed constructs: ${matchedForbidden.join(", ")}.`);
        }
        feedback = `${reasons.join(" ")} ${q.explanation}`.trim();
      }

      evaluations.push({
        questionId: q.id,
        passed,
        earnedWeight: earned,
        maxWeight: weight,
        feedback,
      });
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { score, evaluations };
}

async function syncReviewerSkillBadge(
  db: DbClient,
  args: {
    userId: string;
    skillName: string;
    category: string;
    level: number;
  },
) {
  await db.reviewerSkill.upsert({
    where: {
      userId_name: {
        userId: args.userId,
        name: args.skillName,
      },
    },
    update: {
      category: args.category,
      level: args.level,
    },
    create: {
      userId: args.userId,
      name: args.skillName,
      category: args.category,
      level: args.level,
    },
  });
}

export async function submitAssessmentAttempt(
  db: DbClient,
  args: {
    userId: string;
    attemptId: string;
    answers: Record<string, string>;
    now?: Date;
  },
) {
  const now = args.now ?? new Date();
  const attempt = await db.skillAssessmentAttempt.findUnique({
    where: { id: args.attemptId },
    include: {
      skill: true,
      stage: true,
    },
  });

  if (!attempt || attempt.userId !== args.userId) {
    throw new AppError(404, "ASSESSMENT_ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(409, "ASSESSMENT_ATTEMPT_ALREADY_SUBMITTED", "This assessment attempt has already been submitted.");
  }

  // Re-verify prerequisite level in case state changed
  const existingLevel = await db.userSkillLevel.findUnique({
    where: {
      userId_skillId: {
        userId: args.userId,
        skillId: attempt.skillId,
      },
    },
  });
  const currentVerifiedLevel = existingLevel?.level ?? 0;
  if (attempt.level > 1 && currentVerifiedLevel < attempt.level - 1) {
    throw new AppError(
      403,
      "SEQUENTIAL_LEVEL_LOCKED",
      `Cannot submit Level ${attempt.level} without an active passed Level ${attempt.level - 1} record.`,
    );
  }

  const allQuestions = parseJson<AssessmentQuestion[]>(attempt.stage.questionsJson, []);
  // Grade ONLY the selected question recorded on the attempt
  const questionsToGrade = attempt.selectedQuestionId
    ? allQuestions.filter((q) => q.id === attempt.selectedQuestionId)
    : allQuestions;
  const { score, evaluations } = gradeAssessmentQuestions(questionsToGrade, args.answers ?? {});
  const passed = score >= attempt.stage.passingScore;
  const status = passed ? "PASSED" : "FAILED";
  const cooldownUntil = passed
    ? null
    : new Date(now.getTime() + attempt.stage.cooldownMinutes * 60 * 1000);

  const updatedAttempt = await db.skillAssessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      status,
      score,
      answersJson: JSON.stringify(args.answers ?? {}),
      feedbackJson: JSON.stringify(evaluations),
      completedAt: now,
      cooldownUntil,
    },
  });

  let verifiedLevel = currentVerifiedLevel;

  if (passed) {
    // Grant ONLY the level passed (or preserve higher level if re-taking a lower stage)
    verifiedLevel = Math.max(currentVerifiedLevel, attempt.level);
    await db.userSkillLevel.upsert({
      where: {
        userId_skillId: {
          userId: args.userId,
          skillId: attempt.skillId,
        },
      },
      update: {
        level: verifiedLevel,
        version: attempt.stage.version,
        score: attempt.level >= currentVerifiedLevel ? score : existingLevel?.score ?? score,
        lastAttemptId: attempt.id,
        verifiedAt: now,
      },
      create: {
        userId: args.userId,
        skillId: attempt.skillId,
        level: verifiedLevel,
        version: attempt.stage.version,
        score,
        lastAttemptId: attempt.id,
        verifiedAt: now,
      },
    });

    await syncReviewerSkillBadge(db, {
      userId: args.userId,
      skillName: attempt.skill.name,
      category: attempt.skill.category,
      level: verifiedLevel,
    });
  }

  return {
    attempt: {
      id: updatedAttempt.id,
      skillId: attempt.skillId,
      skillSlug: attempt.skill.slug,
      skillName: attempt.skill.name,
      level: updatedAttempt.level,
      levelName: getSkillLevelName(updatedAttempt.level),
      status: updatedAttempt.status,
      passed,
      score: updatedAttempt.score,
      passingScore: attempt.stage.passingScore,
      verifiedLevel,
      verifiedLevelName: verifiedLevel > 0 ? getSkillLevelName(verifiedLevel) : null,
      cooldownUntil: updatedAttempt.cooldownUntil ? updatedAttempt.cooldownUntil.toISOString() : null,
      completedAt: updatedAttempt.completedAt ? updatedAttempt.completedAt.toISOString() : null,
      evaluations,
    },
  };
}

/**
 * Helper used by seed scripts and tests to grant sequential verified levels (1..targetLevel)
 * with recorded PASSED attempts so the audit trail and `UserSkillLevel` / `ReviewerSkill` match.
 */
export async function seedVerifiedSkillLevel(
  db: DbClient,
  args: {
    userId: string;
    skillSlug: string;
    targetLevel: SkillLevelNumber;
    score?: number;
  },
) {
  await ensureDefaultSkillsSeeded(db);
  const skill = await resolveSkill(db, args.skillSlug);
  const score = args.score ?? 95;
  const now = new Date();

  for (let lvl = 1; lvl <= args.targetLevel; lvl++) {
    const stage = skill.stages.find((s) => s.level === lvl);
    if (!stage) continue;

    const attempt = await db.skillAssessmentAttempt.create({
      data: {
        userId: args.userId,
        skillId: skill.id,
        stageId: stage.id,
        level: lvl,
        version: stage.version,
        status: "PASSED",
        score,
        answersJson: JSON.stringify({ seeded: true }),
        feedbackJson: JSON.stringify([]),
        startedAt: now,
        completedAt: now,
      },
    });

    await db.userSkillLevel.upsert({
      where: {
        userId_skillId: {
          userId: args.userId,
          skillId: skill.id,
        },
      },
      update: {
        level: lvl,
        version: stage.version,
        score,
        lastAttemptId: attempt.id,
        verifiedAt: now,
      },
      create: {
        userId: args.userId,
        skillId: skill.id,
        level: lvl,
        version: stage.version,
        score,
        lastAttemptId: attempt.id,
        verifiedAt: now,
      },
    });
  }

  await syncReviewerSkillBadge(db, {
    userId: args.userId,
    skillName: skill.name,
    category: skill.category,
    level: args.targetLevel,
  });
}
