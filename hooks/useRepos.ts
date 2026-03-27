"use client";

import { useCallback, useState } from "react";
import type {
  FetchReposResult,
  GitHubRepo,
  RepoSelectionMode,
  ReposResponse,
  SessionStatus,
} from "@/types/readme-doctor";

function buildSidebarRepos(
  repos: GitHubRepo[],
  mode: RepoSelectionMode | null,
  selectedRepoIds: Set<string>,
) {
  switch (mode) {
    case "public":
      return repos.filter((repo) => !repo.isPrivate);
    case "private":
      return repos.filter((repo) => repo.isPrivate);
    case "specific":
      return repos.filter((repo) => selectedRepoIds.has(repo.fullName));
    case "all":
    default:
      return repos;
  }
}

export function useRepos(status: SessionStatus) {
  const [allFetchedRepos, setAllFetchedRepos] = useState<GitHubRepo[]>([]);
  const [sidebarRepos, setSidebarRepos] = useState<GitHubRepo[]>([]);
  const [sidebarMode, setSidebarMode] = useState<RepoSelectionMode | null>(null);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string>>(new Set());
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectionComplete, setSelectionComplete] = useState(false);

  const fetchReposWithVisibility = useCallback(
    async (
      visibility: "all" | "public" | "private" = "all",
    ): Promise<FetchReposResult> => {
      setIsLoadingRepos(true);
      setReposError("");

      try {
        const params = visibility !== "all" ? `?visibility=${visibility}` : "";
        const response = await fetch(`/api/repos${params}`);
        const data = (await response.json()) as ReposResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to fetch repositories.");
        }

        const repos = data.repos ?? [];
        setAllFetchedRepos(repos);
        return { repos, success: true };
      } catch (err) {
        setReposError(
          err instanceof Error ? err.message : "Failed to fetch repositories.",
        );
        return { success: false };
      } finally {
        setIsLoadingRepos(false);
      }
    },
    [],
  );

  const confirmSelection = useCallback(
    async (mode: RepoSelectionMode, specificIds?: Set<string>) => {
      if (mode === "specific") {
        // allFetchedRepos should already be loaded by the modal
        const nextSelectedRepoIds = new Set(specificIds ?? []);
        const filtered = buildSidebarRepos(
          allFetchedRepos,
          mode,
          nextSelectedRepoIds,
        );
        setSidebarMode(mode);
        setSelectedRepoIds(nextSelectedRepoIds);
        setSidebarRepos(filtered);
        setSelectionComplete(true);
      } else {
        // Fetch with the right visibility filter
        const visibility =
          mode === "public" || mode === "private" ? mode : "all";
        const result = await fetchReposWithVisibility(visibility);
        if (!result.success) {
          return;
        }

        setSidebarMode(mode);
        setSelectedRepoIds(new Set());
        setSidebarRepos(result.repos);
        setSelectionComplete(true);
      }
    },
    [allFetchedRepos, fetchReposWithVisibility],
  );

  const refreshRepos = useCallback(async () => {
    if (!selectionComplete) return;
    // Re-fetch with same repos that are currently in the sidebar
    setIsLoadingRepos(true);
    setReposError("");

    try {
      const response = await fetch("/api/repos");
      const data = (await response.json()) as ReposResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to fetch repositories.");
      }

      const freshRepos = data.repos ?? [];
      setAllFetchedRepos(freshRepos);
      setSidebarRepos(buildSidebarRepos(freshRepos, sidebarMode, selectedRepoIds));
    } catch (err) {
      setReposError(
        err instanceof Error ? err.message : "Failed to fetch repositories.",
      );
    } finally {
      setIsLoadingRepos(false);
    }
  }, [selectionComplete, selectedRepoIds, sidebarMode]);

  function selectRepo(repo: GitHubRepo) {
    setSelectedRepo(repo);
    if (!selectedRepos.has(repo.fullName)) {
      setSelectedRepos((prev) => new Set(prev).add(repo.fullName));
    }
  }

  function clearSelectedRepo() {
    setSelectedRepo(null);
  }

  const showSelectionModal =
    status === "authenticated" && !selectionComplete;

  return {
    activeRepo: selectedRepo,
    allFetchedRepos,
    clearSelectedRepo,
    confirmSelection,
    fetchReposWithVisibility,
    isLoadingRepos,
    refreshRepos,
    repos: sidebarRepos,
    reposError,
    selectedRepo,
    selectRepo,
    selectedRepos,
    selectionComplete,
    setActiveRepo: setSelectedRepo,
    showSelectionModal,
  };
}
