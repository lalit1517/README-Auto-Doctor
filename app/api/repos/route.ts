import { type NextRequest, NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/auth";

type GitHubRepo = {
  full_name: string;
  html_url: string;
  name: string;
  private: boolean;
};

export async function GET(request: NextRequest) {
  const token = await getGitHubToken();

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in with GitHub." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const visibility = searchParams.get("visibility"); // "all" | "public" | "private"

  try {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    // Build GitHub API URL with optional visibility filter
    const baseUrl = "https://api.github.com/user/repos";
    const params = new URLSearchParams({
      per_page: String(perPage),
      sort: "updated",
      direction: "desc",
    });
    if (visibility === "public" || visibility === "private") {
      params.set("visibility", visibility);
    }

    // Paginate through all repos
    while (true) {
      params.set("page", String(page));

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `GitHub API error: ${errorText}` },
          { status: response.status },
        );
      }

      const batch = (await response.json()) as GitHubRepo[];
      repos.push(...batch);

      if (batch.length < perPage) break;
      page++;
    }

    const mapped = repos.map((repo) => ({
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      name: repo.name,
      isPrivate: repo.private,
    }));

    return NextResponse.json({ repos: mapped });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repositories from GitHub." },
      { status: 500 },
    );
  }
}
