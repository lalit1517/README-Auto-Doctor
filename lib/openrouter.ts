const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-chat";
const FALLBACK_OPENROUTER_MODEL = "deepseek/deepseek-r1:free";

type RepositoryReadmeContext = {
  files: string[];
  packageJson: Record<string, unknown> | null;
  readme: string;
};

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

function buildMessages(context: RepositoryReadmeContext): OpenRouterMessage[] {
  return [
    {
      role: "system",
      content: `You are a senior developer and technical writer.

Your task is to generate a high-quality GitHub README based on:

- existing README (if any)
- project structure
- dependencies
- scripts

Rules:

- Output must be clean markdown
- Use markdown headings like # and ##
- Use proper sections:
  - Project Title
  - Description
  - Features (bullet points)
  - Tech Stack
  - Installation
  - Usage
  - Scripts
  - Folder Structure
- Use bullet points wherever appropriate
- Use fenced code blocks with triple backticks for commands like:
  npm install
  npm run dev
- Include install and usage commands only when they are supported by the project context
- Infer project purpose intelligently
- Do NOT hallucinate unknown features
- Keep it professional and concise`,
    },
    {
      role: "user",
      content: `Generate a complete README for this project:

README:
${context.readme || "(No existing README found)"}

FILES:
${JSON.stringify(context.files, null, 2)}

PACKAGE.JSON:
${JSON.stringify(context.packageJson, null, 2)}`,
    },
  ];
}

async function requestReadmeGeneration(
  context: RepositoryReadmeContext,
  model: string,
  apiKey: string,
) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(context),
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

export async function generateReadmeFromRepositoryContext(
  context: RepositoryReadmeContext,
) {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new OpenRouterRequestError("Missing OPENROUTER_API_KEY.", 500);
  }

  let lastError: OpenRouterRequestError | null = null;

  for (const model of getPreferredModels()) {
    try {
      return await requestReadmeGeneration(context, model, apiKey);
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
      "OpenRouter did not return a generated README.",
      502,
    )
  );
}
