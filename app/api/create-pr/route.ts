import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/auth";
import {
  GitHubRequestError,
  buildGitHubHeaders,
  getGitHubErrorMessage,
  parseGitHubRepoUrl,
  throwGitHubRequestError,
} from "@/lib/github";
import { generatePullRequestDraft } from "@/lib/ai";

const BRANCH_NAME = "readme-auto-fix";
const COMMIT_MESSAGE = "Improve README structure and onboarding docs";
const PR_TITLE = "Improve README structure and onboarding guidance";
const PR_BODY = `- improves the README structure for easier scanning and review
- adds clearer onboarding guidance for setup and usage
- updates the documentation to better reflect the repository context`;

type CreatePrPayload = {
  repoUrl?: string;
  improvedReadme?: string;
};

type GitHubRepoResponse = {
  default_branch: string;
};

type GitHubRefResponse = {
  object?: {
    sha?: string;
  };
};

type GitHubReadmeResponse = {
  content?: string;
  encoding?: string;
  path?: string;
  sha?: string;
};

type GitHubPullRequestResponse = {
  html_url?: string;
};

async function createBranchIfNeeded(
  owner: string,
  repo: string,
  baseSha: string,
  accessToken: string,
) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildGitHubHeaders(accessToken),
    },
    body: JSON.stringify({
      ref: `refs/heads/${BRANCH_NAME}`,
      sha: baseSha,
    }),
    cache: "no-store",
  });

  if (response.ok) {
    return;
  }

  if (response.status === 422) {
    const message = await getGitHubErrorMessage(response);

    if (message.includes("Reference already exists")) {
      return;
    }

    throw new Error(message);
  }

  await throwGitHubRequestError(response, "Unable to create the Git branch on GitHub.");
}

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function getExistingOpenPullRequestUrl(
  owner: string,
  repo: string,
  defaultBranch: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    state: "open",
    head: `${owner}:${BRANCH_NAME}`,
    base: defaultBranch,
  });

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?${params.toString()}`,
    {
      headers: buildGitHubHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const pullRequests = (await response.json()) as GitHubPullRequestResponse[];
  const existingPullRequest = pullRequests[0];

  return existingPullRequest?.html_url ?? null;
}

export async function POST(request: Request) {
  let body: CreatePrPayload;

  try {
    body = (await request.json()) as CreatePrPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const repoUrl = body.repoUrl?.trim();
  const improvedReadme = body.improvedReadme?.trim();

  if (!repoUrl) {
    return NextResponse.json(
      { error: "A GitHub repository URL is required." },
      { status: 400 },
    );
  }

  if (!improvedReadme) {
    return NextResponse.json(
      { error: "Improved README content is required." },
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

  const accessToken = await getGitHubToken();

  if (!accessToken) {
    return NextResponse.json(
      { error: "You must be logged in with GitHub before creating a pull request." },
      { status: 401 },
    );
  }

  const { owner, repo } = parsedRepo;

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: buildGitHubHeaders(accessToken),
      cache: "no-store",
    });

    if (!repoResponse.ok) {
      await throwGitHubRequestError(
        repoResponse,
        "Unable to load repository details from GitHub.",
      );
    }

    const repoData = (await repoResponse.json()) as GitHubRepoResponse;
    const defaultBranch = repoData.default_branch;

    if (!defaultBranch) {
      throw new Error("Could not determine the default branch.");
    }

    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`,
      {
        headers: buildGitHubHeaders(accessToken),
        cache: "no-store",
      },
    );

    if (!refResponse.ok) {
      await throwGitHubRequestError(
        refResponse,
        "Unable to load the default branch reference from GitHub.",
      );
    }

    const refData = (await refResponse.json()) as GitHubRefResponse;
    const baseSha = refData.object?.sha;

    if (!baseSha) {
      throw new Error("Could not determine the default branch SHA.");
    }

    await createBranchIfNeeded(owner, repo, baseSha, accessToken);

    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme?ref=${encodeURIComponent(BRANCH_NAME)}`,
      {
        headers: buildGitHubHeaders(accessToken),
        cache: "no-store",
      },
    );

    if (!readmeResponse.ok) {
      await throwGitHubRequestError(
        readmeResponse,
        "Unable to load the repository README from GitHub.",
      );
    }

    const readmeData = (await readmeResponse.json()) as GitHubReadmeResponse;
    const originalReadme =
      readmeData.content && readmeData.encoding === "base64"
        ? Buffer.from(readmeData.content.replace(/\n/g, ""), "base64").toString("utf-8")
        : "";
    const readmePath = readmeData.path;
    const readmeSha = readmeData.sha;

    if (!readmePath || !readmeSha) {
      throw new Error("Could not determine the README path or SHA.");
    }

    const pullRequestDraft = await generatePullRequestDraft(
      originalReadme,
      improvedReadme,
    ).catch(() => ({
      commitMessage: COMMIT_MESSAGE,
      prTitle: PR_TITLE,
      prDescription: PR_BODY,
    }));

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(readmePath)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...buildGitHubHeaders(accessToken),
        },
        body: JSON.stringify({
          message: pullRequestDraft.commitMessage,
          content: Buffer.from(improvedReadme, "utf-8").toString("base64"),
          sha: readmeSha,
          branch: BRANCH_NAME,
        }),
        cache: "no-store",
      },
    );

    if (!updateResponse.ok) {
      await throwGitHubRequestError(
        updateResponse,
        "Unable to update the README on the new branch.",
      );
    }

    const pullRequestResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildGitHubHeaders(accessToken),
        },
        body: JSON.stringify({
          title: pullRequestDraft.prTitle,
          body: pullRequestDraft.prDescription,
          head: BRANCH_NAME,
          base: defaultBranch,
        }),
        cache: "no-store",
      },
    );

    if (!pullRequestResponse.ok) {
      const existingPullRequestUrl = await getExistingOpenPullRequestUrl(
        owner,
        repo,
        defaultBranch,
        accessToken,
      );

      if (existingPullRequestUrl) {
        return NextResponse.json({ prUrl: existingPullRequestUrl });
      }

      await throwGitHubRequestError(
        pullRequestResponse,
        "Unable to create the pull request on GitHub.",
      );
    }

    const pullRequest = (await pullRequestResponse.json()) as GitHubPullRequestResponse;

    if (!pullRequest.html_url) {
      throw new Error("GitHub did not return a pull request URL.");
    }

    return NextResponse.json({ prUrl: pullRequest.html_url });
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create a pull request right now.",
      },
      { status: 502 },
    );
  }
}
