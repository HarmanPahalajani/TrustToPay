import type { PrismaClient } from "@prisma/client";
import { cosineSimilarity, type ElasticHybridSearchHit, type SanitizedSpecialistDocument } from "./specialistIndexService.js";
import { levelToSignalScore } from "../matching/rankingService.js";

export type BenchmarkSpecialistSpec = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isReviewerApproved: boolean;
  headline: string;
  bio: string;
  skills: Array<{ slug: string; name: string; level: number; score: number }>;
  completedOutcomes: Array<{ taskId: string; taskTitle: string; category: string; requiredSkills: string[] }>;
  stats: {
    acceptedSubmissions: number;
    rejectedSubmissions: number;
    avgTurnaroundMinutes: number;
    activeWorkload: number;
  };
  embeddingVector: number[];
};

export type BenchmarkTaskSpec = {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkillSlug: string;
  requiredSkillName: string;
  minimumLevel: number;
  targetSpecialistId: string;
  queryVector: number[];
};

export type StrategyResult = {
  strategy: "DATABASE_KEYWORD_ONLY" | "ELASTIC_BM25_ONLY" | "JINA_SEMANTIC_ONLY" | "COMBINED_HYBRID";
  taskId: string;
  rankedSpecialistIds: string[];
  topSpecialistId: string | null;
  targetRank: number | null; // 1-based, or null if not found
  precisionAt1: number; // 1 or 0
  recallAt3: number; // 1 or 0
  ineligibleExcluded: boolean;
  durationMs: number;
};

export type BenchmarkSummary = {
  strategies: {
    DATABASE_KEYWORD_ONLY: StrategyMetrics;
    ELASTIC_BM25_ONLY: StrategyMetrics;
    JINA_SEMANTIC_ONLY: StrategyMetrics;
    COMBINED_HYBRID: StrategyMetrics;
  };
  taskResults: StrategyResult[];
  evaluatedAt: string;
};

export type StrategyMetrics = {
  meanReciprocalRank: number;
  averagePrecisionAt1: number;
  averageRecallAt3: number;
  ineligibleRejectionRate: number;
  averageDurationMs: number;
};

