import { memo } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ViewMode } from "@/types/readme-doctor";
import { ErrorDisplay } from "./ErrorDisplay";
import { Loader } from "./Loader";

const markdownRemarkPlugins = [remarkGfm];
const markdownRehypePlugins = [rehypeHighlight];
const markdownPreviewClassName =
  "prose prose-invert prose-slate max-w-none overflow-x-auto p-6 prose-headings:text-white prose-p:text-slate-100 prose-strong:text-white prose-a:text-mint prose-code:text-sky-200 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950/80 prose-blockquote:border-white/10 prose-blockquote:text-slate-300 prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-slate-400 prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2";

type ResultDisplayProps = {
  activityMessage: string;
  canCopyReadme: boolean;
  canCreatePr: boolean;
  error: string;
  improvedReadme: string;
  isCopying: boolean;
  isCreatingPr: boolean;
  isLoading: boolean;
  issues: string[];
  onCopyReadme: () => void;
  onCreatePullRequest: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  originalReadme: string;
  prError: string;
  prUrl: string;
  score: number | null;
  suggestions: string[];
  viewMode: ViewMode;
};

const ReadmeMarkdownPreview = memo(function ReadmeMarkdownPreview({
  content,
}: {
  content: string;
}) {
  return (
    <article className={markdownPreviewClassName}>
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
});

export const ResultDisplay = memo(function ResultDisplay({
  activityMessage,
  canCopyReadme,
  canCreatePr,
  error,
  improvedReadme,
  isCopying,
  isCreatingPr,
  isLoading,
  issues,
  onCopyReadme,
  onCreatePullRequest,
  onViewModeChange,
  originalReadme,
  prError,
  prUrl,
  score,
  suggestions,
  viewMode,
}: ResultDisplayProps) {
  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/50 p-1">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              viewMode === "preview"
                ? "bg-white text-ink"
                : "text-slate-300 hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={isLoading}
            onClick={() => onViewModeChange("preview")}
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
            onClick={() => onViewModeChange("diff")}
            type="button"
          >
            Diff
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            className="inline-flex min-w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canCopyReadme}
            onClick={onCopyReadme}
            type="button"
          >
            {isCopying ? "Copying..." : "Copy README"}
          </button>

          <button
            className="inline-flex min-w-44 items-center justify-center rounded-2xl border border-mint/30 bg-mint/10 px-5 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canCreatePr}
            onClick={onCreatePullRequest}
            type="button"
          >
            {isCreatingPr ? "Creating Pull Request..." : "Create Pull Request"}
          </button>

          <div className="max-w-xl rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
            {activityMessage}
          </div>
        </div>
      </div>

      {error ? <ErrorDisplay message={error} /> : null}
      {prError ? <ErrorDisplay message={prError} /> : null}

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
          <Loader />
        ) : viewMode === "preview" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                  Original README
                </p>
              </div>
              <ReadmeMarkdownPreview content={originalReadme} />
            </section>

            <section className="overflow-hidden rounded-[24px] border border-mint/20 bg-mint/5">
              <div className="flex items-center justify-between gap-3 border-b border-mint/15 px-5 py-4">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-mint">
                  Improved README
                </p>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-mint/20 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canCopyReadme}
                  onClick={onCopyReadme}
                  type="button"
                >
                  {isCopying ? "Copying..." : "Copy"}
                </button>
              </div>
              <ReadmeMarkdownPreview content={improvedReadme} />
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

    </>
  );
});
