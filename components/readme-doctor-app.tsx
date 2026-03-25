"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import ReactDiffViewer from "react-diff-viewer-continued";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AnalyzeResponse = {
  issues?: string[];
  original?: string | null;
  improved?: string;
  score?: number;
  structureExplanation?: string;
  suggestions?: string[];
  error?: string;
};

type CreatePrResponse = {
  prUrl?: string;
  error?: string;
};

type ExplainResponse = {
  error?: string;
  explanation?: string;
};

type Toast = {
  actionHref?: string;
  actionLabel?: string;
  id: number;
  kind: "error" | "success";
  message: string;
};

type ViewMode = "preview" | "diff";

const markdownRemarkPlugins = [remarkGfm];
const markdownRehypePlugins = [rehypeHighlight];
const markdownPreviewClassName =
  "prose prose-invert prose-slate max-w-none overflow-x-auto p-6 prose-headings:text-white prose-p:text-slate-200 prose-strong:text-white prose-a:text-mint prose-code:text-sky-200 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950/80 prose-blockquote:text-slate-300 prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-slate-400 prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2";

const emptyOriginalMarkdown = `# Original README

Paste a GitHub repository URL and click **Analyze README** to fetch the current repository README.
`;

const emptyImprovedMarkdown = `# Improved README

Your improved README will appear here after analysis completes.
`;

function LoadingPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {["Original README", "Improved README"].map((label, index) => (
        <section
          className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25"
          key={label}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              {label}
            </p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                index === 0
                  ? "bg-white/10 text-slate-300"
                  : "bg-mint/10 text-mint"
              }`}
            >
              {index === 0 ? "Fetching" : "Generating"}
            </span>
          </div>
          <div className="space-y-4 p-6">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/5" />
            <div className="h-4 w-4/6 animate-pulse rounded-full bg-white/5" />
            <div className="mt-8 h-24 animate-pulse rounded-2xl bg-slate-900/70" />
          </div>
        </section>
      ))}
    </div>
  );
}

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

export function ReadmeDoctorApp() {
  const explanationDialogTitleId = useId();
  const closeExplanationButtonRef = useRef<HTMLButtonElement | null>(null);
  const explanationDialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const { data: session, status } = useSession();
  const [repoUrl, setRepoUrl] = useState("");
  const [originalReadme, setOriginalReadme] = useState(emptyOriginalMarkdown);
  const [improvedReadme, setImprovedReadme] = useState(emptyImprovedMarkdown);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isExplainingProject, setIsExplainingProject] = useState(false);
  const [error, setError] = useState("");
  const [explanationError, setExplanationError] = useState("");
  const [projectExplanation, setProjectExplanation] = useState("");
  const [prError, setPrError] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const hasImprovedReadme = improvedReadme !== emptyImprovedMarkdown;
  const hasReadmeComparison =
    originalReadme !== emptyOriginalMarkdown && hasImprovedReadme;
  const canAnalyze =
    Boolean(repoUrl.trim()) &&
    !isLoading &&
    !isCreatingPr &&
    !isExplainingProject;
  const canCreatePr =
    Boolean(repoUrl.trim()) &&
    hasImprovedReadme &&
    !isLoading &&
    !isCreatingPr &&
    status === "authenticated";
  const canCopyReadme = hasImprovedReadme && !isLoading && !isCreatingPr && !isCopying;
  const canExplainProject =
    Boolean(repoUrl.trim()) &&
    !isLoading &&
    !isCreatingPr &&
    !isExplainingProject;

  function dismissToast(id: number) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }

  function pushToast(toast: Omit<Toast, "id">) {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isExplainingProject) {
      return;
    }

    if (!repoUrl.trim()) {
      const message = "Enter a GitHub repository URL first.";
      setError(message);
      pushToast({ kind: "error", message });
      return;
    }

    setIsLoading(true);
    setError("");
    setExplanationError("");
    setProjectExplanation("");
    setIsExplanationOpen(false);
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

    if (!hasImprovedReadme) {
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

  async function handleExplainProject() {
    if (!repoUrl.trim()) {
      const message = "Enter a GitHub repository URL first.";
      setExplanationError(message);
      pushToast({ kind: "error", message });
      return;
    }

    setIsExplainingProject(true);
    setExplanationError("");
    setProjectExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = (await response.json()) as ExplainResponse;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            response.status,
            data.error ?? "We could not explain that project.",
          ),
        );
      }

      if (!data.explanation) {
        throw new Error("The project explanation was empty.");
      }

      setProjectExplanation(data.explanation);
      setIsExplanationOpen(true);
      pushToast({
        kind: "success",
        message: "Project explanation is ready.",
      });
    } catch (explainError) {
      const message =
        explainError instanceof Error
          ? explainError.message
          : "Something went wrong while explaining the project.";

      setExplanationError(message);
      pushToast({ kind: "error", message });
    } finally {
      setIsExplainingProject(false);
    }
  }

  async function handleCopyReadme() {
    if (!hasImprovedReadme) {
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

  const activityMessage = isLoading
    ? "Fetching the original README and drafting a stronger rewrite..."
    : isExplainingProject
      ? "Reviewing the repository and preparing a beginner-friendly project explanation..."
    : isCreatingPr
      ? "Creating a GitHub branch, committing the README update, and opening a pull request..."
      : status !== "authenticated"
        ? "Sign in with GitHub to create a pull request once the README looks right."
        : "Preview shows both versions side by side. Diff highlights the exact edits.";

  useEffect(() => {
    if (!isExplanationOpen) {
      return;
    }

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
    closeExplanationButtonRef.current?.focus();

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsExplanationOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialogElement = explanationDialogRef.current;

      if (!dialogElement) {
        return;
      }

      const focusableElements = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      previousFocusedElementRef.current?.focus();
    };
  }, [isExplanationOpen]);

  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:72px_72px] opacity-10" />

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.kind === "success"
                ? "border-mint/30 bg-slate-950/90 text-mint"
                : "border-red-400/30 bg-slate-950/90 text-red-200"
            }`}
            key={toast.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{toast.message}</p>
                {toast.actionHref ? (
                  <a
                    className="inline-flex text-sm font-semibold underline underline-offset-4 hover:text-white"
                    href={toast.actionHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {toast.actionLabel ?? "Open"}
                  </a>
                ) : null}
              </div>

              <button
                aria-label="Dismiss notification"
                className="text-sm text-slate-400 transition hover:text-white"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-7xl rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-glow backdrop-blur-xl sm:p-10">
          <nav className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-200/80">
                README Auto Doctor
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Sign in with GitHub to connect your account before repository write features land.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {status === "authenticated" ? (
                <>
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2">
                    {session.user?.image ? (
                      <img
                        alt={session.user?.name ?? "GitHub avatar"}
                        className="h-10 w-10 rounded-full border border-white/10 object-cover"
                        referrerPolicy="no-referrer"
                        src={session.user.image}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-sky-300/10 text-sm font-semibold text-sky-100">
                        {(session.user?.name ?? session.user?.email ?? "G")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {session.user?.name ?? "GitHub user"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {session.user?.email ?? "Authenticated with GitHub"}
                      </p>
                    </div>
                  </div>

                  <button
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading || isCreatingPr}
                    onClick={() => signOut()}
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={status === "loading" || isLoading || isCreatingPr}
                  onClick={() => signIn("github")}
                  type="button"
                >
                  {status === "loading" ? "Loading..." : "Login with GitHub"}
                </button>
              )}
            </div>
          </nav>

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1 text-sm font-medium text-sky-100">
              README Auto Doctor
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Compare the original README against an AI-improved rewrite.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              Fetch a repository README, improve it with OpenAI, then inspect the polished version in preview or diff mode.
            </p>
          </div>

          <form
            className="mx-auto mt-10 flex max-w-5xl flex-col gap-4 rounded-[28px] border border-white/10 bg-ink/60 p-4 sm:flex-row sm:items-center"
            onSubmit={handleSubmit}
          >
            <input
              aria-label="GitHub repository URL"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-mint/70 focus:ring-2 focus:ring-mint/30 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || isCreatingPr || isExplainingProject}
              onChange={(event) => {
                setRepoUrl(event.target.value);
                setError("");
                setPrError("");
                setPrUrl("");
                setIssues([]);
                setScore(null);
                setSuggestions([]);
              }}
              placeholder="https://github.com/owner/repository"
              type="url"
              value={repoUrl}
            />
            <button
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-mint px-6 py-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!canAnalyze}
              type="submit"
            >
              {isLoading ? (
                <>
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" />
                  Analyzing...
                </>
              ) : (
                "Analyze README"
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/50 p-1">
              <button
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  viewMode === "preview"
                    ? "bg-white text-ink"
                    : "text-slate-300 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isLoading}
                onClick={() => setViewMode("preview")}
                type="button"
              >
                Preview
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  viewMode === "diff"
                    ? "bg-white text-ink"
                    : "text-slate-300 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isLoading}
                onClick={() => setViewMode("diff")}
                type="button"
              >
                Diff
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                className="inline-flex min-w-40 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canExplainProject}
                onClick={() => void handleExplainProject()}
                type="button"
              >
                {isExplainingProject ? "Explaining..." : "Explain Project"}
              </button>

              <button
                className="inline-flex min-w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canCopyReadme}
                onClick={() => void handleCopyReadme()}
                type="button"
              >
                {isCopying ? "Copying..." : "Copy README"}
              </button>

              <button
                className="inline-flex min-w-44 items-center justify-center rounded-2xl border border-mint/30 bg-mint/10 px-5 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canCreatePr}
                onClick={() => void handleCreatePullRequest()}
                type="button"
              >
                {isCreatingPr ? "Creating Pull Request..." : "Create Pull Request"}
              </button>

              <div className="max-w-xl rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                {activityMessage}
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {explanationError ? (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {explanationError}
            </p>
          ) : null}

          {prError ? (
            <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {prError}
            </p>
          ) : null}

          {prUrl ? (
            <p className="mt-6 rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-mint">
              Pull request ready.{" "}
              <a
                className="font-semibold underline decoration-mint/70 underline-offset-4 hover:text-white"
                href={prUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open PR
              </a>
            </p>
          ) : null}

          {score !== null ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[auto,1fr,1fr]">
              <section className="rounded-[24px] border border-sky-300/20 bg-sky-300/10 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-100/80">
                  README Score
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {score}
                  <span className="ml-1 text-lg text-slate-300">/100</span>
                </p>
              </section>

              <section className="rounded-[24px] border border-white/10 bg-slate-950/50 px-5 py-4">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                  Issues
                </p>
                {issues.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {issues.map((issue, index) => (
                      <li className="flex gap-2" key={`${index}-${issue}`}>
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-300" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    No major README issues were reported.
                  </p>
                )}
              </section>

              <section className="rounded-[24px] border border-white/10 bg-slate-950/50 px-5 py-4">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">
                  Suggestions
                </p>
                {suggestions.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {suggestions.map((suggestion, index) => (
                      <li className="flex gap-2" key={`${index}-${suggestion}`}>
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-mint" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    No additional README suggestions were returned.
                  </p>
                )}
              </section>
            </div>
          ) : null}

          <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/60 p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-mint/15 bg-mint/5 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Building your README comparison
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      We are fetching the repository README, then rewriting it into a cleaner version.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-mint">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mint" />
                    In progress
                  </div>
                </div>

                <LoadingPreview />
              </div>
            ) : viewMode === "preview" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
                  <div className="border-b border-white/10 px-5 py-4">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                      Original README
                    </p>
                  </div>
                  <article
                    className={`${markdownPreviewClassName} prose-blockquote:border-sky-400/40`}
                  >
                    <ReactMarkdown
                      remarkPlugins={markdownRemarkPlugins}
                      rehypePlugins={markdownRehypePlugins}
                    >
                      {originalReadme}
                    </ReactMarkdown>
                  </article>
                </section>

                <section className="overflow-hidden rounded-[24px] border border-mint/20 bg-mint/5">
                  <div className="flex items-center justify-between gap-3 border-b border-mint/15 px-5 py-4">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-mint">
                      Improved README
                    </p>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-mint/20 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canCopyReadme}
                      onClick={() => void handleCopyReadme()}
                      type="button"
                    >
                      {isCopying ? "Copying..." : "Copy"}
                    </button>
                  </div>
                  <article
                    className={`${markdownPreviewClassName} prose-p:text-slate-100 prose-blockquote:border-mint/40`}
                  >
                    <ReactMarkdown
                      remarkPlugins={markdownRemarkPlugins}
                      rehypePlugins={markdownRehypePlugins}
                    >
                      {improvedReadme}
                    </ReactMarkdown>
                  </article>
                </section>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1526] p-2">
                <ReactDiffViewer
                  hideLineNumbers={false}
                  leftTitle="Original README"
                  newValue={improvedReadme}
                  oldValue={originalReadme}
                  rightTitle="Improved README"
                  splitView
                  styles={{
                    variables: {
                      dark: {
                        addedBackground: "rgba(16, 185, 129, 0.18)",
                        addedColor: "#f8fafc",
                        addedGutterBackground: "rgba(16, 185, 129, 0.12)",
                        addedGutterColor: "#a7f3d0",
                        codeFoldBackground: "#0f172a",
                        codeFoldContentColor: "#cbd5e1",
                        codeFoldGutterBackground: "#111827",
                        diffViewerBackground: "#0d1526",
                        diffViewerColor: "#e2e8f0",
                        emptyLineBackground: "#0d1526",
                        gutterBackground: "#111827",
                        gutterBackgroundDark: "#0f172a",
                        gutterColor: "#64748b",
                        highlightBackground: "rgba(106, 168, 255, 0.14)",
                        highlightGutterBackground: "rgba(106, 168, 255, 0.12)",
                        removedBackground: "rgba(248, 113, 113, 0.18)",
                        removedColor: "#f8fafc",
                        removedGutterBackground: "rgba(248, 113, 113, 0.12)",
                        removedGutterColor: "#fecaca",
                        wordAddedBackground: "rgba(52, 211, 153, 0.32)",
                        wordRemovedBackground: "rgba(248, 113, 113, 0.32)",
                      },
                    },
                    contentText: {
                      fontSize: "0.875rem",
                      lineHeight: "1.6",
                    },
                    diffContainer: {
                      border: "0",
                    },
                    marker: {
                      minWidth: "32px",
                    },
                  }}
                  useDarkTheme
                />
              </div>
            )}
          </div>

          {!hasReadmeComparison && !isLoading ? (
            <p className="mt-6 text-center text-sm text-slate-400">
              Run an analysis to unlock copy and pull request actions for the improved README.
            </p>
          ) : null}
        </div>
      </section>

      {isExplanationOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-6 backdrop-blur-sm">
          <div
            aria-labelledby={explanationDialogTitleId}
            aria-modal="true"
            className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#081322] p-6 shadow-2xl sm:p-8"
            ref={explanationDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200/80">
                  Project Summary
                </p>
                <h2
                  className="mt-3 text-2xl font-semibold text-white"
                  id={explanationDialogTitleId}
                >
                  Explain Project
                </h2>
              </div>

              <button
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                ref={closeExplanationButtonRef}
                onClick={() => setIsExplanationOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-200">
                {projectExplanation}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
