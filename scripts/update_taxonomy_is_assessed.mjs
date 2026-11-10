import fs from "fs";

const qbContent = fs.readFileSync("backend/src/services/skills/questionBanks.ts", "utf-8");
const coveredSlugs = new Set(Array.from(qbContent.matchAll(/"slug":\s*"([^"]+)"/g)).map(m => m[1]));

const taxPath = "backend/src/services/skills/taxonomy.ts";
const taxContent = fs.readFileSync(taxPath, "utf-8");

const lines = taxContent.split("\n");
let updatedCount = 0;
const newLines = lines.map(line => {
  const m = line.match(/slug:\s*"([^"]+)"/);
  if (m && line.includes("isAssessed:")) {
    const slug = m[1];
    const shouldBeAssessed = coveredSlugs.has(slug);
    const newLine = line.replace(/isAssessed:\s*(true|false)/, `isAssessed: ${shouldBeAssessed}`);
    if (newLine !== line) updatedCount++;
    return newLine;
  }
  return line;
});

fs.writeFileSync(taxPath, newLines.join("\n"));
console.log(`Updated ${updatedCount} lines in ${taxPath}`);
