"use client";

import React, { useState } from "react";

interface PromptInputProps {
  onGenerate?: (prompt: string) => Promise<void> | void;
}

export function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate(prompt.trim());
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="input-panel">
      <textarea
        className="prompt-textarea"
        id="promptInput"
        placeholder="Paste your content draft or topic here..."
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="input-actions">
        <button
          className="btn-generate"
          id="btnGenerate"
          onClick={handleGenerateClick}
          disabled={generating}
        >
          {generating ? (
            <>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" fill="none" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
