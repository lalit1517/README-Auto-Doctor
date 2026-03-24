import { NextResponse } from "next/server";
import {
  GitHubRequestError,
  buildGitHubHeaders,
  parseGitHubRepoUrl,
  throwGitHubRequestError,
} from "@/lib/github";
import {
  OpenRouterRequestError,
  generateReadmeFromRepositoryContext,
} from "@/lib/openrouter";

type AnalyzePayload = {
  repoUrl?: string;
};

type GitHubContentFile = {
  content?: string;
  encoding?: string;
  name?: string;
  type?: string;
};

type RepositoryContext = {
  files: string[];
  packageJson: Record<string, unknown> | null;
  readme: string | null;
};

class GitHubDecodeError extends Error {
  constructor(message = "GitHub content could not be decoded.") {
    super(message);
    this.name = "GitHubDecodeError";
  }
}

class PackageJsonParseError extends Error {
  constructor(message = "package.json could not be parsed.") {
    super(message);
    this.name = "PackageJsonParseError";
  }
}

function decodeGitHubContentFile(file: GitHubContentFile) {
  if (!file.content || file.encoding !== "base64") {
    throw new GitHubDecodeError();
  }

  return Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf-8");
}

async function fetchReadme(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: buildGitHubHeaders(),
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await throwGitHubRequestError(
      response,
      "Unable to fetch the repository README from GitHub.",
    );
  }

  const data = (await response.json()) as GitHubContentFile;
  return decodeGitHubContentFile(data);
}

async function fetchRootFiles(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
    headers: buildGitHubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    await throwGitHubRequestError(
      response,
      "Unable to fetch the repository file structure from GitHub.",
    );
  }

  const data = (await response.json()) as GitHubContentFile[];

  return data
    .map((item) => {
      if (!item.name) {
        return null;
      }

      return item.type === "dir" ? `${item.name}/` : item.name;
    })
    .filter((item): item is string => Boolean(item));
}

async function fetchPackageJson(owner: string, repo: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    {
      headers: buildGitHubHeaders(),
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await throwGitHubRequestError(
      response,
      "Unable to fetch package.json from GitHub.",
    );
  }

  const data = (await response.json()) as GitHubContentFile;
  const decodedPackageJson = decodeGitHubContentFile(data);

  try {
    return JSON.parse(decodedPackageJson) as Record<string, unknown>;
  } catch {
    throw new PackageJsonParseError();
  }
}

async function buildRepositoryContext(owner: string, repo: string): Promise<RepositoryContext> {
  const [readme, files, packageJson] = await Promise.all([
    fetchReadme(owner, repo),
    fetchRootFiles(owner, repo),
    fetchPackageJson(owner, repo),
  ]);

  return {
    readme,
    files,
    packageJson,
  };
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
    const context = await buildRepositoryContext(owner, repo);
    const improved = await generateReadmeFromRepositoryContext(context);

    return NextResponse.json({
      improved,
      original: context.readme,
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
