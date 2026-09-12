import React from "react";
import { PipelineStep, PipelineConfig } from "@/features/pipeline/types/pipeline";

interface PipelineStagesProps {
  steps?: PipelineStep[];
  config?: PipelineConfig;
}

export function PipelineStages({ steps, config }: PipelineStagesProps) {
  const step1 = steps?.find((s) => s.id === "step-1");
  const step2 = steps?.find((s) => s.id === "step-2");
  const step3 = steps?.find((s) => s.id === "step-3");

  const getWordCount = (content?: string | string[]) => {
    if (!content) return 0;
    if (Array.isArray(content)) return content.join(" ").split(/\s+/).length;
    return content.trim().split(/\s+/).length;
  };

  const draftLabel =
    step1?.model ||
    (config ? `${config.draftAgent.provider.toUpperCase()} (${config.draftAgent.model})` : "Gemini 2.5 Flash");
  const critiqueLabel =
    step2?.model ||
    (config ? `${config.critiqueAgent.provider.toUpperCase()} (${config.critiqueAgent.model})` : "DeepSeek V2.5");
  const reconcileLabel =
    step3?.model ||
    (config ? `${config.reconcileAgent.provider.toUpperCase()} RECONCILED (${config.reconcileAgent.model})` : "Gemini Reconciled");

  return (
    <div className="stages-grid">
      {/* Stage 1: Draft */}
      <div className={`stage-panel ${step1?.status === "processing" ? "active" : ""}`}>
        <div className="stage-header">
          <span className="stage-number">Stage 01</span>
          <span className="stage-badge badge-draft">{draftLabel}</span>
        </div>

        <div className="stage-model-info">
          <span>Initial Draft</span>
          {step1?.status === "complete" && (
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              {getWordCount(step1.content)} words
            </span>
          )}
        </div>

        <div className="stage-output-box">
          {step1?.status === "processing" && (
            <div className="status-active-text">
              <svg className="spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              <span>Drafting technical content...</span>
            </div>
          )}

          {step1?.status === "complete" && (
            <div>{typeof step1.content === "string" ? step1.content : step1.content?.join("\n\n")}</div>
          )}

          {(!step1 || step1.status === "pending") && (
            <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              Awaiting topic prompt to begin draft generation...
            </span>
          )}
        </div>

        <div className="stage-footer">
          <span>Target: Comprehensive Draft</span>
          {step1?.status === "complete" ? (
            <span className="status-done-text">&check; Draft Ready</span>
          ) : step1?.status === "processing" ? (
            <span className="status-active-text">Streaming...</span>
          ) : (
            <span>Pending</span>
          )}
        </div>
      </div>

      {/* Stage 2: DeepSeek Adversarial Audit */}
      <div className={`stage-panel ${step2?.status === "processing" ? "active" : ""}`}>
        <div className="stage-header">
          <span className="stage-number">Stage 02</span>
          <span className="stage-badge badge-critique">{critiqueLabel}</span>
        </div>

        <div className="stage-model-info">
          <span>Adversarial Critique</span>
          {step2?.status === "complete" && Array.isArray(step2.content) && (
            <span style={{ fontSize: "11px", color: "var(--deepseek-amber)", fontFamily: "var(--font-mono)" }}>
              {step2.content.length} audit flags
            </span>
          )}
        </div>

        <div className="stage-output-box">
          {step2?.status === "processing" && (
            <div className="status-active-text" style={{ color: "var(--deepseek-amber)" }}>
              <svg className="spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              <span>Auditing draft for inaccuracies &amp; filler...</span>
            </div>
          )}

          {step2?.status === "complete" && (
            <div className="audit-bullet-list">
              {Array.isArray(step2.content) ? (
                step2.content.map((critique, idx) => (
                  <div key={idx} className="audit-bullet-item">
                    <svg className="audit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>{critique}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: "#e2e8f0" }}>{step2.content}</div>
              )}
            </div>
          )}

          {(!step2 || step2.status === "pending") && (
            <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              Awaiting draft completion for adversarial audit...
            </span>
          )}
        </div>

        <div className="stage-footer">
          <span>Rubric: Strict Syntax &bull; No Clichés</span>
          {step2?.status === "complete" ? (
            <span className="status-done-text" style={{ color: "var(--deepseek-amber)" }}>
              &check; Audit Complete
            </span>
          ) : step2?.status === "processing" ? (
            <span className="status-active-text" style={{ color: "var(--deepseek-amber)" }}>
              Auditing...
            </span>
          ) : (
            <span>Pending</span>
          )}
        </div>
      </div>

      {/* Stage 3: Reconciled Final */}
      <div className={`stage-panel reconciled ${step3?.status === "processing" ? "active" : ""}`}>
        <div className="stage-header">
          <span className="stage-number">Stage 03</span>
          <span className="stage-badge badge-reconcile">{reconcileLabel}</span>
        </div>

        <div className="stage-model-info">
          <span>Consensus Manuscript</span>
          {step3?.status === "complete" && (
            <span style={{ fontSize: "11px", color: "var(--reconcile-green)", fontFamily: "var(--font-mono)" }}>
              {getWordCount(step3.content)} words
            </span>
          )}
        </div>

        <div className="stage-output-box">
          {step3?.status === "processing" && (
            <div className="status-active-text" style={{ color: "var(--reconcile-green)" }}>
              <svg className="spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              <span>Reconciling critiques into final version...</span>
            </div>
          )}

          {step3?.status === "complete" && (
            <div>{typeof step3.content === "string" ? step3.content : step3.content?.join("\n\n")}</div>
          )}

          {(!step3 || step3.status === "pending") && (
            <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>
              Awaiting critique to reconcile final version...
            </span>
          )}
        </div>

        <div className="stage-footer">
          <span>Target: Publication-Grade</span>
          {step3?.status === "complete" ? (
            <span className="status-done-text">&check; Reconciled</span>
          ) : step3?.status === "processing" ? (
            <span className="status-active-text" style={{ color: "var(--reconcile-green)" }}>
              Synthesizing...
            </span>
          ) : (
            <span>Pending</span>
          )}
        </div>
      </div>
    </div>
  );
}
