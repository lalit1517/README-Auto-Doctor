import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/auth";
import { GitHubRequestError, parseGitHubRepoUrl } from "@/lib/github";
import {
  OpenRouterRequestError,
  explainProjectWithOpenRouter,
} from "@/lib/openrouter";
import {
  GitHubDecodeError,
  PackageJsonParseError,
  buildBaseRepositoryContext,
} from "@/lib/repository-context";
import type { BaseRepositoryContext } from "@/lib/repository-context";

type ExplainPayload = {
  files?: string[];
  packageJson?: Record<string, unknown> | null;
  readme?: string | null;
  repoUrl?: string;
  requirementsTxt?: string | null;
};

async function resolveContext(body: ExplainPayload) {
  if (body.repoUrl?.trim()) {
    const parsedRepo = parseGitHubRepoUrl(body.repoUrl.trim());

    if (!parsedRepo) {
      throw new Error("Invalid GitHub repository URL.");
    }

    const accessToken = await getGitHubToken();
    return buildBaseRepositoryContext(parsedRepo.owner, parsedRepo.repo, accessToken);
  }

  if (Array.isArray(body.files)) {
    return {
      detection: {
        framework: "Unclear",
        techStack: [],
        confidence: "low" as const,
      },
      files: body.files,
      packageJson: body.packageJson ?? null,
      readme: body.readme ?? null,
      requirementsTxt: body.requirementsTxt ?? null,
    } satisfies BaseRepositoryContext;
  }

  throw new Error("A GitHub repository URL is required.");
}

export async function POST(request: Request) {
  let body: ExplainPayload;

  try {
    body = (await request.json()) as ExplainPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  try {
    const context = await resolveContext(body);
    const explanation = await explainProjectWithOpenRouter(context);

    return NextResponse.json(explanation);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A GitHub repository URL is required."
    ) {
      return NextResponse.json(
        { error: "A GitHub repository URL is required." },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "Invalid GitHub repository URL."
    ) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL." },
        { status: 400 },
      );
    }

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
        { error: error.message || "OpenRouter could not explain the project." },
        { status: error.status || 502 },
      );
    }

    if (error instanceof GitHubDecodeError) {
      return NextResponse.json(
        { error: "GitHub content could not be decoded." },
        { status: 500 },
      );
    }

    if (error instanceof PackageJsonParseError) {
      return NextResponse.json(
        { error: "package.json could not be parsed." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Unable to explain the project right now." },
      { status: 502 },
    );
  }
}
