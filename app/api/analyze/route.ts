import { NextResponse } from "next/server";
import {
  GitHubRequestError,
  buildGitHubHeaders,
  parseGitHubRepoUrl,
  throwGitHubRequestError,
} from "@/lib/github";
import {
  OpenRouterRequestError,
  improveReadmeWithOpenRouter,
} from "@/lib/openrouter";

type AnalyzePayload = {
  repoUrl?: string;
};

async function repoExists(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: buildGitHubHeaders(),
    cache: "no-store",
  });

  return response.ok;
}

export async function POST(request: Request) {
  let body: AnalyzePayload;

  try {
    body = (await request.json()) as AnalyzePayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const repoUrl = body.repoUrl?.trim();

  if (!repoUrl) {
    return NextResponse.json(
      { error: "A GitHub repository URL is required." },
      { status: 400 },
    );
  }

  const parsedRepo = parseGitHubRepoUrl(repoUrl);

  if (!parsedRepo) {
    return NextResponse.json(
      { error: "Invalid GitHub repository URL." },
      { status: 400 },
    );
  }

  const { owner, repo } = parsedRepo;

  try {
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: buildGitHubHeaders(),
        cache: "no-store",
      },
    );

    if (readmeResponse.status === 404) {
      const exists = await repoExists(owner, repo);

      return NextResponse.json(
        { error: exists ? "No README found for this repository." : "Invalid repository." },
        { status: 404 },
      );
    }

    if (!readmeResponse.ok) {
      await throwGitHubRequestError(
        readmeResponse,
        "Unable to fetch the repository README from GitHub.",
      );
    }

    const data = (await readmeResponse.json()) as {
      content?: string;
      encoding?: string;
    };

    if (!data.content || data.encoding !== "base64") {
      return NextResponse.json(
        { error: "README content could not be decoded." },
        { status: 500 },
      );
    }

    const normalizedContent = data.content.replace(/\n/g, "");
    const original = Buffer.from(normalizedContent, "base64").toString("utf-8");
    const improved = await improveReadmeWithOpenRouter(original);

    return NextResponse.json({ original, improved });
  } catch (error) {
    if (
      error instanceof OpenRouterRequestError &&
      error.message === "Missing OPENROUTER_API_KEY."
    ) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing. Add it to your .env.local file." },
        { status: 500 },
      );
    }

    if (error instanceof GitHubRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof OpenRouterRequestError) {
      return NextResponse.json(
        { error: error.message || "OpenRouter could not improve the README." },
        { status: error.status || 502 },
      );
    }

    return NextResponse.json(
      { error: "Unable to fetch or improve the README right now." },
      { status: 502 },
    );
  }
}
