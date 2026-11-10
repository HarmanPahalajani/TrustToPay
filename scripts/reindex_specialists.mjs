import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { reindexAllApprovedSpecialists } from "../backend/src/services/elastic/specialistIndexService.js";

dotenv.config();

const rawUrl = (process.env.RENDER_EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || "").trim().replace(/\\:/g, ":").replace(/\\@/g, "@");

const prisma = new PrismaClient(
  rawUrl
    ? {
        datasources: {
          db: { url: rawUrl.includes("render.com") && !rawUrl.includes("sslmode=") ? `${rawUrl}?sslmode=require` : rawUrl },
        },
      }
    : undefined
);

async function main() {
  console.log("--> Starting Elasticsearch specialist reindexing...");
  const result = await reindexAllApprovedSpecialists(prisma);
  console.log("Reindex result:", JSON.stringify(result, null, 2));
}

main()
  .catch((err) => {
    console.error("Reindex failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
