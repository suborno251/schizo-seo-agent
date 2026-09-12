"use client";

import React, { useState } from "react";

interface PipelineInputProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  rubric: string[];
  onRubricChange: (rubric: string[]) => void;
  onRun: () => void;
  loading: boolean;
  statusMessage?: string;
}

const SUGGESTED_TOPICS = [
  "Kubernetes Ephemeral Storage Best Practices",
  "Redis Caching Strategies & Thundering Herd",
  "PostgreSQL Composite Indexing Patterns",
  "Idempotent API Design in Microservices",
];

export function PipelineInput({
  prompt,
  onPromptChange,
  rubric,
  onRubricChange,
  onRun,
  loading,
  statusMessage,
}: PipelineInputProps) {
  const [showRubric, setShowRubric] = useState(false);
  const [newRule, setNewRule] = useState("");

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    onRubricChange([...rubric, newRule.trim()]);
    setNewRule("");
  };

  const handleRemoveRule = (index: number) => {
    onRubricChange(rubric.filter((_, i) => i !== index));
  };

  return (
    <div className="input-card">
      <div className="input-label-row">
        <label htmlFor="topic-input" className="input-label">
          Topic / Seed Draft
        </label>
        <span className="input-helper">
          3-Stage Multi-Agent &bull; Draft &bull; Adversarial Audit &bull; Reconcile
        </span>
      </div>

      <textarea
        id="topic-input"
        className="prompt-textarea"
        placeholder="Enter a technical topic, architecture pattern, or raw content draft..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        disabled={loading}
      />

      {/* Suggested Topics */}
      <div className="chips-row">
        <span className="chip-label">Suggestions:</span>
        {SUGGESTED_TOPICS.map((topic, i) => (
          <button
            key={i}
            type="button"
            className="suggestion-chip"
            onClick={() => onPromptChange(topic)}
            disabled={loading}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Expandable Rubric Editor */}
      <div className="rubric-section">
        <button
          type="button"
          className="rubric-toggle-btn"
          onClick={() => setShowRubric(!showRubric)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: showRubric ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span>Adversarial Critique Rubric ({rubric.length} rules active)</span>
        </button>

        {showRubric && (
          <div className="rubric-pill-list">
            {rubric.map((rule, idx) => (
              <div key={idx} className="rubric-item">
                <span className="rubric-badge">Rubric Rule</span>
                <span style={{ flexGrow: 1 }}>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  title="Remove rule"
                >
                  &times;
                </button>
              </div>
            ))}

            <form onSubmit={handleAddRule} style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add custom critique rule (e.g., 'Verify Go goroutine leaks')..."
                style={{
                  flexGrow: 1,
                  background: "var(--bg-inner)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  color: "#fff",
                  fontSize: "12.5px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "#e2e8f0",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                + Add Rule
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="input-actions-bar">
        <div>
          {loading && statusMessage && (
            <div className="pipeline-status-indicator">
              <svg
                className="spinner"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-run-pipeline"
          onClick={onRun}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <svg
                className="spinner"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              Running Pipeline...
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run Consensus Pipeline
            </>
          )}
        </button>
      </div>
    </div>
  );
}
