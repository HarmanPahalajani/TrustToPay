import fs from "fs";

const filePath = "backend/src/services/skills/assessmentEngine.ts";
let content = fs.readFileSync(filePath, "utf-8");

// Add import
if (!content.includes('import { DEMO_QUESTION_BANKS }')) {
  content = 'import { DEMO_QUESTION_BANKS } from "./questionBanks.js";\n' + content;
}

// Replace SeedSkillDefinition & DEFAULT_SKILLS_CATALOG array
const startMarker = "export type SeedSkillDefinition = {";
const endMarker = "export function shuffleOptions";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found:", { startIndex, endIndex });
  process.exit(1);
}

const replacement = `export type SeedSkillDefinition = {
  slug: string;
  name: string;
  category: string;
  description: string;
  version: string;
  stages: SeedStageDefinition[];
};

export const DEFAULT_SKILLS_CATALOG: SeedSkillDefinition[] = DEMO_QUESTION_BANKS;

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);

fs.writeFileSync(filePath, content);
console.log("Successfully updated assessmentEngine.ts with DEMO_QUESTION_BANKS!");
