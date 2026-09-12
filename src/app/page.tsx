"use client";

import React, { useState } from "react";
import { Header } from "@/components/pipeline/header";
import { ModelSettings } from "@/components/pipeline/model-settings";
import { PipelineInput } from "@/components/pipeline/pipeline-input";
import { PipelineStages } from "@/components/pipeline/pipeline-stages";
import { RevisionDiff } from "@/components/pipeline/revision-diff";
import { PipelineStep, DiffToken, PipelineConfig } from "@/features/pipeline/types/pipeline";

const INITIAL_RUBRIC = [
  "Flag unsupported claims or factual inaccuracies",
  "Eliminate superficial filler & clichés (e.g., 'In conclusion', 'It is crucial')",
  "Verify technical syntax, AST validity & framework deprecations",
  "Identify logical gaps and missing architectural context",
];

const INITIAL_CONFIG: PipelineConfig = {
  draftAgent: { provider: "gemini", model: "gemini-2.5-flash" },
  critiqueAgent: { provider: "deepseek", model: "deepseek-chat" },
  reconcileAgent: { provider: "gemini", model: "gemini-2.5-flash" },
};

const getInitialSteps = (cfg: PipelineConfig): PipelineStep[] => [
  {
    id: "step-1",
    model: `${cfg.draftAgent.provider.toUpperCase()} (${cfg.draftAgent.model})`,
    status: "pending",
    content: "",
  },
  {
    id: "step-2",
    model: `${cfg.critiqueAgent.provider.toUpperCase()} (${cfg.critiqueAgent.model})`,
    status: "pending",
    content: [],
  },
  {
    id: "step-3",
    model: `${cfg.reconcileAgent.provider.toUpperCase()} RECONCILED (${cfg.reconcileAgent.model})`,
    status: "pending",
    isReconciled: true,
    content: "",
  },
];

export default function PipelineApp() {
  const [config, setConfig] = useState<PipelineConfig>(INITIAL_CONFIG);
  const [prompt, setPrompt] = useState("");
  const [rubric, setRubric] = useState<string[]>(INITIAL_RUBRIC);
  const [steps, setSteps] = useState<PipelineStep[]>(() => getInitialSteps(INITIAL_CONFIG));
  const [diffTokens, setDiffTokens] = useState<DiffToken[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [totalLatencyMs, setTotalLatencyMs] = useState<number | undefined>(undefined);

  const draftContent = typeof steps[0]?.content === "string" ? steps[0].content : undefined;
  const reconciledContent = typeof steps[2]?.content === "string" ? steps[2].content : undefined;

  const handleConfigChange = (newConfig: PipelineConfig) => {
    setConfig(newConfig);
    if (!loading) {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === "step-1") {
            return {
              ...s,
              model: `${newConfig.draftAgent.provider.toUpperCase()} (${newConfig.draftAgent.model})`,
            };
          }
          if (s.id === "step-2") {
            return {
              ...s,
              model: `${newConfig.critiqueAgent.provider.toUpperCase()} (${newConfig.critiqueAgent.model})`,
            };
          }
          if (s.id === "step-3") {
            return {
              ...s,
              model: `${newConfig.reconcileAgent.provider.toUpperCase()} RECONCILED (${newConfig.reconcileAgent.model})`,
            };
          }
          return s;
        })
      );
    }
  };

  const handleRunPipeline = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setDiffTokens(undefined);
    setTotalLatencyMs(undefined);
    setStatusMessage("Connecting to multi-agent stream...");

    // Set initial step states with selected models
    setSteps([
      {
        id: "step-1",
        model: `${config.draftAgent.provider.toUpperCase()} (${config.draftAgent.model})`,
        status: "processing",
        content: "",
      },
      {
        id: "step-2",
        model: `${config.critiqueAgent.provider.toUpperCase()} (${config.critiqueAgent.model})`,
        status: "pending",
        content: [],
      },
      {
        id: "step-3",
        model: `${config.reconcileAgent.provider.toUpperCase()} RECONCILED (${config.reconcileAgent.model})`,
        status: "pending",
        isReconciled: true,
        content: "",
      },
    ]);

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), rubric, config }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error ${response.status}: Failed to start stream`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventName = "";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) {
              eventName = line.replace("event: ", "").trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.replace("data: ", "").trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventName === "status") {
              setStatusMessage(data.message || "");
              if (data.stage === 2) {
                setSteps((prev) =>
                  prev.map((s) =>
                    s.id === "step-2" ? { ...s, status: "processing" } : s
                  )
                );
              } else if (data.stage === 3) {
                setSteps((prev) =>
                  prev.map((s) =>
                    s.id === "step-3" ? { ...s, status: "processing" } : s
                  )
                );
              }
            } else if (eventName === "stage_complete") {
              if (data.stage === 1) {
                setSteps((prev) =>
                  prev.map((s) =>
                    s.id === "step-1"
                      ? {
                          ...s,
                          status: "complete",
                          content: data.content,
                          model: data.model || s.model,
                        }
                      : s
                  )
                );
              } else if (data.stage === 2) {
                setSteps((prev) =>
                  prev.map((s) =>
                    s.id === "step-2"
                      ? {
                          ...s,
                          status: "complete",
                          content: data.content,
                          model: data.model || s.model,
                        }
                      : s
                  )
                );
              } else if (data.stage === 3) {
                setSteps((prev) =>
                  prev.map((s) =>
                    s.id === "step-3"
                      ? {
                          ...s,
                          status: "complete",
                          content: data.content,
                          model: data.model || s.model,
                        }
                      : s
                  )
                );
              }
            } else if (eventName === "done") {
              if (data.diffTokens) {
                setDiffTokens(data.diffTokens);
              }
              if (data.totalLatencyMs) {
                setTotalLatencyMs(data.totalLatencyMs);
              }
              setStatusMessage("");
            } else if (eventName === "error") {
              throw new Error(data.message || "Pipeline execution failed");
            }
          } catch (e: unknown) {
            console.error("Error parsing SSE block:", e);
          }
        }
      }
    } catch (err: unknown) {
      console.warn("SSE stream interrupted or failed. Attempting fallback to /api/generate:", err);
      // Graceful fallback to standard REST API /api/generate
      try {
        setStatusMessage("Running fallback consensus...");
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), rubric, config }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Pipeline execution failed");
        }
        setSteps(json.data.steps);
        setDiffTokens(json.data.diffTokens);
        setTotalLatencyMs(json.data.meta?.totalLatencyMs);
      } catch (fallbackErr: unknown) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : "Pipeline execution failed";
        setError(msg);
      }
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <main className="app-container">
      {/* Header */}
      <Header config={config} />

      {/* Model Architecture Settings */}
      <ModelSettings config={config} onChange={handleConfigChange} />

      {/* Input Form & Rubric Controls */}
      <PipelineInput
        prompt={prompt}
        onPromptChange={setPrompt}
        rubric={rubric}
        onRubricChange={setRubric}
        onRun={handleRunPipeline}
        loading={loading}
        statusMessage={statusMessage}
      />

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "13.5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* 3-Stage Pipeline Cards */}
      <PipelineStages steps={steps} config={config} />

      {/* Revision Diff Viewer */}
      <RevisionDiff
        tokens={diffTokens}
        draftContent={draftContent}
        reconciledContent={reconciledContent}
        latencyMs={totalLatencyMs}
      />
    </main>
  );
}
