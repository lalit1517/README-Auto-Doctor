import {
  buildGitHubHeaders,
  formatRepoTitle,
  throwGitHubRequestError,
} from "@/lib/github";
import { detectProjectStack } from "@/lib/project-detection";

export type GitHubContentFile = {
  content?: string;
  encoding?: string;
  name?: string;
  type?: string;
};

export type BaseRepositoryContext = {
  detection: ReturnType<typeof detectProjectStack>;
  files: string[];
  packageJson: Record<string, unknown> | null;
  readme: string | null;
  requirementsTxt: string | null;
  repoName: string;
  repoTitle: string;
};

export class GitHubDecodeError extends Error {
  constructor(message = "GitHub content could not be decoded.") {
    super(message);
    this.name = "GitHubDecodeError";
  }
}

export class PackageJsonParseError extends Error {
  constructor(message = "package.json could not be parsed.") {
    super(message);
    this.name = "PackageJsonParseError";
  }
}

function decodeGitHubContentFile(file: GitHubContentFile) {
  if (
    (file.content === null || file.content === undefined) ||
    file.encoding !== "base64"
  ) {
    throw new GitHubDecodeError();
  }

  return Buffer.from(file.content, "base64").toString("utf-8");
}

function getRepositoryGitHubHeaders(accessToken: string | null) {
  return buildGitHubHeaders(accessToken ?? undefined, {
    allowEnvFallback: false,
  });
}

export async function fetchOptionalTextFile(
  owner: string,
  repo: string,
  path: string,
  accessToken: string | null,
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      headers: getRepositoryGitHubHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await throwGitHubRequestError(
      response,
      `Unable to fetch ${path} from GitHub.`,
    );
  }

  const data = (await response.json()) as GitHubContentFile;
  return decodeGitHubContentFile(data);
}

async function fetchReadme(owner: string, repo: string, accessToken: string | null) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: getRepositoryGitHubHeaders(accessToken),
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

async function fetchRootFiles(owner: string, repo: string, accessToken: string | null) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
    headers: getRepositoryGitHubHeaders(accessToken),
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

async function fetchPackageJson(owner: string, repo: string, accessToken: string | null) {
  const decodedPackageJson = await fetchOptionalTextFile(
    owner,
    repo,
    "package.json",
    accessToken,
  );

  if (!decodedPackageJson) {
    return null;
  }

  try {
    return JSON.parse(decodedPackageJson) as Record<string, unknown>;
  } catch {
    throw new PackageJsonParseError();
  }
}

export async function buildBaseRepositoryContext(
  owner: string,
  repo: string,
  accessToken: string | null,
): Promise<BaseRepositoryContext> {
  const [readme, files, packageJson, requirementsTxt] = await Promise.all([
    fetchReadme(owner, repo, accessToken),
    fetchRootFiles(owner, repo, accessToken),
    fetchPackageJson(owner, repo, accessToken),
    fetchOptionalTextFile(owner, repo, "requirements.txt", accessToken),
  ]);

  const detection = detectProjectStack({
    files,
    packageJson,
    requirementsTxt,
  });

  return {
    detection,
    files,
    packageJson,
    readme,
    requirementsTxt,
    repoName: repo,
    repoTitle: formatRepoTitle(repo),
  };
}
