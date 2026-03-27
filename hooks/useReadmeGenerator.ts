"use client";

import { useEffect } from "react";
import type { FormEvent } from "react";
import type {
  AnalyzeResponse,
  CreatePrResponse,
  SessionStatus,
} from "@/types/readme-doctor";
import {
  emptyOriginalMarkdown,
  emptyImprovedMarkdown,
  useReadmeState,
} from "./useReadmeState";
import { useToasts } from "./useToasts";

function getApiErrorMessage(status: number, fallback: string) {
  if (status === 401) {
    return "Your GitHub session has expired or is unauthorized. Please sign in again.";
  }

  if (status === 403) {
    return "Repository access is denied for the connected GitHub account.";
  }

  if (status === 429) {
    return "GitHub API rate limit reached. Please wait a moment and try again.";
  }

  return fallback;
}

export function useReadmeGenerator(
  status: SessionStatus,
  selectedRepoUrl?: string | null,
) {
  const state = useReadmeState(status);
  const { dismissToast, pushToast, toasts } = useToasts();
  const resolvedSelectedRepoUrl = selectedRepoUrl?.trim() ?? "";
  const resolvedAnalyzeTarget = resolvedSelectedRepoUrl || state.repoUrl.trim();
  const canAnalyze =
    Boolean(resolvedAnalyzeTarget) && !state.isLoading && !state.isCreatingPr;

  // When the selected repo changes, ensure analysis state is cleared if it
  // doesn't match the newly selected repo. This prevents stale analysis from
  // persisting when the user selects a different repository.
  useEffect(() => {
    // If there's no selected repo URL, do nothing here — users may be typing
    // a URL in the input instead.
    if (!resolvedSelectedRepoUrl) return;

    // If the currently analyzed repo differs from the newly selected repo,
    // clear analysis-related state so the UI reflects the new selection.
    if (resolvedSelectedRepoUrl !== state.analyzedRepoUrl) {
      state.setAnalyzedRepoUrl("");
      state.setOriginalReadme(emptyOriginalMarkdown);
      state.setImprovedReadme(emptyImprovedMarkdown);
      state.resetAnalysisMeta();
      state.clearMessages();
    }
  }, [resolvedSelectedRepoUrl, state.analyzedRepoUrl]);

  async function analyzeUrl(url: string) {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      const message = "Enter a GitHub repository URL first.";
      state.setError(message);
      pushToast({ kind: "error", message });
      return;
    }

    state.setIsLoading(true);
    state.clearMessages();
    state.resetAnalysisMeta();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: normalizedUrl }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            response.status,
            data.error ?? "We could not analyze that repository.",
          ),
        );
      }

      state.setOriginalReadme(data.original ?? "# Original README unavailable");
      state.setImprovedReadme(data.improved ?? "# Improved README unavailable");
      state.setAnalyzedRepoUrl(normalizedUrl);
      state.setScore(typeof data.score === "number" ? data.score : null);
      state.setIssues(Array.isArray(data.issues) ? data.issues : []);
      state.setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      pushToast({
        kind: "success",
        message: "README analysis complete. Your improved version is ready.",
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while analyzing the README.";

      state.setError(message);
      pushToast({ kind: "error", message });
    } finally {
      state.setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await analyzeUrl(resolvedAnalyzeTarget);
  }

  async function handleCreatePullRequest() {
    if (!state.analyzedRepoUrl.trim()) {
      const message = "Enter a GitHub repository URL first.";
      state.setPrError(message);
      pushToast({ kind: "error", message });
      return;
    }

    if (state.improvedReadme === emptyImprovedMarkdown) {
      const message = "Analyze a repository before creating a pull request.";
      state.setPrError(message);
      pushToast({ kind: "error", message });
      return;
    }

    state.setIsCreatingPr(true);
    state.setPrError("");
    state.setPrUrl("");

    try {
      const response = await fetch("/api/create-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: state.analyzedRepoUrl,
          improvedReadme: state.improvedReadme,
        }),
      });

      const data = (await response.json()) as CreatePrResponse;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            response.status,
            data.error ?? "We could not create the pull request.",
          ),
        );
      }

      if (!data.prUrl) {
        throw new Error("The pull request was created, but no URL was returned.");
      }

      state.setPrUrl(data.prUrl);
      pushToast({
        kind: "success",
        message: "Pull request is ready on GitHub.",
        actionHref: data.prUrl,
        actionLabel: "Open PR",
      });
    } catch (createPrError) {
      const message =
        createPrError instanceof Error
          ? createPrError.message
          : "Something went wrong while creating the pull request.";

      state.setPrError(message);
      pushToast({ kind: "error", message });
    } finally {
      state.setIsCreatingPr(false);
    }
  }

  async function handleCopyReadme() {
    if (state.improvedReadme === emptyImprovedMarkdown) {
      pushToast({
        kind: "error",
        message: "Generate an improved README before copying it.",
      });
      return;
    }

    if (!navigator.clipboard) {
      pushToast({
        kind: "error",
        message: "Clipboard access is unavailable in this browser.",
      });
      return;
    }

    state.setIsCopying(true);

    try {
      await navigator.clipboard.writeText(state.improvedReadme);
      pushToast({
        kind: "success",
        message: "Improved README copied to your clipboard.",
      });
    } catch {
      pushToast({
        kind: "error",
        message: "We could not copy the README to your clipboard.",
      });
    } finally {
      state.setIsCopying(false);
    }
  }

  return {
    ...state,
    analyzeUrl,
    canAnalyze,
    dismissToast,
    handleCopyReadme,
    handleCreatePullRequest,
    handleSubmit,
    toasts,
  };
}
