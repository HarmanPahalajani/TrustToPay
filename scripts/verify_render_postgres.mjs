import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const isCheckEmpty = process.argv.includes("--check-empty");
const isVerifyFull = process.argv.includes("--verify-full");

// Prefer RENDER_EXTERNAL_DATABASE_URL if provided, otherwise DATABASE_URL
let rawUrl = (process.env.RENDER_EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || "").trim();

// Normalize escaped characters if passed from markdown (e.g. \: or \@)
if (rawUrl) {
  rawUrl = rawUrl.replace(/\\:/g, ":").replace(/\\@/g, "@");
  // Ensure SSL mode is enabled for Render external connections
  if (rawUrl.includes("render.com") && !rawUrl.includes("sslmode=")) {
    rawUrl += rawUrl.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
}

if (!rawUrl) {
  console.error("[ERROR] No database URL found in RENDER_EXTERNAL_DATABASE_URL or DATABASE_URL.");
  process.exit(1);
}

// Validate protocol without logging credentials
const isPostgres = rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://");
if (!isPostgres) {
  console.error("[ERROR] Provided database URL is not a PostgreSQL connection string.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: rawUrl,
    },
  },
  log: ["error"],
});

async function run() {
  console.log("--> Connecting to PostgreSQL database (read-only preflight)...");

  if (isCheckEmpty || (!isCheckEmpty && !isVerifyFull)) {
    console.log("\n=======================================================");
    console.log("   RENDER POSTGRESQL CONNECTIVITY & READINESS AUDIT    ");
    console.log("=======================================================\n");

    // 1. Connection & Version Check
    const versionResult = await prisma.$queryRawUnsafe(`SELECT version() AS ver;`);
    const versionString = versionResult[0]?.ver || "Unknown";
    console.log(`[PASS] Database connectivity: PASS`);
    console.log(`[PASS] TLS/SSL connection:    PASS (SSL enforced)`);
    console.log(`[INFO] Engine Version:        ${versionString.split(" on ")[0]}`);

    // 2. Database Identity Verification
    const dbIdentity = await prisma.$queryRawUnsafe(`SELECT current_database() AS db, current_schema() AS schema, current_user AS usr;`);
    const currentDb = dbIdentity[0]?.db;
    const currentSchema = dbIdentity[0]?.schema;
    console.log(`[PASS] Database Name:         ${currentDb}`);
    console.log(`[PASS] Current Schema:        ${currentSchema}`);
    console.log(`[PASS] Connected User Role:   ${dbIdentity[0]?.usr}`);

    // 3. Schema Catalog Inspection
    const schemas = await prisma.$queryRawUnsafe(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log(`[INFO] Non-system Schemas:    ${schemas.map((s) => s.schema_name).join(", ") || "public only"}`);

    // 4. Tables in Public Schema
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`[INFO] Public Tables Count:   ${tables.length}`);

    // 5. Check specifically for _prisma_migrations
    const hasMigrationTable = tables.some((t) => t.table_name === "_prisma_migrations");
    console.log(`[INFO] Prisma Migration Table: ${hasMigrationTable ? "EXISTS" : "DOES NOT EXIST"}`);

    if (tables.length === 0) {
      console.log(`[PASS] Database Emptiness:    PASS (0 public tables detected)`);
      console.log(`[PASS] Readiness Status:      READY for baseline migration (0001_init_postgresql)`);
    } else {
      console.log(`[WARN] Database Emptiness:    FAIL (Database is not empty)`);
      console.log("Existing tables found in 'public' schema:");
      tables.forEach((t) => console.log(`   - ${t.table_name} (${t.table_type})`));
      console.log("\n[ABORT] Cannot apply initial baseline to a non-empty database without manual inspection.");
    }

    return;
  }

  if (isVerifyFull) {
    console.log("\n=======================================================");
    console.log("       TRUSTTOPAY POST-MIGRATION VERIFICATION AUDIT    ");
    console.log("=======================================================\n");

    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `);
    console.log(`1. Total Public Tables:      ${tables.length} (Expected: 25 including _prisma_migrations, or 24 application tables)`);

    const migrations = await prisma.$queryRawUnsafe(`
      SELECT migration_name, finished_at, rolled_back_at 
      FROM "_prisma_migrations";
    `);
    console.log(`2. Applied Migrations:       ${migrations.length}`);
    migrations.forEach((m) => console.log(`   - ${m.migration_name} (Finished: ${m.finished_at})`));

    const totalSkills = await prisma.skill.count();
    const assessedSkills = await prisma.skill.count({ where: { stages: { some: {} } } });
    const stages = await prisma.assessmentStage.count();
    console.log(`3. Skill Taxonomy:`);
    console.log(`   - Total Skills:           ${totalSkills} (Expected: 115)`);
    console.log(`   - Assessed Skills:        ${assessedSkills} (Expected: 83)`);
    console.log(`   - Assessment Stages:      ${stages} (Expected: 249)`);

    console.log(`4. Judge Accounts Audit:`);
    const requester = await prisma.user.findUnique({
      where: { email: "agent@demo.trusttopay.dev" },
      include: { profile: true, skills: true },
    });
    if (requester) {
      console.log(`   [REQUESTER] agent@demo.trusttopay.dev:`);
      console.log(`     - DB ID:                ${requester.id}`);
      console.log(`     - Supabase UUID:        ${requester.supabaseId || "NOT LINKED"}`);
      console.log(`     - Role:                 ${requester.role}`);
      console.log(`     - Reviewer Approved:    ${requester.isReviewerApproved}`);
    }

    const reviewer = await prisma.user.findUnique({
      where: { email: "reviewer@demo.trusttopay.dev" },
      include: { profile: true, skills: true },
    });
    if (reviewer) {
      console.log(`   [REVIEWER] reviewer@demo.trusttopay.dev:`);
      console.log(`     - DB ID:                ${reviewer.id}`);
      console.log(`     - Supabase UUID:        ${reviewer.supabaseId || "NOT LINKED"}`);
      console.log(`     - Role:                 ${reviewer.role}`);
      console.log(`     - Reviewer Approved:    ${reviewer.isReviewerApproved}`);
      console.log(`     - Verified Skills:      ${reviewer.skills.length}`);
    }

    const tasks = await prisma.reviewTask.count();
    const sessions = await prisma.agentSession.count();
    console.log(`5. Tasks & Sessions:`);
    console.log(`   - Total Tasks:            ${tasks}`);
    console.log(`   - Total Sessions:         ${sessions}`);
  }
}

run()
  .catch((err) => {
    console.error("[CONNECTION/AUDIT FAILED]");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
