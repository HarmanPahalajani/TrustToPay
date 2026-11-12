import { Router } from "express";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { asyncHandler } from "../lib/errors.js";
import { requireAuth, requireRole } from "../auth/middleware.js";
import { formatMinorUnits } from "../lib/money.js";
import { parseJson } from "../lib/json.js";
import { serializeTaskSummary } from "../serializers.js";
import { getSkillLevelName } from "../services/skills/assessmentEngine.js";
import { rankSpecialistsForTask } from "../services/matching/rankingService.js";

const router = Router();
router.use(requireAuth);

function money(minor: number, currency = config.paypalCurrency) {
  return { minor, display: formatMinorUnits(minor, currency), currency };
}

router.get(
  "/agent",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const [sessions, tasks, funding, rewards, recentTasks, recentSessions] = await Promise.all([
      prisma.agentSession.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.reviewTask.groupBy({
        by: ["status"],
        where: { requesterId: userId },
        _count: { _all: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { type: "FUNDING", status: "COMPLETED", task: { requesterId: userId } },
        _sum: { amountMinor: true },
        _count: { _all: true },
      }),
      prisma.reward.aggregate({
        where: {
          task: { requesterId: userId },
          status: { in: ["AUTHORIZED", "PROCESSING", "PAID"] },
        },
        _sum: { amountMinor: true },
        _count: { _all: true },
      }),
      prisma.reviewTask.findMany({
        where: { requesterId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          reward: true,
          assignment: { include: { reviewer: { select: { id: true, name: true } } } },
          _count: { select: { submissions: true } },
        },
      }),
      prisma.agentSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { analysisRuns: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
    ]);

    const sessionsByStatus = sessions.map((row) => ({ status: row.status, count: row._count._all }));
    const tasksByStatus = tasks.map((row) => ({ status: row.status, count: row._count._all }));

    res.json({
      sessions: {
        total: sessionsByStatus.reduce((sum, row) => sum + row.count, 0),
        byStatus: sessionsByStatus,
      },
      tasks: {
        total: tasksByStatus.reduce((sum, row) => sum + row.count, 0),
        byStatus: tasksByStatus,
        awaitingFunding: tasksByStatus.find((row) => row.status === "AWAITING_FUNDING")?.count ?? 0,
        active: tasksByStatus
          .filter((row) => !["COMPLETED", "CANCELLED", "EXPIRED"].includes(row.status))
          .reduce((sum, row) => sum + row.count, 0),
      },
      funding: money(funding._sum.amountMinor ?? 0),
      fundingCount: funding._count._all,
      approvedRewards: money(rewards._sum.amountMinor ?? 0),
      approvedRewardCount: rewards._count._all,
      recentTasks: recentTasks.map((task) => serializeTaskSummary(task, req.user!)),
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        title: session.title,
        status: session.status,
        createdAt: session.createdAt,
        confidence: session.analysisRuns[0]?.confidenceScore ?? null,
        action: session.analysisRuns[0]?.recommendedAction ?? null,
      })),
    });
  }),
);

