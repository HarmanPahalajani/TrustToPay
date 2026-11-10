import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const pgSchemaPath = path.resolve(rootDir, "backend/prisma/schema.prisma");
const sqliteSchemaPath = path.resolve(rootDir, "backend/prisma/schema.sqlite.prisma");

if (!fs.existsSync(pgSchemaPath)) {
  console.error("Missing schema.prisma at " + pgSchemaPath);
  process.exit(1);
}
if (!fs.existsSync(sqliteSchemaPath)) {
  console.error("Missing schema.sqlite.prisma at " + sqliteSchemaPath);
  process.exit(1);
}

const pgLines = fs.readFileSync(pgSchemaPath, "utf8").split(/\r?\n/);
const sqliteLines = fs.readFileSync(sqliteSchemaPath, "utf8").split(/\r?\n/);

// Strip comments and datasource blocks for parity comparison
function stripDatasource(lines) {
  const result = [];
  let inDatasource = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("datasource ")) {
      inDatasource = true;
      continue;
    }
    if (inDatasource) {
      if (trimmed.endsWith("}")) inDatasource = false;
      continue;
    }
    result.push(line);
  }
  return result.join("\n").trim();
}

const pgBody = stripDatasource(pgLines);
const sqliteBody = stripDatasource(sqliteLines);

if (pgBody === sqliteBody) {
  console.log("[PARITY CHECK PASSED] Both Prisma schemas have 100% identical models, fields, and constraints.");
} else {
  console.error("[PARITY CHECK FAILED] Schema drift detected between schema.prisma and schema.sqlite.prisma.");
  process.exit(1);
}
