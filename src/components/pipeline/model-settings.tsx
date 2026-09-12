"use client";

import React, { useState } from "react";
import {
  PipelineConfig,
  ModelConfig,
  LLMProvider,
} from "@/features/pipeline/types/pipeline";

interface ModelSettingsProps {
  config: PipelineConfig;
  onChange: (config: PipelineConfig) => void;
}

const PRESETS: Array<{
  name: string;
  config: PipelineConfig;
}> = [
  {
    name: "Gemini × DeepSeek",
    config: {
      draftAgent: { provider: "gemini", model: "gemini-2.5-flash" },
      critiqueAgent: { provider: "deepseek", model: "deepseek-chat" },
      reconcileAgent: { provider: "gemini", model: "gemini-2.5-flash" },
    },
  },
  {
    name: "OpenAI Fleet (4o / 4o-mini)",
    config: {
      draftAgent: { provider: "openai", model: "gpt-4o-mini" },
      critiqueAgent: { provider: "openai", model: "gpt-4o" },
      reconcileAgent: { provider: "openai", model: "gpt-4o-mini" },
    },
  },
  {
    name: "DeepSeek End-to-End",
    config: {
      draftAgent: { provider: "deepseek", model: "deepseek-chat" },
      critiqueAgent: { provider: "deepseek", model: "deepseek-reasoner" },
      reconcileAgent: { provider: "deepseek", model: "deepseek-chat" },
    },
  },
  {
    name: "Groq (Llama 3.3 × R1)",
    config: {
      draftAgent: { provider: "groq", model: "llama-3.3-70b-versatile" },
      critiqueAgent: { provider: "groq", model: "deepseek-r1-distill-llama-70b" },
      reconcileAgent: { provider: "groq", model: "llama-3.3-70b-versatile" },
    },
  },
  {
    name: "Local Ollama",
    config: {
      draftAgent: { provider: "ollama", model: "llama3.2", baseUrl: "http://localhost:11434/v1" },
      critiqueAgent: { provider: "ollama", model: "deepseek-r1:8b", baseUrl: "http://localhost:11434/v1" },
      reconcileAgent: { provider: "ollama", model: "llama3.2", baseUrl: "http://localhost:11434/v1" },
    },
  },
];

const PROVIDERS: Array<{ label: string; value: LLMProvider }> = [
  { label: "Google Gemini", value: "gemini" },
  { label: "DeepSeek", value: "deepseek" },
  { label: "OpenAI", value: "openai" },
  { label: "Groq", value: "groq" },
  { label: "OpenRouter", value: "openrouter" },
  { label: "Local Ollama", value: "ollama" },
  { label: "Custom Endpoint", value: "custom" },
];

