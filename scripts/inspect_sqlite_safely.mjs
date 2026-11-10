import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const models = [
    "user",
    "userProfile",
    "reviewerSkill",
    "skill",
    "assessmentStage",
    "skillAssessmentAttempt",
    "userSkillLevel",
    "agentApiKey",
    "agentSession",
    "analysisRun",
    "reviewTask",
    "taskOffer",
    "taskAssignment",
    "reviewSubmission",
    "submissionArtifact",
    "verificationRun",
    "reward",
    "dispute",
    "taskEvent",
    "evidenceSource",
    "paymentTransaction",
    "paymentWebhookEvent",
    "notification",
    "auditLog"
  ];

  const counts = {};
  for (const model of models) {
    if (prisma[model] && typeof prisma[model].count === "function") {
      counts[model] = await prisma[model].count();
    }
  }

  console.log("=== SQLITE DATABASE RECORD COUNTS ===");
  for (const [m, c] of Object.entries(counts)) {
    console.log(`${m.padEnd(25)}: ${c}`);
  }

  // Inspect users by role and email domain (without printing passwords or secrets)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      supabaseId: true,
      isReviewerApproved: true,
      createdAt: true
    }
  });

  console.log("\n=== REGISTERED USERS SUMMARY ===");
  for (const u of users) {
    console.log(`- Role: ${u.role.padEnd(10)} | Email: ${u.email.padEnd(30)} | SupabaseId: ${u.supabaseId ? "LINKED (" + u.supabaseId + ")" : "NOT_LINKED"} | Approved: ${u.isReviewerApproved}`);
  }

  // Inspect tasks count by isSeed
  const seedTasks = await prisma.reviewTask.count({ where: { isSeed: true } });
  const nonSeedTasks = await prisma.reviewTask.count({ where: { isSeed: false } });
  console.log(`\nTasks: ${seedTasks} seeded, ${nonSeedTasks} non-seeded.`);

  // Inspect sessions count by isSeed or total
  const totalSessions = await prisma.agentSession.count();
  console.log(`Sessions total: ${totalSessions}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
