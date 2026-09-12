"use client";

import React, { useState } from "react";
import { DiffToken } from "@/features/pipeline/types/pipeline";

interface RevisionDiffProps {
  tokens?: DiffToken[];
  draftContent?: string;
  reconciledContent?: string;
  latencyMs?: number;
}

export function RevisionDiff({
  tokens,
  draftContent,
  reconciledContent,
  latencyMs,
}: RevisionDiffProps) {
  const [activeTab, setActiveTab] = useState<"diff" | "final" | "draft">("diff");
  const [copied, setCopied] = useState(false);

  if (!tokens || tokens.length === 0) {
    return null;
  }

  const insertionsCount = tokens.filter((t) => t.type === "insert").length;
  const deletionsCount = tokens.filter((t) => t.type === "delete").length;

  const handleCopyFinal = () => {
    const textToCopy =
      reconciledContent ||
      tokens
        .filter((t) => t.type !== "delete")
        .map((t) => t.text)
        .join("");

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="diff-card">
      <div className="diff-toolbar">
        <div>
          <div className="diff-title-group">
            <h2 className="diff-title">Consensus Revision Diff</h2>
            {latencyMs && (
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "#64748b",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {(latencyMs / 1000).toFixed(1)}s total latency
              </span>
            )}
          </div>
          <p className="diff-subtitle">
            Word-by-word diff: <span style={{ color: "#f87171" }}>-{deletionsCount} cuts</span>,{" "}
            <span style={{ color: "#34d399" }}>+{insertionsCount} additions</span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="view-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeTab === "diff" ? "active" : ""}`}
              onClick={() => setActiveTab("diff")}
            >
              Visual Diff
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTab === "final" ? "active" : ""}`}
              onClick={() => setActiveTab("final")}
            >
              Final Clean
            </button>
            {draftContent && (
              <button
                type="button"
                className={`view-tab-btn ${activeTab === "draft" ? "active" : ""}`}
                onClick={() => setActiveTab("draft")}
              >
                Original Draft
              </button>
            )}
          </div>

          <button type="button" className="btn-copy-final" onClick={handleCopyFinal}>
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ color: "#34d399" }}>Copied!</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Visual Diff */}
      {activeTab === "diff" && (
        <div className="diff-content-view">
          {tokens.map((token, idx) => {
            if (token.type === "delete") {
              return (
                <span key={idx} className="diff-del">
                  {token.text}
                </span>
              );
            }
            if (token.type === "insert") {
              return (
                <span key={idx} className="diff-ins">
                  {token.text}
                </span>
              );
            }
            return <React.Fragment key={idx}>{token.text}</React.Fragment>;
          })}
        </div>
      )}

      {/* Tab 2: Final Clean Output */}
      {activeTab === "final" && (
        <div className="diff-content-view final-clean-view">
          {reconciledContent ||
            tokens
              .filter((t) => t.type !== "delete")
              .map((t) => t.text)
              .join("")}
        </div>
      )}

      {/* Tab 3: Original Draft */}
      {activeTab === "draft" && (
        <div className="diff-content-view final-clean-view">
          {draftContent ||
            tokens
              .filter((t) => t.type !== "insert")
              .map((t) => t.text)
              .join("")}
        </div>
      )}
    </section>
  );
}
