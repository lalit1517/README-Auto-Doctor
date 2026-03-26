"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type {
  AnalyzeResponse,
  CreatePrResponse,
  SessionStatus,
  Toast,
  ViewMode,
} from "./types";

const emptyOriginalMarkdown = `# Original README

Paste a GitHub repository URL and click **Analyze README** to fetch the current repository README.
`;

const emptyImprovedMarkdown = `# Improved README

Your improved README will appear here after analysis completes.
`;

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

export function useReadmeGenerator(status: SessionStatus) {
  const [repoUrl, setRepoUrl] = useState("");
  const [originalReadme, setOriginalReadme] = useState(emptyOriginalMarkdown);
  const [improvedReadme, setImprovedReadme] = useState(emptyImprovedMarkdown);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState("");
  const [prError, setPrError] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const toastTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timeoutId of toastTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  function dismissToast(id: number) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }

  function pushToast(toast: Omit<Toast, "id">) {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);

    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
      toastTimeoutsRef.current = toastTimeoutsRef.current.filter(
        (activeTimeoutId) => activeTimeoutId !== timeoutId,
      );
    }, 4500);

    toastTimeoutsRef.current.push(timeoutId);
  }

  function handleRepoUrlChange(value: string) {
    setRepoUrl(value);
    setError("");
    setPrError("");
    setPrUrl("");
    setIssues([]);
    setScore(null);
    setSuggestions([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!repoUrl.trim()) {
      const message = "Enter a GitHub repository URL first.";
      setError(message);
      pushToast({ kind: "error", message });
      return;
    }

    setIsLoading(true);
    setError("");
    setPrError("");
    setPrUrl("");
    setIssues([]);
    setScore(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
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

      setOriginalReadme(data.original ?? "# Original README unavailable");
      setImprovedReadme(data.improved ?? "# Improved README unavailable");
      setScore(typeof data.score === "number" ? data.score : null);
      setIssues(Array.isArray(data.issues) ? data.issues : []);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      pushToast({
        kind: "success",
        message: "README analysis complete. Your improved version is ready.",
      });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while analyzing the README.";

      setError(message);
      pushToast({ kind: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePullRequest() {
    if (!repoUrl.trim()) {
      const message = "Enter a GitHub repository URL first.";
      setPrError(message);
      pushToast({ kind: "error", message });
      return;
    }

    if (improvedReadme === emptyImprovedMarkdown) {
      const message = "Analyze a repository before creating a pull request.";
      setPrError(message);
      pushToast({ kind: "error", message });
      return;
    }

    setIsCreatingPr(true);
    setPrError("");
    setPrUrl("");

    try {
      const response = await fetch("/api/create-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          improvedReadme,
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

      setPrUrl(data.prUrl);
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

      setPrError(message);
      pushToast({ kind: "error", message });
    } finally {
      setIsCreatingPr(false);
    }
  }

  async function handleCopyReadme() {
    if (improvedReadme === emptyImprovedMarkdown) {
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

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(improvedReadme);
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
      setIsCopying(false);
    }
  }

  const hasImprovedReadme = improvedReadme !== emptyImprovedMarkdown;
  const hasReadmeComparison =
    originalReadme !== emptyOriginalMarkdown && hasImprovedReadme;
  const canAnalyze = Boolean(repoUrl.trim()) && !isLoading && !isCreatingPr;
  const canCreatePr =
    Boolean(repoUrl.trim()) &&
    hasImprovedReadme &&
    !isLoading &&
    !isCreatingPr &&
    status === "authenticated";
  const canCopyReadme = hasImprovedReadme && !isLoading && !isCreatingPr && !isCopying;

  const activityMessage = isLoading
    ? "Fetching the original README and drafting a stronger rewrite..."
    : isCreatingPr
      ? "Creating a GitHub branch, committing the README update, and opening a pull request..."
      : status !== "authenticated"
        ? "Sign in with GitHub to create a pull request once the README looks right."
        : "Preview shows both versions side by side. Diff highlights the exact edits.";

  return {
    activityMessage,
    canAnalyze,
    canCopyReadme,
    canCreatePr,
    dismissToast,
    error,
    handleCopyReadme,
    handleCreatePullRequest,
    handleRepoUrlChange,
    handleSubmit,
    hasReadmeComparison,
    improvedReadme,
    isCopying,
    isCreatingPr,
    isLoading,
    issues,
    originalReadme,
    prError,
    prUrl,
    repoUrl,
    score,
    setViewMode,
    suggestions,
    toasts,
    viewMode,
  };
}
