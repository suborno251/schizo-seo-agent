/**
 * Gemini API Integration for Stage 1 (Drafting) and Stage 3 (Reconciliation)
 */

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Stage 1: Generate technical long-form draft from prompt
 */
export async function generateDraft(
  prompt: string,
  apiKey: string = process.env.GEMINI_API_KEY || ""
): Promise<string> {
  if (!apiKey) {
    console.warn("[Gemini] No GEMINI_API_KEY detected. Returning simulated draft.");
    return (
      `# ${prompt}\n\n` +
      `The future of AI is not just about raw power, but about orchestration. ` +
      `By chaining models together, we can leverage the specialized strengths of each. ` +
      `For example, using one model for drafting and another for rigorous critique creates a self-improving pipeline.\n\n` +
      `In conclusion, ephemeral architectural patterns ensure high token efficiency and consistent throughput.`
    );
  }

  const systemInstruction =
    "You are an expert technical writer and principal software engineer. " +
    "Draft a concise, publication-grade, search-dominant technical article on the provided topic. " +
    "Include architectural context and concrete details without superficial buzzwords.";

  const fullPrompt = `${systemInstruction}\n\nTopic: ${prompt}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty candidate response.");
  }

  return text.trim();
}

/**
 * Stage 3: Reconcile original draft with adversarial critique into final version
 */
export async function reconcileContent(
  draft: string,
  critique: string | string[],
  apiKey: string = process.env.GEMINI_API_KEY || ""
): Promise<string> {
  const critiqueText = Array.isArray(critique) ? critique.join("\n- ") : critique;

  if (!apiKey) {
    console.warn("[Gemini] No GEMINI_API_KEY detected. Returning simulated reconciliation.");
    return (
      `The true potential of generative AI lies in agentic orchestration, not just monolithic parameter counts. ` +
      `By architecting modular pipelines, we harness specialized capabilities: assigning one model for rapid ideation ` +
      `and another for structural validation. This iterative, multi-agent synthesis forms a self-refining loop.`
    );
  }

  const prompt =
    `You are the Final Arbiter in a multi-agent AI pipeline.\n` +
    `Your role is to reconcile an initial draft against an adversarial audit from a senior reviewer.\n\n` +
    `CRITIQUE FEEDBACK TO APPLY:\n${critiqueText}\n\n` +
    `ORIGINAL DRAFT:\n${draft}\n\n` +
    `INSTRUCTIONS:\n` +
    `- Address every issue flagged in the critique.\n` +
    `- Eliminate filler, sycophantic phrasing, and clichés.\n` +
    `- Verify technical syntax and ensure the text is crisp, dense, and publication-ready.\n` +
    `- Return only the final revised markdown text.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Reconcile error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty reconciliation response.");
  }

  return text.trim();
}
