import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PromptInput } from "@/features/pipeline/components/prompt-input";
import { PipelineTimeline } from "@/features/pipeline/components/pipeline-timeline";
import { RevisionDiff } from "@/features/pipeline/components/revision-diff";

export default function Home() {
  return (
    <div className="dashboard-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Content */}
      <main className="workspace">
        <header className="workspace-header">
          <h2 className="workspace-title">New Content Run</h2>
        </header>

        {/* Prompt Input Area */}
        <PromptInput />

        {/* Execution Pipeline Timeline */}
        <PipelineTimeline />

        {/* Revision Diff Comparison */}
        <RevisionDiff />
      </main>
    </div>
  );
}