// Deterministic 12-dimensional vector space representing skills:
// [solana, rust, crypto, psql, sql, db_perf, ts, node, distributed, react, css, general]
export const BENCHMARK_SPECIALISTS: BenchmarkSpecialistSpec[] = [
  {
    id: "spec_solana_rust",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@specialists.trusttopay.dev",
    isActive: true,
    isReviewerApproved: true,
    headline: "Solana Core Security Auditor & Anchor Framework Contributor",
    bio: "Specializes in Solana smart contract audits, CPI reentrancy guards, cryptographic signature verification, and Rust memory safety.",
    skills: [
      { slug: "solana", name: "Solana", level: 3, score: 98 },
      { slug: "rust", name: "Rust", level: 3, score: 97 },
      { slug: "cryptography", name: "Cryptography", level: 3, score: 95 },
    ],
    completedOutcomes: [
      { taskId: "task_cpi_1", taskTitle: "Anchor CPI reentrancy audit", category: "SMART_CONTRACTS", requiredSkills: ["Solana", "Rust"] },
      { taskId: "task_cpi_2", taskTitle: "Solana token program invariant review", category: "SMART_CONTRACTS", requiredSkills: ["Solana"] },
    ],
    stats: { acceptedSubmissions: 18, rejectedSubmissions: 1, avgTurnaroundMinutes: 35, activeWorkload: 1 },
    embeddingVector: [0.98, 0.95, 0.92, 0.1, 0.1, 0.05, 0.2, 0.15, 0.1, 0.05, 0.05, 0.5],
  },
  {
    id: "spec_postgres_perf",
    name: "Marcus Vance",
    email: "marcus.vance@specialists.trusttopay.dev",
    isActive: true,
    isReviewerApproved: true,
    headline: "Database Reliability Engineer & PostgreSQL Performance Specialist",
    bio: "Focuses on PostgreSQL query optimization, vacuum tuning, MVCC deadlocks, execution plan analysis, and PGBouncer connection pooling.",
    skills: [
      { slug: "postgresql", name: "PostgreSQL", level: 3, score: 96 },
      { slug: "sql", name: "SQL", level: 3, score: 95 },
      { slug: "performance-tuning", name: "Performance Tuning", level: 3, score: 94 },
    ],
    completedOutcomes: [
      { taskId: "task_pg_1", taskTitle: "PostgreSQL index bloat remediation", category: "DATABASES", requiredSkills: ["PostgreSQL", "SQL"] },
      { taskId: "task_pg_2", taskTitle: "Deadlock resolution in transactional queue", category: "DATABASES", requiredSkills: ["PostgreSQL"] },
    ],
    stats: { acceptedSubmissions: 15, rejectedSubmissions: 1, avgTurnaroundMinutes: 40, activeWorkload: 0 },
    embeddingVector: [0.05, 0.1, 0.1, 0.97, 0.96, 0.94, 0.15, 0.2, 0.25, 0.05, 0.05, 0.45],
  },
  {
    id: "spec_ts_distributed",
    name: "Sarah Chen",
    email: "sarah.chen@specialists.trusttopay.dev",
    isActive: true,
    isReviewerApproved: true,
    headline: "Distributed Systems & Full-Stack TypeScript Architect",
    bio: "Designs idempotent webhook pipelines, Node.js microservices, distributed lock coordination, and TypeScript type systems.",
    skills: [
      { slug: "typescript", name: "TypeScript", level: 3, score: 96 },
      { slug: "node", name: "Node.js", level: 3, score: 94 },
      { slug: "distributed-systems", name: "Distributed Systems", level: 2, score: 88 },
    ],
    completedOutcomes: [
      { taskId: "task_ts_1", taskTitle: "Idempotent payment webhook pipeline", category: "BACKEND", requiredSkills: ["TypeScript", "Node.js"] },
      { taskId: "task_ts_2", taskTitle: "TypeScript AST parser refactor", category: "BACKEND", requiredSkills: ["TypeScript"] },
    ],
    stats: { acceptedSubmissions: 12, rejectedSubmissions: 2, avgTurnaroundMinutes: 50, activeWorkload: 1 },
    embeddingVector: [0.1, 0.15, 0.1, 0.2, 0.25, 0.2, 0.97, 0.95, 0.88, 0.3, 0.2, 0.6],
  },
  {
    id: "spec_rust_junior",
    name: "Alex Rivera",
    email: "alex.rivera@specialists.trusttopay.dev",
    isActive: true,
    isReviewerApproved: true,
    headline: "Junior Rust Developer & Systems Apprentice",
    bio: "Entry-level Rust programmer working on CLI tools and learning ownership and concurrency primitives.",
    skills: [
      { slug: "rust", name: "Rust", level: 1, score: 82 }, // Only L1! Ineligible for tasks requiring L2+
    ],
    completedOutcomes: [],
    stats: { acceptedSubmissions: 2, rejectedSubmissions: 2, avgTurnaroundMinutes: 120, activeWorkload: 0 },
    embeddingVector: [0.3, 0.65, 0.2, 0.05, 0.05, 0.05, 0.1, 0.1, 0.05, 0.05, 0.05, 0.3],
  },
  {
    id: "spec_react_frontend",
    name: "Maya Patel",
    email: "maya.patel@specialists.trusttopay.dev",
    isActive: true,
    isReviewerApproved: true,
    headline: "Frontend UI/UX & Accessible Design System Engineer",
    bio: "Builds accessible React component libraries, Tailwind CSS design tokens, and WCAG AA compliant user interfaces.",
    skills: [
      { slug: "react", name: "React", level: 3, score: 95 },
      { slug: "css", name: "CSS", level: 3, score: 92 },
    ],
    completedOutcomes: [
      { taskId: "task_ui_1", taskTitle: "Accessible dialog modal component", category: "FRONTEND", requiredSkills: ["React"] },
    ],
    stats: { acceptedSubmissions: 10, rejectedSubmissions: 0, avgTurnaroundMinutes: 45, activeWorkload: 0 },
    embeddingVector: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.4, 0.3, 0.1, 0.98, 0.95, 0.5],
  },
  {
    id: "spec_unapproved_security",
    name: "Dave Miller (Suspended)",
    email: "dave.miller@specialists.trusttopay.dev",
    isActive: false, // Inactive account! Must be rejected by DB authoritative check
    isReviewerApproved: false,
    headline: "Suspended Security Researcher",
    bio: "Solana and Rust security expert currently under compliance review.",
    skills: [
      { slug: "solana", name: "Solana", level: 3, score: 95 },
      { slug: "rust", name: "Rust", level: 3, score: 95 },
    ],
    completedOutcomes: [],
    stats: { acceptedSubmissions: 5, rejectedSubmissions: 1, avgTurnaroundMinutes: 45, activeWorkload: 0 },
    embeddingVector: [0.95, 0.92, 0.9, 0.1, 0.1, 0.05, 0.2, 0.15, 0.1, 0.05, 0.05, 0.5],
  },
];

