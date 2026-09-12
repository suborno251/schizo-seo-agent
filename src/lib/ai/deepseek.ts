/**
 * DeepSeek API Integration for Stage 2 (Adversarial Audit & Critique)
 */

interface DeepSeekResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

export const DEFAULT_RUBRIC = [
  "Flag unsupported claims or factual inaccuracies",
  "Eliminate superficial filler (e.g. 'In conclusion', 'It is crucial to')",
  "Check framework deprecations and technical syntax",
  "Identify logical gaps and missing practical architectural examples",
];

/**
 * Stage 2: Adversarially critique the draft against strict editorial and technical rubrics
 */
export async function critiqueDraft(
  draft: string,
  rubric: string[] = DEFAULT_RUBRIC,
  apiKey: string = process.env.DEEPSEEK_API_KEY || ""
): Promise<string[]> {
  if (!apiKey) {
    console.warn("[DeepSeek] No DEEPSEEK_API_KEY detected. Returning simulated critique points.");
    return [
      'The opening sentence is slightly generic. Consider starting with a stronger hook regarding "agentic orchestration".',
      '"rigorous critique" is good, but specify *what* kind of critique (e.g., structural, AST syntax, tonal).',
      'The conclusion lacks a clear actionable takeaway; eliminate "In conclusion" filler.',
    ];
  }

  const systemMessage =
    "You are a hardened Principal Software Engineer and Staff Technical Editor conducting an adversarial audit of technical content.\n" +
    "Critique the following draft ruthlessly based on these rubric rules:\n" +
    rubric.map((r) => `- ${r}`).join("\n") +
    "\n\nReturn your feedback as a bulleted list of 3 to 5 concise, actionable critique points. Do not include introductory pleasantries.";

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Review and critique this technical draft:\n\n${draft}` },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned an empty response.");
  }

  // Split into bullet points
  const points = content
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim())
    .filter((line) => line.length > 5);

  return points.length > 0 ? points : [content.trim()];
}
