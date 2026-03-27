import { memo, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ViewMode } from "@/types/readme-doctor";
import { ErrorDisplay } from "./ErrorDisplay";
import { Loader } from "./Loader";

const markdownRemarkPlugins = [remarkGfm];
const markdownRehypePlugins = [rehypeHighlight];

type ResultDisplayProps = {
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
  onImprovedReadmeChange: (value: string) => void;
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
    <div className="markdown-body max-w-none overflow-x-auto px-6 py-6">
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export const ResultDisplay = memo(function ResultDisplay({
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
  onImprovedReadmeChange,
  onViewModeChange,
  originalReadme,
  prError,
  prUrl,
  score,
  suggestions,
  viewMode,
}: ResultDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <>
      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {/* View mode tabs */}
        <div className="inline-flex rounded-xl border border-[#1E1E35] bg-[#0E0E1A] p-1 gap-2">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-500 ${
              viewMode === "preview"
                ? "bg-[#7C6FE0] text-white shadow-[0_0_16px_rgba(124,111,224,0.3)]"
                : "text-[#9B9BB8] hover:text-[#F2F2FF] hover:bg-[#15152A]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={isLoading}
            onClick={() => onViewModeChange("preview")}
            type="button"
          >
            Preview
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-500 ${
              viewMode === "diff"
                ? "bg-[#7C6FE0] text-white shadow-[0_0_16px_rgba(124,111,224,0.3)]"
                : "text-[#9B9BB8] hover:text-[#F2F2FF] hover:bg-[#15152A]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={isLoading}
            onClick={() => onViewModeChange("diff")}
            type="button"
          >
            Diff
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {score !== null ? (
            <div className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl border border-[#2A2A48] bg-[#0E0E1A] px-5 py-2.5 text-sm font-medium text-[#F2F2FF]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Score: {score}/100
            </div>
          ) : null}

          <button
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,111,224,0.25)] transition-all hover:shadow-[0_0_30px_rgba(124,111,224,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canCreatePr}
            onClick={onCreatePullRequest}
            type="button"
          >
            {isCreatingPr ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
                Creating PR...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M6 21V9a9 9 0 009 9" />
                </svg>
                Create Pull Request
              </>
            )}
          </button>
        </div>
      </div>

      {error ? <ErrorDisplay message={error} /> : null}
      {prError ? <ErrorDisplay message={prError} /> : null}

      {/* PR success banner */}
      {prUrl ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#7C6FE0]/25 bg-[#7C6FE0]/[0.06] px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#7C6FE0]/15">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7l3 3 6-6"
                stroke="#7C6FE0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm text-[#F2F2FF]">
            Pull request created successfully.{" "}
            <a
              className="font-semibold text-[#7C6FE0] underline underline-offset-4 hover:text-[#9B9BB8] transition-colors"
              href={prUrl}
              rel="noreferrer"
              target="_blank"
            >
              View PR →
            </a>
          </p>
        </div>
      ) : null}

      {/* Issues + suggestions */}
      {score !== null ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {/* Issues */}
          <section className="rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5C5C7B] mb-3">
              Issues
            </p>
            {issues.length > 0 ? (
              <ul className="space-y-2">
                {issues.map((issue, index) => (
                  <li className="flex gap-2.5 text-sm text-[#9B9BB8]" key={`${index}-${issue}`}>
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500/70" />
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5C5C7B]">
                No major issues detected.
              </p>
            )}
          </section>

          {/* Suggestions */}
          <section className="rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5C5C7B] mb-3">
              Suggestions
            </p>
            {suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li className="flex gap-2.5 text-sm text-[#9B9BB8]" key={`${index}-${suggestion}`}>
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7C6FE0]/70" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5C5C7B]">
                No additional suggestions.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {/* Main content panels */}
      <div className="mt-5 rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] overflow-hidden">
        {isLoading ? (
          <Loader />
        ) : viewMode === "preview" ? (
          <div className="grid gap-px bg-[#1E1E35] lg:grid-cols-2">
            {/* Original */}
            <section className="overflow-hidden bg-[#0E0E1A]">
              <div className="flex h-11 items-center justify-between border-b border-[#1E1E35] px-5">
                <p className="text-xs font-medium uppercase tracking-widest text-[#5C5C7B]">
                  Original README
                </p>
              </div>
              <ReadmeMarkdownPreview content={originalReadme} />
            </section>

            {/* Improved */}
            <section className="overflow-hidden bg-[#0E0E1A]">
              <div className="flex h-11 items-center justify-between border-b border-[#7C6FE0]/20 bg-[#7C6FE0]/[0.03] px-5">
                <p className="text-xs font-medium uppercase tracking-widest text-[#7C6FE0]">
                  Improved README
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition ${
                      isEditing
                        ? "border-[#2ECAD9]/25 bg-[#2ECAD9]/10 text-[#2ECAD9] hover:bg-[#2ECAD9]/15"
                        : "border-[#7C6FE0]/25 bg-[#7C6FE0]/10 text-[#7C6FE0] hover:bg-[#7C6FE0]/15"
                    }`}
                    onClick={() => setIsEditing((prev) => !prev)}
                    type="button"
                  >
                    {isEditing ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Preview
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </>
                    )}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#7C6FE0]/25 bg-[#7C6FE0]/10 px-3 py-1 text-xs font-medium text-[#7C6FE0] transition hover:bg-[#7C6FE0]/15 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canCopyReadme}
                    onClick={onCopyReadme}
                    type="button"
                  >
                    {isCopying ? "Copying..." : "Copy"}
                  </button>
                </div>
              </div>
              {isEditing ? (
                <textarea
                  className="w-full h-full resize-y bg-[#07070E] p-6 font-mono text-sm text-[#F2F2FF] leading-relaxed outline-none placeholder:text-[#5C5C7B] focus:ring-1 focus:ring-[#7C6FE0]/30"
                  value={improvedReadme}
                  onChange={(e) => onImprovedReadmeChange(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <ReadmeMarkdownPreview content={improvedReadme} />
              )}
            </section>
          </div>
        ) : (
          <div className="overflow-hidden">
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
                    addedBackground: "rgba(124, 111, 224, 0.12)",
                    addedColor: "#F2F2FF",
                    addedGutterBackground: "rgba(124, 111, 224, 0.08)",
                    addedGutterColor: "#7C6FE0",
                    codeFoldBackground: "#07070E",
                    codeFoldContentColor: "#9B9BB8",
                    codeFoldGutterBackground: "#07070E",
                    diffViewerBackground: "#0E0E1A",
                    diffViewerColor: "#F2F2FF",
                    emptyLineBackground: "#0E0E1A",
                    gutterBackground: "#07070E",
                    gutterBackgroundDark: "#07070E",
                    gutterColor: "#5C5C7B",
                    highlightBackground: "rgba(79, 142, 247, 0.10)",
                    highlightGutterBackground: "rgba(79, 142, 247, 0.08)",
                    removedBackground: "rgba(239, 68, 68, 0.10)",
                    removedColor: "#F2F2FF",
                    removedGutterBackground: "rgba(239, 68, 68, 0.07)",
                    removedGutterColor: "#EF4444",
                    wordAddedBackground: "rgba(124, 111, 224, 0.25)",
                    wordRemovedBackground: "rgba(239, 68, 68, 0.25)",
                  },
                },
                contentText: {
                  fontSize: "0.8125rem",
                  lineHeight: "1.6",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
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
