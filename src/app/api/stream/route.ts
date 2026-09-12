import { NextRequest } from "next/server";
import {
  DEFAULT_PIPELINE_CONFIG,
  DEFAULT_RUBRIC,
  executeDraft,
  executeCritique,
  executeReconciliation,
} from "@/lib/ai/pipeline";
import { computeDiff } from "@/lib/diff";
import { PipelineConfig } from "@/features/pipeline/types/pipeline";

export async function POST(req: NextRequest) {
  try {
    const { prompt, config, rubric } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const pipelineConfig: PipelineConfig = {
      draftAgent: { ...DEFAULT_PIPELINE_CONFIG.draftAgent, ...config?.draftAgent },
      critiqueAgent: { ...DEFAULT_PIPELINE_CONFIG.critiqueAgent, ...config?.critiqueAgent },
      reconcileAgent: { ...DEFAULT_PIPELINE_CONFIG.reconcileAgent, ...config?.reconcileAgent },
    };

    const critiqueRubric =
      Array.isArray(rubric) && rubric.length > 0 ? rubric : DEFAULT_RUBRIC;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          const startTime = Date.now();

          // Stage 1: Drafting
          const draftModelLabel = `${pipelineConfig.draftAgent.provider.toUpperCase()} (${pipelineConfig.draftAgent.model})`;
          sendEvent("status", {
            stage: 1,
            message: `Drafting technical overview with ${draftModelLabel}...`,
          });
          const draft = await executeDraft(prompt.trim(), pipelineConfig.draftAgent);
          sendEvent("stage_complete", {
            stage: 1,
            model: draftModelLabel,
            content: draft,
          });

          // Stage 2: Critique
          const critiqueModelLabel = `${pipelineConfig.critiqueAgent.provider.toUpperCase()} (${pipelineConfig.critiqueAgent.model})`;
          sendEvent("status", {
            stage: 2,
            message: `Performing adversarial audit with ${critiqueModelLabel}...`,
          });
          const critique = await executeCritique(
            draft,
            pipelineConfig.critiqueAgent,
            critiqueRubric
          );
          sendEvent("stage_complete", {
            stage: 2,
            model: critiqueModelLabel,
            content: critique,
          });

          // Stage 3: Reconciliation
          const reconcileModelLabel = `${pipelineConfig.reconcileAgent.provider.toUpperCase()} RECONCILED (${pipelineConfig.reconcileAgent.model})`;
          sendEvent("status", {
            stage: 3,
            message: `Synthesizing consensus into reconciled final manuscript with ${reconcileModelLabel}...`,
          });
          const reconciled = await executeReconciliation(
            draft,
            critique,
            pipelineConfig.reconcileAgent
          );
          sendEvent("stage_complete", {
            stage: 3,
            model: reconcileModelLabel,
            content: reconciled,
          });

          // Stage 4: Diff
          const diffTokens = computeDiff(draft, reconciled);
          const totalLatencyMs = Date.now() - startTime;

          sendEvent("done", {
            success: true,
            diffTokens,
            totalLatencyMs,
          });

          controller.close();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Pipeline error";
          sendEvent("error", { message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
