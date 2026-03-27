"use client";

import { useCallback, useState } from "react";
import type {
  GitHubRepo,
  RepoSelectionMode,
  ReposResponse,
  SessionStatus,
} from "@/types/readme-doctor";

export function useRepos(status: SessionStatus) {
  const [allFetchedRepos, setAllFetchedRepos] = useState<GitHubRepo[]>([]);
  const [sidebarRepos, setSidebarRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectionComplete, setSelectionComplete] = useState(false);

  const fetchReposWithVisibility = useCallback(
    async (visibility: "all" | "public" | "private" = "all") => {
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
        return repos;
      } catch (err) {
        setReposError(
          err instanceof Error ? err.message : "Failed to fetch repositories.",
        );
        return [];
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
        const filtered = allFetchedRepos.filter((r) =>
          specificIds?.has(r.fullName),
        );
        setSidebarRepos(filtered);
        setSelectionComplete(true);
      } else {
        // Fetch with the right visibility filter
        const visibility =
          mode === "public" || mode === "private" ? mode : "all";
        const repos = await fetchReposWithVisibility(visibility);
        setSidebarRepos(repos);
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

      // Keep only repos whose fullNames are in the current sidebar set
      const currentNames = new Set(sidebarRepos.map((r) => r.fullName));
      const updatedSidebar = freshRepos.filter((r) =>
        currentNames.has(r.fullName),
      );

      // If sidebar had all repos (no specific filter), show all fresh repos
      if (updatedSidebar.length === 0 && sidebarRepos.length > 0) {
        setSidebarRepos(freshRepos);
      } else {
        setSidebarRepos(
          updatedSidebar.length > 0 ? updatedSidebar : freshRepos,
        );
      }
    } catch (err) {
      setReposError(
        err instanceof Error ? err.message : "Failed to fetch repositories.",
      );
    } finally {
      setIsLoadingRepos(false);
    }
  }, [selectionComplete, sidebarRepos]);

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
