export type ParsedGitHubRepo = {
  owner: string;
  repo: string;
};

type GitHubErrorPayload = {
  message?: string;
};

export class GitHubRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
  }
}

export function parseGitHubRepoUrl(repoUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(repoUrl);
  } catch {
    return null;
  }

  if (parsedUrl.hostname !== "github.com") {
    return null;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/, "");

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo } satisfies ParsedGitHubRepo;
}

type BuildGitHubHeadersOptions = {
  allowEnvFallback?: boolean;
};

export function buildGitHubHeaders(
  accessToken?: string,
  options: BuildGitHubHeadersOptions = {},
) {
  const { allowEnvFallback = true } = options;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "README-Auto-Doctor",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (allowEnvFallback && process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export async function getGitHubErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as GitHubErrorPayload;
    return data.message ?? "GitHub API request failed.";
  } catch {
    return "GitHub API request failed.";
  }
}

export async function throwGitHubRequestError(
  response: Response,
  fallbackMessage = "GitHub API request failed.",
) {
  const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
  const message = await getGitHubErrorMessage(response);

  if (rateLimitRemaining === "0" || /rate limit/i.test(message)) {
    throw new GitHubRequestError(
      "GitHub API rate limit reached. Please wait a bit and try again.",
      429,
    );
  }

  if (response.status === 401) {
    throw new GitHubRequestError(
      "Your GitHub session is no longer authorized. Please sign in again.",
      401,
    );
  }

  if (response.status === 403) {
    throw new GitHubRequestError(
      "Access to this repository is denied for the connected GitHub account.",
      403,
    );
  }

  if (response.status === 404) {
    throw new GitHubRequestError(
      "The repository or README could not be found, or access is denied.",
      404,
    );
  }

  throw new GitHubRequestError(message || fallbackMessage, response.status || 502);
}
