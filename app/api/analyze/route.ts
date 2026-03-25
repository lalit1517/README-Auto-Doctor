import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/auth";
import { GitHubRequestError, parseGitHubRepoUrl } from "@/lib/github";
import {
  OpenRouterRequestError,
  evaluateReadmeWithOpenRouter,
  explainFolderStructureWithOpenRouter,
  generateReadmeFromRepositoryContext,
  summarizeCodebaseWithOpenRouter,
} from "@/lib/openrouter";
import {
  BaseRepositoryContext,
  GitHubDecodeError,
  PackageJsonParseError,
  buildBaseRepositoryContext,
} from "@/lib/repository-context";

type AnalyzePayload = {
  repoUrl?: string;
};

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
    const accessToken = await getGitHubToken();
    const baseContext = await buildBaseRepositoryContext(owner, repo, accessToken);
    const [folderResult, summaryResult] = await Promise.all([
      baseContext.files.length > 0
        ? explainFolderStructureWithOpenRouter(baseContext.files)
        : Promise.resolve({
            structureExplanation: "- No root-level folders or files were detected.",
          }),
      summarizeCodebaseWithOpenRouter(baseContext),
    ]);
    const context: BaseRepositoryContext & {
      architectureSummary: string;
      structureExplanation: string;
    } = {
      ...baseContext,
      architectureSummary: summaryResult.summary,
      structureExplanation: folderResult.structureExplanation,
    };
    const [improved, evaluation] = await Promise.all([
      generateReadmeFromRepositoryContext(context),
      context.readme
        ? evaluateReadmeWithOpenRouter(context.readme)
        : Promise.resolve({
            score: 0,
            issues: ["No existing README found."],
            suggestions: [
              "Add an initial README with project overview, setup steps, and usage details.",
            ],
          }),
    ]);

    return NextResponse.json({
      improved,
      issues: evaluation.issues,
      original: context.readme,
      score: evaluation.score,
      summary: context.architectureSummary,
      structureExplanation: context.structureExplanation,
      suggestions: evaluation.suggestions,
    });
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
        { error: error.message || "OpenRouter could not generate the README." },
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
      { error: "Unable to analyze the repository right now." },
      { status: 502 },
    );
  }
}
