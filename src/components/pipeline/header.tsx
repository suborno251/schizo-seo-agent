import React from "react";
import { PipelineConfig } from "@/features/pipeline/types/pipeline";

interface HeaderProps {
  config?: PipelineConfig;
}

export function Header({ config }: HeaderProps) {
  const modelSummary = config
    ? `${config.draftAgent.model} • ${config.critiqueAgent.model}`
    : "gemini-2.5-flash • deepseek-chat";

  return (
    <header className="app-header">
      <div className="brand-title-group">
        <div className="brand-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6L14 6L20 12L14 18L4 18L10 12L4 6Z"
              fill="url(#brand-grad)"
            />
            <path
              d="M10 6L16 6L20 10L16 14L10 14L14 10L10 6Z"
              fill="#ffffff"
              fillOpacity="0.95"
            />
            <defs>
              <linearGradient
                id="brand-grad"
                x1="4"
                y1="6"
                x2="20"
                y2="18"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1 className="brand-name">
            AI Content Pipeline
            <span style={{ fontSize: "14px", fontWeight: 400, color: "#64748b" }}>
              Multi-Agent Consensus
            </span>
          </h1>
          <p className="brand-desc">
            Adversarial multi-agent pipeline: Draft &bull; Critique &bull; Reconcile across custom LLM models
          </p>
        </div>
      </div>

      <div className="header-badges">
        <div className="model-pill">
          <span className="status-dot"></span>
          <span>{modelSummary}</span>
        </div>
      </div>
    </header>
  );
}