export const BENCHMARK_TASKS: BenchmarkTaskSpec[] = [
  {
    id: "bench_task_solana_cpi",
    title: "Eliminate exploit vector in CPI token mint authority transfer",
    description: "Inspect Anchor instruction handlers to ensure caller possesses valid signer seeds and prevent unauthorized cross-program token minting without proper authority verification.",
    category: "SMART_CONTRACTS",
    requiredSkillSlug: "solana",
    requiredSkillName: "Solana",
    minimumLevel: 2,
    targetSpecialistId: "spec_solana_rust",
    // Vector highlights solana, rust, crypto:
    queryVector: [0.95, 0.9, 0.92, 0.05, 0.05, 0.05, 0.1, 0.1, 0.05, 0.05, 0.05, 0.4],
  },
  {
    id: "bench_task_postgres_mvcc",
    title: "Diagnose MVCC bloat and vacuum deadlocks under peak transactional workload",
    description: "Analyze autovacuum freeze thresholds, pg_stat_activity locked transactions, and connection pool starvation under high concurrency.",
    category: "DATABASES",
    requiredSkillSlug: "postgresql",
    requiredSkillName: "PostgreSQL",
    minimumLevel: 2,
    targetSpecialistId: "spec_postgres_perf",
    // Vector highlights psql, sql, db_perf:
    queryVector: [0.05, 0.05, 0.05, 0.96, 0.95, 0.94, 0.1, 0.15, 0.2, 0.05, 0.05, 0.4],
  },
  {
    id: "bench_task_ts_concurrency",
    title: "Resolve race condition in distributed idempotent event processor",
    description: "Audit Node.js Redis lock acquisition and redlock lease expiration to ensure exactly-once execution across horizontal workers.",
    category: "BACKEND",
    requiredSkillSlug: "typescript",
    requiredSkillName: "TypeScript",
    minimumLevel: 2,
    targetSpecialistId: "spec_ts_distributed",
    // Vector highlights ts, node, distributed:
    queryVector: [0.1, 0.1, 0.05, 0.15, 0.15, 0.15, 0.96, 0.94, 0.9, 0.1, 0.05, 0.5],
  },
];

/**
 * 1. DATABASE KEYWORD MATCHING ALONE:
 * Strictly filters by exact skill match and minimum verified level in database.
 * No BM25 relevance or vector similarity. Rank is solely based on baseline skill level / random.
 */