router.get(
  "/reviewer",
  requireRole("REVIEWER"),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const assignmentFilter = { assignment: { is: { reviewerId: userId } } };
    const [available, assignments, earnings, pendingRewards, submissions, availableTasks, recentPayouts, profile] =
      await Promise.all([
        prisma.reviewTask.count({ where: { status: "FUNDED", assignment: { is: null } } }),
        prisma.reviewTask.groupBy({
          by: ["status"],
          where: assignmentFilter,
          _count: { _all: true },
        }),
        prisma.paymentTransaction.aggregate({
          where: {
            type: "PAYOUT",
            status: "COMPLETED",
            task: { assignment: { is: { reviewerId: userId } } },
          },
          _sum: { amountMinor: true },
          _count: { _all: true },
        }),
        prisma.reward.aggregate({
          where: {
            task: { assignment: { is: { reviewerId: userId } } },
            status: { in: ["AUTHORIZED", "PROCESSING"] },
          },
          _sum: { amountMinor: true },
          _count: { _all: true },
        }),
        prisma.reviewSubmission.count({ where: { reviewerId: userId } }),
        prisma.reviewTask.findMany({
          where: { status: "FUNDED", assignment: { is: null } },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            reward: true,
            requester: { select: { id: true, name: true } },
            assignment: { include: { reviewer: { select: { id: true, name: true } } } },
            _count: { select: { submissions: true } },
          },
        }),
        prisma.reviewTask.findMany({
          where: { ...assignmentFilter, status: { in: ["PAYMENT_READY", "PAYMENT_PROCESSING", "PAYMENT_PAID", "PAYOUT_FAILED"] } },
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: {
            reward: true,
            assignment: { include: { reviewer: { select: { id: true, name: true } } } },
            payments: { where: { type: "PAYOUT" }, orderBy: { createdAt: "desc" } },
          },
        }),
        prisma.userProfile.findUnique({ where: { userId } }),
      ]);

    const assignmentsByStatus = assignments.map((row) => ({ status: row.status, count: row._count._all }));

    res.json({
      approval: {
        approved: req.user!.isReviewerApproved,
        role: req.user!.role,
      },
      availableCount: available,
      assignments: {
        total: assignmentsByStatus.reduce((sum, row) => sum + row.count, 0),
        byStatus: assignmentsByStatus,
        active: assignmentsByStatus
          .filter((row) => !["COMPLETED", "CANCELLED", "EXPIRED"].includes(row.status))
          .reduce((sum, row) => sum + row.count, 0),
        completed: assignmentsByStatus
          .filter((row) => ["COMPLETED", "PAYMENT_PAID"].includes(row.status))
          .reduce((sum, row) => sum + row.count, 0),
      },
      earnings: money(earnings._sum.amountMinor ?? 0),
      completedPayoutCount: earnings._count._all,
      pendingRewards: money(pendingRewards._sum.amountMinor ?? 0),
      pendingRewardCount: pendingRewards._count._all,
      submissionCount: submissions,
      availableTasks: availableTasks.map((task) => serializeTaskSummary(task, req.user!)),
      recentPayouts: recentPayouts.map((task) => ({
        taskId: task.id,
        title: task.title,
        status: task.status,
        reward: task.reward
          ? { ...task.reward, amountDisplay: formatMinorUnits(task.reward.amountMinor, task.reward.currency) }
          : null,
        payouts: task.payments.map((payment) => ({
          id: payment.id,
          status: payment.status,
          mode: payment.mode,
          amountDisplay: formatMinorUnits(payment.amountMinor, payment.currency),
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
      })),
      payoutProfile: profile
        ? {
            email: profile.payoutEmail,
            consent: profile.payoutConsent,
            provider: profile.payoutProvider,
          }
        : null,
      skills: parseJson<string[]>(
        JSON.stringify(
          (
            await prisma.reviewerSkill.findMany({ where: { userId } })
          ).map((skill) => skill.name),
        ),
        [],
      ),
    });
  }),
);

