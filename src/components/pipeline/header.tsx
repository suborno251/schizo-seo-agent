import React from "react";
import Image from "next/image";
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
          <Image
            src="/logo.png"
            alt="Consensus Pipeline Logo"
            width={36}
            height={36}
            priority
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
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
