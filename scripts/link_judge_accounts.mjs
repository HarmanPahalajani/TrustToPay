import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const prisma = new PrismaClient();

const EXPECTED_JUDGES = [
  {
    email: "agent@demo.trusttopay.dev",
    role: "REQUESTER",
    isReviewerApproved: false,
    name: "Elena Rostova — Judge Requester Demo",
  },
  {
    email: "reviewer@demo.trusttopay.dev",
    role: "REVIEWER",
    isReviewerApproved: true,
    name: "Marcus Vance — Judge Reviewer Demo",
  },
];

async function main() {
  console.log("--> Resolving Supabase Auth UUIDs for judge accounts...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });

  if (listError) {
    console.error("[ERROR] Failed to query Supabase admin API:", listError.message);
    process.exit(1);
  }

  const userMap = new Map(users.map((u) => [u.email?.toLowerCase(), u]));

  for (const expected of EXPECTED_JUDGES) {
    const supabaseUser = userMap.get(expected.email.toLowerCase());
    if (!supabaseUser) {
      console.error(`[ERROR] Supabase Auth account missing for: ${expected.email}`);
      console.error("Run `node scripts/provision_supabase_judge_accounts.mjs` first.");
      process.exit(1);
    }

    console.log(`Found Supabase user: ${expected.email} -> UUID: ${supabaseUser.id}`);

    // Upsert / Link into Application Database
    const existing = await prisma.user.findUnique({
      where: { email: expected.email },
      include: { profile: true, skills: true },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseId: supabaseUser.id,
          role: expected.role,
          isReviewerApproved: expected.isReviewerApproved,
        },
        include: { profile: true, skills: true },
      });
      console.log(`[LINKED] User ${updated.email}:`);
      console.log(`  - DB ID:               ${updated.id}`);
      console.log(`  - Supabase UUID:       ${updated.supabaseId}`);
      console.log(`  - Role:                ${updated.role}`);
      console.log(`  - Reviewer Approved:   ${updated.isReviewerApproved}`);
      console.log(`  - Verified Skills:     ${updated.skills.length}`);
    } else {
      const created = await prisma.user.create({
        data: {
          email: expected.email,
          name: expected.name,
          supabaseId: supabaseUser.id,
          role: expected.role,
          isReviewerApproved: expected.isReviewerApproved,
          profile: { create: {} },
        },
        include: { profile: true, skills: true },
      });
      console.log(`[CREATED & LINKED] User ${created.email}:`);
      console.log(`  - DB ID:               ${created.id}`);
      console.log(`  - Supabase UUID:       ${created.supabaseId}`);
      console.log(`  - Role:                ${created.role}`);
      console.log(`  - Reviewer Approved:   ${created.isReviewerApproved}`);
    }
  }

  console.log("\n[SUCCESS] Judge accounts successfully verified and linked to Supabase UUIDs.");
}

main()
  .catch((err) => {
    console.error("[FATAL]", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
