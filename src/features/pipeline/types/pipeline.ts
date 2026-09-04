export type PipelineStatus = "complete" | "processing" | "pending";

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
