import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/ai/pipeline";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, config, rubric } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'prompt' field in request body." },
        { status: 400 }
      );
    }

    const result = await runPipeline(prompt.trim(), { config, rubric });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("[API /api/generate] Pipeline execution error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
