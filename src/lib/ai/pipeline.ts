import { generateCompletion } from "./client";
import { computeDiff } from "../diff";
import {
  PipelineStep,
  DiffToken,
  PipelineConfig,
  ModelConfig,
} from "@/features/pipeline/types/pipeline";

export interface PipelineResult {
  steps: PipelineStep[];
  diffTokens: DiffToken[];
  meta: {
    prompt: string;
    totalLatencyMs: number;
    completedAt: string;
    config: PipelineConfig;
  };
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  draftAgent: {
    provider: "gemini",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
  critiqueAgent: {
    provider: "deepseek",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  },
  reconcileAgent: {
    provider: "gemini",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
};

export const DEFAULT_RUBRIC = [
  "Flag unsupported claims or factual inaccuracies",
  "Eliminate superficial filler & clichés (e.g., 'In conclusion', 'It is crucial')",
  "Verify technical syntax, AST validity & framework deprecations",
  "Identify logical gaps and missing architectural context",
];

/**
 * Execute the 3-stage multi-agent pipeline with user-configurable models
 */
export async function runPipeline(
  prompt: string,
  options?: {
    config?: Partial<PipelineConfig>;
    rubric?: string[];
  }
): Promise<PipelineResult> {
  const startTime = Date.now();

  const config: PipelineConfig = {
    draftAgent: { ...DEFAULT_PIPELINE_CONFIG.draftAgent, ...options?.config?.draftAgent },
    critiqueAgent: { ...DEFAULT_PIPELINE_CONFIG.critiqueAgent, ...options?.config?.critiqueAgent },
    reconcileAgent: { ...DEFAULT_PIPELINE_CONFIG.reconcileAgent, ...options?.config?.reconcileAgent },
  };

  const rubric = options?.rubric && options.rubric.length > 0 ? options.rubric : DEFAULT_RUBRIC;

  // 1. Stage 1: Drafting
  const draft = await executeDraft(prompt, config.draftAgent);

  // 2. Stage 2: Adversarial Critique
  const critiquePoints = await executeCritique(draft, config.critiqueAgent, rubric);

  // 3. Stage 3: Reconciliation
  const reconciled = await executeReconciliation(draft, critiquePoints, config.reconcileAgent);

  // 4. Word-level diff
  const diffTokens: DiffToken[] = computeDiff(draft, reconciled);

  const totalLatencyMs = Date.now() - startTime;

  const steps: PipelineStep[] = [
    {
      id: "step-1",
      model: `${config.draftAgent.provider.toUpperCase()} (${config.draftAgent.model})`,
      status: "complete",
      content: draft,
    },
    {
      id: "step-2",
      model: `${config.critiqueAgent.provider.toUpperCase()} (${config.critiqueAgent.model})`,
      status: "complete",
      content: critiquePoints,
    },
    {
      id: "step-3",
      model: `${config.reconcileAgent.provider.toUpperCase()} RECONCILED (${config.reconcileAgent.model})`,
      status: "complete",
      isReconciled: true,
      content: reconciled,
    },
  ];

  return {
    steps,
    diffTokens,
    meta: {
      prompt,
      totalLatencyMs,
      completedAt: new Date().toISOString(),
      config,
    },
  };
}

export async function executeDraft(prompt: string, modelConfig: ModelConfig): Promise<string> {
  const systemPrompt =
    "You are an expert technical writer and principal software engineer. " +
    "Draft a concise, publication-grade, search-dominant technical article on the provided topic. " +
    "Include architectural context and concrete details without superficial buzzwords.";

  return generateCompletion(modelConfig, {
    systemPrompt,
    userPrompt: `Topic: ${prompt}`,
    temperature: 0.2,
  });
}

export async function executeCritique(
  draft: string,
  modelConfig: ModelConfig,
  rubric: string[]
): Promise<string[]> {
  const systemPrompt =
    "You are a hardened Principal Software Engineer and Staff Technical Editor conducting an adversarial audit of technical content.\n" +
    "Critique the following draft ruthlessly based on these rubric rules:\n" +
    rubric.map((r) => `- ${r}`).join("\n") +
    "\n\nReturn your feedback as a bulleted list of 3 to 5 concise, actionable critique points. Do not include introductory pleasantries.";

  const rawCritique = await generateCompletion(modelConfig, {
    systemPrompt,
    userPrompt: `Review and critique this technical draft:\n\n${draft}`,
    temperature: 0.2,
  });

  const points = rawCritique
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim())
    .filter((line) => line.length > 5);

  return points.length > 0 ? points : [rawCritique.trim()];
}

export async function executeReconciliation(
  draft: string,
  critique: string | string[],
  modelConfig: ModelConfig
): Promise<string> {
  const critiqueText = Array.isArray(critique) ? critique.join("\n- ") : critique;

  const systemPrompt =
    `You are the Final Arbiter in a multi-agent AI pipeline.\n` +
    `Your role is to reconcile an initial draft against an adversarial audit from a senior reviewer.\n\n` +
    `INSTRUCTIONS:\n` +
    `- Address every issue flagged in the critique.\n` +
    `- Eliminate filler, sycophantic phrasing, and clichés.\n` +
    `- Verify technical syntax and ensure the text is crisp, dense, and publication-ready.\n` +
    `- Return only the final revised markdown text.`;

  const userPrompt =
    `CRITIQUE FEEDBACK TO APPLY:\n${critiqueText}\n\n` +
    `ORIGINAL DRAFT:\n${draft}`;

  return generateCompletion(modelConfig, {
    systemPrompt,
    userPrompt,
    temperature: 0.2,
  });
}
