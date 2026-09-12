export type PipelineStatus = "complete" | "processing" | "pending";

export type LLMProvider =
  | "gemini"
  | "deepseek"
  | "openai"
  | "groq"
  | "openrouter"
  | "ollama"
  | "custom";

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
}

export interface PipelineConfig {
  draftAgent: ModelConfig;
  critiqueAgent: ModelConfig;
  reconcileAgent: ModelConfig;
}

export interface PipelineStep {
  id: string;
  model: string;
  status: PipelineStatus;
  content: string | string[];
  isReconciled?: boolean;
}

export interface DiffToken {
  type: "delete" | "insert" | "normal";
  text: string;
}