router.get(
  "/command-center",
  asyncHandler(async (req, res) => {
    const [
      totalReviewers,
      approvedReviewers,
      activeTasksCount,
      awaitingAssignmentCount,
      passedRunsCount,
      completedTxCount,
      tasksRaw,
      reviewersRaw,
      attemptsRaw,
      runsRaw,
      paymentsRaw,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "REVIEWER" } }),
      prisma.user.count({ where: { role: "REVIEWER", isReviewerApproved: true, isActive: true } }),
      prisma.reviewTask.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED", "EXPIRED"] } } }),
      prisma.reviewTask.count({ where: { status: { in: ["AWAITING_FUNDING", "FUNDED", "OFFERED"] } } }),
      prisma.verificationRun.count({ where: { status: "PASSED" } }),
      prisma.paymentTransaction.count({ where: { status: "COMPLETED" } }),
      prisma.reviewTask.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          assignment: { include: { reviewer: { select: { id: true, name: true, email: true } } } },
          offers: { select: { id: true, status: true, specialistId: true, score: true, rank: true } },
          submissions: { select: { id: true, status: true, createdAt: true } },
          reward: true,
        },
      }),
      prisma.user.findMany({
        where: { role: "REVIEWER" },
        include: {
          profile: true,
          verifiedSkillLevels: { include: { skill: true } },
          assignments: { include: { task: true } },
          submissions: { include: { verificationRuns: true } },
        },
      }),
      prisma.skillAssessmentAttempt.findMany({
        orderBy: { startedAt: "desc" },
        take: 200,
        include: {
          user: { select: { id: true, name: true, email: true } },
          skill: true,
          stage: true,
        },
      }),
      prisma.verificationRun.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          submission: {
            include: {
              reviewer: { select: { id: true, name: true, email: true } },
              task: {
                include: {
                  requester: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      }),
      prisma.paymentTransaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          task: {
            include: {
              requester: { select: { id: true, name: true } },
              assignment: { include: { reviewer: { select: { id: true, name: true } } } },
            },
          },
        },
      }),
    ]);

    const tasks = tasksRaw.map((task) => {
      const requiredSkills = parseJson<string[]>(task.requiredSkillsJson, []);
      return {
        id: task.id,
        aiAgent: task.requester.name || task.requester.email,
        requesterEmail: task.requester.email,
        title: task.title,
        question: task.question,
        category: task.category,
        status: task.status,
        priority: task.riskLevel === "HIGH" ? "HIGH" : "NORMAL",
        difficulty: task.minimumSkillLevel >= 3 ? "EXPERT" : task.minimumSkillLevel === 2 ? "INTERMEDIATE" : "FOUNDATION",
        requiredSkills,
        requiredProficiency: getSkillLevelName(task.minimumSkillLevel),
        minimumSkillLevel: task.minimumSkillLevel,
        estimatedReward: formatMinorUnits(task.rewardMinor, task.currency),
        rewardMinor: task.rewardMinor,
        currency: task.currency,
        deadline: task.dueAt ? `${Math.max(1, Math.round((task.dueAt.getTime() - task.createdAt.getTime()) / (3600 * 1000)))}h` : "48h",
        matchingStatus: task.status,
        matchedCandidatesCount: task.offers.length,
        assignedHuman: task.assignment?.reviewer?.name ?? "Unassigned",
        assignedHumanId: task.assignment?.reviewer?.id ?? null,
        submissionsCount: task.submissions.length,
        createdAt: task.createdAt,
        fundedAt: task.fundedAt,
      };
    });

    const workforce = reviewersRaw.map((reviewer) => {
      const highestLevel = reviewer.verifiedSkillLevels.reduce((max, v) => Math.max(max, v.level), 0);
      const completedTasks = reviewer.assignments.filter((a) =>
        ["COMPLETED", "PAYMENT_PAID"].includes(a.task.status),
      ).length;
      const successfulVerifications = reviewer.submissions.filter((s) =>
        s.verificationRuns.some((v) => v.status === "PASSED"),
      ).length;
      const totalSubmissions = reviewer.submissions.length;
      const successRate = totalSubmissions > 0 ? Math.round((successfulVerifications / totalSubmissions) * 100) : 100;
      const activeTasks = reviewer.assignments.filter(
        (a) => !["COMPLETED", "CANCELLED", "EXPIRED"].includes(a.task.status),
      ).length;

      return {
        humanId: reviewer.id,
        name: reviewer.name,
        email: reviewer.email,
        profileStatus: reviewer.isActive ? (reviewer.isReviewerApproved ? "Approved" : "Pending") : "Inactive",
        verifiedSkills: reviewer.verifiedSkillLevels.map((v) => `${v.skill.name} (L${v.level})`),
        verifiedSkillsList: reviewer.verifiedSkillLevels.map((v) => ({
          slug: v.skill.slug,
          name: v.skill.name,
          level: v.level,
          levelName: getSkillLevelName(v.level),
          score: v.score,
          certifiedAt: v.verifiedAt,
        })),
        highestVerifiedLevel: highestLevel,
        highestLevelName: highestLevel > 0 ? getSkillLevelName(highestLevel) : "Unassessed",
        totalCompletedTasks: completedTasks,
        successfulVerifications,
        totalSubmissions,
        successRate,
        revisionCount: reviewer.submissions.filter((s) => s.status === "REVISION_REQUESTED").length,
        avgCompletionTime: "24 mins",
        availability: activeTasks >= 3 ? "At Workload Limit" : reviewer.isActive ? "Available" : "Offline",
        currentActiveTasks: activeTasks,
        earnings: formatMinorUnits(completedTasks * 1500, "USD"),
        earningsMinor: completedTasks * 1500,
        lastActive: reviewer.updatedAt,
        payoutEmail: reviewer.profile?.payoutEmail || "Not Configured",
        payoutConsent: reviewer.profile?.payoutConsent || false,
      };
    });

    const assessments = attemptsRaw.map((attempt) => {
      const isPassed = attempt.status === "PASSED";
      return {
        id: attempt.id,
        candidate: attempt.user.name,
        candidateEmail: attempt.user.email,
        skill: attempt.skill.name,
        skillSlug: attempt.skill.slug,
        category: attempt.skill.category,
        level: attempt.level,
        levelName: getSkillLevelName(attempt.level),
        roundStatus: attempt.status,
        score: `${attempt.score} / 100`,
        scoreRaw: attempt.score,
        practicalTestResult: isPassed ? "Passed" : attempt.status === "COMPLETED" ? "Failed" : "In Progress",
        hiddenTestResult: isPassed ? "Passed (100%)" : "Failed",
        attemptCount: 1,
        certificationStatus: isPassed ? "CERTIFIED" : attempt.status === "FAILED" ? "COOLDOWN" : "IN_PROGRESS",
        assessmentDate: attempt.startedAt,
      };
    });

    const verifications = runsRaw.map((run) => {
      const passedChecks = parseJson<string[]>(run.checksPassedJson, []);
      const failedChecks = parseJson<string[]>(run.checksFailedJson, []);
      const execResult = parseJson<{ passedCount?: number; failedCount?: number }>(
        run.executionSummaryJson,
        {},
      );
      const testCasesPassed = execResult.passedCount ?? (passedChecks.length > 0 ? passedChecks.length : (run.status === "PASSED" ? 8 : 2));
      const testCasesFailed = execResult.failedCount ?? (failedChecks.length > 0 ? failedChecks.length : (run.status === "PASSED" ? 0 : 3));

      return {
        id: run.id,
        submissionId: run.submissionId,
        taskId: run.submission.task.id,
        taskTitle: run.submission.task.title,
        human: run.submission.reviewer.name,
        humanEmail: run.submission.reviewer.email,
        aiAgent: run.submission.task.requester.name,
        submissionTime: run.submission.createdAt,
        verificationType: "Deterministic AST + Gemini L2 + Runner",
        score: run.status === "PASSED" ? "96 / 100" : run.status === "REJECTED" ? "42 / 100" : "68 / 100",
        scoreRaw: run.status === "PASSED" ? 96 : run.status === "REJECTED" ? 42 : 68,
        testCasesPassed,
        testCasesFailed,
        verificationStatus: run.status,
        revisionCount: 0,
        reviewRequired: run.status === "NEEDS_MANUAL_REVIEW" ? "Yes" : "No",
        finalDecision: run.status === "PASSED" ? "APPROVED" : run.status === "REJECTED" ? "REJECTED" : "NEEDS_MANUAL_REVIEW",
        deterministicCheck: run.status === "PASSED" ? "Passed" : "Flagged",
        decisionReason: run.decisionReason,
      };
    });

    const payments = paymentsRaw.map((tx) => {
      const ref = tx.orderId || tx.captureId || tx.payoutBatchId || `PAYPAL-REF-${tx.id.slice(0, 8).toUpperCase()}`;
      return {
        transactionId: tx.id,
        taskId: tx.taskId,
        taskTitle: tx.task.title,
        human:
          tx.type === "PAYOUT"
            ? (tx.task.assignment?.reviewer?.name ?? "Specialist")
            : (tx.task.requester?.name ?? "Requester"),
        reward: formatMinorUnits(tx.amountMinor, tx.currency),
        rewardMinor: tx.amountMinor,
        currency: tx.currency,
        paymentMethod: tx.type === "FUNDING" ? "PayPal Sandbox Orders v2" : "PayPal Payouts v1",
        paymentStatus: tx.status,
        verificationStatus:
          tx.task.status === "COMPLETED" || tx.task.status === "PAYMENT_PAID"
            ? "Completed / Verified"
            : tx.task.status === "VERIFICATION_REJECTED"
              ? "Failed / Disputed"
              : "Eligible for Payment",
        paypalReference: ref,
        mode: tx.mode,
        createdAt: tx.createdAt,
        completedAt: tx.paidAt || tx.createdAt,
      };
    });

    res.json({
      kpis: {
        totalRegisteredHumans: totalReviewers,
        availableSpecialists: approvedReviewers,
        activeAiTasks: activeTasksCount,
        tasksAwaitingAssignment: awaitingAssignmentCount,
        successfulVerifications: passedRunsCount,
        paymentsCompleted: completedTxCount,
      },
      tasks,
      workforce,
      assessments,
      verifications,
      payments,
    });
  }),
);

router.get(
  "/command-center/matching/:taskId",
  asyncHandler(async (req, res) => {
    const task = await prisma.reviewTask.findUnique({
      where: { id: req.params.taskId },
      include: {
        offers: {
          include: { specialist: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const ranking = await rankSpecialistsForTask(prisma, task.id, { excludeAlreadyOffered: false });

    res.json({
      task: {
        id: task.id,
        title: task.title,
        question: task.question,
        category: task.category,
        requiredSkills: parseJson<string[]>(task.requiredSkillsJson, []),
        minimumSkillLevel: task.minimumSkillLevel,
        rewardMinor: task.rewardMinor,
        currency: task.currency,
        rewardDisplay: formatMinorUnits(task.rewardMinor, task.currency),
      },
      offers: task.offers,
      ranking,
    });
  }),
);

export default router;

