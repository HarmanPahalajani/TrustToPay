import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const pgSchema = path.resolve(rootDir, "backend/prisma/schema.prisma");
const sqliteSchema = path.resolve(rootDir, "backend/prisma/schema.sqlite.prisma");

console.log("--> Validating PostgreSQL schema (backend/prisma/schema.prisma)...");
execSync(`npx prisma validate --schema="${pgSchema}"`, {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.POSTGRES_DATABASE_URL || "postgresql://mock_user:mock_pass@mock_host:5432/mock_db",
  },
});

console.log("--> Validating SQLite schema (backend/prisma/schema.sqlite.prisma)...");
execSync(`npx prisma validate --schema="${sqliteSchema}"`, {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: "file:./dev.db",
  },
});

console.log("--> Checking model/field parity between schemas...");
execSync(`node "${path.resolve(__dirname, "verify_schema_parity.mjs")}"`, {
  cwd: rootDir,
  stdio: "inherit",
});

console.log("\n[SUCCESS] Both schemas are completely valid and 100% in parity.");