export function ModelSettings({ config, onChange }: ModelSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdateStage = (
    stageKey: keyof PipelineConfig,
    patch: Partial<ModelConfig>
  ) => {
    onChange({
      ...config,
      [stageKey]: {
        ...config[stageKey],
        ...patch,
      },
    });
  };

  const currentSummary = `${config.draftAgent.model} × ${config.critiqueAgent.model}`;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <button
          type="button"
          className="model-settings-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Model Architecture: <strong>{currentSummary}</strong></span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="model-settings-panel">
          <div className="settings-header">
            <div className="settings-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Configurable Multi-Agent Architecture</span>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Swap any provider/model per stage or leave API keys blank to use .env.local
            </span>
          </div>

          {/* Presets Row */}
          <div className="preset-pills-row">
            <span style={{ fontSize: "11.5px", color: "#64748b", marginRight: "4px" }}>
              Quick Presets:
            </span>
            {PRESETS.map((preset, idx) => {
              const isActive =
                config.draftAgent.model === preset.config.draftAgent.model &&
                config.critiqueAgent.model === preset.config.critiqueAgent.model;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`preset-pill ${isActive ? "active" : ""}`}
                  onClick={() => onChange(preset.config)}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* 3 Stages Column Grid */}
          <div className="stage-settings-grid">
            {/* Stage 1: Drafting */}
            <div className="stage-setting-card">
              <div className="stage-setting-title">
                <span>Stage 1: Draft Agent</span>
                <span className="stage-badge badge-draft">Synthesis</span>
              </div>

              <div className="setting-field">
                <label className="setting-label">Provider</label>
                <select
                  className="setting-select"
                  value={config.draftAgent.provider}
                  onChange={(e) =>
                    handleUpdateStage("draftAgent", {
                      provider: e.target.value as LLMProvider,
                    })
                  }
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-field">
                <label className="setting-label">Model Identifier</label>
                <input
                  type="text"
                  className="setting-input"
                  value={config.draftAgent.model}
                  onChange={(e) =>
                    handleUpdateStage("draftAgent", { model: e.target.value })
                  }
                  placeholder="e.g. gemini-2.5-flash, gpt-4o-mini"
                />
              </div>

              <div className="setting-field">
                <label className="setting-label">Custom API Key (Optional)</label>
                <input
                  type="password"
                  className="setting-input"
                  value={config.draftAgent.apiKey || ""}
                  onChange={(e) =>
                    handleUpdateStage("draftAgent", { apiKey: e.target.value })
                  }
                  placeholder="Uses .env.local if empty"
                />
              </div>

              {(config.draftAgent.provider === "custom" || config.draftAgent.provider === "ollama") && (
                <div className="setting-field">
                  <label className="setting-label">Base URL</label>
                  <input
                    type="text"
                    className="setting-input"
                    value={config.draftAgent.baseUrl || ""}
                    onChange={(e) =>
                      handleUpdateStage("draftAgent", { baseUrl: e.target.value })
                    }
                    placeholder="http://localhost:11434/v1"
                  />
                </div>
              )}
            </div>

            {/* Stage 2: Adversarial Critique */}
            <div className="stage-setting-card">
              <div className="stage-setting-title">
                <span>Stage 2: Critique Agent</span>
                <span className="stage-badge badge-critique">Auditor</span>
              </div>

              <div className="setting-field">
                <label className="setting-label">Provider</label>
                <select
                  className="setting-select"
                  value={config.critiqueAgent.provider}
                  onChange={(e) =>
                    handleUpdateStage("critiqueAgent", {
                      provider: e.target.value as LLMProvider,
                    })
                  }
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-field">
                <label className="setting-label">Model Identifier</label>
                <input
                  type="text"
                  className="setting-input"
                  value={config.critiqueAgent.model}
                  onChange={(e) =>
                    handleUpdateStage("critiqueAgent", { model: e.target.value })
                  }
                  placeholder="e.g. deepseek-chat, gpt-4o, deepseek-r1"
                />
              </div>

              <div className="setting-field">
                <label className="setting-label">Custom API Key (Optional)</label>
                <input
                  type="password"
                  className="setting-input"
                  value={config.critiqueAgent.apiKey || ""}
                  onChange={(e) =>
                    handleUpdateStage("critiqueAgent", { apiKey: e.target.value })
                  }
                  placeholder="Uses .env.local if empty"
                />
              </div>

              {(config.critiqueAgent.provider === "custom" || config.critiqueAgent.provider === "ollama") && (
                <div className="setting-field">
                  <label className="setting-label">Base URL</label>
                  <input
                    type="text"
                    className="setting-input"
                    value={config.critiqueAgent.baseUrl || ""}
                    onChange={(e) =>
                      handleUpdateStage("critiqueAgent", { baseUrl: e.target.value })
                    }
                    placeholder="http://localhost:11434/v1"
                  />
                </div>
              )}
            </div>

            {/* Stage 3: Reconciler */}
            <div className="stage-setting-card">
              <div className="stage-setting-title">
                <span>Stage 3: Reconcile Agent</span>
                <span className="stage-badge badge-reconcile">Arbiter</span>
              </div>

              <div className="setting-field">
                <label className="setting-label">Provider</label>
                <select
                  className="setting-select"
                  value={config.reconcileAgent.provider}
                  onChange={(e) =>
                    handleUpdateStage("reconcileAgent", {
                      provider: e.target.value as LLMProvider,
                    })
                  }
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-field">
                <label className="setting-label">Model Identifier</label>
                <input
                  type="text"
                  className="setting-input"
                  value={config.reconcileAgent.model}
                  onChange={(e) =>
                    handleUpdateStage("reconcileAgent", { model: e.target.value })
                  }
                  placeholder="e.g. gemini-2.5-flash, gpt-4o-mini"
                />
              </div>

              <div className="setting-field">
                <label className="setting-label">Custom API Key (Optional)</label>
                <input
                  type="password"
                  className="setting-input"
                  value={config.reconcileAgent.apiKey || ""}
                  onChange={(e) =>
                    handleUpdateStage("reconcileAgent", { apiKey: e.target.value })
                  }
                  placeholder="Uses .env.local if empty"
                />
              </div>

              {(config.reconcileAgent.provider === "custom" || config.reconcileAgent.provider === "ollama") && (
                <div className="setting-field">
                  <label className="setting-label">Base URL</label>
                  <input
                    type="text"
                    className="setting-input"
                    value={config.reconcileAgent.baseUrl || ""}
                    onChange={(e) =>
                      handleUpdateStage("reconcileAgent", { baseUrl: e.target.value })
                    }
                    placeholder="http://localhost:11434/v1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
