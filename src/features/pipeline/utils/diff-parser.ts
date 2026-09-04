import { DiffToken } from "../types/pipeline";

export const defaultDiffTokens: DiffToken[] = [
  { type: "delete", text: "The future of AI is not just about raw power, but about orchestration." },
  { type: "insert", text: "The true potential of generative AI lies in agentic orchestration, not just monolithic parameter counts." },
  { type: "normal", text: " By " },
  { type: "delete", text: "chaining models together," },
  { type: "insert", text: "architecting modular pipelines," },
  { type: "normal", text: " we can " },
  { type: "delete", text: "leverage the specialized strengths of each." },
  { type: "insert", text: "harness specialized capabilities:" },
  { type: "normal", text: " " },
  { type: "delete", text: "For example, using" },
  { type: "insert", text: "assigning" },
  { type: "normal", text: " one model for " },
  { type: "delete", text: "drafting" },
  { type: "insert", text: "rapid ideation" },
  { type: "normal", text: " and another for " },
  { type: "delete", text: "rigorous critique creates a self-improving pipeline." },
  { type: "insert", text: "structural validation. This iterative, multi-agent synthesis forms a self-refining loop." }
];
