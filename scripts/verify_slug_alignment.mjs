import fs from "fs";

const qbContent = fs.readFileSync("backend/src/services/skills/questionBanks.ts", "utf-8");
const qbSlugs = Array.from(qbContent.matchAll(/"slug":\s*"([^"]+)"/g)).map(m => m[1]);
console.log("Question bank unique slugs count:", new Set(qbSlugs).size);

const taxContent = fs.readFileSync("backend/src/services/skills/taxonomy.ts", "utf-8");
const taxSlugs = Array.from(taxContent.matchAll(/slug:\s*"([^"]+)"/g)).map(m => m[1]);
console.log("Taxonomy unique slugs count:", new Set(taxSlugs).size);

const coveredSet = new Set(qbSlugs);
const missingFromTax = qbSlugs.filter(s => !taxSlugs.includes(s));
console.log("Slugs in question banks missing from taxonomy:", missingFromTax);

const backlog = taxSlugs.filter(s => !coveredSet.has(s));
console.log(`Backlog skills in taxonomy (${backlog.length}):`, backlog);
