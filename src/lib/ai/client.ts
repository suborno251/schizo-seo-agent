import { ModelConfig } from "@/features/pipeline/types/pipeline";

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

interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface CompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Universal model-agnostic completion dispatcher
 * Supports Gemini, DeepSeek, OpenAI, Groq, OpenRouter, Ollama, and Custom OpenAI-compatible endpoints.
 */
export async function generateCompletion(
  config: ModelConfig,
  options: CompletionOptions
): Promise<string> {
  const provider = config.provider;

  if (provider === "gemini") {
    return generateGeminiCompletion(config, options);
  }

  return generateOpenAICompatibleCompletion(config, options);
}

/**
 * Native Google Gemini REST Handler
 */
async function generateGeminiCompletion(
  config: ModelConfig,
  options: CompletionOptions
): Promise<string> {
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY || "";
  const model = config.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    console.warn("[Gemini] No API key provided. Returning simulated response.");
    return (
      `# Simulated Gemini Output (${model})\n\n` +
      `Orchestration across specialized LLMs ensures verifiable technical accuracy. ` +
      `By splitting generation into distinct evaluation phases, we eliminate hallucinations and stale generalities.\n\n` +
      `Topic addressed: ${options.userPrompt.slice(0, 100)}...`
    );
  }

  const promptContent = options.systemPrompt
    ? `${options.systemPrompt}\n\n${options.userPrompt}`
    : options.userPrompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptContent }] }],
        generationConfig: {
          temperature: config.temperature ?? options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 2048,
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
    throw new Error(`Gemini (${model}) returned an empty response.`);
  }

  return text.trim();
}

/**
 * Universal OpenAI-Compatible REST Handler
 * (DeepSeek, OpenAI, Groq, OpenRouter, Ollama, vLLM, etc.)
 */
async function generateOpenAICompatibleCompletion(
  config: ModelConfig,
  options: CompletionOptions
): Promise<string> {
  let baseUrl = config.baseUrl;
  let apiKey = config.apiKey;

  switch (config.provider) {
    case "deepseek":
      baseUrl = baseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
      apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
      break;
    case "openai":
      baseUrl = baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      apiKey = apiKey || process.env.OPENAI_API_KEY || "";
      break;
    case "groq":
      baseUrl = baseUrl || process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
      apiKey = apiKey || process.env.GROQ_API_KEY || "";
      break;
    case "openrouter":
      baseUrl = baseUrl || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
      apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
      break;
    case "ollama":
      baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
      apiKey = apiKey || "ollama";
      break;
    case "custom":
    default:
      baseUrl = baseUrl || "http://localhost:8000/v1";
      apiKey = apiKey || "";
      break;
  }

  if (!apiKey && config.provider !== "ollama") {
    console.warn(`[${config.provider}] No API key provided. Returning simulated response.`);
    return (
      `**Simulated Critique (${config.model || config.provider})**:\n` +
      `- Refine technical terminology for precision.\n` +
      `- Remove generic introductory phrases.\n` +
      `- Ground code examples in stable production APIs.`
    );
  }

  // Format endpoint URL
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const endpoint = cleanBaseUrl.endsWith("/chat/completions")
    ? cleanBaseUrl
    : `${cleanBaseUrl}/chat/completions`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: options.userPrompt });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature ?? options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${config.provider} API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as OpenAICompatibleResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${config.provider} (${config.model}) returned an empty response.`);
  }

  return content.trim();
}
