import React from "react";
import { ModelCard } from "./model-card";
import { PipelineStep } from "../types/pipeline";

interface PipelineTimelineProps {
  steps?: PipelineStep[];
}

const defaultSteps: PipelineStep[] = [
  {
    id: "step-1",
    model: "GEMINI",
    status: "complete",
    content:
      "The future of AI is not just about raw power, but about orchestration. By chaining models together, we can leverage the specialized strengths of each. For example, using one model for drafting and another for rigorous critique creates a self-improving pipeline.",
  },
  {
    id: "step-2",
    model: "DEEPSEEK",
    status: "complete",
    content: [
      'The opening sentence is slightly generic. Consider starting with a stronger hook regarding "agentic workflows".',
      '"rigorous critique" is good, but specify *what* kind of critique (e.g., structural, tonal).',
      "The conclusion lacks a clear takeaway for the reader.",
    ],
  },
  {
    id: "step-3",
    model: "GEMINI RECONCILED",
    status: "processing",
    isReconciled: true,
    content:
      "The true potential of generative AI lies in agentic orchestration, not just monolithic parameter counts. By architecting modular pipelines, we harness specialized capabilities: assigning one LLM for rapid ideation and another for structural validation. This iterative, multi-agent synthesis forms a self-refining loop.",
  },
];

export function PipelineTimeline({ steps = defaultSteps }: PipelineTimelineProps) {
  return (
    <div className="timeline-container">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <ModelCard
            key={step.id}
            modelName={step.model}
            status={step.status}
            content={step.content}
            isReconciled={step.isReconciled}
            showLine={!isLast}
          />
        );
      })}
    </div>
  );
}
