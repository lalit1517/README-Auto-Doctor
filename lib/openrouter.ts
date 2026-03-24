const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-chat";
const FALLBACK_OPENROUTER_MODEL = "deepseek/deepseek-r1:free";

type OpenRouterMessage = {
  content: string;
  role: "system" | "user";
};

type OpenRouterChoice = {
  message?: {
    content?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
};

export class OpenRouterRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenRouterRequestError";
    this.status = status;
  }
}

function getOpenRouterApiKey() {
  return process.env.OPENROUTER_API_KEY?.trim() ?? "";
}

function getPreferredModels() {
  const configuredModel =
    process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

  if (configuredModel === FALLBACK_OPENROUTER_MODEL) {
    return [configuredModel];
  }

  return [configuredModel, FALLBACK_OPENROUTER_MODEL];
}

async function parseOpenRouterError(response: Response) {
  try {
    const data = (await response.json()) as OpenRouterResponse;
    return data.error?.message ?? "OpenRouter API request failed.";
  } catch {
    return "OpenRouter API request failed.";
  }
}

async function requestReadmeImprovement(
  originalReadme: string,
  model: string,
  apiKey: string,
) {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content:
        "You are an expert developer who writes clean, concise, and professional GitHub README files. Always return valid Markdown only.",
    },
    {
      role: "user",
      content: `Improve this GitHub README.

Requirements:
- Return valid Markdown only
- Keep the README concise but professional
- Use a clear structure with these sections:
  - Title
  - Description
  - Installation
  - Usage
  - Features
  - Tech Stack
- Write polished, developer-friendly copy
- Preserve useful project-specific details when present
- Do not add filler text or commentary outside the README

README to improve:

${originalReadme}`,
    },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OpenRouterRequestError(
      await parseOpenRouterError(response),
      response.status || 502,
    );
  }

  const data = (await response.json()) as OpenRouterResponse;
  const improved = data.choices?.[0]?.message?.content?.trim();

  if (!improved) {
    throw new OpenRouterRequestError(
      `OpenRouter returned an empty README for model "${model}".`,
      502,
    );
  }

  return improved;
}

export async function improveReadmeWithOpenRouter(originalReadme: string) {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new OpenRouterRequestError("Missing OPENROUTER_API_KEY.", 500);
  }

  let lastError: OpenRouterRequestError | null = null;

  for (const model of getPreferredModels()) {
    try {
      return await requestReadmeImprovement(originalReadme, model, apiKey);
    } catch (error) {
      if (error instanceof OpenRouterRequestError) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ??
    new OpenRouterRequestError(
      "OpenRouter did not return an improved README.",
      502,
    )
  );
}
