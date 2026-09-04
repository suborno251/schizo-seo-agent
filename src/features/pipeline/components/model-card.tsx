"use client";

import React, { useState } from "react";
import { PipelineStatus } from "../types/pipeline";
import { exportTextAsFile } from "../utils/export-output";

interface ModelCardProps {
  modelName: string;
  status: PipelineStatus;
  content: string | string[];
  isReconciled?: boolean;
  showLine?: boolean;
}

export function ModelCard({
  modelName,
  status,
  content,
  isReconciled = false,
  showLine = true,
}: ModelCardProps) {
  const [copied, setCopied] = useState(false);

  const rawText = Array.isArray(content) ? content.join("\n\n") : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    const filename = `${modelName.toLowerCase().replace(/\s+/g, "-")}-output.txt`;
    exportTextAsFile(filename, rawText);
  };

  return (
    <div className="timeline-item">
      {/* Node Track & Indicator */}
      <div className="node-track">
        <div className={`node-icon-box ${status === "processing" ? "processing-node" : ""}`}>
          {status === "complete" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          )}
        </div>
        {showLine && <div className="node-line"></div>}
      </div>

      {/* Card Body */}
      <div className={`card ${isReconciled ? "reconciled-card" : ""}`}>
        <div className="card-topbar">
          <span className={`badge-model ${isReconciled ? "reconciled" : ""}`}>{modelName}</span>
          <div className="card-tools">
            {isReconciled && (
              <>
                <button className="btn-tool" onClick={handleCopy} title="Copy to clipboard">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button className="btn-tool" onClick={handleExport} title="Export as text file">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  <span>Export</span>
                </button>
              </>
            )}

            {/* Status indicator */}
            <div className={`status-badge ${status}`}>
              {status === "complete" ? (
                <span>✓ Complete</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Processing</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="inner-code-box">
          {Array.isArray(content) ? (
            content.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