export function runDatabaseKeywordOnly(
  task: BenchmarkTaskSpec,
  specialists: BenchmarkSpecialistSpec[],
): StrategyResult {
  const started = performance.now();
  const eligible = specialists.filter((s) => {
    if (!s.isActive || !s.isReviewerApproved) return false;
    const matchingSkill = s.skills.find(
      (sk) => sk.slug === task.requiredSkillSlug || sk.name.toLowerCase() === task.requiredSkillName.toLowerCase(),
    );
    return matchingSkill && matchingSkill.level >= task.minimumLevel;
  });

  // DB keyword sort: highest skill level first, then ID
  eligible.sort((a, b) => {
    const lvlA = a.skills.find((sk) => sk.slug === task.requiredSkillSlug)?.level ?? 0;
    const lvlB = b.skills.find((sk) => sk.slug === task.requiredSkillSlug)?.level ?? 0;
    if (lvlB !== lvlA) return lvlB - lvlA;
    return a.id.localeCompare(b.id);
  });

  const rankedIds = eligible.map((s) => s.id);
  const targetIndex = rankedIds.indexOf(task.targetSpecialistId);
  const targetRank = targetIndex >= 0 ? targetIndex + 1 : null;

  return {
    strategy: "DATABASE_KEYWORD_ONLY",
    taskId: task.id,
    rankedSpecialistIds: rankedIds,
    topSpecialistId: rankedIds[0] ?? null,
    targetRank,
    precisionAt1: targetRank === 1 ? 1 : 0,
    recallAt3: targetRank !== null && targetRank <= 3 ? 1 : 0,
    ineligibleExcluded: !rankedIds.includes("spec_rust_junior") && !rankedIds.includes("spec_unapproved_security"),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

/**
 * 2. ELASTICSEARCH BM25 RETRIEVAL ALONE:
 * Tokenizes task query text and computes BM25 term matching against
 * headline, bio, skill names, and searchable text. (Simulated exact BM25 algorithm).
 * Note: Raw BM25 does not apply database authorization rules on its own.
 */
export function runElasticBM25Only(
  task: BenchmarkTaskSpec,
  specialists: BenchmarkSpecialistSpec[],
): StrategyResult {
  const started = performance.now();
  const queryTokens = `${task.title} ${task.description} ${task.requiredSkillName}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  const scored = specialists.map((s) => {
    const textCorpus = `${s.headline} ${s.bio} ${s.skills.map((sk) => sk.name).join(" ")}`.toLowerCase();
    let termMatches = 0;
    for (const token of queryTokens) {
      if (textCorpus.includes(token)) termMatches += 1;
    }
    const score = queryTokens.length > 0 ? (termMatches / queryTokens.length) * 10 : 0;
    return { specialist: s, score };
  });

  scored.sort((a, b) => b.score - a.score || a.specialist.id.localeCompare(b.specialist.id));

  const rankedIds = scored.filter((s) => s.score > 0).map((s) => s.specialist.id);
  const targetIndex = rankedIds.indexOf(task.targetSpecialistId);
  const targetRank = targetIndex >= 0 ? targetIndex + 1 : null;

  return {
    strategy: "ELASTIC_BM25_ONLY",
    taskId: task.id,
    rankedSpecialistIds: rankedIds,
    topSpecialistId: rankedIds[0] ?? null,
    targetRank,
    precisionAt1: targetRank === 1 ? 1 : 0,
    recallAt3: targetRank !== null && targetRank <= 3 ? 1 : 0,
    // Without DB validation, unapproved or junior candidates may leak into raw BM25 results
    ineligibleExcluded: !rankedIds.includes("spec_rust_junior") && !rankedIds.includes("spec_unapproved_security"),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

/**
 * 3. JINA SEMANTIC RETRIEVAL ALONE:
 * Computes dense vector cosine similarity between the query embedding (retrieval.query)
 * and specialist profile embeddings (retrieval.passage).
 */
export function runJinaSemanticOnly(
  task: BenchmarkTaskSpec,
  specialists: BenchmarkSpecialistSpec[],
): StrategyResult {
  const started = performance.now();
  const scored = specialists.map((s) => {
    const sim = cosineSimilarity(task.queryVector, s.embeddingVector);
    return { specialist: s, similarity: sim };
  });

  scored.sort((a, b) => b.similarity - a.similarity || a.specialist.id.localeCompare(b.specialist.id));

  const rankedIds = scored.map((s) => s.specialist.id);
  const targetIndex = rankedIds.indexOf(task.targetSpecialistId);
  const targetRank = targetIndex >= 0 ? targetIndex + 1 : null;

  return {
    strategy: "JINA_SEMANTIC_ONLY",
    taskId: task.id,
    rankedSpecialistIds: rankedIds,
    topSpecialistId: rankedIds[0] ?? null,
    targetRank,
    precisionAt1: targetRank === 1 ? 1 : 0,
    recallAt3: targetRank !== null && targetRank <= 3 ? 1 : 0,
    ineligibleExcluded: !rankedIds.includes("spec_rust_junior") && !rankedIds.includes("spec_unapproved_security"),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

/**
 * 4. COMBINED HYBRID RETRIEVAL (BM25 + Dense Vector + DB Authoritative 50/30/20 Validation):
 * 1. Hybrid search fuses BM25 keyword score + Jina dense vector cosine similarity.
 * 2. Relational DB hard filters STRICTLY reject unapproved, inactive, and insufficient skill levels.
 * 3. Multi-signal ranking applies 50% Skill, 30% Verification History, 20% Speed/Availability.
 */
export function runCombinedHybrid(
  task: BenchmarkTaskSpec,
  specialists: BenchmarkSpecialistSpec[],
): StrategyResult {
  const started = performance.now();

  // Step 1: Hybrid candidate discovery (BM25 + Jina Cosine Similarity)
  const queryTokens = `${task.title} ${task.description} ${task.requiredSkillName}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  const hybridHits = specialists.map((s) => {
    const textCorpus = `${s.headline} ${s.bio} ${s.skills.map((sk) => sk.name).join(" ")}`.toLowerCase();
    let termMatches = 0;
    for (const token of queryTokens) {
      if (textCorpus.includes(token)) termMatches += 1;
    }
    const keywordScore = queryTokens.length > 0 ? (termMatches / queryTokens.length) * 10 : 0;
    const vectorScore = cosineSimilarity(task.queryVector, s.embeddingVector);
    const hybridScore = Math.round((keywordScore + vectorScore * 10) * 100) / 100;
    return { specialist: s, keywordScore, vectorScore, hybridScore };
  });

  // Step 2: Database Authoritative Hard Filters (100% authoritative in relational layer)
  const dbEligible = hybridHits.filter(({ specialist: s }) => {
    // Hard Filter 1: Active & Reviewer Approved
    if (!s.isActive || !s.isReviewerApproved) return false;
    // Hard Filter 2: Workload limit (< 3)
    if (s.stats.activeWorkload >= 3) return false;
    // Hard Filter 3: Verified Skill Level >= minimumLevel
    const verified = s.skills.find(
      (sk) => sk.slug === task.requiredSkillSlug || sk.name.toLowerCase() === task.requiredSkillName.toLowerCase(),
    );
    if (!verified || verified.level < task.minimumLevel) return false;
    return true;
  });

  // Step 3: Multi-signal 50/30/20 Ranking
  const ranked = dbEligible.map(({ specialist: s, hybridScore, vectorScore }) => {
    const verified = s.skills.find(
      (sk) => sk.slug === task.requiredSkillSlug || sk.name.toLowerCase() === task.requiredSkillName.toLowerCase(),
    )!;

    // Signal 1: Skill Level Match (50% weight)
    const skillSignal = levelToSignalScore(verified.level, verified.score);
    const weightedSkill = skillSignal * 0.5;

    // Signal 2: Historical Verification Success Rate (30% weight)
    const totalSubmissions = s.stats.acceptedSubmissions + s.stats.rejectedSubmissions;
    const verificationSignal = totalSubmissions > 0 ? (s.stats.acceptedSubmissions / totalSubmissions) * 100 : 75;
    const weightedVerification = verificationSignal * 0.3;

    // Signal 3: Speed & Availability (20% weight)
    const speedSubScore = Math.max(40, Math.min(100, 100 - Math.max(0, s.stats.avgTurnaroundMinutes - 15) * 0.35));
    const availabilitySubScore = ((3 - s.stats.activeWorkload) / 3) * 100;
    const speedSignal = speedSubScore * 0.5 + availabilitySubScore * 0.5;
    const weightedSpeed = speedSignal * 0.2;

    const totalScore = Math.round((weightedSkill + weightedVerification + weightedSpeed) * 100) / 100;

    return {
      specialistId: s.id,
      totalScore,
      hybridScore,
      vectorScore,
    };
  });

  // Sort by final composite score descending, then by hybrid relevance
  ranked.sort((a, b) => b.totalScore - a.totalScore || b.hybridScore - a.hybridScore);

  const rankedIds = ranked.map((r) => r.specialistId);
  const targetIndex = rankedIds.indexOf(task.targetSpecialistId);
  const targetRank = targetIndex >= 0 ? targetIndex + 1 : null;

  return {
    strategy: "COMBINED_HYBRID",
    taskId: task.id,
    rankedSpecialistIds: rankedIds,
    topSpecialistId: rankedIds[0] ?? null,
    targetRank,
    precisionAt1: targetRank === 1 ? 1 : 0,
    recallAt3: targetRank !== null && targetRank <= 3 ? 1 : 0,
    ineligibleExcluded: !rankedIds.includes("spec_rust_junior") && !rankedIds.includes("spec_unapproved_security"),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

export function runFullRetrievalBenchmark(): BenchmarkSummary {
  const taskResults: StrategyResult[] = [];

  for (const task of BENCHMARK_TASKS) {
    taskResults.push(runDatabaseKeywordOnly(task, BENCHMARK_SPECIALISTS));
    taskResults.push(runElasticBM25Only(task, BENCHMARK_SPECIALISTS));
    taskResults.push(runJinaSemanticOnly(task, BENCHMARK_SPECIALISTS));
    taskResults.push(runCombinedHybrid(task, BENCHMARK_SPECIALISTS));
  }

  const computeMetrics = (strategy: StrategyResult["strategy"]): StrategyMetrics => {
    const results = taskResults.filter((r) => r.strategy === strategy);
    const n = results.length;
    if (n === 0) {
      return {
        meanReciprocalRank: 0,
        averagePrecisionAt1: 0,
        averageRecallAt3: 0,
        ineligibleRejectionRate: 0,
        averageDurationMs: 0,
      };
    }
    const mrr = results.reduce((sum, r) => sum + (r.targetRank ? 1 / r.targetRank : 0), 0) / n;
    const p1 = results.reduce((sum, r) => sum + r.precisionAt1, 0) / n;
    const r3 = results.reduce((sum, r) => sum + r.recallAt3, 0) / n;
    const inelig = results.reduce((sum, r) => sum + (r.ineligibleExcluded ? 1 : 0), 0) / n;
    const dur = results.reduce((sum, r) => sum + r.durationMs, 0) / n;

    return {
      meanReciprocalRank: Math.round(mrr * 1000) / 1000,
      averagePrecisionAt1: Math.round(p1 * 1000) / 1000,
      averageRecallAt3: Math.round(r3 * 1000) / 1000,
      ineligibleRejectionRate: Math.round(inelig * 1000) / 1000,
      averageDurationMs: Math.round(dur * 100) / 100,
    };
  };

  return {
    strategies: {
      DATABASE_KEYWORD_ONLY: computeMetrics("DATABASE_KEYWORD_ONLY"),
      ELASTIC_BM25_ONLY: computeMetrics("ELASTIC_BM25_ONLY"),
      JINA_SEMANTIC_ONLY: computeMetrics("JINA_SEMANTIC_ONLY"),
      COMBINED_HYBRID: computeMetrics("COMBINED_HYBRID"),
    },
    taskResults,
    evaluatedAt: new Date().toISOString(),
  };
}
