"use client";

import { useState } from "react";
import type { SessionStatus, ViewMode } from "@/types/readme-doctor";

export const emptyOriginalMarkdown = `# Original README

Paste a GitHub repository URL and click **Analyze README** to fetch the current repository README.
`;

export const emptyImprovedMarkdown = `# Improved README

Your improved README will appear here after analysis completes.
`;

export function useReadmeState(status: SessionStatus) {
  const [repoUrl, setRepoUrl] = useState("");
  const [analyzedRepoUrl, setAnalyzedRepoUrl] = useState("");
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
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  const hasImprovedReadme = improvedReadme !== emptyImprovedMarkdown;
  const hasReadmeComparison =
    originalReadme !== emptyOriginalMarkdown && hasImprovedReadme;
  const canAnalyze = Boolean(repoUrl.trim()) && !isLoading && !isCreatingPr;
  const canCreatePr =
    Boolean(analyzedRepoUrl.trim()) &&
    hasImprovedReadme &&
    !isLoading &&
    !isCreatingPr &&
    status === "authenticated";
  const canCopyReadme = hasImprovedReadme && !isLoading && !isCreatingPr && !isCopying;
  function clearMessages() {
    setError("");
    setPrError("");
    setPrUrl("");
  }

  function resetAnalysisMeta() {
    setIssues([]);
    setScore(null);
    setSuggestions([]);
  }

  function handleRepoUrlChange(value: string) {
    setRepoUrl(value);
    clearMessages();
    resetAnalysisMeta();
  }

  return {
    analyzedRepoUrl,
    canAnalyze,
    canCopyReadme,
    canCreatePr,
    clearMessages,
    error,
    handleRepoUrlChange,
    hasImprovedReadme,
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
    resetAnalysisMeta,
    score,
    setError,
    setAnalyzedRepoUrl,
    setImprovedReadme,
    setIsCopying,
    setIsCreatingPr,
    setIsLoading,
    setIssues,
    setOriginalReadme,
    setPrError,
    setPrUrl,
    setScore,
    setSuggestions,
    setRepoUrl,
    setViewMode,
    suggestions,
    viewMode,
  };
}
